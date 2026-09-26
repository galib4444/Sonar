// Sonar Google Sheets webhook
// Deploy → Web app → Execute as: Me → Who has access: Anyone
// After deploying, call /exec?action=setup once to format both tabs

// Jobs whose location matches any HOME_KEYWORDS go to TAB_HOME; the rest go to
// TAB_OTHER. Set these to your own region, e.g. ["san francisco", "bay area"].
const TAB_HOME = "Home Region";
const TAB_OTHER = "Other Locations";
const HOME_KEYWORDS = [];

const HEADERS = [
  "Company", "Role", "Track", "Location", "Salary Range",
  "Source", "Job Posting", "Resume Version", "Date Applied",
  "Status", "Next Action", "Next Action Date", "Contact", "Notes",
  "Date Posted", "Date Added"
];

const STATUS_COLORS = {
  "To Apply":         { bg: "#FFF9C4", fg: "#5D4037" },
  "Applied":          { bg: "#BBDEFB", fg: "#0D47A1" },
  "Follow-Up Sent":   { bg: "#B3E5FC", fg: "#01579B" },
  "Recruiter Screen": { bg: "#C8E6C9", fg: "#1B5E20" },
  "Interview":        { bg: "#A5D6A7", fg: "#1B5E20" },
  "Final Round":      { bg: "#66BB6A", fg: "#FFFFFF" },
  "Offer":            { bg: "#43A047", fg: "#FFFFFF" },
  "Hired":            { bg: "#1B5E20", fg: "#FFFFFF" },
  "Rejected":         { bg: "#ECEFF1", fg: "#90A4AE" },
  "No Response":      { bg: "#ECEFF1", fg: "#90A4AE" },
  "Withdrawn":        { bg: "#ECEFF1", fg: "#90A4AE" },
  "SKIP":             { bg: "#ECEFF1", fg: "#90A4AE" },
};

// ---------- Helpers ----------

function isHomeRegion(location) {
  if (!location) return false;
  const loc = location.toLowerCase();
  return HOME_KEYWORDS.some((kw) => loc.includes(kw.toLowerCase()));
}

function getOrCreateTab(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function setupTab(sheet) {
  const alreadyInitialized = sheet.getRange(1, 1).getValue() === "Company";

  if (!alreadyInitialized) {
    // Clear any test rows
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][0] === "Test Co" || data[i][0] === "Company") {
        sheet.deleteRow(i + 1);
      }
    }
    sheet.insertRowBefore(1);
  }

  // Always (re)write the header row to match the current HEADERS array —
  // cheap and idempotent, so a schema change (e.g. a new trailing column)
  // can reach an already-initialized live sheet via ?action=setup without
  // touching any existing data rows. Clear validation first: the Status
  // column's dropdown rule can end up covering row 1 too (seen live on an
  // already-initialized sheet), and a strict rule rejects the header text
  // itself ("Status" isn't a valid status), throwing and aborting the whole
  // write before anything is saved.
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.clearDataValidations();
  headerRange.setValues([HEADERS]);
  headerRange
    .setBackground("#1A237E")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  if (alreadyInitialized) return; // one-time structural setup below already ran

  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);

  // Column widths: Company, Role, Track, Location, Salary, Source, Job Posting, Resume, DateApplied, Status, NextAction, NextActionDate, Contact, Notes, DatePosted, DateAdded
  const widths = [140, 220, 130, 180, 110, 100, 100, 140, 100, 100, 180, 120, 120, 200, 100, 100];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  // Status dropdown (col 10)
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(Object.keys(STATUS_COLORS), true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 10, sheet.getMaxRows() - 1, 1).setDataValidation(rule);

  colorAllRows(sheet);

  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, sheet.getLastRow(), HEADERS.length).createFilter();
  }
}

function colorAllRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const statuses = sheet.getRange(2, 10, lastRow - 1, 1).getValues();
  statuses.forEach((row, i) => {
    const rowNum = i + 2;
    const colors = STATUS_COLORS[row[0]];
    const range = sheet.getRange(rowNum, 1, 1, HEADERS.length);
    if (colors) {
      range.setBackground(colors.bg).setFontColor(colors.fg);
    } else {
      range.setBackground(i % 2 === 0 ? "#FFFFFF" : "#F8F9FA").setFontColor("#212121");
    }
  });
}

function getExistingUrls(sheet) {
  const lastRow = sheet.getLastRow();
  const existing = new Set();
  if (lastRow < 2) return existing;
  // Job Posting is col 7. getValues() on a HYPERLINK() cell returns the
  // *displayed* text ("Apply"), not the URL — must read the formula.
  const formulas = sheet.getRange(2, 7, lastRow - 1, 1).getFormulas();
  formulas.forEach(r => {
    if (r[0]) existing.add(extractUrlFromHyperlink(r[0]));
  });
  return existing;
}

function extractUrlFromHyperlink(cellValue) {
  if (!cellValue) return "";
  const str = cellValue.toString();
  const match = str.match(/HYPERLINK\("([^"]+)"/i);
  return match ? match[1] : str;
}

function todayString() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

// Reads every data row of a tab back out as plain objects, resolving the
// "Job Posting" HYPERLINK formula to a real URL (getValues() alone would
// return the display text "Apply", not the link).
function readTabRows(sheet, tabName) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const numRows = lastRow - 1;
  const values = sheet.getRange(2, 1, numRows, HEADERS.length).getValues();
  const formulas = sheet.getRange(2, 7, numRows, 1).getFormulas();

  return values.map((row, i) => ({
    tab: tabName,
    row: i + 2, // 1-indexed sheet row, for reference/debugging
    company: row[0] || "",
    role: row[1] || "",
    track: row[2] || "",
    location: row[3] || "",
    salary: row[4] || "",
    source: row[5] || "",
    url: formulas[i][0] ? extractUrlFromHyperlink(formulas[i][0]) : (row[6] || ""),
    resumeVersion: row[7] || "",
    dateApplied: row[8] || "",
    status: row[9] || "",
    nextAction: row[10] || "",
    nextActionDate: row[11] || "",
    contact: row[12] || "",
    notes: row[13] || "",
    postedDate: row[14] || "",
    dateAdded: row[15] || "",
  })).filter(r => r.company); // skip stray blank rows
}

// Finds a row by Job Posting URL across both tabs and updates its Status /
// Date Applied cells in place — never appends, never touches other columns.
function updateRowByUrl(url, status, dateApplied) {
  const tabs = [getOrCreateTab(TAB_HOME), getOrCreateTab(TAB_OTHER)];
  for (const sheet of tabs) {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) continue;
    const formulas = sheet.getRange(2, 7, lastRow - 1, 1).getFormulas();
    const rawUrls = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
    for (let i = 0; i < formulas.length; i++) {
      const rowUrl = formulas[i][0] ? extractUrlFromHyperlink(formulas[i][0]) : (rawUrls[i][0] || "");
      if (rowUrl !== url) continue;

      const rowNum = i + 2;
      if (status) sheet.getRange(rowNum, 10).setValue(status);
      if (dateApplied) sheet.getRange(rowNum, 9).setValue(dateApplied);

      const colors = STATUS_COLORS[status];
      const range = sheet.getRange(rowNum, 1, 1, HEADERS.length);
      if (colors) range.setBackground(colors.bg).setFontColor(colors.fg);

      return true;
    }
  }
  return false;
}

function appendRowToTab(sheet, row, existing) {
  const url = (row.url || "").trim();
  // Check dedup using raw URL
  if (url && existing.has(url)) return false;
  if (url) existing.add(url);

  // "Job Posting" cell: clickable hyperlink label "Apply"
  const jobPostingFormula = url ? `=HYPERLINK("${url}","Apply")` : "";

  const newRow = [
    row.company || "", row.role || "", row.track || "",
    row.location || "", row.salary || "", row.source || "",
    jobPostingFormula,
    row.resumeVersion || "", row.dateApplied || "",
    row.status || "To Apply", row.nextAction || "Evaluate and apply",
    row.nextActionDate || "", row.contact || "", row.notes || "",
    row.postedDate || "", todayString(),
  ];
  sheet.appendRow(newRow);

  // Color the new row
  const rowNum = sheet.getLastRow();
  const colors = STATUS_COLORS[row.status || "To Apply"];
  const range = sheet.getRange(rowNum, 1, 1, HEADERS.length);
  if (colors) {
    range.setBackground(colors.bg).setFontColor(colors.fg);
  } else {
    range.setBackground(rowNum % 2 === 0 ? "#FFFFFF" : "#F8F9FA").setFontColor("#212121");
  }

  // Make the "Apply" link stand out
  if (url) {
    sheet.getRange(rowNum, 7)
      .setFontColor("#1565C0")
      .setFontWeight("bold");
  }
  return true;
}

// ---------- HTTP handlers ----------

function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action;

    if (action === "list") {
      const jobs = [
        ...readTabRows(getOrCreateTab(TAB_HOME), TAB_HOME),
        ...readTabRows(getOrCreateTab(TAB_OTHER), TAB_OTHER),
      ];
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, jobs }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    let result;
    if (action === "setup") {
      setupTab(getOrCreateTab(TAB_HOME));
      setupTab(getOrCreateTab(TAB_OTHER));
      result = "Setup complete — " + TAB_HOME + " and " + TAB_OTHER + " tabs ready";
    } else {
      result = "Sonar webhook active";
    }
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Status update on an existing row (extension "Mark Applied" / "Skip") —
    // checked first since it never touches `data.rows`.
    if (data.updateUrl) {
      const found = updateRowByUrl(data.updateUrl, data.updateStatus, data.updateDateApplied);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, updated: found }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!data.rows || !Array.isArray(data.rows)) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "No rows provided" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheetHome = getOrCreateTab(TAB_HOME);
    const sheetOther = getOrCreateTab(TAB_OTHER);

    // Ensure both tabs have headers
    if (sheetHome.getRange(1, 1).getValue() !== "Company") setupTab(sheetHome);
    if (sheetOther.getRange(1, 1).getValue() !== "Company") setupTab(sheetOther);

    const existingHome = getExistingUrls(sheetHome);
    const existingOther = getExistingUrls(sheetOther);

    let addedHome = 0;
    let addedOther = 0;

    for (const row of data.rows) {
      if (isHomeRegion(row.location)) {
        if (appendRowToTab(sheetHome, row, existingHome)) addedHome++;
      } else {
        if (appendRowToTab(sheetOther, row, existingOther)) addedOther++;
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, added: addedHome + addedOther, home: addedHome, other: addedOther }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this manually in Apps Script editor to authorize + set up both tabs
function testSetup() {
  setupTab(getOrCreateTab(TAB_HOME));
  setupTab(getOrCreateTab(TAB_OTHER));
  Logger.log("Setup complete");
}

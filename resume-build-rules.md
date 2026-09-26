# Resume Build Rules

Standing instructions for building tailored resumes in this project. These exist because each rule below corresponds to a mistake already made. Follow them without being reminded.

---

## 1. Source of truth

Your master resume (and its machine-readable copy, `packages/profile/master-profile.json`) is the only canonical source. Everything written must trace back to it.

Older files are stale and contain known errors. Never pull a fact from a previously tailored resume or an old export without checking it against the master first.

Keep a running list here of corrections the stale files still get wrong, for example:

- A job title that older files inflate (e.g. "Founder", not "Founder & CEO"), or an end date shown as "Present" after the role ended.
- A headcount or metric that older files overstate.
- A technology that older files misattribute to the wrong project.

If two files in this project disagree, say so out loud and ask. Never resolve a conflict silently.

Never invent a number, a tool, a date, or a claim. If a metric is not in the master, it does not go on the resume.

---

## 2. Layout defaults

These are locked. Do not renegotiate them to make content fit.

- US Letter, 0.5 inch side margins, 10 point body minimum.
- One page unless told otherwise.
- Dates go **flush right** against the margin, using an explicit right-aligned tab stop. Do not use a positional tab, it does not survive rendering.
- Every experience and project entry uses the same shape: company or project name and location on the left, dates flush right, job title on its own italic line below.
- If one entry is stacked that way, **all** entries are stacked that way. Never mix an inline title into a resume that uses stacked titles.

---

## 3. Fitting one page

Set the layout first, then fit the content to it. Never do the reverse.

Do not shrink the font, narrow the margins, or tighten line spacing to win space. That produces a cramped page, which reads as an anxious one.

When the draft runs long, cut whole units: a bullet, an entry, a section. Do not shave two words off every sentence, which is how the page ends up dense with nothing actually removed.

Watch for orphan lines, meaning a bullet that wraps onto a second line for only two or three words. Either rewrite that bullet to fit one line or let it run properly. An orphan is wasted space.

---

## 4. Verify before delivering

Render the document to PDF, convert the pages to images, and look at them. Every time. No exceptions.

Confirm on the rendered image:

- It is one page.
- Dates are flush right, not floating beside the title.
- Every entry uses the same format.
- The contact line fits on one line.
- No orphan lines.
- Nothing is jammed against the bottom margin.

A document that has not been looked at has not been checked.

---

## 5. Content decisions

Re-decide every entry against the specific job posting. Do not carry an entry forward just because it appeared on a previous tailored resume. Inheritance is not a reason.

For each posting, read the required and preferred lists, then ask of every entry on the page: does this push on what they asked for? If not, it is a candidate to cut regardless of how long it has been on the resume.

State every cut explicitly in the reply, with the reason, so it can be reversed. Never remove a whole job, project, or section quietly.

Ask before cutting anything previously defended.

Frame the same experience differently by role: building and shipping for engineering roles, client discovery and training for implementation and client-facing roles.

---

## 6. Two resumes to the same employer

When more than one resume goes to the same company, they will be viewed side by side in the applicant tracking system.

Use identical structure, identical company list, and identical dates across both. Only the emphasis and bullet order change. Structural differences between two resumes from the same candidate read as a red flag.

---

## 7. Voice

Plain and direct. No em dashes. No buzzwords, no aspirational framing, no abstract praise.

Bullets lead with what was built or shipped and the result. One sentence each.

Use the posting's own vocabulary for skills and tools, since that is what automated screening matches on.

---

## 8. Delivery

Produce both Word and PDF, named `Firstname_Lastname_[Company]_[Role]`.

Close every delivery with four things:

1. What was tailored, mapped to which specific requirement in the posting.
2. What was cut and why.
3. Which hard requirements are not covered, stated plainly, with how to handle each in an interview.
4. Anything still unverified from the master's open items list that affects this resume.

---

## 9. Open items, always check

Before delivering, check whether the resume depends on anything still unconfirmed. Keep the live list in `master-profile.json` → `open_items`, for example:

- A job title not yet checked against a pay stub or offer letter.
- A certification date not yet confirmed.
- Portfolio site live status; GitHub repos pinned with READMEs.
- A project that stays off resumes until it launches.

If a bullet depends on an unverified item, either keep the wording generic or flag it in the delivery notes. Do not state it as fact.

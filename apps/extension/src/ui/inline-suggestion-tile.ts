/**
 * Inline "needs your input" hints — marks empty fields the extension
 * couldn't fill from your profile: a placeholder telling you to type an
 * answer, plus a visible outline so it's not just a subtle text change.
 * Whatever you type is picked up by the normal submit-time learning system
 * (content.ts's per-submission loop) and reused automatically next time —
 * this module only surfaces where your input is needed, it doesn't do any
 * capturing itself.
 *
 * Never touches a field that looks like an SSN/passport/ID/bank field —
 * those get no hint, no highlight, nothing. Right-click "Smart Fill" and
 * the submit-time learner both independently refuse those regardless of
 * what this module does, but the absence of any hint here is deliberate
 * too: nothing here should imply the extension handles that field at all.
 *
 * When a field receives a value, we restore the original placeholder and
 * remove the highlight. When the field is cleared again, both reappear.
 */

import type { FieldSchema } from '../shared/types';
import { BEKAR_PLACEHOLDER_HINT } from '../shared/types';
import { isSensitiveIdField } from '../shared/field-classifier';

const HIGHLIGHT_OUTLINE = '2px dashed #f59e0b';

/** Track fields we've patched so we can restore them */
interface PlaceholderEntry {
  field: FieldSchema;
  element: HTMLInputElement | HTMLTextAreaElement;
  originalPlaceholder: string;
  originalOutline: string;
  inputHandler: () => void;
  observer: MutationObserver | null;
}

const managedFields = new Map<string, PlaceholderEntry>();

const HINT_TEXT = BEKAR_PLACEHOLDER_HINT;

/** Fields where we've already restored the original placeholder */
const restoredFields = new Set<string>();

/**
 * Register placeholder hints on all eligible text/textarea fields.
 * Safe to call multiple times — skips already-managed fields.
 */
export function showInlineSuggestionTiles(
  fields: FieldSchema[],
  _filledSelectors: Set<string>,
  _onClick: unknown
): void {
  for (const field of fields) {
    if (field.type === 'autocomplete' || field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') continue;
    if (managedFields.has(field.selector)) continue;
    if (isSensitiveIdField(field.label)) continue;

    const element = document.querySelector(field.selector);
    if (!element || !(element instanceof HTMLElement)) continue;
    if (!isPlainTextInput(element)) continue;
    if (isInsideDropdownWidget(element)) continue;

    registerPlaceholderHint(field, element as HTMLInputElement | HTMLTextAreaElement);
  }
}

/**
 * Remove all managed placeholder hints and restore original placeholders.
 */
export function removeAllTiles(): void {
  for (const [selector, entry] of managedFields) {
    restorePlaceholder(entry);
    entry.element.removeEventListener('input', entry.inputHandler);
    entry.element.removeEventListener('change', entry.inputHandler);
    entry.observer?.disconnect();
    managedFields.delete(selector);
  }
  restoredFields.clear();
}

/**
 * Remove a single placeholder hint by selector.
 */
export function removeTile(selector: string): void {
  const entry = managedFields.get(selector);
  if (!entry) return;
  restorePlaceholder(entry);
  entry.element.removeEventListener('input', entry.inputHandler);
  entry.element.removeEventListener('change', entry.inputHandler);
  entry.observer?.disconnect();
  managedFields.delete(selector);
}

/** Always false — no floating tiles exist anymore */
export function hasActiveTiles(): boolean {
  return false;
}

// ── Internals ──────────────────────────────────────────────────────────────

function registerPlaceholderHint(
  field: FieldSchema,
  element: HTMLInputElement | HTMLTextAreaElement
): void {
  const originalPlaceholder = element.getAttribute('placeholder') || '';
  const originalOutline = element.style.outline;
  const isEmpty = () => !element.value?.trim();

  const applyEmptyState = () => {
    if (!originalPlaceholder) element.setAttribute('placeholder', HINT_TEXT);
    element.style.outline = HIGHLIGHT_OUTLINE;
    element.style.outlineOffset = '1px';
  };

  const clearEmptyState = () => {
    const currentPlaceholder = element.getAttribute('placeholder') || '';
    if (currentPlaceholder === HINT_TEXT) {
      if (originalPlaceholder) {
        element.setAttribute('placeholder', originalPlaceholder);
      } else {
        element.removeAttribute('placeholder');
      }
    }
    if (element.style.outline === HIGHLIGHT_OUTLINE) {
      element.style.outline = originalOutline;
    }
  };

  // Only inject hint if field is empty
  if (isEmpty()) applyEmptyState();

  const syncPlaceholder = () => {
    if (isEmpty()) {
      applyEmptyState();
    } else {
      clearEmptyState();
    }
  };

  element.addEventListener('input', syncPlaceholder);
  element.addEventListener('change', syncPlaceholder);

  // Catch programmatic value changes (React-driven)
  const observer = new MutationObserver(syncPlaceholder);
  observer.observe(element, { attributes: true, attributeFilter: ['value'] });

  element.addEventListener('blur', () => setTimeout(syncPlaceholder, 50));

  managedFields.set(field.selector, {
    field,
    element,
    originalPlaceholder,
    originalOutline,
    inputHandler: syncPlaceholder,
    observer,
  });
}

function restorePlaceholder(entry: PlaceholderEntry): void {
  const current = entry.element.getAttribute('placeholder') || '';
  if (current === HINT_TEXT) {
    if (entry.originalPlaceholder) {
      entry.element.setAttribute('placeholder', entry.originalPlaceholder);
    } else {
      entry.element.removeAttribute('placeholder');
    }
  }
  if (entry.element.style.outline === HIGHLIGHT_OUTLINE) {
    entry.element.style.outline = entry.originalOutline;
  }
}

function isPlainTextInput(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === 'textarea') return true;
  if (tag === 'input') {
    const inputType = (el.getAttribute('type') || 'text').toLowerCase();
    if (['text', 'email', 'tel', 'url', 'search', 'number', ''].includes(inputType)) {
      if (el.getAttribute('role') === 'combobox' || el.getAttribute('role') === 'listbox') return false;
      if (el.getAttribute('aria-autocomplete')) return false;
      return true;
    }
  }
  return false;
}

function isInsideDropdownWidget(el: HTMLElement): boolean {
  const parent = el.closest(
    '[class*="select__"], [class*="Select__"], [role="combobox"], [role="listbox"], ' +
    '[class*="dropdown"], [class*="Dropdown"], [class*="combobox"], [class*="Combobox"]'
  );
  return !!parent;
}

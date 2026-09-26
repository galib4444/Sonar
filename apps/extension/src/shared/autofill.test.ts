import { describe, it, expect, vi } from 'vitest';

// autofill.ts imports browser-compat.ts (webextension-polyfill), which
// throws outside a real extension context. matchFieldToProfile is pure
// profile-matching logic and never touches chrome/browser APIs, so a
// minimal stub is enough to let the module load under vitest's node env.
vi.mock('./browser-compat', () => ({
  default: {},
  browser: {},
  chromeCompat: {},
}));

import { matchFieldToProfile } from './autofill';
import type { UserProfile } from './profile';
import type { FieldSchema } from './types';

// Regression for a real bug found via the debug log: a Google Forms "Please
// select the Borough..." question (radio options: The Bronx, Brooklyn,
// Manhattan, Queens, Staten Island) always got auto-filled with "Staten
// Island" — an answer with no connection to the profile at all (address was
// Springfield, NY / Queens).
//
// Cause: "staten island".includes('state') is true (staten = "state" + "n"),
// so the location/state-matching block fired for that literal option label
// and returned the profile's state ("NY"). A radio-type field's dispatcher
// treats any truthy return as "select this option", regardless of whether
// the returned string has anything to do with the option itself — so
// whichever borough happened to contain the substring "state" got checked.

function field(label: string, overrides: Partial<FieldSchema> = {}): FieldSchema {
  return {
    tagName: 'div',
    type: 'radio',
    name: null,
    id: null,
    autocomplete: null,
    required: false,
    disabled: false,
    multiple: false,
    label,
    selector: `#${label.replace(/\s+/g, '-').toLowerCase()}`,
    valuePreview: null,
    ...overrides,
  };
}

function minimalProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    personal: {
      firstName: 'Jordan',
      lastName: 'Rivera',
      email: 'jordan@example.com',
      phone: '',
      location: { city: 'Springfield', state: 'NY', country: 'United States', zipCode: '10001' },
    },
    professional: {},
    work: [],
    education: [],
    skills: [],
    lastUpdated: Date.now(),
    ...overrides,
  };
}

describe('matchFieldToProfile — "state" word-boundary regression', () => {
  const profile = minimalProfile();

  it('does not match "Staten Island" as a state field', () => {
    expect(matchFieldToProfile(field('Staten Island'), profile)).toBeNull();
  });

  it('does not match any of the other boroughs either', () => {
    for (const borough of ['The Bronx', 'Brooklyn', 'Manhattan', 'Queens']) {
      expect(matchFieldToProfile(field(borough), profile)).toBeNull();
    }
  });

  it('still matches a genuine "State" field and returns the profile state', () => {
    expect(matchFieldToProfile(field('State', { type: 'text' }), profile)).toBe('NY');
  });

  it('still matches "State/Province" and "Region" fields', () => {
    expect(matchFieldToProfile(field('State/Province', { type: 'text' }), profile)).toBe('NY');
    expect(matchFieldToProfile(field('Region', { type: 'text' }), profile)).toBe('NY');
  });

  it('still matches a City field correctly (no regression to nearby logic)', () => {
    expect(matchFieldToProfile(field('City', { type: 'text' }), profile)).toBe('Springfield');
  });
});

// Regression for a real bug found via the debug log + a live Google Forms nomination
// page: "Last 4 digits of the Social Security Number (the data collected on this form
// is secure)" got auto-filled with the profile's last name ("Rivera") and tripped the
// form's "Must be 4 digits" validation.
//
// Cause: the last-name rule matches on the bare substring "last", which that label
// contains ("Last 4 digits..."). field-classifier.ts's JUNK_SENSITIVE_ID_RE was added
// for this exact bug, but only gated the LLM classification path — matchFieldToProfile's
// substring matching here never called it.
describe('matchFieldToProfile — sensitive-ID fields never resolve to profile data', () => {
  const profile = minimalProfile();

  it('does not match an SSN field as a last-name field', () => {
    expect(matchFieldToProfile(
      field('Last 4 digits of the Social Security Number (the data collected on this form is secure)', { type: 'text' }),
      profile
    )).toBeNull();
  });

  it('does not match passport, driver\'s license, or tax ID fields', () => {
    for (const label of ["Passport Number", "Driver's License Number", "Tax Identification Number"]) {
      expect(matchFieldToProfile(field(label, { type: 'text' }), profile)).toBeNull();
    }
  });

  it('still matches a genuine Last Name field', () => {
    expect(matchFieldToProfile(field('Last Name', { type: 'text' }), profile)).toBe('Rivera');
  });
});

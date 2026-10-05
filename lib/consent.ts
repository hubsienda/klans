export const CONSENT_STORAGE_KEY = 'klans-consent';
export const CONSENT_VERSION = 1;

export interface ConsentRecord {
  version: number;
  optional: boolean;
  updatedAt: string;
}

const isConsentRecord = (value: unknown): value is ConsentRecord => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<ConsentRecord>;
  return record.version === CONSENT_VERSION
    && typeof record.optional === 'boolean'
    && typeof record.updatedAt === 'string';
};

export const readConsent = (): ConsentRecord | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isConsentRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeConsent = (optional: boolean): ConsentRecord => {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    optional,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  return record;
};

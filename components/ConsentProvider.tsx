'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Language } from '@/lib/types';
import type { ConsentRecord } from '@/lib/consent';
import { readConsent, writeConsent } from '@/lib/consent';
import { CookieBanner } from './CookieBanner';
import { CookiePreferences } from './CookiePreferences';

interface ConsentContextValue {
  consent: ConsentRecord | null;
  openPreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export const useConsent = (): ConsentContextValue => {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useConsent must be used inside ConsentProvider');
  return context;
};

export function ConsentProvider({ language, children }: { language: Language; children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  const save = useCallback((optional: boolean) => {
    setConsent(writeConsent(optional));
    setPreferencesOpen(false);
  }, []);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo(() => ({ consent, openPreferences }), [consent, openPreferences]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {ready && !consent && !preferencesOpen && (
        <CookieBanner
          language={language}
          onAccept={() => save(true)}
          onReject={() => save(false)}
          onPreferences={openPreferences}
        />
      )}
      {preferencesOpen && (
        <CookiePreferences
          language={language}
          initialOptional={consent?.optional ?? false}
          onSave={save}
          onClose={closePreferences}
        />
      )}
    </ConsentContext.Provider>
  );
}

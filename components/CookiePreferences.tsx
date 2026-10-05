'use client';

import { useEffect, useRef, useState } from 'react';
import type { Language } from '@/lib/types';

interface CookiePreferencesProps {
  language: Language;
  initialOptional: boolean;
  onSave: (optional: boolean) => void;
  onClose: () => void;
}

export function CookiePreferences({ language, initialOptional, onSave, onClose }: CookiePreferencesProps) {
  const [optional, setOptional] = useState(initialOptional);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const copy = language === 'en'
    ? {
        title: 'Cookie preferences',
        intro: 'Choose how KLANS should handle optional technologies. Necessary browser storage remains active because it remembers choices you explicitly make on the site.',
        necessaryTitle: 'Necessary browser storage',
        necessaryStatus: 'Always active',
        necessaryText: 'Used for language, light/dark theme and your consent preference. These settings are stored locally in your browser.',
        optionalTitle: 'Optional technologies',
        optionalStatus: 'None currently in use',
        optionalText: 'KLANS currently does not load analytics, advertising pixels, marketing trackers or other optional tracking technologies. This preference is stored so the consent system can record your choice.',
        allow: 'Allow optional technologies',
        block: 'Keep optional technologies off',
        save: 'Save preferences',
        close: 'Close',
      }
    : {
        title: 'Preferencias de cookies',
        intro: 'Elige cómo debe gestionar KLANS las tecnologías opcionales. El almacenamiento necesario del navegador permanece activo porque recuerda las elecciones que realizas expresamente en el sitio.',
        necessaryTitle: 'Almacenamiento necesario del navegador',
        necessaryStatus: 'Siempre activo',
        necessaryText: 'Se utiliza para el idioma, el tema claro/oscuro y tu preferencia de consentimiento. Estos ajustes se guardan localmente en tu navegador.',
        optionalTitle: 'Tecnologías opcionales',
        optionalStatus: 'Actualmente no se utiliza ninguna',
        optionalText: 'KLANS no carga actualmente analítica, píxeles publicitarios, rastreadores de marketing ni otras tecnologías opcionales de seguimiento. Esta preferencia se guarda para que el sistema de consentimiento pueda registrar tu elección.',
        allow: 'Permitir tecnologías opcionales',
        block: 'Mantener desactivadas las tecnologías opcionales',
        save: 'Guardar preferencias',
        close: 'Cerrar',
      };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="modal-panel max-w-2xl p-5 sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        aria-describedby="cookie-preferences-description"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">KLANS</p>
            <h2 id="cookie-preferences-title" className="mt-1 text-2xl font-semibold">{copy.title}</h2>
          </div>
          <button ref={closeRef} className="icon-button shrink-0" onClick={onClose} aria-label={copy.close}>×</button>
        </div>
        <p id="cookie-preferences-description" className="mt-4 text-sm leading-6 text-[var(--muted)]">{copy.intro}</p>

        <div className="mt-6 grid gap-4">
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--page)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{copy.necessaryTitle}</h3>
              <span className="rounded-full bg-[var(--section)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{copy.necessaryStatus}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.necessaryText}</p>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-[var(--page)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{copy.optionalTitle}</h3>
              <span className="rounded-full bg-[var(--section)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{copy.optionalStatus}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.optionalText}</p>
            <fieldset className="mt-4 grid gap-2">
              <legend className="sr-only">{copy.optionalTitle}</legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] p-3 text-sm">
                <input type="radio" name="optional-consent" checked={optional} onChange={() => setOptional(true)} className="mt-1" />
                <span>{copy.allow}</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] p-3 text-sm">
                <input type="radio" name="optional-consent" checked={!optional} onChange={() => setOptional(false)} className="mt-1" />
                <span>{copy.block}</span>
              </label>
            </fieldset>
          </section>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="secondary-button justify-center" onClick={onClose}>{copy.close}</button>
          <button className="primary-button justify-center" onClick={() => onSave(optional)}>{copy.save}</button>
        </div>
      </section>
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';
import { CONSENT_STORAGE_KEY } from '@/lib/consent';
import {
  COMPANY_ADDRESS_LINES,
  COMPANY_CIF,
  COMPANY_NAME,
  POLICY_LAST_UPDATED_EN,
  POLICY_LAST_UPDATED_ES,
  PRIVACY_CONTACT_EMAIL,
} from '@/lib/legal';
import { useConsent } from './ConsentProvider';
import { useSite } from './SiteProvider';

interface PolicySection {
  title: string;
  body: ReactNode;
}

interface StorageEntry {
  name: string;
  provider: string;
  purpose: string;
  type: string;
  duration: string;
  classification: string;
}

function OperatorDetails() {
  return (
    <address className="not-italic">
      <strong>{COMPANY_NAME}</strong><br />
      {COMPANY_ADDRESS_LINES.map((line) => <span key={line}>{line}<br /></span>)}
      CIF: {COMPANY_CIF}<br />
      Email: <a className="text-link" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>
    </address>
  );
}

export function CookiesContent() {
  const { language } = useSite();
  const { openPreferences } = useConsent();

  const storageEntries: StorageEntry[] = language === 'en'
    ? [
        {
          name: 'klans-language',
          provider: 'KLANZ / Naralimon S.C.',
          purpose: 'Remembers the English or Spanish language selected by the visitor.',
          type: 'localStorage',
          duration: 'Until changed or site data is cleared.',
          classification: 'Necessary preference',
        },
        {
          name: 'klans-theme',
          provider: 'KLANZ / Naralimon S.C.',
          purpose: 'Remembers the light or dark theme selected by the visitor.',
          type: 'localStorage',
          duration: 'Until changed or site data is cleared.',
          classification: 'Necessary preference',
        },
        {
          name: CONSENT_STORAGE_KEY,
          provider: 'KLANZ / Naralimon S.C.',
          purpose: 'Stores the visitor’s consent preference, consent version and the date/time at which the preference was updated.',
          type: 'localStorage',
          duration: 'Until changed, storage version changes, or site data is cleared.',
          classification: 'Necessary consent record',
        },
      ]
    : [
        {
          name: 'klans-language',
          provider: 'KLANZ / Naralimon S.C.',
          purpose: 'Recuerda el idioma inglés o español seleccionado por el visitante.',
          type: 'localStorage',
          duration: 'Hasta que se cambie o se borren los datos del sitio.',
          classification: 'Preferencia necesaria',
        },
        {
          name: 'klans-theme',
          provider: 'KLANZ / Naralimon S.C.',
          purpose: 'Recuerda el tema claro u oscuro seleccionado por el visitante.',
          type: 'localStorage',
          duration: 'Hasta que se cambie o se borren los datos del sitio.',
          classification: 'Preferencia necesaria',
        },
        {
          name: CONSENT_STORAGE_KEY,
          provider: 'KLANZ / Naralimon S.C.',
          purpose: 'Guarda la preferencia de consentimiento del visitante, la versión del consentimiento y la fecha/hora de su última actualización.',
          type: 'localStorage',
          duration: 'Hasta que se cambie, cambie la versión de almacenamiento o se borren los datos del sitio.',
          classification: 'Registro de consentimiento necesario',
        },
      ];

  const sections: PolicySection[] = language === 'en'
    ? [
        {
          title: '1. What cookies and similar technologies are',
          body: 'Cookies are small pieces of information that a website may store or retrieve through a browser. Browsers also provide technologies such as localStorage, which can keep simple preferences on the user’s device without creating an account or server-side database record.',
        },
        {
          title: '2. Who operates this website',
          body: (
            <>
              <OperatorDetails />
              <p className="mt-3">Naralimon S.C. owns KLANZ and is the copyright owner of KLANZ and its associated game materials.</p>
            </>
          ),
        },
        {
          title: '3. Applicable legislation',
          body: 'Where applicable, browser-storage and related processing are considered under Regulation (EU) 2016/679 (General Data Protection Regulation, GDPR), Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), and Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), including its rules relevant to storage and retrieval technologies. The GDPR/LOPDGDD concern personal-data protection; the LSSI-CE is the Spanish information-society/e-commerce legislation relevant to cookies and similar technologies.',
        },
        {
          title: '4. Technologies actually used by KLANZ',
          body: 'The audited KLANZ application code uses localStorage for language, theme and consent preferences. It does not call document.cookie, does not use sessionStorage, and does not integrate Google Analytics, gtag, Google Tag Manager, Meta/Facebook Pixel, Vercel Analytics, Microsoft Clarity, Hotjar or another advertising/marketing tracker. The application code does not currently set its own analytics, advertising or marketing cookies. Hosting and security infrastructure may independently process technical request information necessary to deliver and protect the website; that is distinct from the three browser-storage entries deliberately implemented by KLANZ.',
        },
        {
          title: '5. Necessary and preference-related storage',
          body: 'The language and theme values remember settings explicitly chosen by the visitor. The consent record remembers the visitor’s privacy/cookie choice so the site can respect it across normal navigation and page reloads. These values remain on the user’s device and are not a server-side player database.',
        },
        {
          title: '6. Optional technologies',
          body: 'No optional analytics, advertising, marketing or tracking technology is currently integrated into KLANZ. The current consent interface can record an Accept or Reject preference, but accepting optional technologies does not currently activate analytics, advertising or marketing code because none is present. If optional technology is added in future, it must not be enabled before any required consent and this policy must be updated to identify it accurately.',
        },
        {
          title: '7. Consent banner and Cookie Settings',
          body: 'The site displays a privacy/cookie notice when no consent record has yet been stored. The visitor can Accept, Reject or open Preferences. The saved choice is written to localStorage under klans-consent. Cookie Settings in the global footer reopens the preference interface after the initial notice has been dismissed.',
        },
        {
          title: '8. Changing or withdrawing your choice',
          body: 'You can change the stored optional-technology preference at any time through Cookie Settings in the footer. You do not need to clear all browser data manually. Clearing KLANZ site data will also remove the stored preference, in which case the notice will appear again.',
        },
        {
          title: '9. Retention',
          body: 'localStorage has no automatic expiry date. The KLANZ language, theme and consent values normally remain until they are changed, the relevant storage version changes, or the visitor/browser clears site data. KLANZ does not invent a fixed expiry period that the implementation does not enforce.',
        },
        {
          title: '10. Technical service providers',
          body: 'KLANZ is deployed using Vercel infrastructure. Hosting and network providers may process technical request information necessary to deliver, secure and diagnose the website. This policy does not list advertising or analytics providers because none are integrated into the current KLANZ application.',
        },
        {
          title: '11. KLANZ ownership',
          body: 'KLANZ and its associated game materials are the property of Naralimon S.C. and are protected by applicable intellectual-property legislation. This Cookie Policy does not grant a licence or permission for unrestricted reuse.',
        },
      ]
    : [
        {
          title: '1. Qué son las cookies y tecnologías similares',
          body: 'Las cookies son pequeños elementos de información que un sitio web puede guardar o recuperar mediante el navegador. Los navegadores también ofrecen tecnologías como localStorage, que permiten conservar preferencias sencillas en el dispositivo del usuario sin crear una cuenta ni un registro en una base de datos del servidor.',
        },
        {
          title: '2. Quién opera este sitio web',
          body: (
            <>
              <OperatorDetails />
              <p className="mt-3">Naralimon S.C. es propietaria de KLANZ y titular de los derechos de autor de KLANZ y de sus materiales de juego asociados.</p>
            </>
          ),
        },
        {
          title: '3. Legislación aplicable',
          body: 'Cuando resulte aplicable, el almacenamiento en el navegador y los tratamientos relacionados se consideran conforme al Reglamento (UE) 2016/679 (Reglamento General de Protección de Datos, RGPD), la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), y la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), incluidas sus normas relevantes para tecnologías de almacenamiento y recuperación. El RGPD/LOPDGDD se refieren a la protección de datos personales; la LSSI-CE es la legislación española de servicios de la sociedad de la información/comercio electrónico relevante para cookies y tecnologías similares.',
        },
        {
          title: '4. Tecnologías que KLANZ utiliza realmente',
          body: 'El código auditado de KLANZ utiliza localStorage para las preferencias de idioma, tema y consentimiento. No llama a document.cookie, no utiliza sessionStorage y no integra Google Analytics, gtag, Google Tag Manager, Meta/Facebook Pixel, Vercel Analytics, Microsoft Clarity, Hotjar ni otro rastreador publicitario o de marketing. El código de la aplicación no establece actualmente cookies propias de analítica, publicidad o marketing. La infraestructura de alojamiento y seguridad puede tratar de forma independiente información técnica de las solicitudes necesaria para servir y proteger el sitio; esto es distinto de los tres elementos de almacenamiento del navegador implementados deliberadamente por KLANZ.',
        },
        {
          title: '5. Almacenamiento necesario y de preferencias',
          body: 'Los valores de idioma y tema recuerdan ajustes elegidos expresamente por el visitante. El registro de consentimiento recuerda la elección de privacidad/cookies para que el sitio pueda respetarla durante la navegación normal y tras recargar páginas. Estos valores permanecen en el dispositivo del usuario y no constituyen una base de datos de jugadores en el servidor.',
        },
        {
          title: '6. Tecnologías opcionales',
          body: 'Actualmente KLANZ no integra ninguna tecnología opcional de analítica, publicidad, marketing o seguimiento. La interfaz de consentimiento actual puede registrar una preferencia de Aceptar o Rechazar, pero aceptar tecnologías opcionales no activa actualmente código de analítica, publicidad o marketing porque no existe ninguno. Si en el futuro se incorpora una tecnología opcional, no deberá activarse antes del consentimiento que resulte necesario y esta política deberá actualizarse para identificarla con precisión.',
        },
        {
          title: '7. Aviso de consentimiento y Configurar cookies',
          body: 'El sitio muestra un aviso de privacidad/cookies cuando todavía no existe un registro de consentimiento. El visitante puede Aceptar, Rechazar o abrir Preferencias. La elección guardada se escribe en localStorage con la clave klans-consent. Configurar cookies, en el pie de página global, permite volver a abrir la interfaz de preferencias después de cerrar el aviso inicial.',
        },
        {
          title: '8. Cambio o retirada de la elección',
          body: 'Puedes cambiar en cualquier momento la preferencia guardada sobre tecnologías opcionales mediante Configurar cookies en el pie de página. No es necesario borrar manualmente todos los datos del navegador. Si borras los datos del sitio KLANZ, también se eliminará la preferencia guardada y el aviso volverá a aparecer.',
        },
        {
          title: '9. Conservación',
          body: 'localStorage no tiene una fecha de caducidad automática. Los valores de idioma, tema y consentimiento de KLANZ normalmente permanecen hasta que se cambian, cambia la versión de almacenamiento correspondiente o el visitante/navegador borra los datos del sitio. KLANZ no inventa un plazo fijo de caducidad que la implementación no aplica.',
        },
        {
          title: '10. Proveedores técnicos',
          body: 'KLANZ se despliega mediante infraestructura de Vercel. Los proveedores de alojamiento y red pueden tratar información técnica de las solicitudes necesaria para servir, proteger y diagnosticar el sitio web. Esta política no enumera proveedores de publicidad o analítica porque ninguno está integrado en la aplicación KLANZ actual.',
        },
        {
          title: '11. Titularidad de KLANZ',
          body: 'KLANZ y sus materiales de juego asociados son propiedad de Naralimon S.C. y están protegidos por la legislación aplicable en materia de propiedad intelectual. Esta Política de Cookies no concede una licencia ni permiso para su reutilización sin restricciones.',
        },
      ];

  return (
    <main className="site-container py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">KLANZ</p>
        <h1 className="section-title">{language === 'en' ? 'Cookie Policy' : 'Política de Cookies'}</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {language === 'en'
            ? 'This policy describes the browser storage and consent technologies actually used by KLANZ.'
            : 'Esta política describe el almacenamiento del navegador y las tecnologías de consentimiento que KLANZ utiliza realmente.'}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {language === 'en' ? `Last updated: ${POLICY_LAST_UPDATED_EN}` : `Última actualización: ${POLICY_LAST_UPDATED_ES}`}
        </p>
      </header>

      <div className="mt-9 grid gap-4">
        {sections.slice(0, 4).map((section) => (
          <section key={section.title} className="rule-section">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <div className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</div>
          </section>
        ))}

        <section className="rule-section">
          <h2 className="text-lg font-semibold">{language === 'en' ? 'Storage used by KLANZ' : 'Almacenamiento utilizado por KLANZ'}</h2>
          <div className="mt-4 grid gap-3">
            {storageEntries.map((entry) => (
              <article key={entry.name} className="rounded-xl border border-[var(--line)] bg-[var(--page)] p-4">
                <h3 className="font-mono text-sm font-semibold text-[var(--ink)] break-all">{entry.name}</h3>
                <dl className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-2">
                  <div><dt className="font-semibold text-[var(--ink)]">{language === 'en' ? 'Provider' : 'Proveedor'}</dt><dd>{entry.provider}</dd></div>
                  <div><dt className="font-semibold text-[var(--ink)]">{language === 'en' ? 'Type' : 'Tipo'}</dt><dd>{entry.type}</dd></div>
                  <div className="sm:col-span-2"><dt className="font-semibold text-[var(--ink)]">{language === 'en' ? 'Purpose' : 'Finalidad'}</dt><dd>{entry.purpose}</dd></div>
                  <div><dt className="font-semibold text-[var(--ink)]">{language === 'en' ? 'Duration' : 'Duración'}</dt><dd>{entry.duration}</dd></div>
                  <div><dt className="font-semibold text-[var(--ink)]">{language === 'en' ? 'Classification' : 'Clasificación'}</dt><dd>{entry.classification}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        {sections.slice(4).map((section) => (
          <section key={section.title} className="rule-section">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <div className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</div>
          </section>
        ))}

        <section className="rule-section">
          <h2 className="text-lg font-semibold">{language === 'en' ? 'Cookie Settings' : 'Configurar cookies'}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {language === 'en'
              ? 'Open the preference interface to review or change the choice stored on this device.'
              : 'Abre la interfaz de preferencias para revisar o cambiar la elección guardada en este dispositivo.'}
          </p>
          <button className="secondary-button mt-4" type="button" onClick={openPreferences}>
            {language === 'en' ? 'Cookie Settings' : 'Configurar cookies'}
          </button>
        </section>
      </div>
    </main>
  );
}

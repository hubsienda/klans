'use client';

import { CONSENT_STORAGE_KEY } from '@/lib/consent';
import { useConsent } from './ConsentProvider';
import { useSite } from './SiteProvider';

export function CookiesContent() {
  const { language } = useSite();
  const { openPreferences } = useConsent();

  const sections = language === 'en'
    ? [
        {
          title: '1. Cookies and browser storage',
          body: 'Cookies are small pieces of information a website can store through the browser. Browsers can also provide localStorage, which stores simple site preferences without creating an account. The current KLANS implementation uses localStorage for site preferences and consent; it does not currently set analytics, advertising or marketing cookies.',
        },
        {
          title: '2. Necessary storage used by KLANS',
          body: 'KLANS stores three first-party browser preferences: klans-language remembers English or Spanish; klans-theme remembers light or dark mode; and klans-consent stores your consent choice and the time it was updated. These values are used only to remember choices you make on the site.',
        },
        {
          title: '3. Optional technologies',
          body: 'No optional analytics, advertising, marketing pixels or similar tracking technologies are currently enabled in KLANS. Accepting optional technologies therefore does not activate any analytics or marketing service in the current implementation. If optional technology is introduced in a future implementation, it must respect the saved consent choice and this policy must be updated to describe it accurately.',
        },
        {
          title: '4. Retention',
          body: 'localStorage has no automatic expiry date. Language, theme and consent preferences normally remain until you change them, clear this site’s browser data, use browser privacy controls that remove them, or the application changes the relevant storage version.',
        },
        {
          title: '5. Online game state',
          body: 'The Human-vs-Computer game uses browser memory while a match is running. The current implementation does not use persistent cookies or localStorage to create a continuing player profile or server-side game history.',
        },
        {
          title: '6. Changing your choice',
          body: 'You can reopen the consent preferences at any time through Cookie Settings in the global footer. You can also clear KLANS site data using your browser settings. If the stored consent preference is removed, the consent banner will appear again on your next visit.',
        },
        {
          title: '7. KLANS ownership',
          body: 'Naralimon s.c. is the copyright owner of KLANS. This cookie policy does not grant any licence or permission to reuse KLANS rules, game-system materials, names, artwork or associated game content.',
        },
      ]
    : [
        {
          title: '1. Cookies y almacenamiento del navegador',
          body: 'Las cookies son pequeños elementos de información que un sitio web puede guardar mediante el navegador. Los navegadores también ofrecen localStorage, que permite guardar preferencias sencillas del sitio sin crear una cuenta. La implementación actual de KLANS utiliza localStorage para preferencias y consentimiento; actualmente no establece cookies de analítica, publicidad o marketing.',
        },
        {
          title: '2. Almacenamiento necesario utilizado por KLANS',
          body: 'KLANS guarda tres preferencias propias en el navegador: klans-language recuerda inglés o español; klans-theme recuerda el modo claro u oscuro; y klans-consent guarda tu elección de consentimiento y el momento en que fue actualizada. Estos valores se utilizan únicamente para recordar decisiones que realizas en el sitio.',
        },
        {
          title: '3. Tecnologías opcionales',
          body: 'Actualmente KLANS no tiene activadas tecnologías opcionales de analítica, publicidad, píxeles de marketing ni mecanismos similares de seguimiento. Por tanto, aceptar tecnologías opcionales no activa ningún servicio de analítica o marketing en la implementación actual. Si se incorpora una tecnología opcional en una implementación futura, deberá respetar la elección de consentimiento guardada y esta política deberá actualizarse para describirla con precisión.',
        },
        {
          title: '4. Conservación',
          body: 'localStorage no tiene una fecha de caducidad automática. Las preferencias de idioma, tema y consentimiento normalmente permanecen hasta que las cambies, borres los datos del sitio desde el navegador, utilices controles de privacidad del navegador que las eliminen o la aplicación cambie la versión del almacenamiento correspondiente.',
        },
        {
          title: '5. Estado del juego online',
          body: 'El juego Humano contra Ordenador utiliza la memoria del navegador mientras hay una partida en curso. La implementación actual no utiliza cookies persistentes ni localStorage para crear un perfil permanente de jugador o un historial de partidas en el servidor.',
        },
        {
          title: '6. Cómo cambiar tu elección',
          body: 'Puedes volver a abrir las preferencias de consentimiento en cualquier momento mediante Configurar cookies en el pie de página global. También puedes borrar los datos de KLANS desde la configuración de tu navegador. Si se elimina la preferencia de consentimiento guardada, el aviso volverá a aparecer en tu siguiente visita.',
        },
        {
          title: '7. Titularidad de KLANS',
          body: 'Naralimon s.c. es el titular de los derechos de autor de KLANS. Esta política de cookies no concede ninguna licencia ni permiso para reutilizar las reglas de KLANS, los materiales del sistema de juego, nombres, ilustraciones o contenidos asociados.',
        },
      ];

  return (
    <main className="site-container py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">KLANS</p>
        <h1 className="section-title">{language === 'en' ? 'Cookie Policy' : 'Política de Cookies'}</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {language === 'en'
            ? 'This policy describes the browser storage and consent technologies actually used by KLANS.'
            : 'Esta política describe el almacenamiento del navegador y las tecnologías de consentimiento que KLANS utiliza realmente.'}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">{language === 'en' ? 'Last updated: 5 October 2026' : 'Última actualización: 5 de octubre de 2026'}</p>
      </header>

      <div className="mt-9 grid gap-4">
        {sections.map((section) => (
          <section key={section.title} className="rule-section">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
          </section>
        ))}
        <section className="rule-section">
          <h2 className="text-lg font-semibold">{language === 'en' ? '8. Cookie settings' : '8. Configurar cookies'}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {language === 'en'
              ? `Your consent record is stored locally under ${CONSENT_STORAGE_KEY}. You do not need to clear browser storage manually to change it.`
              : `Tu registro de consentimiento se guarda localmente con la clave ${CONSENT_STORAGE_KEY}. No necesitas borrar manualmente el almacenamiento del navegador para cambiarlo.`}
          </p>
          <button className="secondary-button mt-4" type="button" onClick={openPreferences}>
            {language === 'en' ? 'Cookie Settings' : 'Configurar cookies'}
          </button>
        </section>
      </div>
    </main>
  );
}

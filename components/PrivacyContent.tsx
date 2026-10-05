'use client';

import { PRIVACY_CONTACT_EMAIL } from '@/lib/legal';
import { useSite } from './SiteProvider';

export function PrivacyContent() {
  const { language } = useSite();

  const sections = language === 'en'
    ? [
        {
          title: '1. What KLANS is',
          body: 'KLANS is a website for the KLANS tabletop card game and a Human-vs-Computer browser adaptation. The online game runs locally in the browser and does not require an account, login or server-side player profile.',
        },
        {
          title: '2. Technical information when you visit',
          body: 'Like ordinary websites, the hosting and delivery infrastructure may process standard technical request information needed to deliver, secure and diagnose the site. This can include an IP address, requested URL, date and time, browser or user-agent information and security or error logs. The KLANS application code does not use this information to create advertising profiles.',
        },
        {
          title: '3. Browser storage',
          body: 'KLANS uses localStorage to remember the language you choose, the light or dark theme you choose, and your cookie/privacy consent preference. The current online match state is held in browser memory while you play and is not persisted by this implementation as a player account or server-side game record.',
        },
        {
          title: '4. Analytics and optional technologies',
          body: 'KLANS currently does not include Google Analytics, Meta Pixel, advertising cookies, marketing trackers or other optional analytics/tracking technologies. Optional technologies must not be activated before the relevant consent is granted. The site fonts are self-hosted by the deployed application rather than loaded from Google Fonts in the visitor browser.',
        },
        {
          title: '5. Consent preferences',
          body: 'Your Accept, Reject or saved preference is stored locally in your browser. You can change it at any time through Cookie Settings in the footer. Clearing this site’s browser storage will remove the saved preference and the consent banner will be shown again.',
        },
        {
          title: '6. External links',
          body: 'The site may link to external websites, including Naralimon. External sites have their own privacy practices. KLANS does not control those sites, and information is not sent to an external site merely because a normal text link is displayed; navigation occurs when you choose to follow the link.',
        },
        {
          title: '7. Your privacy rights',
          body: 'Depending on the law that applies to you, you may have rights concerning personal data, such as access, correction, deletion, restriction, objection, portability or the right to complain to a competent supervisory authority. These rights apply where the relevant legal conditions are met.',
        },
      ]
    : [
        {
          title: '1. Qué es KLANS',
          body: 'KLANS es un sitio web dedicado al juego de cartas de mesa KLANS y a una adaptación Humano contra Ordenador que funciona en el navegador. El juego online se ejecuta localmente en el navegador y no requiere cuenta, inicio de sesión ni perfil de jugador en el servidor.',
        },
        {
          title: '2. Información técnica al visitar el sitio',
          body: 'Como ocurre con los sitios web normales, la infraestructura de alojamiento y entrega puede tratar información técnica estándar necesaria para servir, proteger y diagnosticar el sitio. Puede incluir la dirección IP, la URL solicitada, fecha y hora, información del navegador o user-agent y registros de seguridad o errores. El código de la aplicación KLANS no utiliza esta información para crear perfiles publicitarios.',
        },
        {
          title: '3. Almacenamiento del navegador',
          body: 'KLANS utiliza localStorage para recordar el idioma elegido, el tema claro u oscuro elegido y tu preferencia de consentimiento de privacidad/cookies. El estado de la partida online actual se mantiene en la memoria del navegador mientras juegas y esta implementación no lo conserva como cuenta de jugador ni como registro de partida en el servidor.',
        },
        {
          title: '4. Analítica y tecnologías opcionales',
          body: 'KLANS no incluye actualmente Google Analytics, Meta Pixel, cookies publicitarias, rastreadores de marketing ni otras tecnologías opcionales de analítica o seguimiento. Las tecnologías opcionales no deben activarse antes de obtener el consentimiento correspondiente. Las fuentes del sitio son servidas por la propia aplicación desplegada y no se cargan desde Google Fonts en el navegador del visitante.',
        },
        {
          title: '5. Preferencias de consentimiento',
          body: 'Tu elección de Aceptar, Rechazar o la preferencia guardada se almacena localmente en tu navegador. Puedes cambiarla en cualquier momento mediante Configurar cookies en el pie de página. Si borras el almacenamiento de este sitio en el navegador, se eliminará la preferencia guardada y volverá a mostrarse el aviso de consentimiento.',
        },
        {
          title: '6. Enlaces externos',
          body: 'El sitio puede enlazar a páginas externas, incluida Naralimon. Esos sitios tienen sus propias prácticas de privacidad. KLANS no controla esos sitios y no se envía información a un sitio externo simplemente porque se muestre un enlace de texto normal; la navegación se produce cuando decides seguir el enlace.',
        },
        {
          title: '7. Tus derechos de privacidad',
          body: 'Dependiendo de la legislación que te resulte aplicable, puedes tener derechos sobre tus datos personales, como acceso, rectificación, supresión, limitación, oposición, portabilidad o el derecho a reclamar ante una autoridad de control competente. Estos derechos se aplican cuando se cumplen las condiciones legales correspondientes.',
        },
      ];

  const contactText = PRIVACY_CONTACT_EMAIL
    ? language === 'en'
      ? <>Privacy enquiries: <a className="text-link" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>.</>
      : <>Consultas de privacidad: <a className="text-link" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>.</>
    : language === 'en'
      ? 'A dedicated privacy contact address is not currently published on this website. When the operator supplies one, it can be added here without changing the policy structure.'
      : 'Actualmente no se publica en este sitio una dirección de contacto específica para privacidad. Cuando el operador facilite una, podrá añadirse aquí sin modificar la estructura de la política.';

  return (
    <main className="site-container py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">KLANS</p>
        <h1 className="section-title">{language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {language === 'en'
            ? 'This policy explains how the KLANS website and browser game handle information and browser-side preferences.'
            : 'Esta política explica cómo el sitio web y el juego de navegador de KLANS tratan la información y las preferencias guardadas en el navegador.'}
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
          <h2 className="text-lg font-semibold">{language === 'en' ? '8. Privacy contact' : '8. Contacto de privacidad'}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{contactText}</p>
        </section>
      </div>
    </main>
  );
}

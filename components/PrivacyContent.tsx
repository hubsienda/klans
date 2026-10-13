'use client';

import type { ReactNode } from 'react';
import {
  COMPANY_ADDRESS_LINES,
  COMPANY_CIF,
  COMPANY_NAME,
  POLICY_LAST_UPDATED_EN,
  POLICY_LAST_UPDATED_ES,
  PRIVACY_CONTACT_EMAIL,
} from '@/lib/legal';
import { useSite } from './SiteProvider';

interface PolicySection {
  title: string;
  body: ReactNode;
}

function ControllerDetails() {
  return (
    <address className="not-italic">
      <strong>{COMPANY_NAME}</strong><br />
      {COMPANY_ADDRESS_LINES.map((line) => <span key={line}>{line}<br /></span>)}
      CIF: {COMPANY_CIF}<br />
      Email: <a className="text-link" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>
    </address>
  );
}

export function PrivacyContent() {
  const { language } = useSite();

  const sections: PolicySection[] = language === 'en'
    ? [
        {
          title: '1. Data Controller',
          body: (
            <>
              <ControllerDetails />
              <p className="mt-3">Naralimon S.C. operates this website, owns KLANZ and is the copyright owner of KLANZ and its associated game materials.</p>
            </>
          ),
        },
        {
          title: '2. Applicable legislation',
          body: 'Where applicable, personal-data processing is governed by Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 (General Data Protection Regulation, GDPR) and by Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).',
        },
        {
          title: '3. Personal data that may be processed',
          body: 'The website and its hosting/network infrastructure may process technical request information needed to deliver and secure the site, such as IP address, requested URL, date and time, browser or user-agent information, device/network information and security or error logs. If you contact Naralimon voluntarily, the information you send may also be processed to answer you. KLANZ stores language, light/dark theme and consent preferences locally in your browser. The current website has no user accounts, player database, newsletter, profiling system or account-based game history.',
        },
        {
          title: '4. Purposes of processing',
          body: 'Information may be processed to operate, deliver, maintain and secure the KLANZ website; provide the Human-vs-Computer browser game; remember visitor-selected language, theme and consent preferences; respond to communications sent to Naralimon; diagnose technical problems; and comply with applicable legal obligations.',
        },
        {
          title: '5. Legal basis',
          body: 'The legal basis depends on the activity concerned. Website delivery, security and technical administration may rely on Naralimon S.C.’s legitimate interests in operating a secure and functional service. Communications sent by a user may be processed in order to respond to steps or requests initiated by that user and, where appropriate, on legitimate interests. Consent is used where processing genuinely requires it, including any future optional technology that would require consent. Processing may also be necessary to comply with legal obligations. Consent is not treated as the legal basis for every operation of the website.',
        },
        {
          title: '6. Data retention',
          body: 'Information is retained only for as long as reasonably necessary for the purpose for which it is processed and for any applicable legal requirements. Browser preferences stored in localStorage remain on the user’s device until they are changed, removed by the user or browser, or the relevant storage version changes. KLANZ does not establish an arbitrary fixed retention period for those local preferences. Technical infrastructure logs and communications may be retained according to operational necessity and applicable legal requirements.',
        },
        {
          title: '7. Recipients and service providers',
          body: 'Limited information may be processed by technical service providers where necessary to host, deliver, secure or maintain the website. KLANZ is deployed using Vercel infrastructure. Service providers do not become owners of KLANZ by providing technical services. The current application does not integrate advertising networks, marketing platforms or analytics services, and Naralimon S.C. does not state that personal data is sold.',
        },
        {
          title: '8. International transfers',
          body: 'Technical hosting and network services may involve infrastructure located or operated in more than one country. Where personal data is transferred internationally, any such transfer must be handled in accordance with applicable data-protection law and the relevant service-provider arrangements. This policy does not claim that a particular international transfer occurs on every visit or invent a transfer mechanism that has not been established.',
        },
        {
          title: '9. Your rights',
          body: 'Where the GDPR and Spanish data-protection law apply, you may have the right to access your personal data, request rectification or erasure, request restriction of processing, object to processing, request data portability where applicable, and withdraw consent at any time where processing is based on consent. Withdrawal does not affect the lawfulness of processing carried out before withdrawal.',
        },
        {
          title: '10. How to exercise your rights',
          body: (
            <>
              Requests may be sent to <a className="text-link" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>. Please identify the request sufficiently for Naralimon S.C. to understand and handle it; the policy does not require unnecessary information from you.
            </>
          ),
        },
        {
          title: '11. Supervisory authority',
          body: (
            <>
              You may lodge a complaint with the competent supervisory authority where applicable. In Spain, the supervisory authority is the Agencia Española de Protección de Datos (AEPD). Its official website is{' '}
              <a className="text-link" href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
            </>
          ),
        },
        {
          title: '12. Security',
          body: 'Naralimon S.C. uses appropriate technical and organisational measures intended to protect information in a manner proportionate to the nature of the website and the information involved. No internet service can guarantee absolute security.',
        },
        {
          title: '13. Children and minors',
          body: 'KLANZ does not require an account merely to use the website or play the current browser game, and the site does not operate a separate children’s-data programme or age-gated account system. If a minor voluntarily contacts Naralimon, any resulting information should be handled in accordance with applicable law and the circumstances of the communication.',
        },
        {
          title: '14. External links',
          body: 'KLANZ may contain links to third-party websites, including Naralimon’s main website. Those websites are governed by their own privacy practices. Following an external link takes you to a service that KLANZ does not control.',
        },
        {
          title: '15. Changes to this Privacy Policy',
          body: 'This Privacy Policy may be updated when legal, technical or operational changes make an update appropriate. The revision date shown on this page identifies the version currently published.',
        },
      ]
    : [
        {
          title: '1. Responsable del tratamiento',
          body: (
            <>
              <ControllerDetails />
              <p className="mt-3">Naralimon S.C. opera este sitio web, es propietaria de KLANZ y es titular de los derechos de autor de KLANZ y de sus materiales de juego asociados.</p>
            </>
          ),
        },
        {
          title: '2. Legislación aplicable',
          body: 'Cuando resulte aplicable, el tratamiento de datos personales se rige por el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016 (Reglamento General de Protección de Datos, RGPD) y por la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).',
        },
        {
          title: '3. Datos personales que pueden tratarse',
          body: 'El sitio web y su infraestructura de alojamiento/red pueden tratar información técnica de las solicitudes necesaria para servir y proteger el sitio, como dirección IP, URL solicitada, fecha y hora, información del navegador o user-agent, información del dispositivo/red y registros de seguridad o errores. Si contactas voluntariamente con Naralimon, también podrá tratarse la información que envíes para responderte. KLANZ guarda localmente en tu navegador las preferencias de idioma, tema claro/oscuro y consentimiento. El sitio actual no dispone de cuentas de usuario, base de datos de jugadores, newsletter, sistema de perfiles ni historial de partidas asociado a cuentas.',
        },
        {
          title: '4. Finalidades del tratamiento',
          body: 'La información puede tratarse para operar, servir, mantener y proteger el sitio web de KLANZ; proporcionar el juego Humano contra Ordenador en el navegador; recordar las preferencias de idioma, tema y consentimiento elegidas por el visitante; responder a comunicaciones enviadas a Naralimon; diagnosticar problemas técnicos; y cumplir obligaciones legales aplicables.',
        },
        {
          title: '5. Base jurídica',
          body: 'La base jurídica depende de la actividad concreta. La entrega, seguridad y administración técnica del sitio pueden basarse en el interés legítimo de Naralimon S.C. en operar un servicio seguro y funcional. Las comunicaciones enviadas por un usuario pueden tratarse para atender actuaciones o solicitudes iniciadas por dicho usuario y, cuando proceda, sobre la base del interés legítimo. El consentimiento se utiliza cuando el tratamiento realmente lo requiere, incluida cualquier futura tecnología opcional que exija consentimiento. También puede ser necesario tratar información para cumplir obligaciones legales. El consentimiento no se considera automáticamente la base jurídica de todas las operaciones del sitio.',
        },
        {
          title: '6. Conservación de los datos',
          body: 'La información se conserva únicamente durante el tiempo razonablemente necesario para la finalidad para la que se trata y para cumplir los requisitos legales aplicables. Las preferencias del navegador guardadas en localStorage permanecen en el dispositivo del usuario hasta que se cambian, son eliminadas por el usuario o el navegador, o cambia la versión de almacenamiento correspondiente. KLANZ no establece un plazo arbitrario fijo para esas preferencias locales. Los registros técnicos de infraestructura y las comunicaciones pueden conservarse según las necesidades operativas y los requisitos legales aplicables.',
        },
        {
          title: '7. Destinatarios y proveedores de servicios',
          body: 'Determinada información limitada puede ser tratada por proveedores técnicos cuando sea necesario para alojar, servir, proteger o mantener el sitio web. KLANZ se despliega mediante infraestructura de Vercel. Los proveedores de servicios no se convierten en propietarios de KLANZ por prestar servicios técnicos. La aplicación actual no integra redes publicitarias, plataformas de marketing ni servicios de analítica, y Naralimon S.C. no afirma que venda datos personales.',
        },
        {
          title: '8. Transferencias internacionales',
          body: 'Los servicios técnicos de alojamiento y red pueden implicar infraestructura ubicada u operada en más de un país. Cuando exista una transferencia internacional de datos personales, deberá gestionarse de conformidad con la normativa de protección de datos aplicable y con los acuerdos del proveedor de servicios correspondiente. Esta política no afirma que se produzca una transferencia concreta en cada visita ni inventa un mecanismo de transferencia que no esté establecido.',
        },
        {
          title: '9. Tus derechos',
          body: 'Cuando resulten aplicables el RGPD y la normativa española de protección de datos, puedes tener derecho de acceso, rectificación, supresión, limitación del tratamiento, oposición y portabilidad cuando proceda, así como a retirar el consentimiento en cualquier momento cuando el tratamiento se base en él. La retirada no afecta a la licitud del tratamiento realizado antes de dicha retirada.',
        },
        {
          title: '10. Cómo ejercer tus derechos',
          body: (
            <>
              Las solicitudes pueden enviarse a <a className="text-link" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a>. Indica suficientemente la solicitud para que Naralimon S.C. pueda comprenderla y tramitarla; esta política no exige que aportes información innecesaria.
            </>
          ),
        },
        {
          title: '11. Autoridad de control',
          body: (
            <>
              Puedes presentar una reclamación ante la autoridad de control competente cuando proceda. En España, la autoridad de control es la Agencia Española de Protección de Datos (AEPD). Su sitio web oficial es{' '}
              <a className="text-link" href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
            </>
          ),
        },
        {
          title: '12. Seguridad',
          body: 'Naralimon S.C. aplica medidas técnicas y organizativas apropiadas destinadas a proteger la información de forma proporcionada a la naturaleza del sitio y de la información tratada. Ningún servicio de Internet puede garantizar una seguridad absoluta.',
        },
        {
          title: '13. Menores',
          body: 'KLANZ no exige una cuenta simplemente para utilizar el sitio web o jugar a la versión actual en el navegador, y el sitio no opera un programa separado de datos de menores ni un sistema de cuentas con control de edad. Si un menor contacta voluntariamente con Naralimon, la información resultante deberá tratarse conforme a la normativa aplicable y a las circunstancias de la comunicación.',
        },
        {
          title: '14. Enlaces externos',
          body: 'KLANZ puede contener enlaces a sitios web de terceros, incluido el sitio principal de Naralimon. Esos sitios se rigen por sus propias prácticas de privacidad. Al seguir un enlace externo accedes a un servicio que KLANZ no controla.',
        },
        {
          title: '15. Cambios en esta Política de Privacidad',
          body: 'Esta Política de Privacidad puede actualizarse cuando cambios legales, técnicos u operativos hagan necesaria una revisión. La fecha de actualización que aparece en esta página identifica la versión actualmente publicada.',
        },
      ];

  return (
    <main className="site-container py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">KLANZ</p>
        <h1 className="section-title">{language === 'en' ? 'Privacy Policy' : 'Política de Privacidad'}</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {language === 'en'
            ? 'This policy explains how the KLANZ website and browser game handle personal data, technical information and browser-side preferences.'
            : 'Esta política explica cómo el sitio web y el juego de navegador de KLANZ tratan datos personales, información técnica y preferencias guardadas en el navegador.'}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {language === 'en' ? `Last updated: ${POLICY_LAST_UPDATED_EN}` : `Última actualización: ${POLICY_LAST_UPDATED_ES}`}
        </p>
      </header>

      <div className="mt-9 grid gap-4">
        {sections.map((section) => (
          <section key={section.title} className="rule-section">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <div className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</div>
          </section>
        ))}
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Qué información recolecta (y sobre todo, cuál no) realidad.uy: sin cuentas, sin cookies propias, sin rastreadores.",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">Legal</p>
      <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
        Política de privacidad
      </h1>
      <p className="mt-1 text-sm text-ink-faint">Última actualización: 30 de septiembre de 2026</p>

      <div className="mt-8 space-y-8 text-ink-soft">
        <section aria-labelledby="resumen">
          <h2 id="resumen" className="font-display text-xl font-bold text-ink">
            Lo importante, primero
          </h2>
          <p className="mt-2">
            realidad.uy está diseñada para funcionar <strong>sin recolectar datos
            personales</strong>: no hay cuentas de usuario, no hay formularios, no usamos
            cookies propias ni herramientas de analítica o publicidad, y no vendemos ni
            compartimos información con terceros. Podés navegar todo el sitio de forma
            anónima.
          </p>
        </section>

        <section aria-labelledby="que-no">
          <h2 id="que-no" className="font-display text-xl font-bold text-ink">
            Qué NO recolectamos
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Nombre, correo electrónico ni ningún dato de contacto.</li>
            <li>Cookies de seguimiento, identificadores publicitarios o huellas del navegador.</li>
            <li>Historial de navegación dentro del sitio asociado a tu identidad.</li>
            <li>Ubicación precisa.</li>
          </ul>
        </section>

        <section aria-labelledby="alojamiento">
          <h2 id="alojamiento" className="font-display text-xl font-bold text-ink">
            Registros técnicos del alojamiento
          </h2>
          <p className="mt-2">
            El sitio se aloja en <strong>Vercel</strong>. Como cualquier servidor web, el
            proveedor registra de forma transitoria datos técnicos de cada visita (dirección
            IP, tipo de navegador, página solicitada) con fines de seguridad y operación.
            Esos registros los gestiona Vercel según su{" "}
            <a
              className="font-semibold text-primary underline decoration-line underline-offset-2 hover:decoration-primary"
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad
            </a>
            ; nosotros no los usamos para identificar personas.
          </p>
        </section>

        <section aria-labelledby="enlaces">
          <h2 id="enlaces" className="font-display text-xl font-bold text-ink">
            Enlaces a sitios de terceros
          </h2>
          <p className="mt-2">
            Cada dato enlaza a su fuente original (INE, BCU, Corte Electoral, Ministerio del
            Interior, Banco Mundial, entre otros). Al seguir esos enlaces salís de
            realidad.uy y aplican las políticas de privacidad de cada organismo.
          </p>
        </section>

        <section aria-labelledby="cambios-priv">
          <h2 id="cambios-priv" className="font-display text-xl font-bold text-ink">
            Cambios a esta política
          </h2>
          <p className="mt-2">
            Si en el futuro el sitio incorpora funciones que cambien este panorama (por
            ejemplo, métricas de audiencia agregadas), esta página se actualizará antes,
            indicando la fecha de revisión. La versión vigente es siempre la publicada acá.
          </p>
        </section>

        <section aria-labelledby="contacto-priv">
          <h2 id="contacto-priv" className="font-display text-xl font-bold text-ink">
            Contacto
          </h2>
          <p className="mt-2">
            Consultas sobre privacidad:{" "}
            <a
              className="font-semibold text-primary underline decoration-line underline-offset-2 hover:decoration-primary"
              href="https://github.com/mqtissj/realidaduy/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              abrí un issue
            </a>{" "}
            en el repositorio público del proyecto en GitHub. Los issues son públicos: no
            incluyas datos personales en el mensaje.
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="pressable mt-10 inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary hover:border-celeste"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}

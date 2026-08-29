import { SITE_HOST } from "@/lib/site";

/**
 * Marco de una pieza insertable: título, contenido, fuente y atribución.
 * Vive dentro del iframe de otro sitio, así que se banca cualquier ancho y
 * todos los enlaces salen del iframe (target="_top").
 */
export default function EmbedFrame({
  title,
  subtitle,
  sourceLine,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  /** "Fuente: INE · Junio 2026". */
  sourceLine: string;
  /** Página del sitio con el dato completo. */
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <h1 className="font-display text-lg font-bold leading-tight text-ink sm:text-xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>

      <div className="mt-3 min-w-0 flex-1">{children}</div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-2.5 text-xs text-ink-faint">
        <span>{sourceLine}</span>
        <a
          className="font-semibold text-primary hover:underline"
          href={href}
          target="_top"
          rel="noopener"
        >
          {SITE_HOST}
        </a>
      </div>
    </div>
  );
}

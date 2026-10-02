import { SITE_INSTAGRAM_HANDLE, SITE_INSTAGRAM_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Link a la cuenta de Instagram, con el glifo dibujado acá (sin cargar nada de Meta). */
export default function InstagramLink({ className }: { className?: string }) {
  return (
    <a
      href={SITE_INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`realidad.uy en Instagram, ${SITE_INSTAGRAM_HANDLE} (se abre en otra pestaña)`}
      className={cn(
        "pressable inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-ink-soft transition-colors hover:text-primary",
        className
      )}
    >
      <svg
        aria-hidden
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      {SITE_INSTAGRAM_HANDLE}
    </a>
  );
}

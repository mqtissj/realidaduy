import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Estructura de tarjeta de Cult UI (texture-card), adaptada a los tokens del
 * proyecto: tema claro único, radios 16px y paleta papel/tinta/celeste.
 * Los bordes anidados crean el relieve sutil que distingue a estas tarjetas.
 */

const TextureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-line bg-gradient-to-b from-canvas to-surface shadow-card",
      className
    )}
    {...props}
  >
    <div className="rounded-[15px] border border-white/60">
      <div className="h-full w-full rounded-[14px] border border-ink/5">
        {children}
      </div>
    </div>
  </div>
));
TextureCard.displayName = "TextureCard";

const TextureCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 md:p-5", className)} {...props} />
));
TextureCardContent.displayName = "TextureCardContent";

export { TextureCard, TextureCardContent };

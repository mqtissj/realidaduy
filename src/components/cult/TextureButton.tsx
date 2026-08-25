import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Estructura de botón de Cult UI (texture-button): capa exterior con degradado
 * que hace de borde + capa interior con el contenido. Adaptado a la paleta
 * del proyecto (azul primario, superficie papel), tema claro único.
 */

const outerVariants = cva(
  "group inline-flex rounded-[10px] p-px transition duration-200 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-b from-primary/80 to-primary shadow-card",
        secondary: "bg-gradient-to-b from-line to-ink/20 shadow-card",
        inverse: "bg-gradient-to-b from-white/80 to-white/40",
      },
    },
    defaultVariants: { variant: "primary" },
  }
);

const innerVariants = cva(
  "inline-flex w-full items-center justify-center gap-2 rounded-[9px] px-5 py-2.5 font-display text-sm font-semibold transition-colors md:text-base",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-primary to-primary-hover text-white group-hover:from-primary-hover group-hover:to-primary-hover",
        secondary:
          "bg-gradient-to-b from-surface to-canvas text-primary group-hover:to-primary-soft",
        inverse: "bg-white text-primary group-hover:bg-white/90",
      },
    },
    defaultVariants: { variant: "primary" },
  }
);

type Variant = VariantProps<typeof outerVariants>;

const TextureButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & Variant
>(({ className, variant, children, ...props }, ref) => (
  <button ref={ref} className={cn(outerVariants({ variant }), className)} {...props}>
    <span className={innerVariants({ variant })}>{children}</span>
  </button>
));
TextureButton.displayName = "TextureButton";

function TextureLink({
  href,
  variant,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & Variant) {
  return (
    <Link href={href} className={cn(outerVariants({ variant }), className)}>
      <span className={innerVariants({ variant })}>{children}</span>
    </Link>
  );
}

export { TextureButton, TextureLink };

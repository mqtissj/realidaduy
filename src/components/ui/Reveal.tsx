"use client";

import { motion } from "motion/react";

/*
 * Aparición sutil al entrar al viewport. Con prefers-reduced-motion se ve fijo
 * desde el primer momento: lo resuelve globals.css ([data-reveal]), no
 * useReducedMotion. El servidor no conoce esa preferencia y manda el estado
 * inicial en línea (opacity 0); si el cliente cambiaba de elemento, la
 * hidratación no corregía ese estilo y el contenido quedaba invisible.
 */

export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

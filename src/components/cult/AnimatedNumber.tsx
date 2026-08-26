"use client";

import { useEffect } from "react";
import {
  motion,
  MotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

/*
 * AnimatedNumber (base Cult UI) con dos reglas propias de la plataforma:
 * 1. El primer render (incluido el HTML del servidor) muestra SIEMPRE el valor
 *    real — nunca un conteo desde 0: una cifra falsa en el HTML rompe SEO,
 *    lectores sin JS y pestañas en segundo plano.
 * 2. La animación queda reservada para cuando `value` CAMBIA (actualización de
 *    datos en vivo), que es cuando el movimiento comunica algo.
 * Con prefers-reduced-motion la cifra es estática siempre.
 */

interface AnimatedNumberProps {
  value: number;
  mass?: number;
  stiffness?: number;
  damping?: number;
  precision?: number;
  format?: (value: number) => string;
}

export function AnimatedNumber({
  value,
  mass = 0.8,
  stiffness = 75,
  damping = 15,
  precision = 0,
  format = (num) => num.toLocaleString("es-UY"),
}: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { mass, stiffness, damping });
  const display: MotionValue<string> = useTransform(spring, (current) =>
    format(parseFloat(current.toFixed(precision)))
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  if (reduce) return <span>{format(value)}</span>;
  return <motion.span>{display}</motion.span>;
}

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
 * AnimatedNumber de Cult UI, con respeto de prefers-reduced-motion:
 * si la persona pide menos movimiento, la cifra se muestra directa.
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
  const spring = useSpring(reduce ? value : 0, { mass, stiffness, damping });
  const display: MotionValue<string> = useTransform(spring, (current) =>
    format(parseFloat(current.toFixed(precision)))
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  if (reduce) return <span>{format(value)}</span>;
  return <motion.span>{display}</motion.span>;
}

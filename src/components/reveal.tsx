"use client";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return <motion.div
    className="scroll-reveal"
    initial={false}
    whileInView={reduceMotion ? undefined : { opacity: [0.65, 1], y: [20, 0] }}
    viewport={{ once: true, amount: "some" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>;
}

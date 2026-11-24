"use client";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children }: {children: React.ReactNode}) {
  const reduce = useReducedMotion();
  return <motion.div initial={false} whileInView={reduce ? undefined : { y: [12,0] }} viewport={{ once: true, amount: .15 }} transition={{ duration: .45 }}>{children}</motion.div>;
}

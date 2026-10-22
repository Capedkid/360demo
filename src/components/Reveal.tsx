"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical travel in px */
  y?: number;
  as?: "div" | "section" | "figure" | "li" | "p" | "h2";
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({ children, className, delay = 0, y = 28, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </Component>
  );
}

/** Image wrapper that unveils with a soft clip + scale as it enters the viewport. */
export function RevealImage({ children, className, delay = 0 }: Omit<Props, "y" | "as">) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`overflow-hidden ${className ?? ""}`}
      initial={reduce ? false : { clipPath: "inset(14% 0% 0% 0%)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.3, ease: EASE, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={reduce ? false : { scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        transition={{ duration: 1.6, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

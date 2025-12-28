"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ShakeProps {
  children: ReactNode;
  className?: string;
}

const shakeVariants = {
  shake: {
    x: [0, -2, 2, -1, 1, 0],
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  initial: {
    opacity: 0,
    y: -4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export function Shake({ children, className }: ShakeProps) {
  return (
    <motion.div
      initial="initial"
      animate={["animate", "shake"]}
      variants={shakeVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

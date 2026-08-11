"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparkleProps {
  className?: string;
  delay?: number;
}

export function Sparkle({ className, delay = 0 }: SparkleProps) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn("text-accent", className)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0.6, 1], scale: [0, 1, 0.9, 1] }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 3 }}
    >
      <path
        d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z"
        fill="currentColor"
      />
    </motion.svg>
  );
}

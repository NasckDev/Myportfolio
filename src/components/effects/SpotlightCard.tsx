import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}

export function SpotlightCard({ children, className, tilt = false }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), { stiffness: 180, damping: 24 });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-5, 5]), { stiffness: 180, damping: 24 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointerX.set(x / rect.width - 0.5);
    pointerY.set(y / rect.height - 0.5);
    element.style.setProperty("--spotlight-x", `${x}px`);
    element.style.setProperty("--spotlight-y", `${y}px`);
  };

  const reset = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={tilt ? { rotateX, rotateY, transformPerspective: 1000 } : ({ transformPerspective: 1000 } as CSSProperties)}
      className={cn("interactive-spotlight relative overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
}

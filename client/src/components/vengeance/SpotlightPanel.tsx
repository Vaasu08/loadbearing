import { motion, useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

type SpotlightPanelProps = {
  children: ReactNode;
  className?: string;
};

/** Vengeance UI-inspired spotlight surface, kept deliberately low-contrast for a security product. */
export function SpotlightPanel({ children, className = "" }: SpotlightPanelProps) {
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const springX = useSpring(x, { stiffness: 140, damping: 24 });
  const springY = useSpring(y, { stiffness: 140, damping: 24 });

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - bounds.left) / bounds.width) * 100);
    y.set(((event.clientY - bounds.top) / bounds.height) * 100);
  };

  return (
    <motion.div className={`vengeance-spotlight ${className}`} onMouseMove={handleMove}>
      <motion.div
        className="vengeance-spotlight__wash"
        style={{ background: `radial-gradient(circle at ${springX}% ${springY}%, rgba(183,255,74,.11), transparent 34%)` }}
        aria-hidden="true"
      />
      <div className="vengeance-spotlight__content">{children}</div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import type { MouseEventHandler, ReactNode } from "react";

type VengeanceButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
};

/** A restrained Vengeance UI-inspired animated CTA; existing form logic remains the caller’s responsibility. */
export function VengeanceButton({ children, className = "", ...props }: VengeanceButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.16 }}
      className={`vengeance-button ${className}`}
      {...props}
    >
      <span className="vengeance-button__sheen" aria-hidden="true" />
      <span className="vengeance-button__label">{children}</span>
    </motion.button>
  );
}

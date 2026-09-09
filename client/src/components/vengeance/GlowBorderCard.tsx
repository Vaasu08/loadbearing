import type { ReactNode } from "react";

type GlowBorderCardProps = {
  children: ReactNode;
  className?: string;
  glow?: "lime" | "amber" | "blue";
};

export function GlowBorderCard({ children, className = "", glow = "lime" }: GlowBorderCardProps) {
  return (
    <div className={`vengeance-glow-card vengeance-glow-card--${glow} ${className}`}>
      <div className="vengeance-glow-card__beam" aria-hidden="true" />
      <div className="vengeance-glow-card__surface">{children}</div>
    </div>
  );
}

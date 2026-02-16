import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard = ({ children, className, hover = true }: GlassCardProps) => (
  <div className={cn("glass-card p-5", hover && "glass-card-hover", className)}>
    {children}
  </div>
);

export default GlassCard;

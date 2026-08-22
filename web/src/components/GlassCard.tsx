import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "ticket" | "interactive";
}

export function GlassCard({
  children,
  className,
  variant = "default",
  ...props
}: GlassCardProps) {
  const baseClasses =
    "relative rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl transition-all duration-300";

  const variantClasses = {
    default: "shadow-glass",
    elevated: "shadow-glass-elevated bg-white/80",
    ticket: "shadow-ticket border-indigo-100/80 bg-white/85",
    interactive:
      "shadow-glass hover:shadow-glass-hover hover:-translate-y-1 hover:border-indigo-200/80 cursor-pointer",
  };

  return (
    <div
      className={twMerge(clsx(baseClasses, variantClasses[variant], className))}
      {...props}
    >
      {children}
    </div>
  );
}

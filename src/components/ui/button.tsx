import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-cyan to-purple text-black font-semibold hover:shadow-neon hover:brightness-110",
  secondary: "bg-surface2 text-white border border-border hover:border-cyan/50",
  outline: "bg-transparent border border-border text-white hover:border-cyan/60 hover:text-cyan",
  ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-surface2",
  danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

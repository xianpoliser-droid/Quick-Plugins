import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none transition-colors focus:border-cyan/60 focus:ring-1 focus:ring-cyan/40",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-gray-300", className)} {...props} />;
}

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan/60 focus:ring-1 focus:ring-cyan/40",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

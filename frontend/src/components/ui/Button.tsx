"use client";
import { forwardRef } from "react";

export type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const buttonBase = `
  inline-flex gap-2
  items-center justify-center
  rounded-md focus-ring
  px-3 py-1.5
  text-sm 
  cursor-pointer
  transition-all duration-slow
  disabled:disabled-default
`;

export const buttonVariants: Record<Variant, string> = {
  primary: "bg-accent fg-primary border border-accent hover:opacity-90",
  secondary: "bg-card fg-primary border border-default hover-card",
  outline: "bg-transparent fg-primary border border-default hover-card",
  danger:
    "fg-danger border border-danger hover:bg-danger hover:fg-primary",
  ghost: "bg-transparent fg-primary hover-card",
};

export default forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "secondary", ...props }, ref) {
    const { type, className = "", ...rest } = props;
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={`
        ${buttonBase} 
        ${buttonVariants[variant] ?? buttonVariants.secondary} 
        ${className}
      `}
        {...rest}
      />
    );
  }
);

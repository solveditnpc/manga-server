import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({
  variant = "ghost",
  className = "",
  ...props
}: ButtonProps) {
  const base = "rounded-md px-3 py-1.5 text-sm focus-ring transition-none";

  const variants: Record<Variant, string> = {
    primary: "bg-accent fg-primary border border-accent",
    ghost: "bg-card fg-primary border border-default hover-card",
    danger: "bg-card fg-accent border border-accent hover-card",
  };

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className}`}
    />
  );
}

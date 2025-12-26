import { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`
        w-full
        border border-default
        rounded-md
        px-3 py-2
        text-sm
        fg-primary
        placeholder:fg-muted
        focus-ring
        ${className}
      `}
    />
  );
}

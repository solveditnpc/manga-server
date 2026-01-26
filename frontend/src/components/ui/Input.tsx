import { forwardRef } from "react";

export default forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(
  function Input({ ...props }, ref) {
    const { type, className = "", ...rest } = props;
    return (
      <input
        {...rest}
        ref={ref}
        type={type ?? "text"}
        className={`
          w-full
          border border-default
          bg-background
          rounded-md
          px-3 py-2
          text-sm
          fg-primary
          placeholder:fg-muted
          focus-ring 
          disabled:disabled-default
          ${className}
        `}
      />
    );
  }
);

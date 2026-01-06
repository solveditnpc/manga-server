"use client";

import { TextareaHTMLAttributes, useEffect, useRef, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", rows = 2, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    function setRefs(node: HTMLTextAreaElement | null) {
      innerRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }

    function autoResize() {
      const el = innerRef.current;
      if (!el) return;

      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }

    useEffect(() => {
      autoResize();
    }, []);

    return (
      <textarea
        ref={setRefs}
        rows={rows}
        {...props}
        onInput={(e) => {
          autoResize();
          props.onInput?.(e);
        }}
        className={`
        w-full
        resize-none
        overflow-hidden
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
);

export default Textarea;

"use client";

import {
  TextareaHTMLAttributes,
  useLayoutEffect,
  useRef,
  forwardRef,
} from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: string;
}

export default forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ maxHeight, ...props },ref ) {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const { className = "", rows, ...rest } = props;

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
      if (maxHeight) {
        el.style.maxHeight = maxHeight;
        el.style.overflowY = "auto";
      }
    }

    useLayoutEffect(() => {
      autoResize();
      // console.log("hello");
    }, [props.value]);

    return (
      <textarea
        ref={setRefs}
        rows={rows}
        onChange={(e) => {
          autoResize();
          props.onChange?.(e);
        }}
        className={`
          w-full
          resize-none
          border border-default
          rounded-md
          px-3 py-2
          text-sm
          fg-primary
          placeholder:fg-muted
          focus-ring
          ${className}
        `}
        {...rest}
      />
    );
  }
);

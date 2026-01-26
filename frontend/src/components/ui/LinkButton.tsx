"use client";
import { Variant, buttonBase, buttonVariants } from "./Button";
import Link, { LinkProps } from "next/link";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

interface LinkButtonProps extends LinkProps, Omit<AnchorProps, "href"> {
  variant?: Variant;
  disabled?: boolean;
}

export default function LinkButton({
  disabled = false,
  variant = "secondary",
  ...props
}: LinkButtonProps) {
  const { className = "", children, ...rest } = props;
  const classes = `
    ${buttonBase}
    ${buttonVariants[variant] ?? buttonVariants.secondary}
    ${disabled ? "disabled-default" : ""}
    ${className}
  `;

  if (disabled) {
    return (
      <button type="button" disabled className={classes}>
        {children}
      </button>
    );
  }

  return (
    <Link {...rest} className={classes}>
      {children}
    </Link>
  );
}

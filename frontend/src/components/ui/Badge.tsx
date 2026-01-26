type BadgeVariant =
  | "default"
  | "light"
  | "muted"
  | "accent"
  | "success"
  | "danger";

type BadgeAppearance = "filled" | "outlined";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  appearance?: BadgeAppearance;
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  appearance = "filled",
  className = "",
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-md border font-medium text-xs px-2 py-0.5";

  const filled: Record<BadgeVariant, string> = {
    default: "bg-card fg-primary border-mid",
    light: "bg-light fg-dark ",
    muted: "bg-card fg-muted border-default",
    accent: "bg-accent fg-accent border-accent",
    success: "bg-success fg-success border-success",
    danger: "bg-danger fg-primary border-danger",
  };

  const outlined: Record<BadgeVariant, string> = {
    default: "bg-transparent fg-secondary border-mid",
    light: "bg-transparent fg-primary border-light",
    muted: "bg-transparent fg-muted border-default",
    accent: "bg-transparent fg-accent border-accent",
    success: "bg-transparent fg-success border-success",
    danger: "bg-transparent fg-danger border-danger",
  };

  const styles =
    appearance === "filled"
      ? filled[variant] ?? filled.default
      : outlined[variant] ?? outlined.default;

  return (
    <span
      className={`
        ${base}
        ${styles}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

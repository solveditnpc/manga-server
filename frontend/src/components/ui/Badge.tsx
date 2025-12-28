interface BadgeProps {
  children: React.ReactNode;
}

export default function Badge({ children }: BadgeProps) {
  return (
    <span
      className="
        inline-flex
        items-center
        rounded-md
        border border-default
        bg-card
        px-2 py-0.5
        text-xs
        fg-secondary
      "
    >
      {children}
    </span>
  );
}

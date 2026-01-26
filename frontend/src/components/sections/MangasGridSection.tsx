interface MangasGridSectionProps {
  children: React.ReactNode;
}

export default function MangasGridSection({
  children,
}: MangasGridSectionProps) {
  return (
    <section className="space-y-4">
      <div
        className="
          grid gap-4
          grid-cols-[repeat(auto-fill,minmax(140px,1fr))]
          sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]
          md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]
          lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]
        "
      >
        {children}
      </div>
    </section>
  );
}

type ReadPageHeaderProps = {
  title: string;
  author?: string;
  visible?: boolean;
};

export default function ReadPageHeader({
  title,
  author,
  visible = true,
}: ReadPageHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-10">
      <div
        className={`
          h-15
          px-4
          flex items-center justify-between
          bg-black/80
          border-b border-default
          text-xs
          transition-opacity duration-200
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        <div className="flex flex-col overflow-hidden">
          <h1 className="fg-primary text-lg truncate max-w-[70vw]">{title}</h1>
          <span className="fg-muted truncate">{author}</span>
        </div>
      </div>
    </div>
  );
}

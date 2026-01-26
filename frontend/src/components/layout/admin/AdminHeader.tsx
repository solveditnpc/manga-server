import { LinkButton } from "@/components/ui";
import APP_CONFIG from "@/config/app.config";
export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-default">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        {/* Left: App Identity */}
        <div className="flex items-center gap-3">
          <LinkButton
            href="/"
            className="text-lg! font-semibold fg-primary whitespace-nowrap"
            variant="ghost"
          >
            {APP_CONFIG.name}
          </LinkButton>

          <span className="text-xs fg-muted">Admin</span>
        </div>

        {/* Right: Session / Exit */}
        <div className="flex items-center gap-2">
          <LinkButton href="/">Exit Admin</LinkButton>
        </div>
      </div>
    </header>
  );
}

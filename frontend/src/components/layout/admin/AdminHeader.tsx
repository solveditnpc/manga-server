import Link from "next/link";
import { Button } from "@/components/ui";
import APP_CONFIG from "@/config/app.config";
export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-default">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
        {/* Left: App Identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-lg w-full md:w-fit font-semibold fg-primary whitespace-nowrap"
          >
            {APP_CONFIG.name}
          </Link>

          <span className="text-xs fg-muted">Admin</span>
        </div>

        {/* Right: Session / Exit */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button> Exit Admin</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

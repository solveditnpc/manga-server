import SearchBar from "@/components/domain/search/SearchBar";
import APP_CONFIG from "@/config/app.config";
import UserMenu from "../../domain/auth/UserMenu";
import { Suspense } from "react";
import { LinkButton } from "@/components/ui";
import ServerToggle from "@/components/domain/server/ServerToogle";

export default function Header() {
  return (
    <header className="fixed w-full top-0 z-40 bg-background border-b border-default">
      <div className="max-w-7xl mx-auto h-14 px-4 flex sm:justify-between items-center gap-2">
        {/* Left: App Name */}
        <div className="w-full sm:w-fit">
          <LinkButton
            href="/user/S/home"
            className="text-lg! font-semibold fg-primary whitespace-nowrap"
            variant="ghost"
          >
            {APP_CONFIG.name}
          </LinkButton>
          <ServerToggle />
        </div>
        {/* Center: Search */}
        <div className="flex justify-end">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Right: User Actions */}
        <div className="flex justify-end">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

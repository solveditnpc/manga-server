import SearchBar from "@/features/search/components/SearchBar";
import APP_CONFIG from "@/config/app.config";
import Link from "next/link";
import UserMenu from "./UserMenu";
import { Suspense } from "react";
export default function Header() {
  return (
    <header className="fixed w-full top-0 z-40 bg-background border-b border-default">
      <div className="max-w-7xl mx-auto h-14 px-4 flex  md:justify-between items-center gap-2">
        {/* Left: App Name */}
        <Link
          href="/"
          className="text-lg w-full md:w-fit font-semibold fg-primary whitespace-nowrap"
        >
          {APP_CONFIG.name}
        </Link>

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

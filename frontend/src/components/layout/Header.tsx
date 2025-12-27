import { Avatar } from "../ui";
import SearchBar from "@/features/search/components/SearchBar";
import LoginLogoutButton from "@/features/auth/components/LoginLogoutButton";
import APP_CONFIG from "@/config/app.config";
import Link from "next/link";
export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-default">
      <div className="max-w-6xl mx-auto h-14 px-4 grid grid-cols-3 items-center">
        {/* Left: App Name */}
        <Link
          href="/"
          className="text-lg font-semibold fg-primary whitespace-nowrap"
        >
          {APP_CONFIG.name}
        </Link>

        {/* Center: Search */}
        <div className="flex justify-center">
          <SearchBar />
        </div>

        {/* Right: User Actions */}
        <div className="flex justify-end items-center gap-2">
          <Avatar />
          <div className="border border-default h-7" />
          <LoginLogoutButton />
        </div>
      </div>
    </header>
  );
}

"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | undefined>();

  useEffect(() => {
    setUsername(Cookies.get("username") || undefined);
  }, []);

  const handleAuthClick = () => {
    router.push("/auth");
  };

  const handleLogout = () => {
    Cookies.remove("username");
    setUsername(undefined);
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-medium fg-primary">Manga Library</h1>
        {/* Note */}
        <p className="text-sm fg-secondary italic -mt-3">
          {" "}
          ( Under development )
        </p>

        {/* Intro */}
        <p className="text-sm fg-muted">
          This is a simple manga reading site. Browse chapters, read
          comfortably, and keep track of what you like.
        </p>

        {/* Status */}
        {username && (
          <p className="text-sm fg-secondary">
            Signed in as <span className="fg-primary">{username}</span>
          </p>
        )}

        {/* Action */}
        {!username ? (
          <button
            onClick={handleAuthClick}
            className="
              w-full rounded-md
              bg-accent fg-primary
              py-2 text-sm font-medium
              focus-ring
            "
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="
              w-full rounded-md
              border border-default
              bg-surface fg-primary
              py-2 text-sm font-medium
              focus-ring
            "
          >
            Log out
          </button>
        )}
      </div>
    </main>
  );
}

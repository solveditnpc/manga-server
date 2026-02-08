import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import APP_CONFIG from "@/config/app.config";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import ConfirmOverlay from "@/components/overlays/confirm/ConfirmOverlay";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { fetchCurrentUser } from "@/server/auth/auth.actions";
import { isServerValid, toValidServer } from "@/utils/mangas.utils";
import { stripUserServerPrefix } from "@/utils/params.utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currUserRef = await fetchCurrentUser();
  const user = currUserRef.ok ? currUserRef.value : null;

  const header = await headers();
  const path = header.get("x-pathname") ?? "";
  const search = header.get("x-search") ?? "";

  const currUrl = `${path}${search ? search : ""}`;
  let correctedUrl: string = currUrl;

  if (!path.startsWith("/")) correctedUrl = `/${path}`;
  // /admin
  else if (path.startsWith("/admin")) {
    if (!user || user.role !== "ADMIN") correctedUrl = "/user/S/home";
    else correctedUrl = `/admin${search ? search : ""}`;
  }
  // /auth
  else if (path.startsWith("/auth")) {
    if (user) correctedUrl = "/user/S/home";
    else correctedUrl = `/auth`;
  }
  //  /user/[server]/...
  else if (path.startsWith("/user/")) {
    const segments = path.split("/").filter(Boolean);

    if (segments.length < 2) correctedUrl = "/user/S/home";
    else {
      const server = segments[1];
      const safeServer = toValidServer(server);
      const strippedPath = stripUserServerPrefix(path);
      correctedUrl = `/user/${safeServer}${strippedPath}${search}`;
    }
  }
  // invalid path , navigate to home
  else {
    correctedUrl = "/user/S/home";
  }

  if (correctedUrl !== currUrl) redirect(correctedUrl);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          position="top-center"
          duration={2000}
          toastOptions={{
            style: {
              background: "var(--card-hover)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-mid)",
            },
          }}
        />

        <ConfirmOverlay />
      </body>
    </html>
  );
}

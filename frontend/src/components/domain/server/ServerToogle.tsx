"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useServerContext } from "@/components/domain/server/ServerContext";
import type { Server } from "@/types/manga.type";
import Link from "next/link";
import { stripUserServerPrefix } from "@/utils/params.utils";

export default function ServerToggle() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const { server } = useServerContext();
  const next: Server = server === "S" ? "N" : "S";
  const restPath = stripUserServerPrefix(pathname);

  const href = `/user/${next}${restPath}${search ? `?${search}` : ""}`;
  const isS = server === "S";

  return (
    <Link
      href={href}
      title="Switch server"
      className={`
        rounded-md border 
        font-medium text-xs
        p-1.5 py-1
        ${
          isS
            ? "fg-success border-success hover:bg-success"
            : "fg-accent  border-accent  hover:bg-accent"
        }
      `}
    >
      {server}
    </Link>
  );
}

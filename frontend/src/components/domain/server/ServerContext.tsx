"use client";
import { createContext, useContext, useState } from "react";
import { Server } from "@/types/manga.type";

export const ServerContext = createContext<{
  server: Server;
  routePrefix: string;
} | null>(null);

export function ServerContextProvider({
  server,
  children,
}: {
  server: Server;
  children: React.ReactNode;
}) {
  const routePrefix = `/user/${server}/`;
  return (
    <ServerContext.Provider value={{ server, routePrefix }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServerContext() {
  const ctx = useContext(ServerContext);

  if (!ctx) {
    throw new Error("server is only available within ServerProvider");
  }

  return ctx;
}
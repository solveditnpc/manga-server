import { toValidServer, isServerValid } from "@/utils/mangas.utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Server } from "@/types/manga.type";
import { ServerContextProvider } from "@/components/domain/server/ServerContext";
import { stripUserServerPrefix } from "@/utils/params.utils";

async function layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ server: string }>;
}>) {
  const { server } = await params;
  if (!isServerValid(server)) {
    const header = await headers();
    const path = stripUserServerPrefix(header.get("x-pathname") ?? "");
    const search = header.get("x-search") ?? "";
    const safeServer = toValidServer(server);

    redirect(`/user/${safeServer}${path}${search}`);
  }
  return (
    <div className="h-screen flex flex-col bg-background">
      <ServerContextProvider server={server as Server}>
        {children}
      </ServerContextProvider>
    </div>
  );
}

export default layout;

import { Server } from "@/types/manga.type";
import { ServerContextProvider } from "@/components/domain/server/ServerContext";

async function layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ server: string }>;
}>) {
  const { server } = await params;

  return (
    <div className="h-screen flex flex-col bg-background">
      <ServerContextProvider server={server as Server}>
        {children}
      </ServerContextProvider>
    </div>
  );
}

export default layout;

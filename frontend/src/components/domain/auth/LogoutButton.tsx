"use client";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/auth.hooks";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  const {
    mutate: logout,
    isPending,
    isError,
    error,
  } = useLogout({
    onSuccess: () => router.replace("/auth"),
  });

  useEffect(() => {
    if (!isError) return;

    toast.error("Failed to logout", {
      description: error?.message || "Please try again",
    });
  }, [isError, error]);

  return (
    <Button
      type="button"
      variant="danger"
      className="w-full flex gap-1 justify-center items-center"
      disabled={isPending}
      onClick={() => logout()}
    >
      {isPending ? (
        <>
          Logging out... <LoaderCircle size={14} className="animate-spin" />
        </>
      ) : (
        "Logout"
      )}
    </Button>
  );
}

export default LogoutButton;

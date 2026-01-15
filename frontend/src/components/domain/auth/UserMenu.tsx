"use client";
import LogoutButton from "@/components/domain/auth/LogoutButton";
import { LinkButton, Dropdown } from "../../ui";
import { useCurrentUser } from "@/hooks/auth.hooks";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserMenu() {
  const { data: user, isLoading, isError, error } = useCurrentUser();
  const avatar = user?.username.charAt(0).toUpperCase();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!isError) return;

    toast.error("Failed to fetch user", {
      description: error?.message || "Please refresh the page to try again",
    });
  }, [isError, error]);

  if (isLoading)
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <LoaderCircle size={14} className="animate-spin fg-muted" />
      </div>
    );

  if (!user) return <LinkButton href="/auth">Login</LinkButton>;

  return (
    <Dropdown
      disabled={isLoading}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <div
          className="
          w-8 h-8
          rounded-full
          bg-card
          border border-default
          flex items-center justify-center
          text-sm font-medium
          fg-primary
          hover-card
          focus-ring
        "
          aria-haspopup="menu"
          aria-label="User menu"
        >
          {isLoading ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            avatar
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-1 items-center justify-center w-full text-nowrap">
        <div className="text-sm fg-primary truncate">{user.username}</div>
        <div className="border-t border-default w-full"></div>
        <LogoutButton />
      </div>
    </Dropdown>
  );
}

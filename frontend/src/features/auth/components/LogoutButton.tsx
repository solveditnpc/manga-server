"use client";
import { Button } from "@/components/ui";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

function LogoutButton({ className }: { className?: string }) {
  const username = Cookies.get("username");
  const router = useRouter();
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    Cookies.remove("username");
    router.push("/auth");
  };
  return (
    <Button className={className} onClick={handleLogout} variant="primary">
      Logout
    </Button>
  );
}

export default LogoutButton;

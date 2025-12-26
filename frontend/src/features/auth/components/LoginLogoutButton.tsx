"use client";
import { Button } from "@/components/ui";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

function LoginLogoutButton({ className }: { className?: string }) {
  const username = Cookies.get("username");
  const router = useRouter();
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    Cookies.remove("username");
    router.push("/auth");
  };

  return username ? (
    <Button className={className} onClick={handleLogout}>
      Logout
    </Button>
  ) : (
    <Button
      onClick={() => {
        router.push("/auth");
      }}
      variant="primary"
      className={className}
    >
      Login
    </Button>
  );
}

export default LoginLogoutButton;

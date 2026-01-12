"use client";
import { Input, Button, Tooltip } from "@/components/ui";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

const TOOLTIP_MSG: { [key: string]: React.ReactNode } = {
  username: "If it’s new, we’ll create it. If it exists, we’ll sign you in.",
  password:
    "We’ll check this password for existing names, or save it for new ones.",
};


export default function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(username, password);

    // Store username in cookie for workflow simulation
    // TODO : Modify the auth workflow after setting up backend.
    Cookies.set("username", username, { expires: 7 });

    router.push("/");
  };
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Username */}
      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="text-sm fg-secondary flex items-center"
        >
          Username
          <Tooltip message={TOOLTIP_MSG.username}>
            <Info size={16} className="ml-1 stroke-(--text-muted)" />
          </Tooltip>{" "}
        </label>

        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-background"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm fg-secondary flex items-center"
        >
          Password
          <Tooltip message={TOOLTIP_MSG.password}>
            <Info size={16} className="ml-1 stroke-(--text-muted)" />
          </Tooltip>{" "}
        </label>

        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-background"
        />
      </div>

      {/* Submit */}
      <Button type="submit" variant="primary" className="w-full">
        Continue
      </Button>
    </form>
  );
}

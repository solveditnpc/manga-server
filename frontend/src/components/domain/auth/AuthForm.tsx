"use client";
import { Input, Button, Tooltip } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, LoaderCircle } from "lucide-react";
import { useLogin } from "@/hooks/auth.hooks";
import { Eye, EyeClosed } from "lucide-react";
import { LoginData } from "@/types/auth.type";

const TOOLTIP_MSG: { [key: string]: React.ReactNode } = {
  username: "If it’s new, we’ll create it. If it exists, we’ll sign you in.",
  password:
    "We’ll check this password for existing names, or save it for new ones.",
};

export default function AuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });
  const router = useRouter();

  const {
    mutate: login,
    isPending,
    isError,
    error,
  } = useLogin({
    onSuccess: () => router.replace("/"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username || !formData.password) return;

    login(formData);
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
            <Info size={16} className="ml-1 stroke-muted" />
          </Tooltip>
        </label>

        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData((p) => ({ ...p, username: e.target.value }))
          }
          required
          disabled={isPending}
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
            <Info size={16} className="ml-1 stroke-muted" />
          </Tooltip>
        </label>

        <div className="relative text-right">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData((p) => ({ ...p, password: e.target.value }))
            }
            required
            disabled={isPending}
          />

          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 fg-muted"
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {!showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            Submitting... <LoaderCircle size={14} className="animate-spin" />
          </>
        ) : (
          "Continue"
        )}
      </Button>
      {isError && (
        <p className="fg-danger text-sm text-center italic">
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
      )}
    </form>
  );
}

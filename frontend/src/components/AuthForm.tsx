"use client";
import Tooltip from "@/components/Tooltip";
import { ReactNode } from "react";
import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
const TOOLTIP_MSG: { [key: string]: ReactNode } = {
    username: (
        <>
            If it’s new, we’ll create it.
            <br />
            If it exists, we’ll sign you in.
        </>
    ),
    password: (
        <>We’ll check this password for existing names, or save it for new ones.</>
    ),
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
                <label className="text-sm fg-secondary flex items-center">
                    Username
                    <Tooltip message={TOOLTIP_MSG.username} />
                </label>

                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-md bg-background border border-default px-3 py-2 fg-primary focus-ring"
                />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <label className="text-sm fg-secondary flex items-center">
                    Password
                    <Tooltip message={TOOLTIP_MSG.password} />
                </label>

                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-md bg-background border border-default px-3 py-2 fg-primary focus-ring"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="
              w-full rounded-md
              bg-accent
              fg-primary
              py-2
              text-sm font-medium
              focus-ring
            "
            >
                Continue
            </button>
        </form>
    );
}

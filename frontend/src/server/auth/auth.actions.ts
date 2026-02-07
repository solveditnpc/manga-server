"use server";
import { cookies } from "next/headers";
import { AsyncResult } from "@/types/server.types";
import { User, LoginData } from "@/types/auth.type";
import { validateSession, loginOrRegisterService } from "./auth.service";

// ---------------- Fetch current user ----------------
export async function fetchCurrentUser(): AsyncResult<
  User,
  "UNAUTHORIZED" | "INTERNAL_ERROR"
> {
  const store = await cookies();
  const session = store.get("session")?.value;

  const res = await validateSession(session);

  try {
    if (!res.ok && res.error === "UNAUTHORIZED") store.delete("session");
  } finally {
    return res;
  }
}

// ---------------- Handle user login/register ----------------
export async function loginOrRegister({
  username,
  password,
}: LoginData): AsyncResult<
  void,
  "INVALID_CREDENTIALS" | "INTERNAL_ERROR" | "INVALID_REQUEST"
> {
  const store = await cookies();
  const session = store.get("session")?.value;

  if (session) return { ok: false, error: "INVALID_REQUEST" };

  const res = await loginOrRegisterService({
    username,
    password,
  });

  if (!res.ok) return res;

  store.set({
    name: "session",
    value: JSON.stringify({ id: res.value.id }), // see next section
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return { ok: true, value: undefined };
}

// Handle user logout
export async function logout(): Promise<void> {
  (await cookies()).delete("session");
}

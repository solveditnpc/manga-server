import bcrypt from "bcrypt";
import { prisma } from "@/libs/prisma";
import { AsyncResult } from "@/types/server.types";
import { User, UserPrsima, LoginData } from "@/types/auth.type";

// ---------------- Helpers ----------------

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function safeUser(user: UserPrsima): User {
  return {
    id: user.id,
    username: user.username,
    cover_url: user.cover_url,
    role: user.role,
  };
}

// ---------------- User By Username/Id ----------------

export async function getUserByUsername(
  username: User["username"],
): AsyncResult<UserPrsima, "NOT_FOUND" | "INTERNAL_ERROR"> {
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return { ok: false, error: "NOT_FOUND" };

    return {
      ok: true,
      value: user,
    };
  } catch (error) {
    console.log("Error `auth.service/getUserByUsername` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function getUserById(
  id: User["id"],
): AsyncResult<UserPrsima, "NOT_FOUND" | "INTERNAL_ERROR"> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { ok: false, error: "NOT_FOUND" };

    return {
      ok: true,
      value: user,
    };
  } catch (error) {
    console.log("Error `auth.service/getUserById` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

// ---------------- Validate Session ----------------

export async function validateSession(
  session: string | undefined,
): AsyncResult<User, "UNAUTHORIZED" | "INTERNAL_ERROR"> {

  if (!session) return { ok: false, error: "UNAUTHORIZED" };

  let parsedSession: { id?: User["id"] };
  try {
    parsedSession = JSON.parse(session);
  } catch {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  if (typeof parsedSession?.id !== "number")
    return { ok: false, error: "UNAUTHORIZED" };

  const id: User["id"] = parsedSession.id;

  const res = await getUserById(id);

  if (!res.ok)
    return {
      ok: false,
      error: res.error === "INTERNAL_ERROR" ? "INTERNAL_ERROR" : "UNAUTHORIZED",
    };
  const user = res.value;
  return {
    ok: true,
    value: safeUser(user),
  };
}

// ---------------- Login & Register ----------------

export async function loginUser({
  username,
  password,
}: LoginData): AsyncResult<
  User,
  "INVALID_CREDENTIALS" | "NOT_EXIST" | "INTERNAL_ERROR"
> {
  const res = await getUserByUsername(username);

  if (!res.ok)
    return {
      ok: false,
      error: res.error === "NOT_FOUND" ? "NOT_EXIST" : "INTERNAL_ERROR",
    };

  const user = res.value;

  const isPassValid = await verifyPassword(password, user.password);

  if (!isPassValid) return { ok: false, error: "INVALID_CREDENTIALS" };

  return { ok: true, value: safeUser(user) };
}

export async function registerUser({
  username,
  password,
}: LoginData): AsyncResult<User, "INTERNAL_ERROR"> {
  try {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "USER",
        cover_url: "",
      },
    });

    if (!user) return { ok: false, error: "INTERNAL_ERROR" };

    return { ok: true, value: safeUser(user) };
  } catch (error) {
    console.log("Error `auth.service/registerUser` : \n", error);
    return { ok: false, error: "INTERNAL_ERROR" };
  }
}

export async function loginOrRegisterService(
  input: LoginData,
): AsyncResult<User, "INVALID_CREDENTIALS" | "INTERNAL_ERROR"> {
  const login = await loginUser(input);

  if (login.ok) return login;

  if (login.error === "NOT_EXIST") {
    return registerUser(input);
  }

  return { ok: false, error: login.error };
}

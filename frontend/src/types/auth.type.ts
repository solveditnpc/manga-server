import { User as UserPrsima } from "@/generated/prisma/client";

export type { UserPrsima };
export type User = Omit<UserPrsima, "password">;

export interface LoginData {
  username: string;
  password: string;
}

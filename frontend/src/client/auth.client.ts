import Cookies from "js-cookie";
import { User, LoginData } from "@/types/auth.type";

// Temporary sleep function
const sleep = (timeout: number = 100) =>
  new Promise((res) => setTimeout(res, timeout));

export async function fetchCurrentUser(): Promise<User | null> {
  // TODO: Add user data fetching logic here

  await sleep(500);
  const username = Cookies.get("username");
  if (!username) return null;
  return {
    id: username,
    username,
    cover_url: "",
    role: "user",
  };
}

export async function handleLogin({ username, password }: LoginData) {
  // TODO: Add user login logic here

  await sleep(500);
  // throw new Error("Invalid username or password");
  Cookies.set("username", username, { expires: 7 });
}

export async function handleLogout() {
  // TODO: Add user logout logic here
  
  await sleep(500);
  // throw new Error("Failed to logout");
  Cookies.remove("username");
}

export interface User {
  id: string;
  username: string;
  cover_url: string;
  role: "admin" | "user";
}

export interface LoginData {
  username: string;
  password: string;
}

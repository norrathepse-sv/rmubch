import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      role?: string | null;
      department?: string | null;
      deplevel?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string | null;
    department?: string | null;
    deplevel?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    department?: string | null;
    deplevel?: string | null;
  }
}
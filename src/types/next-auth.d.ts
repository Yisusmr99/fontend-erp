import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: "RefreshAccessTokenError";
    user: {
      id: number;
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    accessTokenExpires: number;
    error?: "RefreshAccessTokenError";
    user: {
      id: number;
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
  }
}

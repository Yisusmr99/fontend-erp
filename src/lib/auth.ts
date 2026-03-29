import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/v1";
const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 horas

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data.status) throw new Error(data.message ?? "Refresh failed");

    return {
      ...token,
      accessToken: data.data.token,
      accessTokenExpires: Date.now() + TOKEN_LIFETIME_MS,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.status) return null;

        const { user, token } = data.data;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          roles: user.roles,
          permissions: user.permissions,
          accessToken: token,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      // Primer login: guardamos todo en el JWT
      if (user) {
        const u = user as typeof user & {
          roles: string[];
          permissions: string[];
          accessToken: string;
        };
        return {
          ...token,
          accessToken: u.accessToken,
          accessTokenExpires: Date.now() + TOKEN_LIFETIME_MS,
          user: {
            id: Number(u.id),
            name: u.name!,
            email: u.email!,
            roles: u.roles,
            permissions: u.permissions,
          },
        };
      }

      // Token aún vigente
      if (Date.now() < token.accessTokenExpires) return token;

      // Token expirado → renovar
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user = {
        ...session.user,
        ...token.user,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

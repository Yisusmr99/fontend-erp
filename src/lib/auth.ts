import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { login, refresh } from "@/lib/api/auth";

const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8 horas

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const data = await refresh(token.accessToken as string);

    if (!data.status) throw new Error(data.message ?? "Refresh failed");

    return {
      ...token,
      accessToken: data.data.token,
      accessTokenExpires: Date.now() + TOKEN_LIFETIME_MS,
      error: undefined,
    };
  } catch (err) {
    console.error("❌ refreshAccessToken error:", err);
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

        try {
          const data = await login(credentials.email, credentials.password);
          console.log("Login response: ", data);
          if (!data.status) return null;

          const { user, token } = data.data;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions,
            accessToken: token,
          };
        } catch (err) {
          console.error("❌ Login error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      // Primer login: guardamos todo en el JWT
      if (user) {
        const u = user as typeof user & {
          roles: unknown;
          permissions: unknown;
          accessToken: string;
        };

        // El backend puede devolver roles como objeto, array de objetos o array de strings
        const rawRoles = u.roles;
        const normalizeRoles = (r: unknown): string[] => {
          if (!r) return [];
          if (typeof r === 'string') return [r];
          if (Array.isArray(r)) return r.map((x) => (typeof x === 'string' ? x : (x as { name: string }).name));
          if (typeof r === 'object' && 'name' in (r as object)) return [(r as { name: string }).name];
          return [];
        };

        return {
          ...token,
          accessToken: u.accessToken,
          accessTokenExpires: Date.now() + TOKEN_LIFETIME_MS,
          user: {
            id: Number(u.id),
            name: u.name!,
            email: u.email!,
            roles: normalizeRoles(rawRoles),
            permissions: Array.isArray(u.permissions) ? u.permissions : [],
          },
        };
      }

      // Token aún vigente (con 2 minutos de margen para renovar antes de que expire)
      if (Date.now() < (token.accessTokenExpires as number) - 2 * 60 * 1000) return token;

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

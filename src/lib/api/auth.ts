import apiClient from "../apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiResponse<T> {
  status: boolean;
  data: T;
  message?: string;
}

interface LoginData {
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  token: string;
}

interface RefreshData {
  token: string;
}

// login y refresh usan fetch directamente para evitar el interceptor de apiClient
// que llama getSession(), lo cual crearía un loop circular cuando NextAuth
// intenta renovar el token desde el jwt callback (server-side).

export async function login(email: string, password: string): Promise<ApiResponse<LoginData>> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}

export async function logout(accessToken: string) {
  await apiClient.post("/auth/logout", null, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function refresh(accessToken: string): Promise<ApiResponse<RefreshData>> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  return res.json();
}

import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: false,
});

// Interceptor para agregar el token Bearer a las peticiones
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();

      if (session?.error === "RefreshAccessTokenError") {
        await signOut({ callbackUrl: "/login" });
        return Promise.reject(new Error("Session expired"));
      }

      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      } else {
        console.warn("⚠️ No token found in session");
      }
    } catch (error) {
      console.error("Error getting session:", error);
    }

    return config;
  },
  (error) => {
    console.error("Error in request interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para log
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error.response?.status, error.response?.statusText);
    return Promise.reject(error);
  }
);

export default apiClient;

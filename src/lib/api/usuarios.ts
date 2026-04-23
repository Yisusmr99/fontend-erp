import apiClient from "../apiClient";

export interface UsuarioRole {
    id: number;
    name: string;
    permissions: string[];
}

export interface Usuario {
    id: number;
    name: string;
    email: string;
    estado: boolean;
    roles: UsuarioRole;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface UsuariosApiResponse {
    users: Usuario[];
    meta: PaginationMeta;
}

export interface FetchUsuariosResult {
    data: Usuario[];
    meta: PaginationMeta;
}

export interface CreateUsuarioPayload {
    name: string;
    email: string;
    password: string;
    role: string;
    estado?: boolean;
}

export interface UpdateUsuarioPayload {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    estado?: boolean;
}

export async function fetchUsuarios(page: number = 1): Promise<FetchUsuariosResult> {
    try {
        const response = await apiClient.get("/users", {
            params: { page },
        });
        const data = response.data.data as UsuariosApiResponse;
        return {
            data: data.users,
            meta: data.meta,
        };
    } catch (error) {
        console.error("Error fetching usuarios:", error);
        throw error;
    }
}

export async function createUsuario(payload: CreateUsuarioPayload): Promise<Usuario> {
    try {
        const response = await apiClient.post("/users", payload);
        return response.data.data as Usuario;
    } catch (error) {
        console.error("Error creating usuario:", error);
        throw error;
    }
}

export async function updateUsuario(id: number, payload: UpdateUsuarioPayload): Promise<Usuario> {
    try {
        const response = await apiClient.put(`/users/${id}`, payload);
        return response.data.data as Usuario;
    } catch (error) {
        console.error("Error updating usuario:", error);
        throw error;
    }
}

export async function deleteUsuario(id: number): Promise<void> {
    try {
        await apiClient.delete(`/users/${id}`);
    } catch (error) {
        console.error("Error deleting usuario:", error);
        throw error;
    }
}

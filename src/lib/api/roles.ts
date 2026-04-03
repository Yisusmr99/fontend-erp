import apiClient from "../apiClient";

export interface Role {
    id: number;
    name: string;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface RolesApiResponse {
    roles: Role[];
    meta: PaginationMeta;
}

export interface FetchRolesResult {
    data: Role[];
    meta: PaginationMeta;
}

export interface RoleSimple {
    id: number;
    name: string;
    permissions: string[];
}

export async function fetchAllRoles(): Promise<RoleSimple[]> {
    const response = await apiClient.get("/roles/all");
    return response.data.data as RoleSimple[];
}

export async function fetchRoles(page: number = 1): Promise<FetchRolesResult> {
    try {
        const response = await apiClient.get("/roles", {
            params: { page },
        });
        const data = response.data.data as RolesApiResponse;
        return {
            data: data.roles,
            meta: data.meta,
        };
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
}
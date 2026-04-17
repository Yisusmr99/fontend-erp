import apiClient from "../apiClient";
import type {
    Cuenta,
    CuentasApiResponse,
    FetchCuentasResult,
    StoreCuentaPayload,
    UpdateCuentaPayload,
} from "../types/cuentas";

export async function fetchCuentas(page: number = 1): Promise<FetchCuentasResult> {
    try {
        const response = await apiClient.get("/cuentas", {
            params: { page },
        });
        const data = response.data.data as CuentasApiResponse;
        return {
            data: data.cuentas,
            meta: data.meta,
        };
    } catch (error) {
        console.error("Error fetching cuentas:", error);
        throw error;
    }
}

export async function fetchAllCuentas(): Promise<Cuenta[]> {
    try {
        const response = await apiClient.get("/cuentas/all");
        return response.data.data as Cuenta[];
    } catch (error) {
        console.error("Error fetching all cuentas:", error);
        throw error;
    }
}

export async function fetchCuenta(id: number): Promise<Cuenta> {
    try {
        const response = await apiClient.get(`/cuentas/${id}`);
        return response.data.data as Cuenta;
    } catch (error) {
        console.error("Error fetching cuenta:", error);
        throw error;
    }
}

export async function createCuenta(payload: StoreCuentaPayload): Promise<Cuenta> {
    try {
        const response = await apiClient.post("/cuentas", payload);
        return response.data.data as Cuenta;
    } catch (error) {
        console.error("Error creating cuenta:", error);
        throw error;
    }
}

export async function updateCuenta(id: number, payload: UpdateCuentaPayload): Promise<Cuenta> {
    try {
        const response = await apiClient.put(`/cuentas/${id}`, payload);
        return response.data.data as Cuenta;
    } catch (error) {
        console.error("Error updating cuenta:", error);
        throw error;
    }
}

export async function deleteCuenta(id: number): Promise<Cuenta> {
    try {
        const response = await apiClient.delete(`/cuentas/${id}`);
        return response.data.data as Cuenta;
    } catch (error) {
        console.error("Error closing cuenta:", error);
        throw error;
    }
}

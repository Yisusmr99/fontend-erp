import apiClient from "../apiClient";
import type { DashboardSummary } from "../types/dashboard";

/**
 * Obtiene los KPIs globales del dashboard.
 * GET /api/dashboard/summary
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
    try {
        const response = await apiClient.get("/dashboard/summary");
        return response.data.data as DashboardSummary;
    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        throw error;
    }
}

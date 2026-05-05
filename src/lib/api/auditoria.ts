import apiClient from "../apiClient";
import type {
    AuditLog,
    AuditoriaListFiltros,
    AuditoriaListResponse,
    ResumenAuditoria,
    ResumenAuditoriaFiltros,
    SnapshotsListFiltros,
    SnapshotsListResponse,
    TransaccionSnapshot,
} from "../types/auditoria";

/**
 * Convierte un objeto de filtros a query string, omitiendo valores vacíos.
 * Maneja booleanos (`true` -> "1", `false` -> "0") y números.
 */
function toParams(filtros: Record<string, unknown>): Record<string, string> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(filtros)) {
        if (value === undefined || value === null || value === "") continue;
        if (typeof value === "boolean") {
            params[key] = value ? "1" : "0";
        } else {
            params[key] = String(value);
        }
    }
    return params;
}

/**
 * Listar bitácora de auditoría con filtros.
 * GET /auditoria
 */
export async function fetchAuditoriaList(
    filtros: AuditoriaListFiltros = {}
): Promise<AuditoriaListResponse> {
    const response = await apiClient.get("/auditoria", {
        params: toParams(filtros as Record<string, unknown>),
    });
    return response.data.data as AuditoriaListResponse;
}

/**
 * Detalle de un evento de auditoría.
 * GET /auditoria/{id}
 */
export async function fetchAuditoriaDetalle(id: string): Promise<AuditLog> {
    const response = await apiClient.get(`/auditoria/${id}`);
    return response.data.data as AuditLog;
}

/**
 * Resumen / métricas para dashboard de auditoría.
 * GET /auditoria/resumen
 */
export async function fetchAuditoriaResumen(
    filtros: ResumenAuditoriaFiltros = {}
): Promise<ResumenAuditoria> {
    const response = await apiClient.get("/auditoria/resumen", {
        params: toParams(filtros as Record<string, unknown>),
    });
    return response.data.data as ResumenAuditoria;
}

/**
 * Listar snapshots de transacciones con filtros.
 * GET /auditoria/snapshots
 */
export async function fetchSnapshotsList(
    filtros: SnapshotsListFiltros = {}
): Promise<SnapshotsListResponse> {
    const response = await apiClient.get("/auditoria/snapshots", {
        params: toParams(filtros as Record<string, unknown>),
    });
    return response.data.data as SnapshotsListResponse;
}

/**
 * Detalle de un snapshot de transacción.
 * GET /auditoria/snapshots/{id}
 */
export async function fetchSnapshotDetalle(id: string): Promise<TransaccionSnapshot> {
    const response = await apiClient.get(`/auditoria/snapshots/${id}`);
    return response.data.data as TransaccionSnapshot;
}

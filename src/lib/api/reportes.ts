import apiClient from "../apiClient";
import type {
    ClienteReporteListItem,
    EstadoCuentaReporte,
    HistorialTransaccionesFiltros,
    HistorialTransaccionesReporte,
    ListadoCuentasFiltros,
    ListadoCuentasReporte,
    TransferenciasExternasFiltros,
    TransferenciasExternasReporte,
    ActividadMensualFiltros,
    ActividadMensualReporte,
} from "../types/reportes";

/**
 * Convierte un objeto de filtros a query string, omitiendo valores vacíos.
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
 * Lista de clientes (selector).
 * GET /reportes/clientes
 */
export async function fetchReporteClientes(): Promise<ClienteReporteListItem[]> {
    const response = await apiClient.get("/reportes/clientes");
    return response.data.data as ClienteReporteListItem[];
}

/**
 * 1. Estado de cuenta por cliente.
 * GET /reportes/estado-cuenta/{clienteId}
 */
export async function fetchEstadoCuenta(clienteId: number): Promise<EstadoCuentaReporte> {
    const response = await apiClient.get(`/reportes/estado-cuenta/${clienteId}`);
    return response.data.data as EstadoCuentaReporte;
}

/**
 * 2. Historial de transacciones.
 * GET /reportes/transacciones
 */
export async function fetchHistorialTransacciones(
    filtros: HistorialTransaccionesFiltros = {}
): Promise<HistorialTransaccionesReporte> {
    const response = await apiClient.get("/reportes/transacciones", {
        params: toParams(filtros as Record<string, unknown>),
    });
    return response.data.data as HistorialTransaccionesReporte;
}

/**
 * 3. Listado de cuentas con saldos.
 * GET /reportes/cuentas
 */
export async function fetchListadoCuentas(
    filtros: ListadoCuentasFiltros = {}
): Promise<ListadoCuentasReporte> {
    const response = await apiClient.get("/reportes/cuentas", {
        params: toParams(filtros as Record<string, unknown>),
    });
    return response.data.data as ListadoCuentasReporte;
}

/**
 * 4. Reporte de transferencias externas.
 * GET /reportes/transferencias-externas
 */
export async function fetchTransferenciasExternas(
    filtros: TransferenciasExternasFiltros = {}
): Promise<TransferenciasExternasReporte> {
    const response = await apiClient.get("/reportes/transferencias-externas", {
        params: toParams(filtros as Record<string, unknown>),
    });
    return response.data.data as TransferenciasExternasReporte;
}

/**
 * 5. Reporte de actividad mensual.
 * GET /reportes/actividad-mensual
 */
export async function fetchActividadMensual(
    filtros: ActividadMensualFiltros = {}
): Promise<ActividadMensualReporte> {
    const response = await apiClient.get("/reportes/actividad-mensual", {
        params: toParams(filtros as Record<string, unknown>),
    });
    return response.data.data as ActividadMensualReporte;
}

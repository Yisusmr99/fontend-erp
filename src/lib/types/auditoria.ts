// =====================================================
// Tipos del módulo de Auditoría
// =====================================================

export type Severidad = "info" | "warning" | "error" | "critical";

export type EstadoTransaccion = "pendiente" | "completada" | "fallida";

export type MonedaSnapshot = "Q" | "USD";

// ----- Wrappers genéricos de la API -----
export interface ApiResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

export interface ApiError {
    status: false;
    message: string;
    errors: Record<string, string[]> | unknown[];
}

export interface Paginacion {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

// =====================================================
// 1. Bitácora (audit_logs)
// =====================================================
export interface AuditLogHttp {
    method: string;
    url: string;
    ruta: string | null;
    ruta_nombre: string | null;
    status?: number;
}

export interface AuditLogCambios {
    antes: Record<string, unknown>;
    despues: Record<string, unknown>;
}

export interface AuditLog {
    id: string;
    accion: string;
    modulo: string;
    severidad: Severidad;
    mensaje: string | null;
    usuario_id: number | null;
    usuario_email: string | null;
    ip: string | null;
    user_agent: string | null;
    http: AuditLogHttp | null;
    payload: Record<string, unknown> | null;
    cambios: AuditLogCambios | null;
    contexto: Record<string, unknown> | null;
    created_at: string;
}

export interface AuditoriaListResponse {
    filtros: Record<string, unknown>;
    paginacion: Paginacion;
    items: AuditLog[];
}

export interface AuditoriaListFiltros {
    q?: string;
    modulo?: string;
    accion?: string;
    severidad?: Severidad;
    usuario_id?: number;
    usuario_email?: string;
    ip?: string;
    desde?: string;
    hasta?: string;
    page?: number;
    per_page?: number;
}

// =====================================================
// 2. Resumen / métricas
// =====================================================
export interface ResumenAuditoriaPeriodo {
    desde: string;
    hasta: string;
}

export interface ResumenAuditoriaTotales {
    eventos: number;
    usuarios_unicos: number;
    logins_exitosos: number;
    logins_fallidos: number;
}

export interface ResumenAuditoria {
    periodo: ResumenAuditoriaPeriodo;
    totales: ResumenAuditoriaTotales;
    por_severidad: Record<Severidad, number>;
    por_modulo: Record<string, number>;
    top_acciones: Record<string, number>;
    por_dia: Record<string, number>;
}

export interface ResumenAuditoriaFiltros {
    desde?: string;
    hasta?: string;
}

// =====================================================
// 3. Snapshots de transacciones
// =====================================================
export interface SnapshotClienteEmbed {
    id: number;
    nombres: string | null;
    apellidos: string | null;
    dpi: string | null;
}

export interface SnapshotCuenta {
    id: number;
    numero_cuenta: string;
    tipo_cuenta: string | null;
    moneda: string | null;
    cliente: SnapshotClienteEmbed | null;
}

export interface SnapshotRegistradoPor {
    id: number;
    name: string | null;
    email: string | null;
    ip: string | null;
    user_agent: string | null;
}

export interface TransaccionSnapshot {
    id: string;
    transaccion_id_sql: number;
    motivo: string;
    tipo_transaccion: string;
    estado: EstadoTransaccion;
    moneda: MonedaSnapshot;
    monto: number;
    monto_convertido: number | null;
    es_externa: boolean;
    banco_externo: string | null;
    referencia: string | null;
    cuenta_origen: SnapshotCuenta | null;
    cuenta_destino: SnapshotCuenta | null;
    registrado_por: SnapshotRegistradoPor | null;
    fecha_transaccion: string;
    hora_transaccion: string | null;
    created_at: string;
}

export interface SnapshotsListResponse {
    filtros: Record<string, unknown>;
    paginacion: Paginacion;
    items: TransaccionSnapshot[];
}

export interface SnapshotsListFiltros {
    transaccion_id?: number;
    cliente_id?: number;
    cuenta_id?: number;
    numero_cuenta?: string;
    tipo?: string;
    estado?: EstadoTransaccion;
    moneda?: MonedaSnapshot;
    es_externa?: boolean;
    banco_externo?: string;
    monto_min?: number;
    monto_max?: number;
    desde?: string;
    hasta?: string;
    page?: number;
    per_page?: number;
}

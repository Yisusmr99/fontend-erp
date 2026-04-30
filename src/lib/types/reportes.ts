import type { Cuenta, ClienteCuenta, TipoCuenta, Moneda } from "./cuentas";

// =====================================================
// Helper compartido
// =====================================================
export interface ClienteReporteListItem {
    id: number;
    nombre_completo: string;
    dpi: string;
    estado: boolean;
    cantidad_cuentas: number;
}

// =====================================================
// 1. Estado de cuenta por cliente
// =====================================================
export interface SaldoPorMonedaReporte {
    moneda: string;
    cantidad_cuentas: number;
    total_disponible: number;
    total_saldo: number;
}

export interface ResumenBancoExternoReporte {
    banco_externo: string;
    cantidad: number;
    monto_total: number;
}

export interface MovimientosExternosReporte {
    total_enviado: number;
    total_recibido: number;
    salientes_por_banco: ResumenBancoExternoReporte[];
    entrantes_por_banco: ResumenBancoExternoReporte[];
}

export interface ClienteCompletoReporte extends ClienteCuenta {
    cuentas?: Cuenta[];
}

export interface TransaccionReporte {
    id: number;
    tipo_transaccion: string;
    moneda: string;
    monto: number | string;
    monto_convertido?: number | string | null;
    referencia: string | null;
    estado: string;
    es_externa: boolean;
    banco_externo: string | null;
    fecha_transaccion: string | null;
    hora_transaccion: string | null;
    cuenta_origen?: Cuenta | null;
    cuenta_destino?: Cuenta | null;
    transferencia_externa?: unknown;
    created_at: string;
    updated_at: string;
}

export interface EstadoCuentaReporte {
    cliente: ClienteCompletoReporte;
    cuentas: {
        total: number;
        activas: number;
        inactivas: number;
        distribucion_tipo: Record<string, number>;
        detalle: Cuenta[];
    };
    saldos_propios: SaldoPorMonedaReporte[];
    movimientos_externos: MovimientosExternosReporte;
    transacciones_recientes: TransaccionReporte[];
    ultima_actividad: string | null;
    fecha_emision: string;
}

// =====================================================
// 2. Historial de transacciones
// =====================================================
export interface HistorialTransaccionesFiltros {
    desde?: string;
    hasta?: string;
    cliente_id?: number;
    cuenta_id?: number;
    tipo?: "transferencia" | "deposito" | "retiro";
    estado?: "pendiente" | "completada" | "fallida";
    es_externa?: boolean;
}

export interface HistorialTransaccionesReporte {
    filtros: HistorialTransaccionesFiltros;
    totales: {
        registros: number;
        completadas: number;
        monto_total: number;
        por_tipo: Record<string, { cantidad: number; monto_total: number }>;
    };
    transacciones: TransaccionReporte[];
    fecha_emision: string;
}

// =====================================================
// 3. Listado de cuentas
// =====================================================
export interface ListadoCuentasFiltros {
    cliente_id?: number;
    tipo_cuenta?: TipoCuenta;
    moneda?: Moneda;
    estado?: boolean;
}

export interface ListadoCuentasReporte {
    filtros: ListadoCuentasFiltros;
    totales: {
        cantidad: number;
        activas: number;
        inactivas: number;
        por_moneda: SaldoPorMonedaReporte[];
        por_tipo: Record<string, number>;
    };
    cuentas: Cuenta[];
    fecha_emision: string;
}

// =====================================================
// 4. Transferencias externas
// =====================================================
export interface TransferenciasExternasFiltros {
    desde?: string;
    hasta?: string;
    banco_externo?: string;
    tipo?: "entrante" | "saliente";
}

export interface TransferenciaExternaReporteItem {
    id: number;
    tipo: string;
    banco_externo: string;
    cuenta_externa: string;
    codigo_confirmacion: string;
    estado: string;
    fecha_envio: string | null;
    fecha_confirmacion: string | null;
    transaccion?: TransaccionReporte | null;
    created_at: string;
    updated_at: string;
}

export interface TransferenciasExternasReporte {
    filtros: TransferenciasExternasFiltros;
    totales: {
        cantidad: number;
        monto_total: number;
        por_banco: ResumenBancoExternoReporte[];
        por_tipo: Record<string, { cantidad: number; monto_total: number }>;
    };
    transferencias: TransferenciaExternaReporteItem[];
    fecha_emision: string;
}

// =====================================================
// 5. Actividad mensual
// =====================================================
export interface ActividadMensualFiltros {
    anio?: number;
    mes?: number;
}

export interface TopClienteActividad {
    cliente_id: number;
    nombre_completo: string;
    cantidad_transacciones: number;
    monto_total: number;
}

export interface ActividadMensualReporte {
    periodo: {
        anio: number;
        mes: number;
        fecha_inicio: string;
        fecha_fin: string;
    };
    transacciones: {
        total: number;
        completadas: number;
        pendientes: number;
        fallidas: number;
        monto_movido: number;
        por_tipo: Record<string, { cantidad: number; monto_total: number }>;
        por_moneda: Record<string, { cantidad: number; monto_total: number }>;
    };
    transferencias_externas: number;
    cuentas_nuevas: number;
    clientes_nuevos: number;
    top_clientes: TopClienteActividad[];
    fecha_emision: string;
}

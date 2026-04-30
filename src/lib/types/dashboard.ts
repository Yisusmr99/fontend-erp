// =====================================================
// /dashboard/summary
// =====================================================

export interface DashboardClientesStats {
    total: number;
    activos: number;
    inactivos: number;
}

export interface DashboardCuentasStats {
    total: number;
    activas: number;
    inactivas: number;
    distribucion_tipo: Record<string, number>;
}

export interface SaldoPorMoneda {
    moneda: string;
    cantidad_cuentas: number;
    total_disponible: number;
    total_saldo: number;
}

export interface DashboardTransaccionesMes {
    periodo_inicio: string;
    periodo_fin: string;
    total: number;
    externas: number;
    monto_movido: number;
    distribucion_por_tipo: Record<string, number>;
}

export interface DashboardTransferenciasExternas {
    total_historico: number;
}

export interface DashboardSummary {
    clientes: DashboardClientesStats;
    cuentas: DashboardCuentasStats;
    saldos_por_moneda: SaldoPorMoneda[];
    transacciones_mes: DashboardTransaccionesMes;
    transferencias_externas: DashboardTransferenciasExternas;
}

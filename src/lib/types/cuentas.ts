export type TipoCuenta = "monetaria" | "ahorro" | "estudiantil";

export type Moneda = "Q" | "$";

export interface ClienteCuenta {
    id: number;
    nombres: string;
    apellidos: string;
    dpi: string;
    direccion: string;
    telefono: string;
    correo_electronico: string;
    estado: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface Cuenta {
    id: number;
    id_cliente: number;
    numero_cuenta: string;
    saldo: number;
    saldo_disponible: number;
    tipo_cuenta: TipoCuenta;
    moneda: Moneda;
    fecha_apertura: string | null;
    fecha_cierre: string | null;
    estado: boolean;
    cliente?: ClienteCuenta;
    created_at: string;
    updated_at: string;
}

export interface CuentasPaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface CuentasApiResponse {
    cuentas: Cuenta[];
    meta: CuentasPaginationMeta;
}

export interface FetchCuentasResult {
    data: Cuenta[];
    meta: CuentasPaginationMeta;
}

export interface StoreCuentaPayload {
    id_cliente: number;
    numero_cuenta: string;
    saldo_disponible: number;
    tipo_cuenta: TipoCuenta;
    moneda?: Moneda;
}

export interface UpdateCuentaPayload {
    id_cliente?: number;
    numero_cuenta?: string;
    tipo_cuenta?: TipoCuenta;
    moneda?: Moneda;
    estado?: boolean;
}

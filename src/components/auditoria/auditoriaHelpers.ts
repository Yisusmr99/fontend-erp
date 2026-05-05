import { signOut } from "next-auth/react";
import type { Severidad, EstadoTransaccion } from "@/lib/types/auditoria";

// =====================================================
// Catálogos / labels
// =====================================================
export const MODULOS_AUDITORIA: { value: string; label: string }[] = [
    { value: "auth", label: "Autenticación" },
    { value: "clientes", label: "Clientes" },
    { value: "cuentas", label: "Cuentas" },
    { value: "transacciones", label: "Transacciones" },
    { value: "transferencias-externas", label: "Transferencias externas" },
    { value: "tickets", label: "Tickets" },
    { value: "users", label: "Usuarios" },
    { value: "roles", label: "Roles" },
];

export const MODULO_LABELS: Record<string, string> = MODULOS_AUDITORIA.reduce(
    (acc, m) => {
        acc[m.value] = m.label;
        return acc;
    },
    {} as Record<string, string>
);

export const SEVERIDADES: Severidad[] = ["info", "warning", "error", "critical"];

export const SEVERIDAD_LABEL: Record<Severidad, string> = {
    info: "Info",
    warning: "Advertencia",
    error: "Error",
    critical: "Crítica",
};

export const ESTADOS_TRANSACCION: EstadoTransaccion[] = [
    "pendiente",
    "completada",
    "fallida",
];

// =====================================================
// Colores semánticos (para Chip de MUI)
// =====================================================
export type MuiChipColor =
    | "default"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "error";

export function severidadColor(s: Severidad): MuiChipColor {
    switch (s) {
        case "info":
            return "info";
        case "warning":
            return "warning";
        case "error":
            return "error";
        case "critical":
            return "error";
        default:
            return "default";
    }
}

/**
 * Hex aproximado para gráficos (Chart.js no acepta theme tokens directos).
 */
export const SEVERIDAD_HEX: Record<Severidad, string> = {
    info: "#0288D1",
    warning: "#ED6C02",
    error: "#D32F2F",
    critical: "#7B1FA2",
};

export function estadoTransaccionColor(e: EstadoTransaccion): MuiChipColor {
    switch (e) {
        case "completada":
            return "success";
        case "fallida":
            return "error";
        case "pendiente":
            return "warning";
        default:
            return "default";
    }
}

export function httpStatusColor(status?: number): MuiChipColor {
    if (status === undefined || status === null) return "default";
    if (status >= 500) return "error";
    if (status >= 400) return "warning";
    if (status >= 300) return "info";
    if (status >= 200) return "success";
    return "default";
}

export function httpMethodColor(method?: string): MuiChipColor {
    switch ((method ?? "").toUpperCase()) {
        case "GET":
            return "info";
        case "POST":
            return "success";
        case "PUT":
        case "PATCH":
            return "warning";
        case "DELETE":
            return "error";
        default:
            return "default";
    }
}

// =====================================================
// Formato de fechas (zona America/Guatemala)
// =====================================================
const TZ_GT = "America/Guatemala";

export function formatFechaGT(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString("es-GT", {
            timeZone: TZ_GT,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

export function formatFechaCorta(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("es-GT", {
            timeZone: TZ_GT,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return iso;
    }
}

export function formatHoraGT(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleTimeString("es-GT", {
            timeZone: TZ_GT,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    } catch {
        return iso;
    }
}

// =====================================================
// Formato de montos
// =====================================================
export function formatMonto(monto: number | string | null | undefined, moneda: string): string {
    const n = Number(monto ?? 0);
    if (moneda === "USD" || moneda === "$") {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return formatter.format(n);
    }
    const formatter = new Intl.NumberFormat("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `Q ${formatter.format(n)}`;
}

export function formatNumero(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    return n.toLocaleString("es-GT");
}

// =====================================================
// Manejo de errores HTTP
// =====================================================
export interface ApiErrorContext {
    /** redirige al login en 401 */
    redirectOn401?: boolean;
}

export function describeApiError(
    error: unknown,
    fallback: string,
    ctx: ApiErrorContext = { redirectOn401: true }
): string {
    const err = error as {
        response?: { status?: number; data?: { message?: string } };
    };
    const status = err.response?.status;

    if (status === 401 && ctx.redirectOn401) {
        signOut({ callbackUrl: "/login" }).catch(() => undefined);
        return "Sesión expirada. Redirigiendo al inicio de sesión…";
    }
    if (status === 403) return "No tienes permisos para acceder a este recurso.";
    if (status === 404) return err.response?.data?.message ?? "Registro no encontrado.";
    if (status === 422) return err.response?.data?.message ?? "Filtros inválidos.";
    if (status && status >= 500) {
        return err.response?.data?.message ?? "Error interno del servidor.";
    }
    return err.response?.data?.message ?? fallback;
}

// =====================================================
// Hook simple de debounce
// =====================================================
import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 400): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(id);
    }, [value, delayMs]);
    return debounced;
}

// =====================================================
// Query string <-> filtros (para URL persistente)
// =====================================================
export type ParamSpec<T> = {
    key: keyof T & string;
    type: "string" | "number" | "boolean";
};

export function paramsToFiltros<T>(sp: URLSearchParams, spec: ParamSpec<T>[]): Partial<T> {
    const result: Record<string, unknown> = {};
    for (const { key, type } of spec) {
        const raw = sp.get(key);
        if (raw === null || raw === "") continue;
        switch (type) {
            case "number": {
                const n = Number(raw);
                if (!Number.isNaN(n)) result[key] = n;
                break;
            }
            case "boolean":
                result[key] = raw === "1" || raw === "true";
                break;
            default:
                result[key] = raw;
        }
    }
    return result as Partial<T>;
}

export function filtrosToParams<T>(filtros: T): URLSearchParams {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(filtros as Record<string, unknown>)) {
        if (value === undefined || value === null || value === "") continue;
        if (typeof value === "boolean") {
            sp.set(key, value ? "1" : "0");
        } else {
            sp.set(key, String(value));
        }
    }
    return sp;
}

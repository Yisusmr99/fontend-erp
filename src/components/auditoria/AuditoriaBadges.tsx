"use client";

import Chip from "@mui/material/Chip";
import type { Severidad, EstadoTransaccion } from "@/lib/types/auditoria";
import {
    SEVERIDAD_LABEL,
    severidadColor,
    estadoTransaccionColor,
    httpMethodColor,
    httpStatusColor,
    MODULO_LABELS,
} from "./auditoriaHelpers";

export function SeveridadChip({ severidad, size = "small" }: { severidad: Severidad; size?: "small" | "medium" }) {
    return (
        <Chip
            label={SEVERIDAD_LABEL[severidad] ?? severidad}
            color={severidadColor(severidad)}
            size={size}
            variant={severidad === "critical" ? "filled" : "outlined"}
            aria-label={`Severidad: ${severidad}`}
        />
    );
}

export function EstadoTransaccionChip({
    estado,
    size = "small",
}: {
    estado: EstadoTransaccion;
    size?: "small" | "medium";
}) {
    return (
        <Chip
            label={estado.charAt(0).toUpperCase() + estado.slice(1)}
            color={estadoTransaccionColor(estado)}
            size={size}
            aria-label={`Estado de transacción: ${estado}`}
        />
    );
}

export function HttpMethodChip({ method, size = "small" }: { method?: string | null; size?: "small" | "medium" }) {
    if (!method) return <Chip label="—" size={size} variant="outlined" />;
    return (
        <Chip
            label={method.toUpperCase()}
            color={httpMethodColor(method)}
            size={size}
            variant="outlined"
            aria-label={`Método HTTP: ${method}`}
        />
    );
}

export function HttpStatusChip({ status, size = "small" }: { status?: number | null; size?: "small" | "medium" }) {
    if (status === null || status === undefined) return <Chip label="—" size={size} variant="outlined" />;
    return (
        <Chip
            label={String(status)}
            color={httpStatusColor(status)}
            size={size}
            variant="outlined"
            aria-label={`Código HTTP: ${status}`}
        />
    );
}

export function ModuloChip({ modulo, size = "small" }: { modulo: string; size?: "small" | "medium" }) {
    return (
        <Chip
            label={MODULO_LABELS[modulo] ?? modulo}
            size={size}
            variant="outlined"
            color="primary"
        />
    );
}

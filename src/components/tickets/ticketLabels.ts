import {
    ESTADO_TICKET_ASIGNADO_VALOR,
    ESTADO_TICKET_CERRADO_VALOR,
    ESTADO_TICKET_EN_PROCESO_VALOR,
    ESTADO_TICKET_OPCIONES,
    ESTADO_TICKET_PENDIENTE_VALOR,
    ESTADO_TICKET_RESUELTO_VALOR,
    TIPO_TICKET_OPCIONES,
} from "@/lib/ticketCatalog";
import type { TicketClienteResumen } from "@/lib/types/ticket";
import { PrioridadTicket } from "@/lib/types/ticket";

export function tipoTicketLabel(v: string | number): string {
    const s = String(v).toLowerCase();
    return TIPO_TICKET_OPCIONES.find((o) => o.value === s)?.label ?? `Tipo (${s})`;
}

export function estadoTicketLabel(v: string | number): string {
    const s = String(v).toLowerCase();
    return ESTADO_TICKET_OPCIONES.find((o) => o.value === s)?.label ?? `Estado (${s})`;
}

export function prioridadLabel(v: number): string {
    const m: Record<number, string> = {
        [PrioridadTicket.Baja]: "Baja",
        [PrioridadTicket.Media]: "Media",
        [PrioridadTicket.Alta]: "Alta",
        [PrioridadTicket.Urgente]: "Urgente",
    };
    return m[v] ?? `Prioridad ${v}`;
}

export function prioridadColor(
    v: number
): "default" | "primary" | "success" | "warning" | "error" {
    if (v === PrioridadTicket.Urgente) return "error";
    if (v === PrioridadTicket.Alta) return "warning";
    if (v === PrioridadTicket.Media) return "primary";
    if (v === PrioridadTicket.Baja) return "success";
    return "default";
}

export function estadoColor(v: string | number): "default" | "primary" | "success" | "warning" | "error" {
    const s = String(v).toLowerCase();
    if (s === ESTADO_TICKET_CERRADO_VALOR) return "default";
    if (s === ESTADO_TICKET_ASIGNADO_VALOR) return "primary";
    if (s === ESTADO_TICKET_EN_PROCESO_VALOR) return "warning";
    if (s === ESTADO_TICKET_PENDIENTE_VALOR) return "error";
    if (s === ESTADO_TICKET_RESUELTO_VALOR) return "success";
    return "success"; // abierto
}

export function formatTicketClienteNombre(c?: TicketClienteResumen): string {
    if (!c) return "—";
    const n = `${c.nombres ?? ""} ${c.apellidos ?? ""}`.trim();
    return n || `Cliente #${c.id}`;
}

export function enumNumericPairs(record: Record<string, number | string>): [string, number][] {
    return Object.entries(record).filter((e): e is [string, number] => typeof e[1] === "number");
}

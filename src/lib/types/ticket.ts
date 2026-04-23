import {
    CANAL_ORIGEN_DEFAULT,
    CANAL_ORIGEN_OPCIONES,
    ESTADO_TICKET_ABIERTO_VALOR,
    ESTADO_TICKET_OPCIONES,
    TIPO_TICKET_OPCIONES,
} from "@/lib/ticketCatalog";

/**
 * Tipos alineados con Ticket / HistorialTicket (Laravel).
 * `id_tipo_ticket` e `id_estado_ticket` son valores de enums string-backed en PHP.
 */

/** Valores de `App\Enums\EstadoTicket` (string-backed). Sincronizado con PHP. */
export const EstadoTicket = {
    Abierto: "abierto",
    Asignado: "asignado",
    EnProceso: "en proceso",
    Pendiente: "pendiente",
    Resuelto: "resuelto",
    Cerrado: "cerrado",
} as const;

export type EstadoTicketValue = (typeof EstadoTicket)[keyof typeof EstadoTicket];

/** Valores de `App\Enums\TipoTicket` (string-backed). */
export const TipoTicket = {
    Consulta: "consulta",
    Reclamo: "reclamo",
    Solicitud: "solicitud",
    Soporte: "soporte",
} as const;

export type TipoTicketValue = (typeof TipoTicket)[keyof typeof TipoTicket];

/** Catálogo de prioridad (entero según tu tabla / enum en backend). */
export const PrioridadTicket = {
    Baja: 1,
    Media: 2,
    Alta: 3,
    Urgente: 4,
} as const;

export type PrioridadTicketValue = (typeof PrioridadTicket)[keyof typeof PrioridadTicket];

export interface TicketClienteResumen {
    id: number;
    nombres?: string;
    apellidos?: string;
    dpi?: string;
    correo_electronico?: string;
    telefono?: string;
}

export interface TicketUsuarioResumen {
    id: number;
    name: string;
    email?: string;
}

export interface Ticket {
    id_ticket: number;
    codigo_ticket: string;
    id_cliente: number;
    /** Valor string del enum `TipoTicket` en PHP. */
    id_tipo_ticket: string;
    /** Valor string del enum `EstadoTicket` en PHP. */
    id_estado_ticket: string;
    id_prioridad: number;
    asunto: string;
    descripcion: string | null;
    fecha_creacion: string;
    fecha_cierre: string | null;
    canal_origen: string | null;
    creado_por: number;
    observaciones_generales: string | null;
    cliente?: TicketClienteResumen;
    creador?: TicketUsuarioResumen;
    asignaciones_count?: number;
    historiales_count?: number;
}

export interface TicketsPaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface TicketsApiResponse {
    tickets: Ticket[];
    meta: TicketsPaginationMeta;
}

export interface FetchTicketsResult {
    data: Ticket[];
    meta: TicketsPaginationMeta;
}

export interface StoreTicketPayload {
    id_cliente: number;
    id_tipo_ticket: string;
    id_prioridad: number;
    asunto: string;
    descripcion?: string | null;
    canal_origen?: string | null;
    creado_por?: number;
    observaciones_generales?: string | null;
}

export interface UpdateTicketPayload {
    id_cliente?: number;
    id_tipo_ticket?: string;
    id_estado_ticket?: string;
    id_prioridad?: number;
    asunto?: string;
    descripcion?: string | null;
    canal_origen?: string | null;
    observaciones_generales?: string | null;
}

export interface AssignTicketPayload {
    id_usuario_asignado: number;
    motivo_asignacion?: string | null;
}

export interface ReassignTicketPayload {
    id_usuario_asignado: number;
    motivo_asignacion: string;
}

export interface ChangeTicketStatusPayload {
    id_estado_ticket: string;
    descripcion: string;
}

export interface CloseTicketPayload {
    descripcion?: string | null;
}

export interface HistorialTicket {
    id_historial: number;
    id_ticket: number;
    id_usuario: number;
    fecha_movimiento: string;
    tipo_movimiento: number;
    descripcion: string | null;
    estado_anterior: string | null;
    estado_nuevo: string | null;
    usuario?: TicketUsuarioResumen;
}

export interface TicketCreateFormState {
    id_cliente: number | null;
    id_tipo_ticket: string;
    id_prioridad: number;
    asunto: string;
    descripcion: string;
    canal_origen: string;
    observaciones_generales: string;
}

export interface TicketEditFormState {
    id_tipo_ticket: string;
    id_prioridad: number;
    id_estado_ticket: string;
    asunto: string;
    descripcion: string;
    canal_origen: string;
    observaciones_generales: string;
}

export interface TicketAssignFormState {
    id_usuario: number | null;
    motivo: string;
}

export interface TicketReassignFormState {
    id_usuario: number | null;
    motivo: string;
}

export interface TicketStatusFormState {
    id_estado_ticket: string;
    descripcion: string;
    id_usuario_asignado: number | null;
    motivo_asignacion: string;
}

export interface TicketCloseFormState {
    descripcion: string;
}

export function emptyTicketCreateForm(): TicketCreateFormState {
    return {
        id_cliente: null,
        id_tipo_ticket: TIPO_TICKET_OPCIONES[0]?.value ?? TipoTicket.Consulta,
        id_prioridad: PrioridadTicket.Media,
        asunto: "",
        descripcion: "",
        canal_origen: CANAL_ORIGEN_DEFAULT,
        observaciones_generales: "",
    };
}

export function ticketEditFormFromTicket(t: Ticket): TicketEditFormState {
    const rawCanal = (t.canal_origen ?? "").trim().toLowerCase();
    const canalValido = CANAL_ORIGEN_OPCIONES.some((o) => o.value === rawCanal);

    const rawTipo = String(t.id_tipo_ticket ?? "").toLowerCase();
    const tipoOk = TIPO_TICKET_OPCIONES.some((o) => o.value === rawTipo);

    const rawEst = String(t.id_estado_ticket ?? "").toLowerCase();
    const estOk = ESTADO_TICKET_OPCIONES.some((o) => o.value === rawEst);

    return {
        id_tipo_ticket: tipoOk ? rawTipo : TIPO_TICKET_OPCIONES[0]?.value ?? TipoTicket.Consulta,
        id_prioridad: t.id_prioridad,
        id_estado_ticket: estOk ? rawEst : ESTADO_TICKET_ABIERTO_VALOR,
        asunto: t.asunto,
        descripcion: t.descripcion ?? "",
        canal_origen: canalValido ? rawCanal : CANAL_ORIGEN_DEFAULT,
        observaciones_generales: t.observaciones_generales ?? "",
    };
}

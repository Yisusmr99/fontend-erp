/**
 * Catalogo alineado con StoreTicketRequest y enums PHP (string-backed).
 *
 * TipoTicket en PHP: consulta | reclamo | solicitud | soporte
 *
 * EstadoTicket en PHP:
 *   case Abierto = 'abierto'; case Asignado = 'asignado'; case EnProceso = 'en proceso';
 *   case Pendiente = 'pendiente'; case Resuelto = 'resuelto'; case Cerrado = 'cerrado';
 *
 * Crear ticket: no enviar id_estado_ticket; el request hace mergeIfMissing con EstadoTicket::Abierto.
 */

export const CANAL_ORIGEN_OPCIONES = [
    { value: "web", label: "Web" },
    { value: "telefono", label: "Telefono" },
    { value: "correo", label: "Correo" },
    { value: "presencial", label: "Presencial" },
] as const;

export type CanalOrigenValue = (typeof CANAL_ORIGEN_OPCIONES)[number]["value"];

export const CANAL_ORIGEN_DEFAULT: CanalOrigenValue = "web";

export const ESTADO_TICKET_ABIERTO_VALOR = "abierto";
export const ESTADO_TICKET_ASIGNADO_VALOR = "asignado";
export const ESTADO_TICKET_EN_PROCESO_VALOR = "en proceso";
export const ESTADO_TICKET_PENDIENTE_VALOR = "pendiente";
export const ESTADO_TICKET_RESUELTO_VALOR = "resuelto";
export const ESTADO_TICKET_CERRADO_VALOR = "cerrado";

export const TIPO_TICKET_OPCIONES: { value: string; label: string }[] = [
    { value: "consulta", label: "Consulta" },
    { value: "reclamo", label: "Reclamo" },
    { value: "solicitud", label: "Solicitud" },
    { value: "soporte", label: "Soporte" },
];

export const ESTADO_TICKET_OPCIONES: { value: string; label: string }[] = [
    { value: "abierto", label: "Abierto" },
    { value: "asignado", label: "Asignado" },
    { value: "en proceso", label: "En proceso" },
    { value: "pendiente", label: "Pendiente" },
    { value: "resuelto", label: "Resuelto" },
    { value: "cerrado", label: "Cerrado" },
];

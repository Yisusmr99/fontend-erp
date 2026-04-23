import apiClient from "../apiClient";
import type {
    AssignTicketPayload,
    ChangeTicketStatusPayload,
    CloseTicketPayload,
    FetchTicketsResult,
    ReassignTicketPayload,
    StoreTicketPayload,
    Ticket,
    TicketsApiResponse,
    UpdateTicketPayload,
} from "../types/ticket";

function parseTicketsIndexPayload(raw: unknown): TicketsApiResponse {
    if (raw && typeof raw === "object" && "tickets" in raw && "meta" in raw) {
        return raw as TicketsApiResponse;
    }
    if (Array.isArray(raw)) {
        return {
            tickets: raw as Ticket[],
            meta: {
                current_page: 1,
                last_page: 1,
                per_page: raw.length,
                total: raw.length,
            },
        };
    }
    return { tickets: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } };
}

export async function fetchTickets(page: number = 1): Promise<FetchTicketsResult> {
    try {
        const response = await apiClient.get("/tickets", {
            params: { page },
        });
        const data = parseTicketsIndexPayload(response.data?.data);
        return {
            data: data.tickets,
            meta: data.meta,
        };
    } catch (error) {
        console.error("Error fetching tickets:", error);
        throw error;
    }
}

export async function fetchAllTickets(): Promise<Ticket[]> {
    try {
        const response = await apiClient.get("/tickets/all");
        const raw = response.data?.data;
        if (Array.isArray(raw)) {
            return raw as Ticket[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching all tickets:", error);
        throw error;
    }
}

export async function fetchTicket(id: number): Promise<Ticket> {
    try {
        const response = await apiClient.get(`/tickets/${id}`);
        return response.data.data as Ticket;
    } catch (error) {
        console.error("Error fetching ticket:", error);
        throw error;
    }
}

export interface TicketFilterParams {
    page?: number;
    per_page?: number;
    id_estado_ticket?: string;
    canal_origen?: string;
    id_cliente?: number;
    id_tipo_ticket?: string;
    id_prioridad?: number;
    search?: string;
}

export async function fetchTicketsFiltered(params: TicketFilterParams): Promise<FetchTicketsResult> {
    try {
        const response = await apiClient.get("/tickets/filter", { params });
        const data = parseTicketsIndexPayload(response.data?.data);
        return {
            data: data.tickets,
            meta: data.meta,
        };
    } catch (error) {
        console.error("Error fetching filtered tickets:", error);
        throw error;
    }
}

export async function fetchTicketsByCliente(clienteId: number): Promise<Ticket[]> {
    try {
        const response = await apiClient.get(`/tickets/cliente/${clienteId}`);
        const raw = response.data?.data;
        if (Array.isArray(raw)) {
            return raw as Ticket[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching tickets by client:", error);
        throw error;
    }
}

export async function createTicket(payload: StoreTicketPayload): Promise<Ticket> {
    try {
        const response = await apiClient.post("/tickets", payload);
        return response.data.data as Ticket;
    } catch (error) {
        console.error("Error creating ticket:", error);
        throw error;
    }
}

export async function updateTicket(id: number, payload: UpdateTicketPayload): Promise<Ticket> {
    try {
        const response = await apiClient.put(`/tickets/${id}`, payload);
        return response.data.data as Ticket;
    } catch (error) {
        console.error("Error updating ticket:", error);
        throw error;
    }
}

export async function deleteTicket(id: number): Promise<void> {
    try {
        await apiClient.delete(`/tickets/${id}`);
    } catch (error) {
        console.error("Error deleting ticket:", error);
        throw error;
    }
}

export async function assignTicket(id: number, payload: AssignTicketPayload): Promise<Ticket> {
    try {
        const response = await apiClient.post(`/tickets/${id}/asignar`, payload);
        return response.data.data as Ticket;
    } catch (error) {
        console.error("Error assigning ticket:", error);
        throw error;
    }
}

export async function reassignTicket(id: number, payload: ReassignTicketPayload): Promise<Ticket> {
    try {
        const response = await apiClient.post(`/tickets/${id}/reasignar`, payload);
        return response.data.data as Ticket;
    } catch (error) {
        console.error("Error reassigning ticket:", error);
        throw error;
    }
}

export async function changeTicketStatus(
    id: number,
    payload: ChangeTicketStatusPayload
): Promise<Ticket> {
    try {
        const response = await apiClient.patch(`/tickets/${id}/estado`, payload);
        return response.data.data as Ticket;
    } catch (error) {
        console.error("Error changing ticket status:", error);
        throw error;
    }
}

export async function closeTicket(id: number, payload: CloseTicketPayload): Promise<Ticket> {
    try {
        const response = await apiClient.post(`/tickets/${id}/cerrar`, payload);
        return response.data.data as Ticket;
    } catch (error) {
        console.error("Error closing ticket:", error);
        throw error;
    }
}

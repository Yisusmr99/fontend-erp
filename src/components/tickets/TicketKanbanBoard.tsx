"use client";

import { useCallback, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Paper,
    Tooltip,
    Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import type { Ticket } from "@/lib/types/ticket";
import { ESTADO_TICKET_OPCIONES } from "@/lib/ticketCatalog";
import {
    estadoColor,
    formatTicketClienteNombre,
    prioridadColor,
    prioridadLabel,
    tipoTicketLabel,
} from "./ticketLabels";

export interface TicketKanbanBoardProps {
    tickets: Ticket[];
    onOpenDetail: (t: Ticket) => void;
    onOpenEdit: (t: Ticket) => void;
    onChangeStatus: (ticketId: number, nuevoEstado: string) => void;
}

export default function TicketKanbanBoard({
    tickets,
    onOpenDetail,
    onOpenEdit,
    onChangeStatus,
}: TicketKanbanBoardProps) {
    const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const ticketsByEstado = ESTADO_TICKET_OPCIONES.map((estado) => ({
        ...estado,
        tickets: tickets.filter(
            (t) => t.id_estado_ticket === estado.value
        ),
    }));

    const handleDragStart = useCallback(
        (e: React.DragEvent, ticket: Ticket) => {
            setDraggedTicket(ticket);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(ticket.id_ticket));
        },
        []
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent, estadoValue: string) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setDragOverColumn(estadoValue);
        },
        []
    );

    const handleDragLeave = useCallback(() => {
        setDragOverColumn(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, nuevoEstado: string) => {
            e.preventDefault();
            setDragOverColumn(null);
            if (draggedTicket && draggedTicket.id_estado_ticket !== nuevoEstado) {
                onChangeStatus(draggedTicket.id_ticket, nuevoEstado);
            }
            setDraggedTicket(null);
        },
        [draggedTicket, onChangeStatus]
    );

    const handleDragEnd = useCallback(() => {
        setDraggedTicket(null);
        setDragOverColumn(null);
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 2,
                minHeight: "calc(100vh - 280px)",
            }}
        >
            {ticketsByEstado.map((column) => (
                <Paper
                    key={column.value}
                    onDragOver={(e) => handleDragOver(e, column.value)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.value)}
                    sx={{
                        minWidth: 280,
                        maxWidth: 320,
                        flex: "1 0 280px",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: dragOverColumn === column.value
                            ? "action.hover"
                            : "background.default",
                        borderRadius: 2,
                        border: dragOverColumn === column.value
                            ? "2px dashed"
                            : "1px solid",
                        borderColor: dragOverColumn === column.value
                            ? "primary.main"
                            : "divider",
                        transition: "all 0.2s ease",
                    }}
                >
                    <Box
                        sx={{
                            p: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor: "action.hover",
                            borderRadius: "8px 8px 0 0",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                                label={column.label}
                                color={estadoColor(column.value)}
                                size="small"
                                sx={{ fontWeight: "bold" }}
                            />
                        </Box>
                        <Chip
                            label={column.tickets.length}
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 28 }}
                        />
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            p: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        {column.tickets.length === 0 && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: "center", py: 4 }}
                            >
                                Sin tickets
                            </Typography>
                        )}

                        {column.tickets.map((ticket) => (
                            <Card
                                key={ticket.id_ticket}
                                draggable
                                onDragStart={(e) => handleDragStart(e, ticket)}
                                onDragEnd={handleDragEnd}
                                sx={{
                                    cursor: "grab",
                                    opacity: draggedTicket?.id_ticket === ticket.id_ticket ? 0.4 : 1,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        boxShadow: 4,
                                        transform: "translateY(-2px)",
                                    },
                                    "&:active": {
                                        cursor: "grabbing",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            mb: 0.5,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            fontWeight="bold"
                                        >
                                            {ticket.codigo_ticket}
                                        </Typography>
                                        <Chip
                                            label={prioridadLabel(ticket.id_prioridad)}
                                            color={prioridadColor(ticket.id_prioridad)}
                                            size="small"
                                            sx={{ height: 20, fontSize: "0.65rem" }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{
                                            mb: 0.5,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                        }}
                                    >
                                        {ticket.asunto}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {formatTicketClienteNombre(ticket.cliente)}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mt: 1,
                                        }}
                                    >
                                        <Chip
                                            label={tipoTicketLabel(ticket.id_tipo_ticket)}
                                            variant="outlined"
                                            size="small"
                                            sx={{ height: 20, fontSize: "0.65rem" }}
                                        />
                                        <Box>
                                            <Tooltip title="Ver detalle">
                                                <IconButton
                                                    size="small"
                                                    color="info"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenDetail(ticket);
                                                    }}
                                                >
                                                    <VisibilityIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenEdit(ticket);
                                                    }}
                                                >
                                                    <EditIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {ticket.fecha_creacion && (
                                        <Typography
                                            variant="caption"
                                            color="text.disabled"
                                            sx={{ mt: 0.5, display: "block", fontSize: "0.6rem" }}
                                        >
                                            {new Date(ticket.fecha_creacion).toLocaleDateString()}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Paper>
            ))}
        </Box>
    );
}

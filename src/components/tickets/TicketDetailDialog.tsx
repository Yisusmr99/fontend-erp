"use client";

import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import type { Ticket } from "@/lib/types/ticket";
import { ESTADO_TICKET_CERRADO_VALOR } from "@/lib/ticketCatalog";
import {
    estadoTicketLabel,
    formatTicketClienteNombre,
    prioridadColor,
    prioridadLabel,
    tipoTicketLabel,
} from "./ticketLabels";

export interface TicketDetailDialogProps {
    open: boolean;
    ticket: Ticket | null;
    onClose: () => void;
    onAssign: (t: Ticket) => void;
    onReassign: (t: Ticket) => void;
    onChangeStatus: (t: Ticket) => void;
    onCloseTicket: (t: Ticket) => void;
    onEdit: (t: Ticket) => void;
    onDelete: (t: Ticket) => void;
}

export default function TicketDetailDialog({
    open,
    ticket,
    onClose,
    onAssign,
    onReassign,
    onChangeStatus,
    onCloseTicket,
    onEdit,
    onDelete,
}: TicketDetailDialogProps) {
    const cerrado = ticket?.id_estado_ticket === ESTADO_TICKET_CERRADO_VALOR;

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Ticket {ticket?.codigo_ticket}</span>
                <IconButton onClick={handleClose} aria-label="cerrar">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {ticket && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            <Chip label={estadoTicketLabel(ticket.id_estado_ticket)} color="primary" />
                            <Chip label={tipoTicketLabel(ticket.id_tipo_ticket)} variant="outlined" />
                            <Chip
                                label={prioridadLabel(ticket.id_prioridad)}
                                color={prioridadColor(ticket.id_prioridad)}
                            />
                        </Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            Cliente
                        </Typography>
                        <Typography>{formatTicketClienteNombre(ticket.cliente)}</Typography>
                        <Divider />
                        <Typography variant="subtitle2" color="text.secondary">
                            Asunto
                        </Typography>
                        <Typography>{ticket.asunto}</Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Descripción
                        </Typography>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>{ticket.descripcion || "—"}</Typography>
                        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Canal
                                </Typography>
                                <Typography>{ticket.canal_origen || "—"}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Creado
                                </Typography>
                                <Typography>
                                    {ticket.fecha_creacion
                                        ? new Date(ticket.fecha_creacion).toLocaleString()
                                        : "—"}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Cierre
                                </Typography>
                                <Typography>
                                    {ticket.fecha_cierre
                                        ? new Date(ticket.fecha_cierre).toLocaleString()
                                        : "—"}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            Creado por
                        </Typography>
                        <Typography>
                            {ticket.creador
                                ? `${ticket.creador.name}${ticket.creador.email ? ` (${ticket.creador.email})` : ""}`
                                : `Usuario #${ticket.creado_por}`}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            Observaciones generales
                        </Typography>
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>
                            {ticket.observaciones_generales || "—"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Asignaciones: {ticket.asignaciones_count ?? 0} · Historial:{" "}
                            {ticket.historiales_count ?? 0}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ flexWrap: "wrap", gap: 1, p: 2 }}>
                {!cerrado && ticket && (
                    <>
                        <Button
                            startIcon={<AssignmentIndIcon />}
                            variant="outlined"
                            onClick={() => {
                                handleClose();
                                onAssign(ticket);
                            }}
                        >
                            Asignar
                        </Button>
                        <Button
                            startIcon={<SwapHorizIcon />}
                            variant="outlined"
                            onClick={() => {
                                handleClose();
                                onReassign(ticket);
                            }}
                        >
                            Reasignar
                        </Button>
                        <Button
                            startIcon={<ToggleOnIcon />}
                            variant="outlined"
                            onClick={() => {
                                handleClose();
                                onChangeStatus(ticket);
                            }}
                        >
                            Cambiar estado
                        </Button>
                        <Button
                            color="warning"
                            variant="outlined"
                            onClick={() => {
                                handleClose();
                                onCloseTicket(ticket);
                            }}
                        >
                            Cerrar ticket
                        </Button>
                    </>
                )}
                {ticket && (
                    <>
                        <Button
                            startIcon={<EditIcon />}
                            variant="contained"
                            onClick={() => {
                                handleClose();
                                onEdit(ticket);
                            }}
                        >
                            Editar
                        </Button>
                        <Button
                            startIcon={<DeleteIcon />}
                            color="error"
                            variant="outlined"
                            onClick={() => {
                                handleClose();
                                onDelete(ticket);
                            }}
                        >
                            Eliminar
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

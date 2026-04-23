"use client";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Ticket, TicketStatusFormState } from "@/lib/types/ticket";
import type { Usuario } from "@/lib/api/usuarios";
import {
    ESTADO_TICKET_ASIGNADO_VALOR,
    ESTADO_TICKET_CERRADO_VALOR,
    ESTADO_TICKET_OPCIONES,
} from "@/lib/ticketCatalog";
import { estadoColor, estadoTicketLabel } from "./ticketLabels";

export interface TicketChangeStatusDialogProps {
    open: boolean;
    onClose: () => void;
    ticket: Ticket | null;
    form: TicketStatusFormState;
    onFormChange: (patch: Partial<TicketStatusFormState>) => void;
    usuarios: Usuario[];
    loadingUsuarios: boolean;
    formError: string | null;
    saving: boolean;
    onSubmit: () => void;
}

export default function TicketChangeStatusDialog({
    open,
    onClose,
    ticket,
    form,
    onFormChange,
    usuarios,
    loadingUsuarios,
    formError,
    saving,
    onSubmit,
}: TicketChangeStatusDialogProps) {
    const estadoActual = ticket?.id_estado_ticket ?? "";
    const esAsignacion = form.id_estado_ticket === ESTADO_TICKET_ASIGNADO_VALOR;
    const esCierre = form.id_estado_ticket === ESTADO_TICKET_CERRADO_VALOR;
    const cambio = estadoActual !== form.id_estado_ticket;

    const selectedUsuario = usuarios.find((u) => u.id === form.id_usuario_asignado) ?? null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cambiar estado del ticket</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {formError && (
                        <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                            {formError}
                        </Alert>
                    )}

                    {ticket && (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                p: 1.5,
                                bgcolor: "action.hover",
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                Ticket
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {ticket.codigo_ticket} — {ticket.asunto}
                            </Typography>
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                            py: 1,
                        }}
                    >
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                Estado actual
                            </Typography>
                            <Chip
                                label={estadoTicketLabel(estadoActual)}
                                color={estadoColor(estadoActual)}
                                size="medium"
                            />
                        </Box>
                        <ArrowForwardIcon color={cambio ? "primary" : "disabled"} />
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                Nuevo estado
                            </Typography>
                            <Chip
                                label={estadoTicketLabel(form.id_estado_ticket)}
                                color={cambio ? estadoColor(form.id_estado_ticket) : "default"}
                                size="medium"
                                variant={cambio ? "filled" : "outlined"}
                            />
                        </Box>
                    </Box>

                    <Divider />

                    <TextField
                        select
                        label="Nuevo estado"
                        fullWidth
                        value={form.id_estado_ticket}
                        onChange={(e) =>
                            onFormChange({
                                id_estado_ticket: e.target.value,
                                id_usuario_asignado: null,
                                motivo_asignacion: "",
                            })
                        }
                    >
                        {ESTADO_TICKET_OPCIONES.filter((opt) => opt.value !== estadoActual).map(
                            (opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            )
                        )}
                    </TextField>

                    {esAsignacion && (
                        <>
                            <Alert severity="info" sx={{ py: 0.5 }}>
                                Al cambiar a <strong>Asignado</strong> debes seleccionar el usuario responsable.
                            </Alert>
                            <Autocomplete
                                options={usuarios}
                                loading={loadingUsuarios}
                                value={selectedUsuario}
                                onChange={(_e, v) =>
                                    onFormChange({ id_usuario_asignado: v?.id ?? null })
                                }
                                getOptionLabel={(u) => `${u.name} (${u.email})`}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                renderInput={(params) => (
                                    <TextField {...params} label="Asignar a" required />
                                )}
                            />
                            <TextField
                                label="Motivo de asignacion"
                                fullWidth
                                multiline
                                minRows={2}
                                value={form.motivo_asignacion}
                                onChange={(e) =>
                                    onFormChange({ motivo_asignacion: e.target.value })
                                }
                                helperText="Opcional: describe el motivo de la asignacion."
                            />
                        </>
                    )}

                    {esCierre && (
                        <Alert severity="warning" sx={{ py: 0.5 }}>
                            Al cerrar el ticket se finalizaran todas las asignaciones activas.
                        </Alert>
                    )}

                    <TextField
                        label="Descripcion del cambio"
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        value={form.descripcion}
                        onChange={(e) => onFormChange({ descripcion: e.target.value })}
                        helperText="Requerido para registrar el historial del ticket."
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={saving || !cambio}
                    color={esCierre ? "warning" : "primary"}
                >
                    {saving ? (
                        <CircularProgress size={24} />
                    ) : esCierre ? (
                        "Cerrar ticket"
                    ) : esAsignacion ? (
                        "Asignar y cambiar"
                    ) : (
                        "Cambiar estado"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

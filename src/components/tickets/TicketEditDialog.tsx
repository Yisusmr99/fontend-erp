"use client";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
} from "@mui/material";
import type { TicketEditFormState } from "@/lib/types/ticket";
import { enumNumericPairs } from "./ticketLabels";
import { PrioridadTicket } from "@/lib/types/ticket";
import { CANAL_ORIGEN_OPCIONES, ESTADO_TICKET_OPCIONES, TIPO_TICKET_OPCIONES } from "@/lib/ticketCatalog";

export interface TicketEditDialogProps {
    open: boolean;
    codigoTicket: string | undefined;
    onClose: () => void;
    form: TicketEditFormState;
    onFormChange: (patch: Partial<TicketEditFormState>) => void;
    formError: string | null;
    saving: boolean;
    onSubmit: () => void;
}

export default function TicketEditDialog({
    open,
    codigoTicket,
    onClose,
    form,
    onFormChange,
    formError,
    saving,
    onSubmit,
}: TicketEditDialogProps) {
    const prioridadOptions = enumNumericPairs(PrioridadTicket);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Editar ticket {codigoTicket}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {formError && (
                        <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                            {formError}
                        </Alert>
                    )}
                    <TextField
                        select
                        label="Estado"
                        fullWidth
                        value={form.id_estado_ticket}
                        onChange={(e) => onFormChange({ id_estado_ticket: e.target.value })}
                    >
                        {ESTADO_TICKET_OPCIONES.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            select
                            label="Tipo"
                            fullWidth
                            value={form.id_tipo_ticket}
                            onChange={(e) => onFormChange({ id_tipo_ticket: e.target.value })}
                        >
                            {TIPO_TICKET_OPCIONES.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Prioridad"
                            fullWidth
                            value={form.id_prioridad}
                            onChange={(e) => onFormChange({ id_prioridad: Number(e.target.value) })}
                        >
                            {prioridadOptions.map(([label, val]) => (
                                <MenuItem key={val} value={val}>
                                    {label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <TextField
                        label="Asunto"
                        fullWidth
                        value={form.asunto}
                        onChange={(e) => onFormChange({ asunto: e.target.value })}
                    />
                    <TextField
                        label="Descripción"
                        fullWidth
                        multiline
                        minRows={3}
                        value={form.descripcion}
                        onChange={(e) => onFormChange({ descripcion: e.target.value })}
                    />
                    <TextField
                        select
                        label="Canal de origen"
                        fullWidth
                        value={form.canal_origen}
                        onChange={(e) => onFormChange({ canal_origen: e.target.value })}
                    >
                        {CANAL_ORIGEN_OPCIONES.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Observaciones generales"
                        fullWidth
                        multiline
                        minRows={2}
                        value={form.observaciones_generales}
                        onChange={(e) => onFormChange({ observaciones_generales: e.target.value })}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" onClick={onSubmit} disabled={saving}>
                    {saving ? <CircularProgress size={24} /> : "Actualizar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

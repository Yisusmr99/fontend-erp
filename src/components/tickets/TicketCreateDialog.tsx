"use client";

import {
    Alert,
    Autocomplete,
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
import type { TicketClienteResumen, TicketCreateFormState } from "@/lib/types/ticket";
import { formatTicketClienteNombre } from "./ticketLabels";
import { PrioridadTicket } from "@/lib/types/ticket";
import { CANAL_ORIGEN_OPCIONES, TIPO_TICKET_OPCIONES } from "@/lib/ticketCatalog";
import { enumNumericPairs } from "./ticketLabels";

export interface TicketCreateDialogProps {
    open: boolean;
    onClose: () => void;
    form: TicketCreateFormState;
    onFormChange: (patch: Partial<TicketCreateFormState>) => void;
    clientes: TicketClienteResumen[];
    loadingClientes: boolean;
    formError: string | null;
    saving: boolean;
    onSubmit: () => void;
}

export default function TicketCreateDialog({
    open,
    onClose,
    form,
    onFormChange,
    clientes,
    loadingClientes,
    formError,
    saving,
    onSubmit,
}: TicketCreateDialogProps) {
    const prioridadOptions = enumNumericPairs(PrioridadTicket);
    const selectedCliente = clientes.find((c) => c.id === form.id_cliente) ?? null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Nuevo ticket</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {formError && (
                        <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                            {formError}
                        </Alert>
                    )}
                    <Autocomplete
                        options={clientes}
                        loading={loadingClientes}
                        value={selectedCliente}
                        onChange={(_e, v) => onFormChange({ id_cliente: v?.id ?? null })}
                        getOptionLabel={(o) => formatTicketClienteNombre(o) + (o.dpi ? ` — ${o.dpi}` : "")}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => <TextField {...params} label="Cliente" required />}
                    />
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
                        required
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
                        required
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
                    {saving ? <CircularProgress size={24} /> : "Guardar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

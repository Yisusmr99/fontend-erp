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
    TextField,
} from "@mui/material";
import type { Usuario } from "@/lib/api/usuarios";
import type { TicketAssignFormState } from "@/lib/types/ticket";

export interface TicketAssignDialogProps {
    open: boolean;
    onClose: () => void;
    form: TicketAssignFormState;
    onFormChange: (patch: Partial<TicketAssignFormState>) => void;
    usuarios: Usuario[];
    loadingUsuarios: boolean;
    formError: string | null;
    saving: boolean;
    onSubmit: () => void;
}

export default function TicketAssignDialog({
    open,
    onClose,
    form,
    onFormChange,
    usuarios,
    loadingUsuarios,
    formError,
    saving,
    onSubmit,
}: TicketAssignDialogProps) {
    const selected = usuarios.find((u) => u.id === form.id_usuario) ?? null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Asignar ticket</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {formError && (
                        <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                            {formError}
                        </Alert>
                    )}
                    <Autocomplete
                        options={usuarios}
                        loading={loadingUsuarios}
                        value={selected}
                        onChange={(_e, v) => onFormChange({ id_usuario: v?.id ?? null })}
                        getOptionLabel={(u) => `${u.name} (${u.email})`}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField {...params} label="Usuario asignado" required />
                        )}
                    />
                    <TextField
                        label="Motivo (opcional)"
                        fullWidth
                        multiline
                        minRows={2}
                        value={form.motivo}
                        onChange={(e) => onFormChange({ motivo: e.target.value })}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" onClick={onSubmit} disabled={saving}>
                    {saving ? <CircularProgress size={24} /> : "Asignar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

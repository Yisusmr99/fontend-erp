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
    TextField,
} from "@mui/material";
import type { TicketCloseFormState } from "@/lib/types/ticket";

export interface TicketCloseDialogProps {
    open: boolean;
    onClose: () => void;
    form: TicketCloseFormState;
    onFormChange: (patch: Partial<TicketCloseFormState>) => void;
    formError: string | null;
    saving: boolean;
    onSubmit: () => void;
}

export default function TicketCloseDialog({
    open,
    onClose,
    form,
    onFormChange,
    formError,
    saving,
    onSubmit,
}: TicketCloseDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cerrar ticket</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {formError && (
                        <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                            {formError}
                        </Alert>
                    )}
                    <TextField
                        label="Comentario de cierre (opcional)"
                        fullWidth
                        multiline
                        minRows={3}
                        value={form.descripcion}
                        onChange={(e) => onFormChange({ descripcion: e.target.value })}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" color="warning" onClick={onSubmit} disabled={saving}>
                    {saving ? <CircularProgress size={24} /> : "Cerrar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

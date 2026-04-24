"use client";

import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

export interface TicketDeleteDialogProps {
    open: boolean;
    codigoTicket: string | undefined;
    onClose: () => void;
    saving: boolean;
    onConfirm: () => void;
}

export default function TicketDeleteDialog({
    open,
    codigoTicket,
    onClose,
    saving,
    onConfirm,
}: TicketDeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>¿Eliminar ticket?</DialogTitle>
            <DialogContent>
                <Typography>
                    Se eliminará el ticket <strong>{codigoTicket}</strong> (borrado lógico en el servidor si
                    aplica).
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" color="error" onClick={onConfirm} disabled={saving}>
                    {saving ? <CircularProgress size={24} /> : "Eliminar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

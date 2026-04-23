"use client";

import { useMemo } from "react";
import { Box, Chip, IconButton, Paper } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Ticket } from "@/lib/types/ticket";
import {
    estadoColor,
    estadoTicketLabel,
    formatTicketClienteNombre,
    prioridadColor,
    prioridadLabel,
    tipoTicketLabel,
} from "./ticketLabels";

export interface TicketsGridProps {
    tickets: Ticket[];
    loading: boolean;
    totalRows: number;
    paginationModel: GridPaginationModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;
    onOpenDetail: (t: Ticket) => void;
    onOpenEdit: (t: Ticket) => void;
    pageSize?: number;
}

export default function TicketsGrid({
    tickets,
    loading,
    totalRows,
    paginationModel,
    onPaginationModelChange,
    onOpenDetail,
    onOpenEdit,
    pageSize = 15,
}: TicketsGridProps) {
    const columns = useMemo<GridColDef<Ticket>[]>(
        () => [
            { field: "codigo_ticket", headerName: "Código", width: 130 },
            {
                field: "cliente",
                headerName: "Cliente",
                flex: 1,
                minWidth: 180,
                valueGetter: (_v, row) => formatTicketClienteNombre(row.cliente),
            },
            { field: "asunto", headerName: "Asunto", flex: 1, minWidth: 200 },
            {
                field: "id_tipo_ticket",
                headerName: "Tipo",
                width: 120,
                renderCell: (p) => (
                    <Chip size="small" label={tipoTicketLabel(p.row.id_tipo_ticket)} variant="outlined" />
                ),
            },
            {
                field: "id_prioridad",
                headerName: "Prioridad",
                width: 110,
                renderCell: (p) => (
                    <Chip
                        size="small"
                        label={prioridadLabel(p.row.id_prioridad)}
                        color={prioridadColor(p.row.id_prioridad)}
                    />
                ),
            },
            {
                field: "id_estado_ticket",
                headerName: "Estado",
                width: 130,
                renderCell: (p) => (
                    <Chip
                        size="small"
                        label={estadoTicketLabel(p.row.id_estado_ticket)}
                        color={estadoColor(p.row.id_estado_ticket)}
                    />
                ),
            },
            {
                field: "fecha_creacion",
                headerName: "Creado",
                width: 120,
                valueFormatter: (value: string | null | undefined) =>
                    value ? new Date(String(value)).toLocaleDateString() : "—",
            },
            {
                field: "asignaciones_count",
                headerName: "Asign.",
                width: 70,
                align: "center",
                headerAlign: "center",
                valueGetter: (_v, row) => row.asignaciones_count ?? 0,
            },
            {
                field: "actions",
                headerName: "Acciones",
                width: 200,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Box sx={{ display: "flex", gap: 0.25 }}>
                        <IconButton size="small" color="info" onClick={() => onOpenDetail(params.row)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={() => onOpenEdit(params.row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ),
            },
        ],
        [onOpenDetail, onOpenEdit]
    );

    return (
        <Paper sx={{ height: "calc(100vh - 200px)", width: "100%", boxShadow: 3, borderRadius: 2 }}>
            <DataGrid
                rows={tickets}
                columns={columns}
                getRowId={(row) => row.id_ticket}
                loading={loading}
                rowCount={totalRows}
                paginationModel={paginationModel}
                onPaginationModelChange={onPaginationModelChange}
                paginationMode="server"
                pageSizeOptions={[pageSize]}
                disableRowSelectionOnClick
                getRowHeight={() => "auto"}
                getEstimatedRowHeight={() => 56}
                sx={{
                    border: "none",
                    p: 1,
                    "& .MuiDataGrid-columnHeaders": {
                        bgcolor: "action.hover",
                        fontWeight: "bold",
                    },
                    "& .MuiDataGrid-cell": { py: 1 },
                }}
            />
        </Paper>
    );
}

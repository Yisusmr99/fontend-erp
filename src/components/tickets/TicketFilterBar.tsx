"use client";

import {
    Autocomplete,
    Box,
    IconButton,
    MenuItem,
    TextField,
    Tooltip,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { TicketClienteResumen } from "@/lib/types/ticket";
import { PrioridadTicket } from "@/lib/types/ticket";
import {
    CANAL_ORIGEN_OPCIONES,
    ESTADO_TICKET_OPCIONES,
    TIPO_TICKET_OPCIONES,
} from "@/lib/ticketCatalog";
import { enumNumericPairs, formatTicketClienteNombre } from "./ticketLabels";

export interface TicketFilters {
    id_estado_ticket: string;
    canal_origen: string;
    id_cliente: number | null;
    id_tipo_ticket: string;
    id_prioridad: string;
    search: string;
}

export const emptyFilters: TicketFilters = {
    id_estado_ticket: "",
    canal_origen: "",
    id_cliente: null,
    id_tipo_ticket: "",
    id_prioridad: "",
    search: "",
};

export interface TicketFilterBarProps {
    filters: TicketFilters;
    onFilterChange: (patch: Partial<TicketFilters>) => void;
    onClear: () => void;
    clientes: TicketClienteResumen[];
    loadingClientes: boolean;
}

export default function TicketFilterBar({
    filters,
    onFilterChange,
    onClear,
    clientes,
    loadingClientes,
}: TicketFilterBarProps) {
    const prioridadOptions = enumNumericPairs(PrioridadTicket);
    const selectedCliente = clientes.find((c) => c.id === filters.id_cliente) ?? null;

    const hasActiveFilters = Object.entries(filters).some(([, v]) =>
        v !== "" && v !== null
    );

    return (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                alignItems: "center",
                mb: 2,
            }}
        >
            <TextField
                size="small"
                label="Buscar"
                placeholder="Codigo o asunto..."
                value={filters.search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                sx={{ minWidth: 180 }}
            />

            <TextField
                select
                size="small"
                label="Estado"
                value={filters.id_estado_ticket}
                onChange={(e) => onFilterChange({ id_estado_ticket: e.target.value })}
                sx={{ minWidth: 140 }}
            >
                <MenuItem value="">Todos</MenuItem>
                {ESTADO_TICKET_OPCIONES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                size="small"
                label="Canal"
                value={filters.canal_origen}
                onChange={(e) => onFilterChange({ canal_origen: e.target.value })}
                sx={{ minWidth: 130 }}
            >
                <MenuItem value="">Todos</MenuItem>
                {CANAL_ORIGEN_OPCIONES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                size="small"
                label="Tipo"
                value={filters.id_tipo_ticket}
                onChange={(e) => onFilterChange({ id_tipo_ticket: e.target.value })}
                sx={{ minWidth: 130 }}
            >
                <MenuItem value="">Todos</MenuItem>
                {TIPO_TICKET_OPCIONES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                select
                size="small"
                label="Prioridad"
                value={filters.id_prioridad}
                onChange={(e) => onFilterChange({ id_prioridad: e.target.value })}
                sx={{ minWidth: 130 }}
            >
                <MenuItem value="">Todas</MenuItem>
                {prioridadOptions.map(([label, val]) => (
                    <MenuItem key={val} value={val}>
                        {label}
                    </MenuItem>
                ))}
            </TextField>

            <Autocomplete
                size="small"
                options={clientes}
                loading={loadingClientes}
                value={selectedCliente}
                onChange={(_e, v) => onFilterChange({ id_cliente: v?.id ?? null })}
                getOptionLabel={(o) =>
                    formatTicketClienteNombre(o) + (o.dpi ? ` - ${o.dpi}` : "")
                }
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                    <TextField {...params} label="Cliente" />
                )}
                sx={{ minWidth: 220 }}
            />

            {hasActiveFilters && (
                <Tooltip title="Limpiar filtros">
                    <IconButton size="small" onClick={onClear} color="error">
                        <ClearIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}

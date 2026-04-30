"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";

import { fetchHistorialTransacciones, fetchReporteClientes } from "@/lib/api/reportes";
import type {
    ClienteReporteListItem,
    HistorialTransaccionesFiltros,
    HistorialTransaccionesReporte,
} from "@/lib/types/reportes";
import { abrirVistaImpresion, escapeHtml, formatFecha, formatMoneda } from "./printHelper";

export default function ReporteHistorialTransacciones() {
    const [clientes, setClientes] = useState<ClienteReporteListItem[]>([]);
    const [filtros, setFiltros] = useState<HistorialTransaccionesFiltros>({});
    const [clienteSel, setClienteSel] = useState<ClienteReporteListItem | null>(null);

    const [reporte, setReporte] = useState<HistorialTransaccionesReporte | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReporteClientes().then(setClientes).catch(() => undefined);
    }, []);

    const handleGenerar = async () => {
        setLoading(true);
        setError(null);
        try {
            const f: HistorialTransaccionesFiltros = {
                ...filtros,
                cliente_id: clienteSel?.id,
            };
            const data = await fetchHistorialTransacciones(f);
            setReporte(data);
        } catch (e) {
            console.error(e);
            setError("No se pudo generar el reporte. Verifica los filtros.");
        } finally {
            setLoading(false);
        }
    };

    const handleImprimir = () => {
        if (!reporte) return;

        const filas = reporte.transacciones
            .map(
                (t) => `
                <tr>
                    <td>${escapeHtml(formatFecha(t.fecha_transaccion ?? t.created_at))}</td>
                    <td>${escapeHtml(t.tipo_transaccion)}</td>
                    <td>${escapeHtml(t.cuenta_origen?.numero_cuenta ?? "—")}</td>
                    <td>${escapeHtml(t.cuenta_destino?.numero_cuenta ?? "—")}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(t.moneda, Number(t.monto)))}</td>
                    <td>${escapeHtml(t.estado)}</td>
                    <td>${t.es_externa ? escapeHtml(t.banco_externo ?? "Externa") : "Interna"}</td>
                </tr>`
            )
            .join("");

        const filtrosTxt = Object.entries(filtros)
            .filter(([, v]) => v !== undefined && v !== "" && v !== null)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · ");

        const body = `
            ${filtrosTxt ? `<div class="text-muted" style="margin-bottom:8px;">Filtros: ${escapeHtml(filtrosTxt)}</div>` : ""}

            <div class="totals-grid">
                <div class="card"><div class="label">Registros</div><div class="value">${reporte.totales.registros}</div></div>
                <div class="card"><div class="label">Completadas</div><div class="value">${reporte.totales.completadas}</div></div>
                <div class="card"><div class="label">Monto total</div><div class="value">Q ${reporte.totales.monto_total.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</div></div>
            </div>

            <div class="section-title">Transacciones</div>
            <table>
                <thead><tr><th>Fecha</th><th>Tipo</th><th>Origen</th><th>Destino</th><th class="text-right">Monto</th><th>Estado</th><th>Externa</th></tr></thead>
                <tbody>${filas || '<tr><td colspan="7" class="text-muted">Sin resultados.</td></tr>'}</tbody>
            </table>
        `;

        abrirVistaImpresion({
            titulo: "Historial de Transacciones",
            subtitulo: filtrosTxt || "Todos los registros",
            bodyHtml: body,
            fechaEmision: reporte.fecha_emision,
        });
    };

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Filtros
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            type="date"
                            label="Desde"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={filtros.desde ?? ""}
                            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value || undefined })}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            type="date"
                            label="Hasta"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={filtros.hasta ?? ""}
                            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value || undefined })}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                label="Tipo"
                                value={filtros.tipo ?? ""}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        tipo: (e.target.value || undefined) as HistorialTransaccionesFiltros["tipo"],
                                    })
                                }
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="transferencia">Transferencia</MenuItem>
                                <MenuItem value="deposito">Depósito</MenuItem>
                                <MenuItem value="retiro">Retiro</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                label="Estado"
                                value={filtros.estado ?? ""}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        estado: (e.target.value || undefined) as HistorialTransaccionesFiltros["estado"],
                                    })
                                }
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="pendiente">Pendiente</MenuItem>
                                <MenuItem value="completada">Completada</MenuItem>
                                <MenuItem value="fallida">Fallida</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={clientes}
                            value={clienteSel}
                            onChange={(_, v) => setClienteSel(v)}
                            getOptionLabel={(o) => `${o.nombre_completo} — DPI ${o.dpi}`}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            renderInput={(params) => (
                                <TextField {...params} label="Cliente (opcional)" />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel>Origen externa</InputLabel>
                            <Select
                                label="Origen externa"
                                value={
                                    filtros.es_externa === undefined
                                        ? ""
                                        : filtros.es_externa
                                        ? "1"
                                        : "0"
                                }
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFiltros({
                                        ...filtros,
                                        es_externa: val === "" ? undefined : val === "1",
                                    });
                                }}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="1">Solo externas</MenuItem>
                                <MenuItem value="0">Solo internas</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                        onClick={handleGenerar}
                        disabled={loading}
                    >
                        Generar reporte
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handleImprimir}
                        disabled={!reporte}
                    >
                        Imprimir / PDF
                    </Button>
                </Stack>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!reporte && !loading && (
                <Alert severity="info">Configura los filtros y presiona <strong>Generar reporte</strong>.</Alert>
            )}

            {reporte && (
                <Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Registros</Typography>
                                <Typography variant="h5" fontWeight="bold">{reporte.totales.registros}</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Completadas</Typography>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    {reporte.totales.completadas}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Monto total</Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    Q {reporte.totales.monto_total.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Resultados ({reporte.transacciones.length})
                        </Typography>
                        {reporte.transacciones.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Sin resultados con los filtros aplicados.
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Tipo</TableCell>
                                            <TableCell>Origen</TableCell>
                                            <TableCell>Destino</TableCell>
                                            <TableCell align="right">Monto</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Tipo origen</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reporte.transacciones.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{formatFecha(t.fecha_transaccion ?? t.created_at)}</TableCell>
                                                <TableCell>{t.tipo_transaccion}</TableCell>
                                                <TableCell>{t.cuenta_origen?.numero_cuenta ?? "—"}</TableCell>
                                                <TableCell>{t.cuenta_destino?.numero_cuenta ?? "—"}</TableCell>
                                                <TableCell align="right">
                                                    {formatMoneda(t.moneda, Number(t.monto))}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={t.estado}
                                                        color={
                                                            t.estado === "completada"
                                                                ? "success"
                                                                : t.estado === "fallida"
                                                                ? "error"
                                                                : "warning"
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {t.es_externa ? (
                                                        <Chip size="small" label={t.banco_externo ?? "Externa"} color="info" />
                                                    ) : (
                                                        <Chip size="small" label="Interna" variant="outlined" />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Box>
            )}
        </Box>
    );
}

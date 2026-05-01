"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
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
    Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";

import { fetchActividadMensual } from "@/lib/api/reportes";
import type {
    ActividadMensualFiltros,
    ActividadMensualReporte,
} from "@/lib/types/reportes";
import { abrirVistaImpresion, escapeHtml, formatFecha, formatMoneda } from "./printHelper";

const MESES = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
];

export default function ReporteActividadMensual() {
    const now = new Date();
    const [filtros, setFiltros] = useState<ActividadMensualFiltros>({
        anio: now.getFullYear(),
        mes: now.getMonth() + 1,
    });
    const [reporte, setReporte] = useState<ActividadMensualReporte | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const aniosDisponibles: number[] = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
        aniosDisponibles.push(y);
    }

    const handleGenerar = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchActividadMensual(filtros);
            setReporte(data);
        } catch (e) {
            console.error(e);
            setError("No se pudo generar el reporte mensual.");
        } finally {
            setLoading(false);
        }
    };

    // Cargar el mes actual al montar
    useEffect(() => {
        handleGenerar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleImprimir = () => {
        if (!reporte) return;

        const mesLabel = MESES.find((m) => m.value === reporte.periodo.mes)?.label ?? `${reporte.periodo.mes}`;

        const porTipoRows = Object.entries(reporte.transacciones.por_tipo)
            .map(
                ([tipo, val]) => `
                <tr>
                    <td>${escapeHtml(tipo)}</td>
                    <td class="text-right">${val.cantidad}</td>
                    <td class="text-right">${escapeHtml(formatMoneda("Q", val.monto_total))}</td>
                </tr>`
            )
            .join("");

        const porMonedaRows = Object.entries(reporte.transacciones.por_moneda)
            .map(
                ([moneda, val]) => `
                <tr>
                    <td>${escapeHtml(moneda)}</td>
                    <td class="text-right">${val.cantidad}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(moneda, val.monto_total))}</td>
                </tr>`
            )
            .join("");

        const topClientesRows = reporte.top_clientes
            .map(
                (c, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${escapeHtml(c.nombre_completo)}</td>
                    <td class="text-right">${c.cantidad_transacciones}</td>
                    <td class="text-right">${escapeHtml(formatMoneda("Q", c.monto_total))}</td>
                </tr>`
            )
            .join("");

        const body = `
            <div class="totals-grid">
                <div class="card"><div class="label">Transacciones</div><div class="value">${reporte.transacciones.total}</div></div>
                <div class="card"><div class="label">Completadas</div><div class="value">${reporte.transacciones.completadas}</div></div>
                <div class="card"><div class="label">Pendientes</div><div class="value">${reporte.transacciones.pendientes}</div></div>
                <div class="card"><div class="label">Fallidas</div><div class="value">${reporte.transacciones.fallidas}</div></div>
                <div class="card"><div class="label">Monto movido</div><div class="value">Q ${reporte.transacciones.monto_movido.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</div></div>
                <div class="card"><div class="label">Transf. externas</div><div class="value">${reporte.transferencias_externas}</div></div>
                <div class="card"><div class="label">Cuentas nuevas</div><div class="value">${reporte.cuentas_nuevas}</div></div>
                <div class="card"><div class="label">Clientes nuevos</div><div class="value">${reporte.clientes_nuevos}</div></div>
            </div>

            <div class="section-title">Transacciones por tipo</div>
            <table>
                <thead><tr><th>Tipo</th><th class="text-right">Cantidad</th><th class="text-right">Monto (completadas)</th></tr></thead>
                <tbody>${porTipoRows || '<tr><td colspan="3" class="text-muted">Sin datos.</td></tr>'}</tbody>
            </table>

            <div class="section-title">Transacciones por moneda</div>
            <table>
                <thead><tr><th>Moneda</th><th class="text-right">Cantidad</th><th class="text-right">Monto</th></tr></thead>
                <tbody>${porMonedaRows || '<tr><td colspan="3" class="text-muted">Sin datos.</td></tr>'}</tbody>
            </table>

            <div class="section-title">Top 5 clientes con más actividad</div>
            <table>
                <thead><tr><th>#</th><th>Cliente</th><th class="text-right">Transacciones</th><th class="text-right">Monto total</th></tr></thead>
                <tbody>${topClientesRows || '<tr><td colspan="4" class="text-muted">Sin actividad.</td></tr>'}</tbody>
            </table>
        `;

        abrirVistaImpresion({
            titulo: "Resumen Mensual de Actividad",
            subtitulo: `Período: ${mesLabel} ${reporte.periodo.anio}`,
            bodyHtml: body,
            fechaEmision: reporte.fecha_emision,
        });
    };

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Período
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                    <FormControl sx={{ minWidth: 140 }}>
                        <InputLabel>Año</InputLabel>
                        <Select
                            label="Año"
                            value={filtros.anio ?? now.getFullYear()}
                            onChange={(e) =>
                                setFiltros({ ...filtros, anio: Number(e.target.value) || undefined })
                            }
                        >
                            {aniosDisponibles.map((y) => (
                                <MenuItem key={y} value={y}>
                                    {y}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel>Mes</InputLabel>
                        <Select
                            label="Mes"
                            value={filtros.mes ?? now.getMonth() + 1}
                            onChange={(e) =>
                                setFiltros({ ...filtros, mes: Number(e.target.value) || undefined })
                            }
                        >
                            {MESES.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && reporte && (
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                        Período: {formatFecha(reporte.periodo.fecha_inicio)} —{" "}
                        {formatFecha(reporte.periodo.fecha_fin)}
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Transacciones</Typography>
                                <Typography variant="h5" fontWeight="bold">{reporte.transacciones.total}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {reporte.transacciones.completadas} completadas
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Monto movido</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    Q {reporte.transacciones.monto_movido.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Cuentas nuevas</Typography>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    {reporte.cuentas_nuevas}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Clientes nuevos</Typography>
                                <Typography variant="h5" fontWeight="bold" color="info.main">
                                    {reporte.clientes_nuevos}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Transacciones por tipo
                                </Typography>
                                <DistribucionBar
                                    data={Object.fromEntries(
                                        Object.entries(reporte.transacciones.por_tipo).map(([k, v]) => [k, v.cantidad])
                                    )}
                                    labels={{ transferencia: "Transferencias", deposito: "Depósitos", retiro: "Retiros" }}
                                />
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Estado de las transacciones
                                </Typography>
                                <DistribucionBar
                                    data={{
                                        completadas: reporte.transacciones.completadas,
                                        pendientes: reporte.transacciones.pendientes,
                                        fallidas: reporte.transacciones.fallidas,
                                    }}
                                    labels={{
                                        completadas: "Completadas",
                                        pendientes: "Pendientes",
                                        fallidas: "Fallidas",
                                    }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Top 5 clientes con más actividad
                        </Typography>
                        {reporte.top_clientes.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Sin actividad en el período.
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Cliente</TableCell>
                                            <TableCell align="right">Transacciones</TableCell>
                                            <TableCell align="right">Monto total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reporte.top_clientes.map((c, i) => (
                                            <TableRow key={c.cliente_id}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell>{c.nombre_completo}</TableCell>
                                                <TableCell align="right">{c.cantidad_transacciones}</TableCell>
                                                <TableCell align="right">{formatMoneda("Q", c.monto_total)}</TableCell>
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

function DistribucionBar({
    data,
    labels = {},
}: {
    data: Record<string, number>;
    labels?: Record<string, string>;
}) {
    const entries = Object.entries(data ?? {});
    const total = entries.reduce((acc, [, v]) => acc + Number(v ?? 0), 0);
    if (total === 0)
        return (
            <Typography variant="body2" color="text.secondary">
                Sin datos disponibles.
            </Typography>
        );

    return (
        <Stack spacing={1.5}>
            {entries.map(([key, val]) => {
                const pct = total === 0 ? 0 : (Number(val) / total) * 100;
                return (
                    <Box key={key}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2">{labels[key] ?? key}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {val} ({pct.toFixed(1)}%)
                            </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                );
            })}
        </Stack>
    );
}

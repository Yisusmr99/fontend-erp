"use client";

import { useState } from "react";
import {
    Alert,
    Box,
    Button,
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

import { fetchTransferenciasExternas } from "@/lib/api/reportes";
import type {
    TransferenciasExternasFiltros,
    TransferenciasExternasReporte,
} from "@/lib/types/reportes";
import { abrirVistaImpresion, escapeHtml, formatFecha, formatMoneda } from "./printHelper";

export default function ReporteTransferenciasExternas() {
    const [filtros, setFiltros] = useState<TransferenciasExternasFiltros>({});
    const [reporte, setReporte] = useState<TransferenciasExternasReporte | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerar = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTransferenciasExternas(filtros);
            setReporte(data);
        } catch (e) {
            console.error(e);
            setError("No se pudo generar el reporte.");
        } finally {
            setLoading(false);
        }
    };

    const handleImprimir = () => {
        if (!reporte) return;

        const filas = reporte.transferencias
            .map(
                (t) => `
                <tr>
                    <td>${escapeHtml(formatFecha(t.fecha_envio))}</td>
                    <td>${escapeHtml(t.banco_externo)}</td>
                    <td>${escapeHtml(t.tipo)}</td>
                    <td>${escapeHtml(t.cuenta_externa)}</td>
                    <td>${escapeHtml(t.codigo_confirmacion)}</td>
                    <td class="text-right">${escapeHtml(
                        formatMoneda(
                            t.transaccion?.moneda || "Q",
                            Number(t.transaccion?.monto ?? 0)
                        )
                    )}</td>
                    <td>${escapeHtml(t.estado)}</td>
                </tr>`
            )
            .join("");

        const porBancoRows = reporte.totales.por_banco
            .map(
                (b) => `
                <tr>
                    <td>${escapeHtml(b.banco_externo)}</td>
                    <td class="text-right">${b.cantidad}</td>
                    <td class="text-right">${escapeHtml(formatMoneda("Q", b.monto_total))}</td>
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
                <div class="card"><div class="label">Transferencias</div><div class="value">${reporte.totales.cantidad}</div></div>
                <div class="card"><div class="label">Monto total</div><div class="value">Q ${reporte.totales.monto_total.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</div></div>
                <div class="card"><div class="label">Bancos involucrados</div><div class="value">${reporte.totales.por_banco.length}</div></div>
            </div>

            <div class="section-title">Resumen por banco</div>
            <table>
                <thead><tr><th>Banco</th><th class="text-right">Cantidad</th><th class="text-right">Monto total</th></tr></thead>
                <tbody>${porBancoRows || '<tr><td colspan="3" class="text-muted">Sin datos.</td></tr>'}</tbody>
            </table>

            <div class="section-title">Detalle de transferencias</div>
            <table>
                <thead><tr><th>Fecha</th><th>Banco</th><th>Tipo</th><th>Cuenta externa</th><th>Confirmación</th><th class="text-right">Monto</th><th>Estado</th></tr></thead>
                <tbody>${filas || '<tr><td colspan="7" class="text-muted">Sin resultados.</td></tr>'}</tbody>
            </table>
        `;

        abrirVistaImpresion({
            titulo: "Transferencias Externas",
            subtitulo: filtrosTxt || "Todas las transferencias",
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
                        <TextField
                            label="Banco externo (contiene)"
                            fullWidth
                            value={filtros.banco_externo ?? ""}
                            onChange={(e) =>
                                setFiltros({ ...filtros, banco_externo: e.target.value || undefined })
                            }
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
                                        tipo: (e.target.value || undefined) as TransferenciasExternasFiltros["tipo"],
                                    })
                                }
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="entrante">Entrantes</MenuItem>
                                <MenuItem value="saliente">Salientes</MenuItem>
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
                                <Typography variant="caption" color="text.secondary">Transferencias</Typography>
                                <Typography variant="h5" fontWeight="bold">{reporte.totales.cantidad}</Typography>
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
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Bancos involucrados</Typography>
                                <Typography variant="h5" fontWeight="bold">{reporte.totales.por_banco.length}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Resumen por banco
                        </Typography>
                        {reporte.totales.por_banco.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Sin datos.</Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Banco</TableCell>
                                            <TableCell align="right">Cantidad</TableCell>
                                            <TableCell align="right">Monto total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reporte.totales.por_banco.map((b) => (
                                            <TableRow key={b.banco_externo}>
                                                <TableCell>{b.banco_externo}</TableCell>
                                                <TableCell align="right">{b.cantidad}</TableCell>
                                                <TableCell align="right">{formatMoneda("Q", b.monto_total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Detalle de transferencias ({reporte.transferencias.length})
                        </Typography>
                        {reporte.transferencias.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Sin resultados.</Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Banco</TableCell>
                                            <TableCell>Tipo</TableCell>
                                            <TableCell>Cuenta ext.</TableCell>
                                            <TableCell>Confirmación</TableCell>
                                            <TableCell align="right">Monto</TableCell>
                                            <TableCell>Estado</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reporte.transferencias.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{formatFecha(t.fecha_envio)}</TableCell>
                                                <TableCell>{t.banco_externo}</TableCell>
                                                <TableCell>{t.tipo}</TableCell>
                                                <TableCell>{t.cuenta_externa}</TableCell>
                                                <TableCell>{t.codigo_confirmacion}</TableCell>
                                                <TableCell align="right">
                                                    {formatMoneda(
                                                        t.transaccion?.moneda || "Q",
                                                        Number(t.transaccion?.monto ?? 0)
                                                    )}
                                                </TableCell>
                                                <TableCell>{t.estado}</TableCell>
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

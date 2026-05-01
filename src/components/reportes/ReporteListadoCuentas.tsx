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

import { fetchListadoCuentas, fetchReporteClientes } from "@/lib/api/reportes";
import type {
    ClienteReporteListItem,
    ListadoCuentasFiltros,
    ListadoCuentasReporte,
} from "@/lib/types/reportes";
import type { Moneda, TipoCuenta } from "@/lib/types/cuentas";
import { abrirVistaImpresion, escapeHtml, formatFecha, formatMoneda } from "./printHelper";

const TIPO_LABEL: Record<string, string> = {
    monetaria: "Monetaria",
    ahorro: "Ahorro",
    estudiantil: "Estudiantil",
};

export default function ReporteListadoCuentas() {
    const [clientes, setClientes] = useState<ClienteReporteListItem[]>([]);
    const [filtros, setFiltros] = useState<ListadoCuentasFiltros>({});
    const [clienteSel, setClienteSel] = useState<ClienteReporteListItem | null>(null);

    const [reporte, setReporte] = useState<ListadoCuentasReporte | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReporteClientes().then(setClientes).catch(() => undefined);
    }, []);

    const handleGenerar = async () => {
        setLoading(true);
        setError(null);
        try {
            const f: ListadoCuentasFiltros = {
                ...filtros,
                cliente_id: clienteSel?.id,
            };
            const data = await fetchListadoCuentas(f);
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

        const filas = reporte.cuentas
            .map(
                (c) => `
                <tr>
                    <td>${escapeHtml(c.numero_cuenta)}</td>
                    <td>${escapeHtml(c.cliente ? `${c.cliente.nombres} ${c.cliente.apellidos}` : "—")}</td>
                    <td>${escapeHtml(TIPO_LABEL[c.tipo_cuenta] ?? c.tipo_cuenta)}</td>
                    <td>${escapeHtml(c.moneda)}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(c.moneda, Number(c.saldo_disponible)))}</td>
                    <td>${c.estado ? '<span class="pill">Activa</span>' : '<span class="pill" style="background:#fce4ec;color:#c2185b;">Cerrada</span>'}</td>
                    <td>${escapeHtml(formatFecha(c.fecha_apertura))}</td>
                </tr>`
            )
            .join("");

        const totalesPorMoneda = reporte.totales.por_moneda
            .map(
                (m) => `
                <tr>
                    <td>${escapeHtml(m.moneda)}</td>
                    <td class="text-right">${m.cantidad_cuentas}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(m.moneda, m.total_disponible))}</td>
                </tr>`
            )
            .join("");

        const body = `
            <div class="totals-grid">
                <div class="card"><div class="label">Cuentas</div><div class="value">${reporte.totales.cantidad}</div></div>
                <div class="card"><div class="label">Activas</div><div class="value">${reporte.totales.activas}</div></div>
                <div class="card"><div class="label">Inactivas</div><div class="value">${reporte.totales.inactivas}</div></div>
            </div>

            <div class="section-title">Saldos por moneda</div>
            <table>
                <thead><tr><th>Moneda</th><th class="text-right">Cuentas</th><th class="text-right">Total disponible</th></tr></thead>
                <tbody>${totalesPorMoneda || '<tr><td colspan="3" class="text-muted">Sin datos.</td></tr>'}</tbody>
            </table>

            <div class="section-title">Detalle de cuentas</div>
            <table>
                <thead><tr><th>Número</th><th>Cliente</th><th>Tipo</th><th>Moneda</th><th class="text-right">Saldo disponible</th><th>Estado</th><th>Apertura</th></tr></thead>
                <tbody>${filas || '<tr><td colspan="7" class="text-muted">Sin resultados.</td></tr>'}</tbody>
            </table>
        `;

        abrirVistaImpresion({
            titulo: "Listado de Cuentas",
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
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                            options={clientes}
                            value={clienteSel}
                            onChange={(_, v) => setClienteSel(v)}
                            getOptionLabel={(o) => `${o.nombre_completo} — DPI ${o.dpi}`}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            renderInput={(params) => <TextField {...params} label="Cliente (opcional)" />}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                label="Tipo"
                                value={filtros.tipo_cuenta ?? ""}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        tipo_cuenta: (e.target.value || undefined) as TipoCuenta | undefined,
                                    })
                                }
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="monetaria">Monetaria</MenuItem>
                                <MenuItem value="ahorro">Ahorro</MenuItem>
                                <MenuItem value="estudiantil">Estudiantil</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Moneda</InputLabel>
                            <Select
                                label="Moneda"
                                value={filtros.moneda ?? ""}
                                onChange={(e) =>
                                    setFiltros({
                                        ...filtros,
                                        moneda: (e.target.value || undefined) as Moneda | undefined,
                                    })
                                }
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="Q">Quetzales (Q)</MenuItem>
                                <MenuItem value="$">Dólares ($)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                label="Estado"
                                value={
                                    filtros.estado === undefined ? "" : filtros.estado ? "1" : "0"
                                }
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFiltros({
                                        ...filtros,
                                        estado: v === "" ? undefined : v === "1",
                                    });
                                }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="1">Activas</MenuItem>
                                <MenuItem value="0">Cerradas</MenuItem>
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
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Total cuentas</Typography>
                                <Typography variant="h5" fontWeight="bold">{reporte.totales.cantidad}</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Activas</Typography>
                                <Typography variant="h5" fontWeight="bold" color="success.main">{reporte.totales.activas}</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Cerradas</Typography>
                                <Typography variant="h5" fontWeight="bold">{reporte.totales.inactivas}</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Monedas</Typography>
                                <Typography variant="h5" fontWeight="bold">{reporte.totales.por_moneda.length}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Cuentas ({reporte.cuentas.length})
                        </Typography>
                        {reporte.cuentas.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Sin resultados con los filtros aplicados.
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Número</TableCell>
                                            <TableCell>Cliente</TableCell>
                                            <TableCell>Tipo</TableCell>
                                            <TableCell>Moneda</TableCell>
                                            <TableCell align="right">Saldo disponible</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Apertura</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reporte.cuentas.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.numero_cuenta}</TableCell>
                                                <TableCell>
                                                    {c.cliente ? `${c.cliente.nombres} ${c.cliente.apellidos}` : "—"}
                                                </TableCell>
                                                <TableCell>{TIPO_LABEL[c.tipo_cuenta] ?? c.tipo_cuenta}</TableCell>
                                                <TableCell>{c.moneda}</TableCell>
                                                <TableCell align="right">
                                                    {formatMoneda(c.moneda, Number(c.saldo_disponible))}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={c.estado ? "Activa" : "Cerrada"}
                                                        color={c.estado ? "success" : "default"}
                                                    />
                                                </TableCell>
                                                <TableCell>{formatFecha(c.fecha_apertura)}</TableCell>
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

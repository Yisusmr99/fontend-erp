"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Paper,
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

import { fetchEstadoCuenta, fetchReporteClientes } from "@/lib/api/reportes";
import type {
    ClienteReporteListItem,
    EstadoCuentaReporte,
} from "@/lib/types/reportes";
import { abrirVistaImpresion, escapeHtml, formatFecha, formatMoneda } from "./printHelper";

const TIPO_LABEL: Record<string, string> = {
    monetaria: "Monetaria",
    ahorro: "Ahorro",
    estudiantil: "Estudiantil",
};

export default function ReporteEstadoCuenta() {
    const [clientes, setClientes] = useState<ClienteReporteListItem[]>([]);
    const [seleccionado, setSeleccionado] = useState<ClienteReporteListItem | null>(null);
    const [reporte, setReporte] = useState<EstadoCuentaReporte | null>(null);

    const [loadingLista, setLoadingLista] = useState(true);
    const [loadingReporte, setLoadingReporte] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        fetchReporteClientes()
            .then((cls) => mounted && setClientes(cls))
            .catch(() => mounted && setError("No se pudo cargar la lista de clientes."))
            .finally(() => mounted && setLoadingLista(false));
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!seleccionado) {
            setReporte(null);
            return;
        }
        let mounted = true;
        setLoadingReporte(true);
        setError(null);
        fetchEstadoCuenta(seleccionado.id)
            .then((data) => mounted && setReporte(data))
            .catch(() => mounted && setError("No se pudo generar el estado de cuenta."))
            .finally(() => mounted && setLoadingReporte(false));
        return () => {
            mounted = false;
        };
    }, [seleccionado]);

    const monedaPrincipal = reporte?.saldos_propios?.[0]?.moneda || "Q";

    const handleImprimir = () => {
        if (!reporte) return;

        const cuentasRows = reporte.cuentas.detalle
            .map(
                (c) => `
                <tr>
                    <td>${escapeHtml(c.numero_cuenta)}</td>
                    <td>${escapeHtml(TIPO_LABEL[c.tipo_cuenta] ?? c.tipo_cuenta)}</td>
                    <td>${escapeHtml(c.moneda)}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(c.moneda, Number(c.saldo_disponible)))}</td>
                    <td>${c.estado ? '<span class="pill">Activa</span>' : '<span class="pill" style="background:#fce4ec;color:#c2185b;">Cerrada</span>'}</td>
                    <td>${escapeHtml(formatFecha(c.fecha_apertura))}</td>
                </tr>`
            )
            .join("");

        const saldosRows = reporte.saldos_propios
            .map(
                (s) => `
                <tr>
                    <td>${escapeHtml(s.moneda)}</td>
                    <td class="text-right">${s.cantidad_cuentas}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(s.moneda, s.total_disponible))}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(s.moneda, s.total_saldo))}</td>
                </tr>`
            )
            .join("");

        const salientesRows = reporte.movimientos_externos.salientes_por_banco
            .map(
                (b) => `
                <tr>
                    <td>${escapeHtml(b.banco_externo)}</td>
                    <td class="text-right">${b.cantidad}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(monedaPrincipal, b.monto_total))}</td>
                </tr>`
            )
            .join("");

        const entrantesRows = reporte.movimientos_externos.entrantes_por_banco
            .map(
                (b) => `
                <tr>
                    <td>${escapeHtml(b.banco_externo)}</td>
                    <td class="text-right">${b.cantidad}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(monedaPrincipal, b.monto_total))}</td>
                </tr>`
            )
            .join("");

        const transRows = reporte.transacciones_recientes
            .map(
                (t) => `
                <tr>
                    <td>${escapeHtml(formatFecha(t.fecha_transaccion ?? t.created_at))}</td>
                    <td>${escapeHtml(t.tipo_transaccion)}</td>
                    <td>${escapeHtml(t.cuenta_origen?.numero_cuenta ?? "—")}</td>
                    <td>${escapeHtml(t.cuenta_destino?.numero_cuenta ?? "—")}</td>
                    <td class="text-right">${escapeHtml(formatMoneda(t.moneda || monedaPrincipal, Number(t.monto)))}</td>
                    <td>${escapeHtml(t.estado)}</td>
                    <td>${t.es_externa ? escapeHtml(t.banco_externo ?? "Externa") : "Interna"}</td>
                </tr>`
            )
            .join("");

        const body = `
            <div class="section-title">Datos del cliente</div>
            <table>
                <tr><th>Nombre</th><td>${escapeHtml(reporte.cliente.nombres)} ${escapeHtml(reporte.cliente.apellidos)}</td></tr>
                <tr><th>DPI</th><td>${escapeHtml(reporte.cliente.dpi)}</td></tr>
                <tr><th>Correo</th><td>${escapeHtml(reporte.cliente.correo_electronico)}</td></tr>
                <tr><th>Teléfono</th><td>${escapeHtml(reporte.cliente.telefono)}</td></tr>
                <tr><th>Dirección</th><td>${escapeHtml(reporte.cliente.direccion)}</td></tr>
                <tr><th>Estado</th><td>${reporte.cliente.estado ? "Activo" : "Inactivo"}</td></tr>
                <tr><th>Última actividad</th><td>${escapeHtml(formatFecha(reporte.ultima_actividad))}</td></tr>
            </table>

            <div class="section-title">Resumen de cuentas</div>
            <div class="totals-grid">
                <div class="card"><div class="label">Total cuentas</div><div class="value">${reporte.cuentas.total}</div></div>
                <div class="card"><div class="label">Activas</div><div class="value">${reporte.cuentas.activas}</div></div>
                <div class="card"><div class="label">Inactivas</div><div class="value">${reporte.cuentas.inactivas}</div></div>
                <div class="card"><div class="label">Enviado externo</div><div class="value">${escapeHtml(formatMoneda(monedaPrincipal, reporte.movimientos_externos.total_enviado))}</div></div>
                <div class="card"><div class="label">Recibido externo</div><div class="value">${escapeHtml(formatMoneda(monedaPrincipal, reporte.movimientos_externos.total_recibido))}</div></div>
            </div>

            <div class="section-title">Saldos propios por moneda</div>
            <table>
                <thead><tr><th>Moneda</th><th class="text-right">Cuentas</th><th class="text-right">Disponible</th><th class="text-right">Saldo</th></tr></thead>
                <tbody>${saldosRows || '<tr><td colspan="4" class="text-muted">Sin datos.</td></tr>'}</tbody>
            </table>

            <div class="section-title">Detalle de cuentas</div>
            <table>
                <thead><tr><th>Número</th><th>Tipo</th><th>Moneda</th><th class="text-right">Saldo disponible</th><th>Estado</th><th>Apertura</th></tr></thead>
                <tbody>${cuentasRows || '<tr><td colspan="6" class="text-muted">Sin cuentas.</td></tr>'}</tbody>
            </table>

            <div class="section-title">Movimientos con bancos externos</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div>
                    <strong>Salientes</strong>
                    <table><thead><tr><th>Banco</th><th class="text-right">#</th><th class="text-right">Monto</th></tr></thead>
                    <tbody>${salientesRows || '<tr><td colspan="3" class="text-muted">Sin movimientos.</td></tr>'}</tbody></table>
                </div>
                <div>
                    <strong>Entrantes</strong>
                    <table><thead><tr><th>Banco</th><th class="text-right">#</th><th class="text-right">Monto</th></tr></thead>
                    <tbody>${entrantesRows || '<tr><td colspan="3" class="text-muted">Sin movimientos.</td></tr>'}</tbody></table>
                </div>
            </div>

            <div class="section-title">Últimas transacciones</div>
            <table>
                <thead><tr><th>Fecha</th><th>Tipo</th><th>Origen</th><th>Destino</th><th class="text-right">Monto</th><th>Estado</th><th>Externa</th></tr></thead>
                <tbody>${transRows || '<tr><td colspan="7" class="text-muted">Sin transacciones.</td></tr>'}</tbody>
            </table>
        `;

        abrirVistaImpresion({
            titulo: "Estado de Cuenta",
            subtitulo: `Cliente: ${reporte.cliente.nombres} ${reporte.cliente.apellidos} · DPI ${reporte.cliente.dpi}`,
            bodyHtml: body,
            fechaEmision: reporte.fecha_emision,
        });
    };

    return (
        <Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} sx={{ mb: 3 }}>
                <Autocomplete
                    sx={{ flex: 1 }}
                    options={clientes}
                    value={seleccionado}
                    loading={loadingLista}
                    onChange={(_, v) => setSeleccionado(v)}
                    getOptionLabel={(o) => `${o.nombre_completo} — DPI ${o.dpi}`}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={(params) => (
                        <TextField {...params} label="Buscar cliente" placeholder="Nombre o DPI..." />
                    )}
                />
                <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    disabled={!reporte || loadingReporte}
                    onClick={handleImprimir}
                >
                    Imprimir / PDF
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!seleccionado && !loadingReporte && (
                <Alert severity="info">Selecciona un cliente para generar el estado de cuenta.</Alert>
            )}

            {loadingReporte && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loadingReporte && reporte && (
                <Box>
                    {/* Cabecera del cliente */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
                        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                    {reporte.cliente.nombres} {reporte.cliente.apellidos}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    DPI: {reporte.cliente.dpi}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {reporte.cliente.correo_electronico} · {reporte.cliente.telefono}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {reporte.cliente.direccion}
                                </Typography>
                            </Box>
                            <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                                <Chip
                                    label={reporte.cliente.estado ? "Activo" : "Inactivo"}
                                    color={reporte.cliente.estado ? "success" : "default"}
                                    size="small"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Última actividad: {formatFecha(reporte.ultima_actividad)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Resumen */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Cuentas totales</Typography>
                                <Typography variant="h5" fontWeight="bold">{reporte.cuentas.total}</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Activas</Typography>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    {reporte.cuentas.activas}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Enviado a otros bancos</Typography>
                                <Typography variant="h6" fontWeight="bold" color="error.main">
                                    {formatMoneda(monedaPrincipal, reporte.movimientos_externos.total_enviado)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="caption" color="text.secondary">Recibido de otros bancos</Typography>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                    {formatMoneda(monedaPrincipal, reporte.movimientos_externos.total_recibido)}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Cuentas */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Detalle de cuentas
                        </Typography>
                        {reporte.cuentas.detalle.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Sin cuentas registradas.
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Número</TableCell>
                                            <TableCell>Tipo</TableCell>
                                            <TableCell>Moneda</TableCell>
                                            <TableCell align="right">Saldo disponible</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Apertura</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reporte.cuentas.detalle.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.numero_cuenta}</TableCell>
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

                    {/* Transacciones recientes */}
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Últimas transacciones
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {reporte.transacciones_recientes.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Sin transacciones recientes.
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
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reporte.transacciones_recientes.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{formatFecha(t.fecha_transaccion ?? t.created_at)}</TableCell>
                                                <TableCell>{t.tipo_transaccion}</TableCell>
                                                <TableCell>{t.cuenta_origen?.numero_cuenta ?? "—"}</TableCell>
                                                <TableCell>{t.cuenta_destino?.numero_cuenta ?? "—"}</TableCell>
                                                <TableCell align="right">
                                                    {formatMoneda(t.moneda || monedaPrincipal, Number(t.monto))}
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

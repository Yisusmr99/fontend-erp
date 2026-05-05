"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { fetchSnapshotDetalle } from "@/lib/api/auditoria";
import type { SnapshotCuenta, TransaccionSnapshot } from "@/lib/types/auditoria";
import { describeApiError, formatFechaGT, formatMonto } from "./auditoriaHelpers";
import { EstadoTransaccionChip } from "./AuditoriaBadges";

function CuentaCard({ titulo, cuenta }: { titulo: string; cuenta: SnapshotCuenta | null }) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <AccountBalanceWalletIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight="bold">
                    {titulo}
                </Typography>
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            {cuenta ? (
                <Stack spacing={0.5}>
                    <Typography variant="body2">
                        <strong>Número:</strong> {cuenta.numero_cuenta}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Tipo:</strong> {cuenta.tipo_cuenta ?? "—"}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Moneda:</strong> {cuenta.moneda ?? "—"}
                    </Typography>
                    <Typography variant="body2">
                        <strong>ID interno:</strong> #{cuenta.id}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                        TITULAR
                    </Typography>
                    {cuenta.cliente ? (
                        <>
                            <Typography variant="body2">
                                {cuenta.cliente.nombres ?? ""} {cuenta.cliente.apellidos ?? ""}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                DPI: {cuenta.cliente.dpi ?? "—"} · Cliente #{cuenta.cliente.id}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Sin titular registrado.
                        </Typography>
                    )}
                </Stack>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    Sin cuenta asociada (puede ser un depósito o retiro de caja).
                </Typography>
            )}
        </Paper>
    );
}

interface Props {
    id: string;
}

export default function AuditoriaSnapshotDetalle({ id }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<TransaccionSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchSnapshotDetalle(id);
            setData(res);
        } catch (e) {
            console.error(e);
            setError(describeApiError(e, "No se pudo cargar el snapshot."));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const volver = () => {
        const qs = searchParams.toString();
        router.push(`/auditoria${qs ? `?${qs}&tab=snapshots` : "?tab=snapshots"}`);
    };

    return (
        <Box>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                sx={{ mb: 2 }}
            >
                <Button startIcon={<ArrowBackIcon />} onClick={volver} variant="text">
                    Volver a snapshots
                </Button>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={cargar}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                >
                    Recargar
                </Button>
            </Stack>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={cargar}>
                            Reintentar
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {loading && (
                <Stack spacing={2}>
                    <Skeleton variant="rounded" height={140} />
                    <Skeleton variant="rounded" height={220} />
                    <Skeleton variant="rounded" height={180} />
                </Stack>
            )}

            {!loading && data && (
                <>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            spacing={2}
                        >
                            <Box>
                                <Typography variant="overline" color="text.secondary">
                                    Snapshot inmutable de transacción
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {data.tipo_transaccion.charAt(0).toUpperCase() + data.tipo_transaccion.slice(1)}
                                    {" · "}
                                    {formatMonto(data.monto, data.moneda)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Transacción SQL #{data.transaccion_id_sql} · Motivo: {data.motivo}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <EstadoTransaccionChip estado={data.estado} size="medium" />
                                {data.es_externa ? (
                                    <Chip size="medium" color="info" label={data.banco_externo ?? "Externa"} />
                                ) : (
                                    <Chip size="medium" variant="outlined" label="Interna" />
                                )}
                            </Stack>
                        </Stack>
                    </Paper>

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Datos generales
                                </Typography>
                                <Divider sx={{ mb: 1.5 }} />
                                <Stack spacing={0.7}>
                                    <Typography variant="body2">
                                        <strong>ID Snapshot:</strong> <code>{data.id}</code>
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Moneda:</strong> {data.moneda}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Monto:</strong> {formatMonto(data.monto, data.moneda)}
                                    </Typography>
                                    {data.monto_convertido !== null && data.monto_convertido !== undefined && (
                                        <Typography variant="body2">
                                            <strong>Monto convertido:</strong>{" "}
                                            {formatMonto(data.monto_convertido, data.moneda === "Q" ? "USD" : "Q")}
                                        </Typography>
                                    )}
                                    <Typography variant="body2">
                                        <strong>Referencia:</strong> {data.referencia ?? "—"}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Fecha de transacción:</strong> {formatFechaGT(data.fecha_transaccion)}
                                    </Typography>
                                    {data.hora_transaccion && (
                                        <Typography variant="body2">
                                            <strong>Hora:</strong> {formatFechaGT(data.hora_transaccion)}
                                        </Typography>
                                    )}
                                    <Typography variant="body2">
                                        <strong>Snapshot creado:</strong> {formatFechaGT(data.created_at)}
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Operador que registró la transacción
                                </Typography>
                                <Divider sx={{ mb: 1.5 }} />
                                {data.registrado_por ? (
                                    <Stack spacing={0.7}>
                                        <Typography variant="body2">
                                            <strong>Nombre:</strong> {data.registrado_por.name ?? "—"}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Email:</strong> {data.registrado_por.email ?? "—"}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Usuario ID:</strong> #{data.registrado_por.id}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>IP:</strong> {data.registrado_por.ip ?? "—"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ wordBreak: "break-word", fontFamily: "monospace", fontSize: 12 }}
                                        >
                                            <strong>UA:</strong> {data.registrado_por.user_agent ?? "—"}
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No se registró información del operador.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Box sx={{ position: "relative", mb: 3 }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            spacing={1}
                            sx={{ mb: 2 }}
                        >
                            <SwapHorizIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight="bold">
                                Cuentas involucradas
                            </Typography>
                        </Stack>
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <CuentaCard titulo="Cuenta origen" cuenta={data.cuenta_origen} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <CuentaCard titulo="Cuenta destino" cuenta={data.cuenta_destino} />
                            </Grid>
                        </Grid>
                    </Box>
                </>
            )}
        </Box>
    );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Alert,
    Box,
    Button,
    Divider,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";

import { fetchAuditoriaDetalle } from "@/lib/api/auditoria";
import type { AuditLog } from "@/lib/types/auditoria";
import {
    HttpMethodChip,
    HttpStatusChip,
    ModuloChip,
    SeveridadChip,
} from "./AuditoriaBadges";
import { describeApiError, formatFechaGT } from "./auditoriaHelpers";

interface InfoRowProps {
    label: string;
    value: React.ReactNode;
    copyable?: boolean;
}
function InfoRow({ label, value }: InfoRowProps) {
    return (
        <Grid container spacing={1} sx={{ py: 1 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {label.toUpperCase()}
                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
                <Typography component="div" variant="body2">
                    {value ?? "—"}
                </Typography>
            </Grid>
        </Grid>
    );
}

function JsonBlock({ data }: { data: unknown }) {
    if (data === null || data === undefined) {
        return (
            <Typography variant="body2" color="text.secondary">
                Sin información.
            </Typography>
        );
    }
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: (t) => (t.palette.mode === "dark" ? "background.default" : "grey.50"),
                overflow: "auto",
                maxHeight: 360,
            }}
        >
            <Box
                component="pre"
                sx={{
                    m: 0,
                    fontFamily:
                        "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 12,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                }}
            >
                {JSON.stringify(data, null, 2)}
            </Box>
        </Paper>
    );
}

interface Props {
    id: string;
}

export default function AuditoriaDetalle({ id }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<AuditLog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchAuditoriaDetalle(id);
            setData(res);
        } catch (e) {
            console.error(e);
            setError(describeApiError(e, "No se pudo cargar el evento."));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const volver = () => {
        const qs = searchParams.toString();
        router.push(`/auditoria${qs ? `?${qs}` : "?tab=bitacora"}`);
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
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Button startIcon={<ArrowBackIcon />} onClick={volver} variant="text">
                        Volver a la bitácora
                    </Button>
                </Stack>
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
                    <Skeleton variant="rounded" height={220} />
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
                                    Evento de auditoría
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ wordBreak: "break-all" }}>
                                    {data.accion}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {data.mensaje ?? "Sin mensaje asociado."}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <SeveridadChip severidad={data.severidad} size="medium" />
                                <ModuloChip modulo={data.modulo} size="medium" />
                            </Stack>
                        </Stack>
                    </Paper>

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Información del evento
                                </Typography>
                                <Divider sx={{ mb: 1 }} />
                                <InfoRow label="ID" value={<code>{data.id}</code>} />
                                <InfoRow label="Fecha" value={formatFechaGT(data.created_at)} />
                                <InfoRow label="Usuario" value={data.usuario_email ?? "—"} />
                                <InfoRow
                                    label="Usuario ID"
                                    value={data.usuario_id !== null ? `#${data.usuario_id}` : "—"}
                                />
                                <InfoRow label="IP" value={data.ip ?? "—"} />
                                <InfoRow
                                    label="User-Agent"
                                    value={
                                        <Typography
                                            variant="body2"
                                            sx={{ wordBreak: "break-word", fontFamily: "monospace", fontSize: 12 }}
                                        >
                                            {data.user_agent ?? "—"}
                                        </Typography>
                                    }
                                />
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Petición HTTP
                                </Typography>
                                <Divider sx={{ mb: 1 }} />
                                {data.http ? (
                                    <>
                                        <InfoRow
                                            label="Método / Status"
                                            value={
                                                <Stack direction="row" spacing={1}>
                                                    <HttpMethodChip method={data.http.method} />
                                                    <HttpStatusChip status={data.http.status} />
                                                </Stack>
                                            }
                                        />
                                        <InfoRow
                                            label="URL"
                                            value={
                                                <Typography
                                                    variant="body2"
                                                    sx={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: 12 }}
                                                >
                                                    {data.http.url}
                                                </Typography>
                                            }
                                        />
                                        <InfoRow label="Ruta" value={data.http.ruta ?? "—"} />
                                        <InfoRow label="Nombre de ruta" value={data.http.ruta_nombre ?? "—"} />
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Sin información HTTP asociada.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Payload de entrada
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <JsonBlock data={data.payload} />
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Contexto adicional
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <JsonBlock data={data.contexto} />
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Cambios registrados
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                {data.cambios ? (
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                                Antes
                                            </Typography>
                                            <JsonBlock data={data.cambios.antes} />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                                Después
                                            </Typography>
                                            <JsonBlock data={data.cambios.despues} />
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Este evento no registra cambios de campos.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Grid,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import GroupIcon from "@mui/icons-material/Group";
import LoginIcon from "@mui/icons-material/Login";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

import { fetchAuditoriaResumen } from "@/lib/api/auditoria";
import type { ResumenAuditoria, ResumenAuditoriaFiltros } from "@/lib/types/auditoria";
import {
    SEVERIDAD_HEX,
    SEVERIDAD_LABEL,
    MODULO_LABELS,
    describeApiError,
    formatFechaCorta,
    formatNumero,
} from "./auditoriaHelpers";
import { BarChart, DonutChart, LineChart } from "./AuditoriaCharts";

interface KpiProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: string;
}
function KpiCard({ title, value, subtitle, icon, color = "primary.main" }: KpiProps) {
    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
                {icon && (
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: color,
                            color: "primary.contrastText",
                        }}
                    >
                        {icon}
                    </Box>
                )}
            </Stack>
            <Typography variant="h4" fontWeight="bold">
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Paper>
    );
}

export default function AuditoriaResumen() {
    const [filtros, setFiltros] = useState<ResumenAuditoriaFiltros>({});
    const [data, setData] = useState<ResumenAuditoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(
        async (f: ResumenAuditoriaFiltros) => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchAuditoriaResumen(f);
                setData(res);
            } catch (e) {
                console.error(e);
                setError(describeApiError(e, "No se pudo cargar el resumen de auditoría."));
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        cargar(filtros);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAplicar = () => {
        cargar(filtros);
    };

    const totalIntentosLogin =
        (data?.totales.logins_exitosos ?? 0) + (data?.totales.logins_fallidos ?? 0);
    const tasaFallos =
        totalIntentosLogin > 0
            ? ((data?.totales.logins_fallidos ?? 0) / totalIntentosLogin) * 100
            : 0;

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Período
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            type="date"
                            label="Desde"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={filtros.desde ?? ""}
                            onChange={(e) =>
                                setFiltros({ ...filtros, desde: e.target.value || undefined })
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <TextField
                            type="date"
                            label="Hasta"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            value={filtros.hasta ?? ""}
                            onChange={(e) =>
                                setFiltros({ ...filtros, hasta: e.target.value || undefined })
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack direction="row" spacing={1.5}>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={handleAplicar}
                                disabled={loading}
                            >
                                Aplicar
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    const limpio: ResumenAuditoriaFiltros = {};
                                    setFiltros(limpio);
                                    cargar(limpio);
                                }}
                                disabled={loading}
                            >
                                Últimos 30 días
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
                {data?.periodo && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
                        Mostrando: {formatFechaCorta(data.periodo.desde)} → {formatFechaCorta(data.periodo.hasta)}
                    </Typography>
                )}
            </Paper>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => cargar(filtros)}>
                            Reintentar
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {loading && (
                <>
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        {[0, 1, 2, 3].map((i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                                <Skeleton variant="rounded" height={120} />
                            </Grid>
                        ))}
                    </Grid>
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Skeleton variant="rounded" height={320} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Skeleton variant="rounded" height={320} />
                        </Grid>
                    </Grid>
                </>
            )}

            {!loading && data && (
                <>
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KpiCard
                                title="Eventos totales"
                                value={formatNumero(data.totales.eventos)}
                                subtitle="Acciones registradas"
                                icon={<EventNoteIcon />}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KpiCard
                                title="Usuarios únicos"
                                value={formatNumero(data.totales.usuarios_unicos)}
                                subtitle="Que generaron actividad"
                                icon={<GroupIcon />}
                                color="success.main"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KpiCard
                                title="Logins exitosos"
                                value={formatNumero(data.totales.logins_exitosos)}
                                subtitle={`${formatNumero(data.totales.logins_fallidos)} fallidos`}
                                icon={<LoginIcon />}
                                color="info.main"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KpiCard
                                title="% logins fallidos"
                                value={`${tasaFallos.toFixed(1)}%`}
                                subtitle={`Sobre ${formatNumero(totalIntentosLogin)} intentos`}
                                icon={<ErrorOutlineIcon />}
                                color={tasaFallos > 25 ? "error.main" : "warning.main"}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Eventos por día
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Tendencia de actividad diaria del sistema
                                </Typography>
                                {Object.keys(data.por_dia ?? {}).length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Sin datos en el período seleccionado.
                                    </Typography>
                                ) : (
                                    <LineChart data={data.por_dia} height={300} />
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Distribución por severidad
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Clasificación de los eventos registrados
                                </Typography>
                                <DonutChart
                                    data={data.por_severidad as unknown as Record<string, number>}
                                    labels={SEVERIDAD_LABEL}
                                    colors={SEVERIDAD_HEX}
                                    ariaLabel="Distribución por severidad"
                                    height={280}
                                />
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Actividad por módulo
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Eventos generados por cada área del sistema
                                </Typography>
                                <BarChart
                                    data={data.por_modulo}
                                    labels={MODULO_LABELS}
                                    horizontal
                                    height={Math.max(280, Object.keys(data.por_modulo).length * 32)}
                                    ariaLabel="Eventos por módulo"
                                />
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12 }}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Top acciones
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Las acciones más frecuentes en el período seleccionado
                                </Typography>
                                {Object.keys(data.top_acciones ?? {}).length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Sin acciones registradas.
                                    </Typography>
                                ) : (
                                    <BarChart
                                        data={data.top_acciones}
                                        horizontal
                                        height={Math.max(260, Object.keys(data.top_acciones).length * 32)}
                                        ariaLabel="Top acciones"
                                    />
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}

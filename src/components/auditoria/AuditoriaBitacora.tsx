"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Alert,
    Badge,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

import { fetchAuditoriaList } from "@/lib/api/auditoria";
import type {
    AuditoriaListFiltros,
    AuditoriaListResponse,
    Severidad,
} from "@/lib/types/auditoria";
import {
    MODULOS_AUDITORIA,
    MODULO_LABELS,
    SEVERIDADES,
    SEVERIDAD_LABEL,
    describeApiError,
    filtrosToParams,
    formatFechaGT,
    paramsToFiltros,
    useDebouncedValue,
    type ParamSpec,
} from "./auditoriaHelpers";
import {
    HttpMethodChip,
    HttpStatusChip,
    ModuloChip,
    SeveridadChip,
} from "./AuditoriaBadges";

const PER_PAGE = 15;

const PARAM_SPEC: ParamSpec<AuditoriaListFiltros>[] = [
    { key: "q", type: "string" },
    { key: "modulo", type: "string" },
    { key: "accion", type: "string" },
    { key: "severidad", type: "string" },
    { key: "usuario_id", type: "number" },
    { key: "usuario_email", type: "string" },
    { key: "ip", type: "string" },
    { key: "desde", type: "string" },
    { key: "hasta", type: "string" },
    { key: "page", type: "number" },
    { key: "per_page", type: "number" },
];

// Llaves consideradas para el contador de "filtros activos" (excluye q, page y per_page)
const FILTRO_KEYS_AVANZADOS: (keyof AuditoriaListFiltros)[] = [
    "modulo",
    "accion",
    "severidad",
    "usuario_id",
    "usuario_email",
    "ip",
    "desde",
    "hasta",
];

function contarFiltrosAvanzados(f: AuditoriaListFiltros): number {
    return FILTRO_KEYS_AVANZADOS.reduce((acc, k) => {
        const v = f[k];
        return v !== undefined && v !== null && v !== "" ? acc + 1 : acc;
    }, 0);
}

export default function AuditoriaBitacora() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialFiltros = useMemo(
        () =>
            paramsToFiltros<AuditoriaListFiltros>(
                new URLSearchParams(searchParams.toString()),
                PARAM_SPEC
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const [filtros, setFiltrosState] = useState<AuditoriaListFiltros>(() => ({
        page: 1,
        ...initialFiltros,
        per_page: PER_PAGE, // forzamos 15 incluso si vino otro en la URL
    }));
    const [qInput, setQInput] = useState<string>(initialFiltros.q ?? "");
    const qDebounced = useDebouncedValue(qInput, 400);

    const [data, setData] = useState<AuditoriaListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado del modal de filtros avanzados
    const [openFiltros, setOpenFiltros] = useState(false);
    const [draft, setDraft] = useState<AuditoriaListFiltros>(filtros);

    // Sincroniza la URL leyendo siempre el window.location actual
    // (evita closures viejos / race conditions con cambio de tab).
    const syncToUrl = useCallback(
        (next: AuditoriaListFiltros) => {
            if (typeof window === "undefined") return;
            const live = new URLSearchParams(window.location.search);
            PARAM_SPEC.forEach(({ key }) => live.delete(key));
            const ourParams = filtrosToParams(next);
            ourParams.forEach((v, k) => live.set(k, v));
            const newQs = live.toString();
            if (newQs !== window.location.search.replace(/^\?/, "")) {
                router.replace(`?${newQs}`, { scroll: false });
            }
        },
        [router]
    );

    // Wrapper que actualiza state + URL en un solo paso, dirigido por usuario.
    const setFiltros = useCallback(
        (
            updater:
                | AuditoriaListFiltros
                | ((prev: AuditoriaListFiltros) => AuditoriaListFiltros)
        ) => {
            setFiltrosState((prev) => {
                const next =
                    typeof updater === "function"
                        ? (updater as (p: AuditoriaListFiltros) => AuditoriaListFiltros)(prev)
                        : updater;
                if (next !== prev) syncToUrl(next);
                return next;
            });
        },
        [syncToUrl]
    );

    // Sincroniza el debounce de búsqueda con los filtros activos
    useEffect(() => {
        setFiltros((prev) => {
            if ((prev.q ?? "") === qDebounced) return prev;
            return { ...prev, q: qDebounced || undefined, page: 1 };
        });
    }, [qDebounced, setFiltros]);

    const cargar = useCallback(async (f: AuditoriaListFiltros) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchAuditoriaList(f);
            setData(res);
        } catch (e) {
            console.error(e);
            setError(describeApiError(e, "No se pudo cargar la bitácora."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar(filtros);
    }, [filtros, cargar]);

    const verDetalle = (id: string) => {
        const qs = filtrosToParams(filtros).toString();
        router.push(`/auditoria/bitacora/${id}${qs ? `?${qs}` : ""}`);
    };

    const limpiarTodo = () => {
        setQInput("");
        setFiltros({ page: 1, per_page: PER_PAGE });
    };

    const abrirModal = () => {
        setDraft(filtros);
        setOpenFiltros(true);
    };

    const aplicarDraft = () => {
        setFiltros({ ...draft, page: 1, per_page: PER_PAGE });
        setOpenFiltros(false);
    };

    const limpiarDraft = () => {
        setDraft({ q: filtros.q, page: 1, per_page: PER_PAGE });
    };

    const setDraftCampo = <K extends keyof AuditoriaListFiltros>(
        key: K,
        value: AuditoriaListFiltros[K]
    ) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const totalPages = data?.paginacion.last_page ?? 1;
    const items = data?.items ?? [];
    const filtrosActivos = contarFiltrosAvanzados(filtros);

    const removeFiltro = (key: keyof AuditoriaListFiltros) => {
        setFiltros((prev) => ({ ...prev, [key]: undefined, page: 1 }));
    };

    return (
        <Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ p: 2 }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar en mensaje, acción, módulo o URL…"
                        value={qInput}
                        onChange={(e) => setQInput(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        inputProps={{ maxLength: 200, "aria-label": "Búsqueda libre en bitácora" }}
                    />
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <Tooltip title="Filtros avanzados">
                            <IconButton
                                color={filtrosActivos > 0 ? "primary" : "default"}
                                onClick={abrirModal}
                                aria-label="Abrir filtros avanzados"
                            >
                                <Badge badgeContent={filtrosActivos} color="primary">
                                    <FilterListIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Recargar">
                            <span>
                                <IconButton
                                    onClick={() => cargar(filtros)}
                                    disabled={loading}
                                    aria-label="Recargar bitácora"
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {(filtrosActivos > 0 || qInput) && (
                            <Tooltip title="Limpiar todo">
                                <IconButton onClick={limpiarTodo} aria-label="Limpiar todos los filtros">
                                    <RestartAltIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>

                {filtrosActivos > 0 && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {filtros.modulo && (
                                <Chip
                                    size="small"
                                    label={`Módulo: ${MODULO_LABELS[filtros.modulo] ?? filtros.modulo}`}
                                    onDelete={() => removeFiltro("modulo")}
                                />
                            )}
                            {filtros.severidad && (
                                <Chip
                                    size="small"
                                    label={`Severidad: ${SEVERIDAD_LABEL[filtros.severidad]}`}
                                    onDelete={() => removeFiltro("severidad")}
                                />
                            )}
                            {filtros.accion && (
                                <Chip
                                    size="small"
                                    label={`Acción: ${filtros.accion}`}
                                    onDelete={() => removeFiltro("accion")}
                                />
                            )}
                            {filtros.usuario_email && (
                                <Chip
                                    size="small"
                                    label={`Email: ${filtros.usuario_email}`}
                                    onDelete={() => removeFiltro("usuario_email")}
                                />
                            )}
                            {filtros.usuario_id !== undefined && (
                                <Chip
                                    size="small"
                                    label={`Usuario #${filtros.usuario_id}`}
                                    onDelete={() => removeFiltro("usuario_id")}
                                />
                            )}
                            {filtros.ip && (
                                <Chip
                                    size="small"
                                    label={`IP: ${filtros.ip}`}
                                    onDelete={() => removeFiltro("ip")}
                                />
                            )}
                            {filtros.desde && (
                                <Chip
                                    size="small"
                                    label={`Desde: ${filtros.desde}`}
                                    onDelete={() => removeFiltro("desde")}
                                />
                            )}
                            {filtros.hasta && (
                                <Chip
                                    size="small"
                                    label={`Hasta: ${filtros.hasta}`}
                                    onDelete={() => removeFiltro("hasta")}
                                />
                            )}
                        </Stack>
                    </Box>
                )}
            </Paper>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => cargar(filtros)}>
                            Reintentar
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                    sx={{ p: 2 }}
                >
                    <Typography variant="subtitle1" fontWeight="bold">
                        Bitácora del sistema
                    </Typography>
                    {data && (
                        <Typography variant="caption" color="text.secondary">
                            {data.paginacion.total} eventos · página {data.paginacion.current_page} de{" "}
                            {data.paginacion.last_page}
                        </Typography>
                    )}
                </Stack>

                <TableContainer>
                    <Table size="small" aria-label="Tabla de bitácora de auditoría">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Severidad</TableCell>
                                <TableCell>Módulo</TableCell>
                                <TableCell>Acción</TableCell>
                                <TableCell>Usuario</TableCell>
                                <TableCell>HTTP</TableCell>
                                <TableCell>IP</TableCell>
                                <TableCell align="center">Detalle</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading &&
                                Array.from({ length: 6 }).map((_, idx) => (
                                    <TableRow key={`sk-${idx}`}>
                                        <TableCell colSpan={8}>
                                            <Skeleton variant="rectangular" height={32} />
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Box sx={{ textAlign: "center", py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Sin eventos para los filtros aplicados.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading &&
                                items.map((it) => (
                                    <TableRow key={it.id} hover>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                                            {formatFechaGT(it.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <SeveridadChip severidad={it.severidad} />
                                        </TableCell>
                                        <TableCell>
                                            <ModuloChip modulo={it.modulo} />
                                        </TableCell>
                                        <TableCell>
                                            <Stack>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {it.accion}
                                                </Typography>
                                                {it.mensaje && (
                                                    <Typography variant="caption" color="text.secondary" noWrap>
                                                        {it.mensaje}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack>
                                                <Typography variant="body2">{it.usuario_email ?? "—"}</Typography>
                                                {it.usuario_id !== null && it.usuario_id !== undefined && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID #{it.usuario_id}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <HttpMethodChip method={it.http?.method} />
                                                <HttpStatusChip status={it.http?.status} />
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>{it.ip ?? "—"}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Ver detalle">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => verDetalle(it.id)}
                                                    aria-label="Ver detalle del evento"
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {!loading && data && totalPages > 1 && (
                    <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                        <Pagination
                            count={totalPages}
                            page={data.paginacion.current_page}
                            onChange={(_, page) => setFiltros((prev) => ({ ...prev, page }))}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                )}
            </Paper>

            {/* ============== Modal de filtros avanzados ============== */}
            <Dialog
                open={openFiltros}
                onClose={() => setOpenFiltros(false)}
                maxWidth="md"
                fullWidth
                aria-labelledby="bitacora-filtros-titulo"
            >
                <DialogTitle id="bitacora-filtros-titulo" sx={{ pr: 6 }}>
                    Filtros avanzados
                    <IconButton
                        onClick={() => setOpenFiltros(false)}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                        aria-label="Cerrar diálogo de filtros"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="dlg-modulo-label">Módulo</InputLabel>
                                <Select
                                    labelId="dlg-modulo-label"
                                    label="Módulo"
                                    value={draft.modulo ?? ""}
                                    onChange={(e) =>
                                        setDraftCampo("modulo", (e.target.value || undefined) as string | undefined)
                                    }
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {MODULOS_AUDITORIA.map((m) => (
                                        <MenuItem key={m.value} value={m.value}>
                                            {m.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="dlg-severidad-label">Severidad</InputLabel>
                                <Select
                                    labelId="dlg-severidad-label"
                                    label="Severidad"
                                    value={draft.severidad ?? ""}
                                    onChange={(e) =>
                                        setDraftCampo(
                                            "severidad",
                                            (e.target.value || undefined) as Severidad | undefined
                                        )
                                    }
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {SEVERIDADES.map((s) => (
                                        <MenuItem key={s} value={s}>
                                            {SEVERIDAD_LABEL[s]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Acción"
                                placeholder="auth.login.success"
                                value={draft.accion ?? ""}
                                onChange={(e) => setDraftCampo("accion", e.target.value || undefined)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Email del usuario"
                                placeholder="admin@example.com"
                                value={draft.usuario_email ?? ""}
                                onChange={(e) =>
                                    setDraftCampo("usuario_email", e.target.value || undefined)
                                }
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Usuario ID"
                                type="number"
                                value={draft.usuario_id ?? ""}
                                onChange={(e) => {
                                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                                    setDraftCampo("usuario_id", v);
                                }}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="IP"
                                placeholder="192.168.0.1"
                                value={draft.ip ?? ""}
                                onChange={(e) => setDraftCampo("ip", e.target.value || undefined)}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Desde"
                                slotProps={{ inputLabel: { shrink: true } }}
                                value={draft.desde ?? ""}
                                onChange={(e) => setDraftCampo("desde", e.target.value || undefined)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Hasta"
                                slotProps={{ inputLabel: { shrink: true } }}
                                value={draft.hasta ?? ""}
                                onChange={(e) => setDraftCampo("hasta", e.target.value || undefined)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={limpiarDraft} color="inherit" startIcon={<RestartAltIcon />}>
                        Limpiar
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button onClick={() => setOpenFiltros(false)} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={aplicarDraft} variant="contained">
                        Aplicar filtros
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

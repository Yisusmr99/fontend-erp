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
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

import { fetchSnapshotsList } from "@/lib/api/auditoria";
import type {
    EstadoTransaccion,
    MonedaSnapshot,
    SnapshotsListFiltros,
    SnapshotsListResponse,
} from "@/lib/types/auditoria";
import {
    ESTADOS_TRANSACCION,
    describeApiError,
    filtrosToParams,
    formatFechaGT,
    formatMonto,
    paramsToFiltros,
    type ParamSpec,
} from "./auditoriaHelpers";
import { EstadoTransaccionChip } from "./AuditoriaBadges";

const PER_PAGE = 15;

const PARAM_SPEC: ParamSpec<SnapshotsListFiltros>[] = [
    { key: "transaccion_id", type: "number" },
    { key: "cliente_id", type: "number" },
    { key: "cuenta_id", type: "number" },
    { key: "numero_cuenta", type: "string" },
    { key: "tipo", type: "string" },
    { key: "estado", type: "string" },
    { key: "moneda", type: "string" },
    { key: "es_externa", type: "boolean" },
    { key: "banco_externo", type: "string" },
    { key: "monto_min", type: "number" },
    { key: "monto_max", type: "number" },
    { key: "desde", type: "string" },
    { key: "hasta", type: "string" },
    { key: "page", type: "number" },
    { key: "per_page", type: "number" },
];

const TIPOS_TRANSACCION = ["deposito", "retiro", "transferencia", "pago"];

const FILTRO_KEYS_AVANZADOS: (keyof SnapshotsListFiltros)[] = [
    "transaccion_id",
    "cliente_id",
    "cuenta_id",
    "numero_cuenta",
    "tipo",
    "estado",
    "moneda",
    "es_externa",
    "banco_externo",
    "monto_min",
    "monto_max",
    "desde",
    "hasta",
];

function contarFiltrosAvanzados(f: SnapshotsListFiltros): number {
    return FILTRO_KEYS_AVANZADOS.reduce((acc, k) => {
        const v = f[k];
        return v !== undefined && v !== null && v !== "" ? acc + 1 : acc;
    }, 0);
}

export default function AuditoriaSnapshots() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialFiltros = useMemo(
        () =>
            paramsToFiltros<SnapshotsListFiltros>(
                new URLSearchParams(searchParams.toString()),
                PARAM_SPEC
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const [filtros, setFiltrosState] = useState<SnapshotsListFiltros>(() => ({
        page: 1,
        ...initialFiltros,
        per_page: PER_PAGE, // forzamos 15 incluso si vino otro en la URL
    }));

    const [data, setData] = useState<SnapshotsListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [openFiltros, setOpenFiltros] = useState(false);
    const [draft, setDraft] = useState<SnapshotsListFiltros>(filtros);

    // Sincroniza la URL leyendo siempre el window.location actual
    // (evita closures viejos / race conditions con cambio de tab).
    const syncToUrl = useCallback(
        (next: SnapshotsListFiltros) => {
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
                | SnapshotsListFiltros
                | ((prev: SnapshotsListFiltros) => SnapshotsListFiltros)
        ) => {
            setFiltrosState((prev) => {
                const next =
                    typeof updater === "function"
                        ? (updater as (p: SnapshotsListFiltros) => SnapshotsListFiltros)(prev)
                        : updater;
                if (next !== prev) syncToUrl(next);
                return next;
            });
        },
        [syncToUrl]
    );

    const cargar = useCallback(async (f: SnapshotsListFiltros) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchSnapshotsList(f);
            setData(res);
        } catch (e) {
            console.error(e);
            setError(describeApiError(e, "No se pudieron cargar los snapshots."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargar(filtros);
    }, [filtros, cargar]);

    const verDetalle = (id: string) => {
        const qs = filtrosToParams(filtros).toString();
        router.push(`/auditoria/snapshots/${id}${qs ? `?${qs}` : ""}`);
    };

    const limpiarTodo = () => {
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
        setDraft({ page: 1, per_page: PER_PAGE });
    };

    const setDraftCampo = <K extends keyof SnapshotsListFiltros>(
        key: K,
        value: SnapshotsListFiltros[K]
    ) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const removeFiltro = (key: keyof SnapshotsListFiltros) => {
        setFiltros((prev) => ({ ...prev, [key]: undefined, page: 1 }));
    };

    const totalPages = data?.paginacion.last_page ?? 1;
    const items = data?.items ?? [];
    const filtrosActivos = contarFiltrosAvanzados(filtros);

    return (
        <Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                    sx={{ p: 2 }}
                >
                    <Typography variant="subtitle1" fontWeight="bold">
                        {data
                            ? `${data.paginacion.total} snapshot${data.paginacion.total === 1 ? "" : "s"}`
                            : "Snapshots"}
                    </Typography>
                    <Stack direction="row" spacing={1}>
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
                                    aria-label="Recargar snapshots"
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {filtrosActivos > 0 && (
                            <Tooltip title="Limpiar todos los filtros">
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
                            {filtros.transaccion_id !== undefined && (
                                <Chip
                                    size="small"
                                    label={`Trans. SQL #${filtros.transaccion_id}`}
                                    onDelete={() => removeFiltro("transaccion_id")}
                                />
                            )}
                            {filtros.cliente_id !== undefined && (
                                <Chip
                                    size="small"
                                    label={`Cliente #${filtros.cliente_id}`}
                                    onDelete={() => removeFiltro("cliente_id")}
                                />
                            )}
                            {filtros.cuenta_id !== undefined && (
                                <Chip
                                    size="small"
                                    label={`Cuenta #${filtros.cuenta_id}`}
                                    onDelete={() => removeFiltro("cuenta_id")}
                                />
                            )}
                            {filtros.numero_cuenta && (
                                <Chip
                                    size="small"
                                    label={`# Cuenta: ${filtros.numero_cuenta}`}
                                    onDelete={() => removeFiltro("numero_cuenta")}
                                />
                            )}
                            {filtros.tipo && (
                                <Chip
                                    size="small"
                                    label={`Tipo: ${filtros.tipo}`}
                                    onDelete={() => removeFiltro("tipo")}
                                />
                            )}
                            {filtros.estado && (
                                <Chip
                                    size="small"
                                    label={`Estado: ${filtros.estado}`}
                                    onDelete={() => removeFiltro("estado")}
                                />
                            )}
                            {filtros.moneda && (
                                <Chip
                                    size="small"
                                    label={`Moneda: ${filtros.moneda}`}
                                    onDelete={() => removeFiltro("moneda")}
                                />
                            )}
                            {filtros.es_externa !== undefined && (
                                <Chip
                                    size="small"
                                    label={filtros.es_externa ? "Solo externas" : "Solo internas"}
                                    onDelete={() => removeFiltro("es_externa")}
                                />
                            )}
                            {filtros.banco_externo && (
                                <Chip
                                    size="small"
                                    label={`Banco: ${filtros.banco_externo}`}
                                    onDelete={() => removeFiltro("banco_externo")}
                                />
                            )}
                            {filtros.monto_min !== undefined && (
                                <Chip
                                    size="small"
                                    label={`Mín: ${filtros.monto_min}`}
                                    onDelete={() => removeFiltro("monto_min")}
                                />
                            )}
                            {filtros.monto_max !== undefined && (
                                <Chip
                                    size="small"
                                    label={`Máx: ${filtros.monto_max}`}
                                    onDelete={() => removeFiltro("monto_max")}
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
                <TableContainer>
                    <Table size="small" aria-label="Tabla de snapshots de transacciones">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Origen</TableCell>
                                <TableCell>Destino</TableCell>
                                <TableCell align="right">Monto</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Externa</TableCell>
                                <TableCell>Operador</TableCell>
                                <TableCell align="center">Detalle</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading &&
                                Array.from({ length: 6 }).map((_, idx) => (
                                    <TableRow key={`sk-${idx}`}>
                                        <TableCell colSpan={9}>
                                            <Skeleton variant="rectangular" height={32} />
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Box sx={{ textAlign: "center", py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Sin snapshots para los filtros aplicados.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading &&
                                items.map((it) => (
                                    <TableRow key={it.id} hover>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                                            {formatFechaGT(it.fecha_transaccion ?? it.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Stack>
                                                <Typography variant="body2">{it.tipo_transaccion}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    SQL #{it.transaccion_id_sql}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {it.cuenta_origen ? (
                                                <Stack>
                                                    <Typography variant="body2">{it.cuenta_origen.numero_cuenta}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {it.cuenta_origen.cliente?.nombres ?? ""}{" "}
                                                        {it.cuenta_origen.cliente?.apellidos ?? ""}
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {it.cuenta_destino ? (
                                                <Stack>
                                                    <Typography variant="body2">{it.cuenta_destino.numero_cuenta}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {it.cuenta_destino.cliente?.nombres ?? ""}{" "}
                                                        {it.cuenta_destino.cliente?.apellidos ?? ""}
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>
                                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                            {formatMonto(it.monto, it.moneda)}
                                        </TableCell>
                                        <TableCell>
                                            <EstadoTransaccionChip estado={it.estado} />
                                        </TableCell>
                                        <TableCell>
                                            {it.es_externa ? (
                                                <Chip
                                                    size="small"
                                                    color="info"
                                                    label={it.banco_externo ?? "Externa"}
                                                />
                                            ) : (
                                                <Chip size="small" variant="outlined" label="Interna" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {it.registrado_por?.email ?? "—"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Ver snapshot">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => verDetalle(it.id)}
                                                    aria-label="Ver detalle del snapshot"
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
                aria-labelledby="snapshots-filtros-titulo"
            >
                <DialogTitle id="snapshots-filtros-titulo" sx={{ pr: 6 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="ID Transacción (SQL)"
                                value={draft.transaccion_id ?? ""}
                                onChange={(e) =>
                                    setDraftCampo(
                                        "transaccion_id",
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                    )
                                }
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Cliente ID"
                                value={draft.cliente_id ?? ""}
                                onChange={(e) =>
                                    setDraftCampo(
                                        "cliente_id",
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                    )
                                }
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Cuenta ID"
                                value={draft.cuenta_id ?? ""}
                                onChange={(e) =>
                                    setDraftCampo(
                                        "cuenta_id",
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                    )
                                }
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Número de cuenta"
                                value={draft.numero_cuenta ?? ""}
                                onChange={(e) => setDraftCampo("numero_cuenta", e.target.value || undefined)}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="dlg-tipo-label">Tipo</InputLabel>
                                <Select
                                    labelId="dlg-tipo-label"
                                    label="Tipo"
                                    value={draft.tipo ?? ""}
                                    onChange={(e) =>
                                        setDraftCampo("tipo", (e.target.value || undefined) as string | undefined)
                                    }
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {TIPOS_TRANSACCION.map((t) => (
                                        <MenuItem key={t} value={t}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="dlg-estado-label">Estado</InputLabel>
                                <Select
                                    labelId="dlg-estado-label"
                                    label="Estado"
                                    value={draft.estado ?? ""}
                                    onChange={(e) =>
                                        setDraftCampo(
                                            "estado",
                                            (e.target.value || undefined) as EstadoTransaccion | undefined
                                        )
                                    }
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {ESTADOS_TRANSACCION.map((s) => (
                                        <MenuItem key={s} value={s}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="dlg-moneda-label">Moneda</InputLabel>
                                <Select
                                    labelId="dlg-moneda-label"
                                    label="Moneda"
                                    value={draft.moneda ?? ""}
                                    onChange={(e) =>
                                        setDraftCampo(
                                            "moneda",
                                            (e.target.value || undefined) as MonedaSnapshot | undefined
                                        )
                                    }
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    <MenuItem value="Q">Quetzales (Q)</MenuItem>
                                    <MenuItem value="USD">Dólares (USD)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="dlg-externa-label">Origen</InputLabel>
                                <Select<string>
                                    labelId="dlg-externa-label"
                                    label="Origen"
                                    value={
                                        draft.es_externa === undefined ? "" : draft.es_externa ? "1" : "0"
                                    }
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setDraftCampo("es_externa", v === "" ? undefined : v === "1");
                                    }}
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    <MenuItem value="1">Solo externas</MenuItem>
                                    <MenuItem value="0">Solo internas</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Banco externo"
                                value={draft.banco_externo ?? ""}
                                onChange={(e) => setDraftCampo("banco_externo", e.target.value || undefined)}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Monto mín."
                                value={draft.monto_min ?? ""}
                                onChange={(e) =>
                                    setDraftCampo(
                                        "monto_min",
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                    )
                                }
                                inputProps={{ min: 0, step: "0.01" }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Monto máx."
                                value={draft.monto_max ?? ""}
                                onChange={(e) =>
                                    setDraftCampo(
                                        "monto_max",
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                    )
                                }
                                inputProps={{ min: 0, step: "0.01" }}
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

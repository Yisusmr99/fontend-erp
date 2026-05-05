"use client";

import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Box,
    CircularProgress,
    Paper,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import AppLayout from "@/components/layout/AppLayout";

const AuditoriaBitacora = lazy(() => import("@/components/auditoria/AuditoriaBitacora"));
const AuditoriaSnapshots = lazy(() => import("@/components/auditoria/AuditoriaSnapshots"));

type TabKey = "bitacora" | "snapshots";

const TABS: {
    key: TabKey;
    label: string;
    icon: React.ReactElement;
    descripcion: string;
    Component: React.LazyExoticComponent<() => React.JSX.Element>;
}[] = [
    {
        key: "bitacora",
        label: "Bitácora",
        icon: <HistoryIcon />,
        descripcion:
            "Listado detallado de cada acción registrada por el middleware de auditoría. Soporta búsqueda libre y filtros combinables.",
        Component: AuditoriaBitacora,
    },
    {
        key: "snapshots",
        label: "Detalle Transacciones",
        icon: <ReceiptLongIcon />,
        descripcion:
            "Foto inmutable de cada transacción con datos de cliente, cuenta, operador e IP en el momento del registro.",
        Component: AuditoriaSnapshots,
    },
];

function getInitialTab(sp: URLSearchParams): TabKey {
    const t = sp.get("tab");
    if (t === "bitacora" || t === "snapshots") return t;
    return "bitacora";
}

function AuditoriaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [tab, setTab] = useState<TabKey>(() =>
        getInitialTab(new URLSearchParams(searchParams.toString()))
    );

    const tabActual = useMemo(() => TABS.find((t) => t.key === tab) ?? TABS[0], [tab]);
    const ActiveComponent = tabActual.Component;

    const handleTabChange = (_: React.SyntheticEvent, value: TabKey) => {
        setTab(value);
        // Limpiamos toda la query y dejamos solo ?tab=… al cambiar de pestaña
        const sp = new URLSearchParams();
        sp.set("tab", value);
        router.replace(`?${sp.toString()}`, { scroll: false });
    };

    // Sincroniza el estado si el query string cambia desde fuera
    // (botón atrás del navegador, links externos, etc.)
    useEffect(() => {
        const fromUrl = getInitialTab(new URLSearchParams(searchParams.toString()));
        if (fromUrl !== tab) setTab(fromUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Auditoría
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Pista de auditoría inmutable: cada acción del sistema registrada y consultable en tiempo real.
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="Pestañas del módulo de Auditoría"
                    sx={{
                        bgcolor: "background.default",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    {TABS.map((t) => (
                        <Tab
                            key={t.key}
                            value={t.key}
                            label={t.label}
                            icon={t.icon}
                            iconPosition="start"
                            sx={{ minHeight: 56, textTransform: "none" }}
                        />
                    ))}
                </Tabs>
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {tabActual.descripcion}
                    </Typography>
                    <Suspense
                        fallback={
                            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                                <CircularProgress />
                            </Box>
                        }
                    >
                        <ActiveComponent />
                    </Suspense>
                </Box>
            </Paper>
        </>
    );
}

export default function AuditoriaPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return (
        <AppLayout>
            <Suspense
                fallback={
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                }
            >
                <AuditoriaContent />
            </Suspense>
        </AppLayout>
    );
}

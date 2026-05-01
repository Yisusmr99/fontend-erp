"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import ReporteEstadoCuenta from "@/components/reportes/ReporteEstadoCuenta";
import ReporteHistorialTransacciones from "@/components/reportes/ReporteHistorialTransacciones";
import ReporteListadoCuentas from "@/components/reportes/ReporteListadoCuentas";
import ReporteTransferenciasExternas from "@/components/reportes/ReporteTransferenciasExternas";
import ReporteActividadMensual from "@/components/reportes/ReporteActividadMensual";

interface ReporteTab {
    label: string;
    icon: React.ReactElement;
    component: React.ReactNode;
    descripcion: string;
}

const REPORTES: ReporteTab[] = [
    {
        label: "Estado de cuenta",
        icon: <AccountBalanceIcon />,
        descripcion: "Estado de cuenta detallado de un cliente: cuentas, saldos y movimientos con otros bancos.",
        component: <ReporteEstadoCuenta />,
    },
    {
        label: "Historial de transacciones",
        icon: <ReceiptLongIcon />,
        descripcion: "Listado de transacciones con filtros por fecha, cliente, cuenta, tipo y estado.",
        component: <ReporteHistorialTransacciones />,
    },
    {
        label: "Listado de cuentas",
        icon: <ListAltIcon />,
        descripcion: "Cuentas del banco con saldos y filtros por cliente, tipo, moneda y estado.",
        component: <ReporteListadoCuentas />,
    },
    {
        label: "Transferencias externas",
        icon: <SwapHorizIcon />,
        descripcion: "Transferencias con otros bancos en un período, agrupadas por banco y tipo.",
        component: <ReporteTransferenciasExternas />,
    },
    {
        label: "Actividad mensual",
        icon: <CalendarMonthIcon />,
        descripcion: "Resumen estadístico mensual: transacciones, montos, top clientes y crecimiento.",
        component: <ReporteActividadMensual />,
    },
];

function ReportesContent() {
    const [tab, setTab] = useState(0);
    const reporteActual = REPORTES[tab];

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Reportes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Genera reportes detallados y expórtalos a PDF mediante el diálogo de impresión del navegador.
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        bgcolor: "background.default",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    {REPORTES.map((r, idx) => (
                        <Tab
                            key={r.label}
                            label={r.label}
                            icon={r.icon}
                            iconPosition="start"
                            sx={{ minHeight: 56, textTransform: "none" }}
                            value={idx}
                        />
                    ))}
                </Tabs>
                <Box sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {reporteActual.descripcion}
                    </Typography>
                    {reporteActual.component}
                </Box>
            </Paper>
        </>
    );
}

export default function ReportesPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return (
        <AppLayout>
            <ReportesContent />
        </AppLayout>
    );
}

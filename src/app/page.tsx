"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { fetchDashboardSummary } from "@/lib/api/dashboard";
import type { DashboardSummary, SaldoPorMoneda } from "@/lib/types/dashboard";

// ---------- Helpers ----------
const TIPO_LABEL: Record<string, string> = {
  monetaria: "Monetaria",
  ahorro: "Ahorro",
  estudiantil: "Estudiantil",
};

const formatMoneda = (moneda: string, monto: number) => {
  const value = (monto ?? 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${moneda} ${value}`;
};

const formatFecha = (iso: string | null | undefined) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-GT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

// ---------- Componentes auxiliares ----------
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}
function StatCard({ title, value, subtitle, icon, color = "primary.main" }: StatCardProps) {
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

interface DistribucionBarProps {
  data: Record<string, number>;
  labels?: Record<string, string>;
}
function DistribucionBar({ data, labels = {} }: DistribucionBarProps) {
  const entries = Object.entries(data ?? {});
  const total = entries.reduce((acc, [, v]) => acc + Number(v ?? 0), 0);
  if (total === 0)
    return (
      <Typography variant="body2" color="text.secondary">
        Sin datos disponibles.
      </Typography>
    );

  return (
    <Stack spacing={1.5}>
      {entries.map(([key, val]) => {
        const pct = total === 0 ? 0 : (Number(val) / total) * 100;
        return (
          <Box key={key}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2">{labels[key] ?? key}</Typography>
              <Typography variant="body2" color="text.secondary">
                {val} ({pct.toFixed(1)}%)
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        );
      })}
    </Stack>
  );
}

function SaldosPorMonedaList({ saldos }: { saldos: SaldoPorMoneda[] }) {
  if (!saldos || saldos.length === 0)
    return (
      <Typography variant="body2" color="text.secondary">
        Sin saldos registrados.
      </Typography>
    );

  return (
    <Stack spacing={1.5}>
      {saldos.map((s) => (
        <Paper
          key={s.moneda}
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack>
            <Typography variant="body2" color="text.secondary">
              Moneda {s.moneda}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatMoneda(s.moneda, s.total_disponible)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {s.cantidad_cuentas} cuenta(s) · saldo total {formatMoneda(s.moneda, s.total_saldo)}
            </Typography>
          </Stack>
          <CurrencyExchangeIcon color="primary" />
        </Paper>
      ))}
    </Stack>
  );
}

// ---------- Página principal ----------
function DashboardContent() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoadingSummary(true);

    fetchDashboardSummary()
      .then((sum) => {
        if (!mounted) return;
        setSummary(sum);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError("No se pudo cargar el resumen del dashboard. Verifica tu sesión.");
      })
      .finally(() => {
        if (mounted) setLoadingSummary(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Resumen general del sistema bancario
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loadingSummary && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loadingSummary && summary && (
        <>
          {/* KPIs principales */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total de cuentas"
                value={summary.cuentas.total}
                subtitle={`${summary.cuentas.activas} activas · ${summary.cuentas.inactivas} inactivas`}
                icon={<AccountBalanceIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total de clientes"
                value={summary.clientes.total}
                subtitle={`${summary.clientes.activos} activos · ${summary.clientes.inactivos} inactivos`}
                icon={<PeopleIcon />}
                color="success.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Transacciones del mes"
                value={summary.transacciones_mes.total}
                subtitle={`${summary.transacciones_mes.externas} externas`}
                icon={<SwapHorizIcon />}
                color="warning.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Transferencias externas"
                value={summary.transferencias_externas.total_historico}
                subtitle="Total histórico"
                icon={<ReceiptLongIcon />}
                color="info.main"
              />
            </Grid>
          </Grid>

          {/* Saldos por moneda + Distribución por tipo */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Saldos consolidados por moneda
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Suma de saldo disponible de cuentas activas
                </Typography>
                <SaldosPorMonedaList saldos={summary.saldos_por_moneda} />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Distribución por tipo de cuenta
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Total: {summary.cuentas.total} cuentas
                </Typography>
                <DistribucionBar data={summary.cuentas.distribucion_tipo} labels={TIPO_LABEL} />
              </Paper>
            </Grid>
          </Grid>

          {/* Movimiento del mes */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={1}
              mb={2}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Actividad del mes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFecha(summary.transacciones_mes.periodo_inicio)} —{" "}
                  {formatFecha(summary.transacciones_mes.periodo_fin)}
                </Typography>
              </Box>
              <Chip
                label={`Monto movido: Q ${summary.transacciones_mes.monto_movido.toLocaleString("es-GT", {
                  minimumFractionDigits: 2,
                })}`}
                color="primary"
              />
            </Stack>
            <DistribucionBar
              data={summary.transacciones_mes.distribucion_por_tipo}
              labels={{
                transferencia: "Transferencias",
                deposito: "Depósitos",
                retiro: "Retiros",
              }}
            />
          </Paper>

          {/* Aviso: la consulta detallada por cliente se trasladó a Reportes */}
          <Alert severity="info" sx={{ mb: 2 }}>
            ¿Buscás el detalle por cliente? Ahora está en <strong>Reportes → Estado de cuenta</strong>,
            donde además podés generar un PDF imprimible.
          </Alert>
        </>
      )}
    </>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}

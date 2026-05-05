"use client";

import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler,
    type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import { useMemo } from "react";

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

const COLOR_PALETTE = [
    "#0097A7",
    "#F5A000",
    "#7B1FA2",
    "#0288D1",
    "#2E7D32",
    "#D32F2F",
    "#5E35B1",
    "#00897B",
    "#C2185B",
    "#455A64",
];

function pickColors(n: number): string[] {
    const out: string[] = [];
    for (let i = 0; i < n; i += 1) {
        out.push(COLOR_PALETTE[i % COLOR_PALETTE.length]);
    }
    return out;
}

// =====================================================
// Doughnut: Distribución por severidad / módulo
// =====================================================
interface DonutChartProps {
    data: Record<string, number>;
    labels?: Record<string, string>;
    colors?: Record<string, string>;
    height?: number;
    ariaLabel?: string;
}

export function DonutChart({ data, labels = {}, colors, height = 260, ariaLabel }: DonutChartProps) {
    const theme = useTheme();
    const entries = Object.entries(data ?? {});
    const labelArr = entries.map(([k]) => labels[k] ?? k);
    const valArr = entries.map(([, v]) => Number(v));
    const colorArr = entries.map(([k], idx) => colors?.[k] ?? COLOR_PALETTE[idx % COLOR_PALETTE.length]);

    const chartData = {
        labels: labelArr,
        datasets: [
            {
                data: valArr,
                backgroundColor: colorArr,
                borderColor: theme.palette.background.paper,
                borderWidth: 2,
            },
        ],
    };

    const opts: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: { color: theme.palette.text.primary, font: { size: 12 } },
            },
        },
        cutout: "60%",
    };

    return (
        <div style={{ height, width: "100%" }} role="img" aria-label={ariaLabel ?? "Gráfico de distribución"}>
            <Doughnut data={chartData} options={opts} />
        </div>
    );
}

// =====================================================
// Bar (horizontal): Top acciones / por módulo
// =====================================================
interface BarChartProps {
    data: Record<string, number>;
    labels?: Record<string, string>;
    color?: string;
    horizontal?: boolean;
    height?: number;
    ariaLabel?: string;
}

export function BarChart({
    data,
    labels = {},
    color,
    horizontal = false,
    height = 280,
    ariaLabel,
}: BarChartProps) {
    const theme = useTheme();
    const entries = Object.entries(data ?? {});
    const labelArr = entries.map(([k]) => labels[k] ?? k);
    const valArr = entries.map(([, v]) => Number(v));

    const baseColor = color ?? theme.palette.primary.main;
    const colorArr = entries.length === 1 ? [baseColor] : pickColors(entries.length);

    const chartData = {
        labels: labelArr,
        datasets: [
            {
                label: "Eventos",
                data: valArr,
                backgroundColor: color ? baseColor : colorArr,
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const opts: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? "y" : "x",
        plugins: {
            legend: { display: false },
            tooltip: { mode: "nearest", intersect: false },
        },
        scales: {
            x: {
                ticks: { color: theme.palette.text.secondary },
                grid: { color: theme.palette.divider },
            },
            y: {
                ticks: { color: theme.palette.text.secondary },
                grid: { color: theme.palette.divider },
            },
        },
    };

    return (
        <div style={{ height, width: "100%" }} role="img" aria-label={ariaLabel ?? "Gráfico de barras"}>
            <Bar data={chartData} options={opts} />
        </div>
    );
}

// =====================================================
// Line: Eventos por día
// =====================================================
interface LineChartProps {
    data: Record<string, number>;
    height?: number;
    ariaLabel?: string;
}

export function LineChart({ data, height = 280, ariaLabel }: LineChartProps) {
    const theme = useTheme();

    const sorted = useMemo(() => {
        return Object.entries(data ?? {}).sort(([a], [b]) => a.localeCompare(b));
    }, [data]);

    const labels = sorted.map(([d]) => d);
    const values = sorted.map(([, v]) => Number(v));

    const chartData = {
        labels,
        datasets: [
            {
                label: "Eventos por día",
                data: values,
                borderColor: theme.palette.primary.main,
                backgroundColor: `${theme.palette.primary.main}33`,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 5,
            },
        ],
    };

    const opts: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: {
                ticks: { color: theme.palette.text.secondary, maxRotation: 45, minRotation: 0 },
                grid: { color: theme.palette.divider },
            },
            y: {
                beginAtZero: true,
                ticks: { color: theme.palette.text.secondary },
                grid: { color: theme.palette.divider },
            },
        },
    };

    return (
        <div style={{ height, width: "100%" }} role="img" aria-label={ariaLabel ?? "Eventos por día"}>
            <Line data={chartData} options={opts} />
        </div>
    );
}

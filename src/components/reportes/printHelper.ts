/**
 * Helper para imprimir / exportar a PDF cualquier reporte.
 * Replica el patrón usado en /transacciones (window.open + window.print).
 *
 * El usuario puede elegir "Guardar como PDF" en el diálogo de impresión del navegador.
 */

export interface PrintOptions {
    titulo: string;
    subtitulo?: string;
    bodyHtml: string;
    fechaEmision?: string;
}

export function abrirVistaImpresion({ titulo, subtitulo, bodyHtml, fechaEmision }: PrintOptions): void {
    const ventana = window.open("", "_blank", "width=1000,height=800");
    if (!ventana) return;

    const fechaFmt = fechaEmision
        ? new Date(fechaEmision).toLocaleString("es-GT")
        : new Date().toLocaleString("es-GT");

    ventana.document.write(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(titulo)} - Derbancks</title>
<style>
    * { box-sizing: border-box; }
    body {
        font-family: 'Segoe UI', Arial, sans-serif;
        padding: 24px;
        color: #222;
        font-size: 12px;
        line-height: 1.45;
    }
    .header {
        border-bottom: 2px solid #006666;
        padding-bottom: 12px;
        margin-bottom: 16px;
    }
    .header h1 {
        margin: 0 0 4px 0;
        color: #006666;
        font-size: 22px;
    }
    .header h2 {
        margin: 0;
        color: #555;
        font-size: 14px;
        font-weight: normal;
    }
    .meta {
        font-size: 11px;
        color: #777;
        margin-top: 6px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0 18px 0;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 6px 8px;
        text-align: left;
    }
    th {
        background: #f5f5f5;
        font-weight: 600;
    }
    .totals-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 8px;
        margin: 10px 0 16px 0;
    }
    .totals-grid .card {
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 8px 10px;
        background: #fafafa;
    }
    .totals-grid .label {
        font-size: 10px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .totals-grid .value {
        font-size: 16px;
        font-weight: 700;
        color: #006666;
        margin-top: 2px;
    }
    .section-title {
        font-size: 14px;
        font-weight: 700;
        color: #006666;
        margin: 18px 0 6px 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 4px;
    }
    .pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
        background: #e0f2f1;
        color: #006666;
    }
    .text-right { text-align: right; }
    .text-muted { color: #777; }
    .footer {
        margin-top: 20px;
        font-size: 10px;
        color: #999;
        text-align: center;
        border-top: 1px solid #eee;
        padding-top: 8px;
    }
    @media print {
        body { padding: 12px; }
        .no-print { display: none; }
    }
</style>
</head>
<body>
    <div class="header">
        <h1>Derbancks</h1>
        <h2>${escapeHtml(titulo)}</h2>
        ${subtitulo ? `<div class="meta">${escapeHtml(subtitulo)}</div>` : ""}
        <div class="meta">Emitido: ${fechaFmt}</div>
    </div>

    ${bodyHtml}

    <div class="footer">
        Reporte generado por el sistema Derbancks · Documento informativo
    </div>

    <script>
        window.onload = function () { window.print(); };
    </script>
</body>
</html>
`);
    ventana.document.close();
}

/**
 * Escape HTML para evitar inyección.
 */
export function escapeHtml(value: unknown): string {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Formatea un monto con su moneda.
 */
export function formatMoneda(moneda: string, monto: number | string | null | undefined): string {
    const n = Number(monto ?? 0);
    return `${moneda} ${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formatea fecha en es-GT.
 */
export function formatFecha(iso: string | null | undefined): string {
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
}

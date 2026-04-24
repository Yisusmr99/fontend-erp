/**
 * Mensaje legible desde respuestas de error (Laravel validation, ApiResponse, Axios).
 */
function collectValidationLines(errors: unknown): string[] {
    if (!errors || typeof errors !== "object") return [];
    const lines: string[] = [];
    for (const [field, msgs] of Object.entries(errors as Record<string, unknown>)) {
        if (Array.isArray(msgs)) {
            for (const m of msgs) lines.push(`${field}: ${String(m)}`);
        } else if (msgs != null && msgs !== "") {
            lines.push(`${field}: ${String(msgs)}`);
        }
    }
    return lines;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    const err = error as { response?: { data?: unknown } };
    const raw = err.response?.data;
    if (!raw || typeof raw !== "object") return fallback;

    const top = raw as Record<string, unknown>;

    let lines = collectValidationLines(top.errors);
    if (lines.length === 0 && top.data && typeof top.data === "object") {
        const inner = top.data as Record<string, unknown>;
        lines = collectValidationLines(inner.errors);
        if (lines.length > 0 && typeof inner.message === "string" && inner.message) {
            return `${inner.message}\n${lines.join("\n")}`;
        }
    }
    if (lines.length > 0) return lines.join("\n");

    if (typeof top.message === "string" && top.message.trim()) return top.message;

    if (top.data && typeof top.data === "object") {
        const inner = top.data as Record<string, unknown>;
        if (typeof inner.message === "string" && inner.message.trim()) return inner.message;
    }

    return fallback;
}

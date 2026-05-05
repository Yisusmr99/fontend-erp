"use client";

import { Suspense, lazy, use, useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import AppLayout from "@/components/layout/AppLayout";

const AuditoriaDetalle = lazy(() => import("@/components/auditoria/AuditoriaDetalle"));

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function AuditoriaDetallePage({ params }: PageProps) {
    const { id } = use(params);
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
                <AuditoriaDetalle id={id} />
            </Suspense>
        </AppLayout>
    );
}

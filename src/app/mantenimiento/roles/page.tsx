'use client';
import AppLayout from "@/components/layout/AppLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

import { fetchRoles, Role } from "@/lib/api/roles";

// Componente de contenido que se carga dinámicamente solo en cliente
function RolesContent() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 10,
        page: 0,
    });
    const [totalRows, setTotalRows] = useState(0);

    const loadRoles = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchRoles(page);
            
            setRoles(response.data);
            setTotalRows(response.meta.total);
        } catch (err) {
            console.error("Error loading roles:", err);
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    // Cargar los roles cuando el componente se monta
    useEffect(() => {
        loadRoles(1);
    }, []);

    // Cargar los roles cuando cambia la página
    useEffect(() => {
        if (paginationModel.page > 0) {
            loadRoles(paginationModel.page + 1);
        }
    }, [paginationModel.page]);

    // Definir las columnas del DataGrid
    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ID",
            width: 70,
            sortable: true,
        },
        {
            field: "name",
            headerName: "Nombre",
            flex: 1,
            minWidth: 200,
            sortable: true,
        },
        {
            field: "permissions",
            headerName: "Permisos",
            flex: 1,
            minWidth: 300,
            sortable: false,
            renderCell: (params) => {
                const permissions = params.value as string[];
                return (
                    <Typography variant="body2" color="text.secondary">
                        {permissions.length > 0 ? permissions.join(", ") : "-"}
                    </Typography>
                );
            },
        },
        {
            field: "created_at",
            headerName: "Fecha de Creación",
            flex: 1,
            minWidth: 180,
            sortable: true,
            valueFormatter: (value) => {
                if (!value) return "-";
                return new Date(value).toLocaleDateString("es-ES");
            },
        },
    ];

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Roles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Administra los roles y permisos del sistema
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ height: 600, width: "100%" }}>
                {loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <DataGrid
                        rows={roles}
                        columns={columns}
                        pageSizeOptions={[10, 15, 25]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        rowCount={totalRows}
                        paginationMode="server"
                        disableRowSelectionOnClick
                        sx={{
                            "& .MuiDataGrid-root": {
                                borderRadius: 1,
                            },
                        }}
                    />
                )}
            </Paper>
        </>
    );
}

// Componente página que solo renderiza en cliente
export default function RolesPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // No renderizar nada hasta que esté montado en cliente
    if (!isMounted) {
        return null;
    }

    return (
        <AppLayout>
            <RolesContent />
        </AppLayout>
    );
}
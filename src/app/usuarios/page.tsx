'use client';
import AppLayout from "@/components/layout/AppLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario, Usuario } from "@/lib/api/usuarios";
import { fetchAllRoles, RoleSimple } from "@/lib/api/roles";

interface FormState {
    name: string;
    email: string;
    password: string;
    role: string;
    estado: boolean;
}

const initialForm: FormState = {
    name: "",
    email: "",
    password: "",
    role: "",
    estado: true,
};

function UsuariosContent() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 10,
        page: 0,
    });
    const [totalRows, setTotalRows] = useState(0);
    const [allRoles, setAllRoles] = useState<RoleSimple[]>([]);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
    const [formData, setFormData] = useState<FormState>(initialForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const loadUsuarios = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchUsuarios(page);
            setUsuarios(response.data);
            setTotalRows(response.meta.total);
        } catch {
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsuarios(1);
        fetchAllRoles().then(setAllRoles).catch(() => {});
    }, []);

    useEffect(() => {
        if (paginationModel.page > 0) {
            loadUsuarios(paginationModel.page + 1);
        }
    }, [paginationModel.page]);

    const handleOpenCreate = () => {
        setFormData(initialForm);
        setFormError(null);
        setOpenCreate(true);
    };

    const handleOpenEdit = (usuario: Usuario) => {
        console.log("Editar usuario:", usuario);
        setSelectedUsuario(usuario);
        setFormData({
            name: usuario.name,
            email: usuario.email,
            password: "",
            role: usuario.roles.name,
            estado: usuario.estado,
        });
        setFormError(null);
        setOpenEdit(true);
    };

    const handleOpenDelete = (usuario: Usuario) => {
        setSelectedUsuario(usuario);
        setOpenDelete(true);
    };

    const handleCreate = async () => {
        setSaving(true);
        setFormError(null);
        try {
            await createUsuario({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                estado: formData.estado,
            });
            setOpenCreate(false);
            loadUsuarios(paginationModel.page + 1);
        } catch {
            setFormError("Error al crear el usuario. Verifica los datos.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedUsuario) return;
        setSaving(true);
        setFormError(null);
        try {
            const payload: Parameters<typeof updateUsuario>[1] = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                estado: formData.estado,
            };
            if (formData.password) payload.password = formData.password;
            await updateUsuario(selectedUsuario.id, payload);
            setOpenEdit(false);
            loadUsuarios(paginationModel.page + 1);
        } catch {
            setFormError("Error al actualizar el usuario. Verifica los datos.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUsuario) return;
        setSaving(true);
        try {
            await deleteUsuario(selectedUsuario.id);
            setOpenDelete(false);
            loadUsuarios(paginationModel.page + 1);
        } catch {
            setOpenDelete(false);
            setError("Error al eliminar el usuario.");
        } finally {
            setSaving(false);
        }
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 70, sortable: true },
        { field: "name", headerName: "Nombre", flex: 1, minWidth: 150, sortable: true },
        { field: "email", headerName: "Email", flex: 1, minWidth: 200, sortable: true },
        {
            field: "roles",
            headerName: "Roles",
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params) => {
                return <Chip label={params.value.name} size="small" />;
            }
        },
        {
            field: "estado",
            headerName: "Estado",
            width: 110,
            sortable: false,
            renderCell: (params) => (
                <Chip
                    label={params.value ? "Activo" : "Inactivo"}
                    color={params.value ? "success" : "error"}
                    size="small"
                />
            ),
        },
        {
            field: "actions",
            headerName: "Acciones",
            width: 110,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(params.row as Usuario)}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(params.row as Usuario)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <>
            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Usuarios
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Administra los usuarios del sistema
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Nuevo Usuario
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ height: 600, width: "100%" }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <DataGrid
                        rows={usuarios}
                        columns={columns}
                        pageSizeOptions={[10, 15, 25]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        rowCount={totalRows}
                        paginationMode="server"
                        disableRowSelectionOnClick
                        sx={{ "& .MuiDataGrid-root": { borderRadius: 1 } }}
                    />
                )}
            </Paper>

            {/* Dialog Crear */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nuevo Usuario</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                    {formError && <Alert severity="error">{formError}</Alert>}
                    <TextField
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        fullWidth
                        required
                    />
                    <FormControl fullWidth required>
                        <InputLabel>Rol</InputLabel>
                        <Select
                            value={formData.role}
                            label="Rol"
                            onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                        >
                            {allRoles.map((r) => (
                                <MenuItem key={r.id} value={r.name}>
                                    {r.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={formData.estado ? "true" : "false"}
                            label="Estado"
                            onChange={(e) => setFormData((p) => ({ ...p, estado: e.target.value === "true" }))}
                        >
                            <MenuItem value="true">Activo</MenuItem>
                            <MenuItem value="false">Inactivo</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)} disabled={saving}>Cancelar</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Editar */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
                    {formError && <Alert severity="error">{formError}</Alert>}
                    <TextField
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        fullWidth
                    />
                    <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        fullWidth
                    />
                    <TextField
                        label="Nueva Contraseña (opcional)"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        fullWidth
                    />
                    <FormControl fullWidth>
                        <InputLabel>Rol</InputLabel>
                        <Select
                            value={formData.role}
                            label="Rol"
                            onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                        >
                            {allRoles.map((r) => (
                                <MenuItem key={r.id} value={r.name}>
                                    {r.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={formData.estado ? "true" : "false"}
                            label="Estado"
                            onChange={(e) => setFormData((p) => ({ ...p, estado: e.target.value === "true" }))}
                        >
                            <MenuItem value="true">Activo</MenuItem>
                            <MenuItem value="false">Inactivo</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)} disabled={saving}>Cancelar</Button>
                    <Button variant="contained" onClick={handleEdit} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Eliminar */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Eliminar Usuario</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de eliminar al usuario <strong>{selectedUsuario?.name}</strong>? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)} disabled={saving}>Cancelar</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>
                        {saving ? <CircularProgress size={20} /> : "Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default function UsuariosPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <AppLayout>
            <UsuariosContent />
        </AppLayout>
    );
}

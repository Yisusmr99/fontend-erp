"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import apiClient from "@/lib/apiClient";
import { 
  Box, Typography, Paper, CircularProgress, Alert, Button, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Snackbar 
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

function ClientesContent() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ 
    pageSize: 15, 
    page: 0 
  });

  // Estados de Modales
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    nombres: "", apellidos: "", dpi: "", direccion: "", telefono: "", email: "" 
  });
  
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState({ open: false, texto: "", color: "success" as "success" | "error" });

  const showMsg = (texto: string, color: "success" | "error") => 
    setMensaje({ open: true, texto, color });

  // CARGAR CLIENTES (CON EL TOTAL CORREGIDO SEGÚN TU JSON)
  const loadClientes = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/clientes?page=${page + 1}&per_page=${pageSize}`);
      
      // La ruta exacta según tu respuesta es res.data.data
      const listado = res.data?.data?.clientes || [];
      // El total real que me mostraste (68) está en meta.total
      const total = res.data?.data?.meta?.total || 0;

      setClientes(listado);
      setTotalRows(Number(total));
    } catch (error) {
      showMsg("Error al cargar datos del servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes(paginationModel.page, paginationModel.pageSize);
  }, [paginationModel.page, paginationModel.pageSize]);

  // CREAR CLIENTE
  const handleCreate = async () => {
    setSaving(true);
    setFormError(null);
    
    const payload = {
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      dpi: formData.dpi,
      direccion: formData.direccion,
      telefono: formData.telefono,
      correo_electronico: formData.email,
      estado: true
    };

    try {
      await apiClient.post("/clientes", payload);
      setOpenCreate(false);
      showMsg("¡Cliente creado con éxito!", "success");
      loadClientes(paginationModel.page, paginationModel.pageSize);
    } catch (error: any) {
      console.error("Error backend:", error.response?.data);
      setFormError(error.response?.data?.message || "Error al crear. Verifica que el DPI no esté repetido.");
    } finally {
      setSaving(false);
    }
  };

  // EDITAR CLIENTE
  const handleEdit = async () => {
    if (!selectedCliente) return;
    setSaving(true);
    try {
      await apiClient.put(`/clientes/${selectedCliente.id}`, {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dpi: formData.dpi,
        direccion: formData.direccion,
        telefono: formData.telefono,
        correo_electronico: formData.email,
      });
      setOpenEdit(false);
      showMsg("Cliente actualizado", "success");
      loadClientes(paginationModel.page, paginationModel.pageSize);
    } catch (error: any) {
      setFormError("Error al actualizar datos.");
    } finally {
      setSaving(false);
    }
  };

  // ELIMINAR CLIENTE
  const handleDelete = async () => {
    if (!selectedCliente) return;
    setSaving(true);
    try {
      await apiClient.delete(`/clientes/${selectedCliente.id}`);
      setOpenDelete(false);
      showMsg("Cliente eliminado", "success");
      loadClientes(paginationModel.page, paginationModel.pageSize);
    } catch {
      showMsg("No se pudo eliminar el cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "dpi", headerName: "DPI", width: 140 },
    { 
      field: "nombre_completo", 
      headerName: "Nombre Completo", 
      flex: 1, 
      valueGetter: (p, row) => `${row.nombres || ''} ${row.apellidos || ''}` 
    },
    { field: "correo_electronico", headerName: "Email", flex: 1 },
    { field: "telefono", headerName: "Teléfono", width: 120 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 110,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => {
            setSelectedCliente(params.row);
            setFormData({
              nombres: params.row.nombres,
              apellidos: params.row.apellidos,
              dpi: params.row.dpi,
              direccion: params.row.direccion,
              telefono: params.row.telefono,
              email: params.row.correo_electronico
            });
            setOpenEdit(true);
          }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => { 
            setSelectedCliente(params.row); 
            setOpenDelete(true); 
          }}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight="bold">Gestión de Clientes</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => {
            setFormData({ nombres: "", apellidos: "", dpi: "", direccion: "", telefono: "", email: "" });
            setFormError(null);
            setOpenCreate(true);
          }}
        >
          Nuevo Cliente
        </Button>
      </Box>

<Paper sx={{ 
        height: 'calc(100vh - 200px)', // Reduje el descuento de 250 a 200 para que sea más alta
        width: "100%", 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 3, // Le da un toque de elevación más elegante
        borderRadius: 2
      }}>
        <DataGrid
          rows={clientes}
          columns={columns}
          loading={loading}
          rowCount={totalRows}
          pageSizeOptions={[5, 10, 15, 25, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          disableRowSelectionOnClick
          // Esto hace que las filas sean un poquito más altas y fáciles de leer
          getRowHeight={() => 'auto'} 
          getEstimatedRowHeight={() => 60}
          sx={{
            border: 'none',
            padding: 1,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5', // Un gris muy tenue para el encabezado
              color: '#333',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              padding: '12px 8px', // Más espacio interno en las celdas
            },
            '& .MuiDataGrid-main': { 
              overflow: 'auto' 
            },
          }}
        />
      </Paper>

      {/* MODAL CREAR */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField label="Nombres" fullWidth value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} />
          <TextField label="Apellidos" fullWidth value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} />
          <TextField label="DPI" fullWidth value={formData.dpi} onChange={(e) => setFormData({...formData, dpi: e.target.value})} />
          <TextField label="Dirección" fullWidth value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
          <TextField label="Teléfono" fullWidth value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
          <TextField label="Email" fullWidth value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField label="Nombres" fullWidth value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} />
          <TextField label="Apellidos" fullWidth value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} />
          <TextField label="DPI" fullWidth value={formData.dpi} onChange={(e) => setFormData({...formData, dpi: e.target.value})} />
          <TextField label="Dirección" fullWidth value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
          <TextField label="Teléfono" fullWidth value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
          <TextField label="Email" fullWidth value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEdit} disabled={saving}>Actualizar</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL ELIMINAR */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>¿Confirmar eliminación?</DialogTitle>
        <DialogContent>Esta acción no se puede deshacer.</DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={saving}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={mensaje.open} 
        autoHideDuration={4000} 
        onClose={() => setMensaje({ ...mensaje, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={mensaje.color} variant="filled" sx={{ width: '100%' }}>{mensaje.texto}</Alert>
      </Snackbar>
    </>
  );
}

export default function ClientesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <AppLayout><ClientesContent /></AppLayout>;
}
"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import apiClient from "@/lib/apiClient"; 
import { 
  Box, Typography, Paper, TextField, Button, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid, CircularProgress, Snackbar, Alert, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mensaje, setMensaje] = useState({ open: false, texto: "", color: "success" as "success" | "error" });

  // Estados para el Modal de Edición
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);

  // --- 1. CARGAR CLIENTES ---
  const cargarClientes = async () => {
    try {
      setFetching(true);
      const res = await apiClient.get("/clientes");
      const data = res.data?.data?.clientes || [];
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // --- 2. MANEJO DE ERRORES ---
  const procesarError = (error: any) => {
    if (error.response?.status === 422) {
      const errores = error.response.data.errors;
      return (Object.values(errores)[0] as string[])[0] || "Datos inválidos";
    }
    return error.response?.data?.message || "Ocurrió un error";
  };

  // --- 3. GUARDAR (CREAR) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      nombres: formData.get("nombres"),
      apellidos: formData.get("apellidos"),
      dpi: formData.get("dpi"),
      direccion: formData.get("direccion"),
      telefono: formData.get("telefono"),
      correo_electronico: formData.get("email"),
      estado: true,
    };

    try {
      await apiClient.post("/clientes", payload);
      setMensaje({ open: true, texto: "¡Cliente guardado!", color: "success" });
      (e.target as HTMLFormElement).reset();
      cargarClientes();
    } catch (error: any) {
      setMensaje({ open: true, texto: procesarError(error), color: "error" });
    } finally {
      setLoading(false);
    }
  };

  // --- 4. ACTUALIZAR (EDITAR) ---
  const handleEditClick = (cliente: any) => {
    setSelectedCliente(cliente);
    setOpenEdit(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      nombres: formData.get("nombres"),
      apellidos: formData.get("apellidos"),
      dpi: formData.get("dpi"),
      direccion: formData.get("direccion"),
      telefono: formData.get("telefono"),
      correo_electronico: formData.get("email"),
    };

    try {
      await apiClient.put(`/clientes/${selectedCliente.id}`, payload);
      setMensaje({ open: true, texto: "Cliente actualizado", color: "success" });
      setOpenEdit(false);
      cargarClientes();
    } catch (error: any) {
      setMensaje({ open: true, texto: procesarError(error), color: "error" });
    } finally {
      setLoading(false);
    }
  };

  // --- 5. ELIMINAR ---
  const eliminarCliente = async (id: number) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    try {
      await apiClient.delete(`/clientes/${id}`);
      setMensaje({ open: true, texto: "Cliente eliminado", color: "success" });
      cargarClientes();
    } catch (error: any) {
      setMensaje({ open: true, texto: procesarError(error), color: "error" });
    }
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Gestión de Clientes</Typography>
      </Box>

      {/* Formulario de Registro */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" /> Nuevo Cliente
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Nombres" name="nombres" size="small" required /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Apellidos" name="apellidos" size="small" required /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="DPI" name="dpi" size="small" required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Dirección" name="direccion" size="small" required /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Email" name="email" type="email" size="small" required /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Teléfono" name="telefono" size="small" required /></Grid>
            <Grid item xs={12} sx={{ textAlign: 'right' }}>
              <Button type="submit" variant="contained" disabled={loading}>Guardar</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><b>DPI</b></TableCell>
              <TableCell><b>Nombre</b></TableCell>
              <TableCell><b>Correo</b></TableCell>
              <TableCell align="center"><b>Acciones</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fetching ? (
              <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={20} /></TableCell></TableRow>
            ) : clientes.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.dpi}</TableCell>
                <TableCell>{c.nombres} {c.apellidos}</TableCell>
                <TableCell>{c.correo_electronico}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEditClick(c)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => eliminarCliente(c.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL DE EDICIÓN */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleUpdate}>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}><TextField fullWidth label="Nombres" name="nombres" defaultValue={selectedCliente?.nombres} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Apellidos" name="apellidos" defaultValue={selectedCliente?.apellidos} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="DPI" name="dpi" defaultValue={selectedCliente?.dpi} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Teléfono" name="telefono" defaultValue={selectedCliente?.telefono} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Dirección" name="direccion" defaultValue={selectedCliente?.direccion} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Email" name="email" defaultValue={selectedCliente?.correo_electronico} type="email" required /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loading}>Actualizar</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={mensaje.open} autoHideDuration={3000} onClose={() => setMensaje({ ...mensaje, open: false })}>
        <Alert severity={mensaje.color} variant="filled">{mensaje.texto}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
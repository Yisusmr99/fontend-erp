"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  fetchCuentas,
  createCuenta,
  updateCuenta,
  deleteCuenta,
} from "@/lib/api/cuentas";
import apiClient from "@/lib/apiClient";
import type {
  Cuenta,
  StoreCuentaPayload,
  UpdateCuentaPayload,
  TipoCuenta,
  Moneda,
  ClienteCuenta,
} from "@/lib/types/cuentas";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  MenuItem,
  Autocomplete,
  Chip,
  Divider,
  InputAdornment,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";

const TIPO_CUENTA_OPTIONS: { value: TipoCuenta; label: string }[] = [
  { value: "monetaria", label: "Monetaria" },
  { value: "ahorro", label: "Ahorro" },
  { value: "estudiantil", label: "Estudiantil" },
];

const MONEDA_OPTIONS: { value: Moneda; label: string }[] = [
  { value: "Q", label: "Quetzal (Q)" },
  { value: "$", label: "Dólar ($)" },
];

interface CreateFormData {
  id_cliente: number | null;
  numero_cuenta: string;
  saldo_disponible: string;
  tipo_cuenta: TipoCuenta;
  moneda: Moneda;
}

interface EditFormData {
  id_cliente: number | null;
  numero_cuenta: string;
  tipo_cuenta: TipoCuenta;
  moneda: Moneda;
  estado: boolean;
}

interface ClienteFormData {
  nombres: string;
  apellidos: string;
  dpi: string;
  direccion: string;
  telefono: string;
  correo_electronico: string;
}

const emptyCreateForm: CreateFormData = {
  id_cliente: null,
  numero_cuenta: "",
  saldo_disponible: "",
  tipo_cuenta: "monetaria",
  moneda: "Q",
};

const emptyEditForm: EditFormData = {
  id_cliente: null,
  numero_cuenta: "",
  tipo_cuenta: "monetaria",
  moneda: "Q",
  estado: true,
};

const emptyClienteForm: ClienteFormData = {
  nombres: "",
  apellidos: "",
  dpi: "",
  direccion: "",
  telefono: "",
  correo_electronico: "",
};

function CuentasContent() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 15,
    page: 0,
  });

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openCreateCliente, setOpenCreateCliente] = useState(false);

  const [selectedCuenta, setSelectedCuenta] = useState<Cuenta | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormData>({ ...emptyCreateForm });
  const [editForm, setEditForm] = useState<EditFormData>({ ...emptyEditForm });
  const [clienteForm, setClienteForm] = useState<ClienteFormData>({ ...emptyClienteForm });

  const [clientes, setClientes] = useState<ClienteCuenta[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [clienteFormError, setClienteFormError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState({
    open: false,
    texto: "",
    color: "success" as "success" | "error",
  });

  const showMsg = (texto: string, color: "success" | "error") =>
    setMensaje({ open: true, texto, color });

  const loadClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const res = await apiClient.get("/clientes/all");
      setClientes(res.data?.data || []);
    } catch {
      showMsg("Error al cargar clientes", "error");
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  const loadCuentas = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const result = await fetchCuentas(page + 1);
      setCuentas(result.data);
      setTotalRows(result.meta.total);
    } catch {
      showMsg("Error al cargar cuentas", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCuentas(paginationModel.page);
  }, [paginationModel.page, loadCuentas]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const handleCreate = async () => {
    if (!createForm.id_cliente) {
      setFormError("Debes seleccionar un cliente.");
      return;
    }
    const saldo = parseFloat(createForm.saldo_disponible);
    if (!saldo || saldo <= 0) {
      setFormError("El saldo disponible debe ser mayor a 0.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const payload: StoreCuentaPayload = {
      id_cliente: createForm.id_cliente,
      numero_cuenta: createForm.numero_cuenta,
      saldo_disponible: saldo,
      tipo_cuenta: createForm.tipo_cuenta,
      moneda: createForm.moneda,
    };
    try {
      await createCuenta(payload);
      setOpenCreate(false);
      showMsg("Cuenta creada con éxito", "success");
      loadCuentas(paginationModel.page);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Error al crear la cuenta. Verifica que el número de cuenta no esté repetido.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCuenta) return;
    setSaving(true);
    setFormError(null);
    const payload: UpdateCuentaPayload = {
      id_cliente: editForm.id_cliente ?? undefined,
      numero_cuenta: editForm.numero_cuenta,
      tipo_cuenta: editForm.tipo_cuenta,
      moneda: editForm.moneda,
      estado: editForm.estado,
    };
    try {
      await updateCuenta(selectedCuenta.id, payload);
      setOpenEdit(false);
      showMsg("Cuenta actualizada", "success");
      loadCuentas(paginationModel.page);
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Error al actualizar la cuenta.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCuenta) return;
    setSaving(true);
    try {
      await deleteCuenta(selectedCuenta.id);
      setOpenDelete(false);
      showMsg("Cuenta cerrada correctamente", "success");
      loadCuentas(paginationModel.page);
    } catch {
      showMsg("No se pudo cerrar la cuenta", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCliente = async () => {
    setSaving(true);
    setClienteFormError(null);
    try {
      const res = await apiClient.post("/clientes", {
        ...clienteForm,
        estado: true,
      });
      const nuevoCliente = res.data?.data;
      await loadClientes();
      if (nuevoCliente?.id) {
        setCreateForm((prev) => ({ ...prev, id_cliente: nuevoCliente.id }));
      }
      setOpenCreateCliente(false);
      showMsg("Cliente creado con éxito", "success");
    } catch (error: any) {
      setClienteFormError(
        error.response?.data?.message || "Error al crear cliente. Verifica que el DPI no esté repetido."
      );
    } finally {
      setSaving(false);
    }
  };

  const openCreateModal = () => {
    setCreateForm({ ...emptyCreateForm });
    setFormError(null);
    setOpenCreate(true);
  };

  const openEditModal = (cuenta: Cuenta) => {
    setSelectedCuenta(cuenta);
    setEditForm({
      id_cliente: cuenta.id_cliente,
      numero_cuenta: cuenta.numero_cuenta,
      tipo_cuenta: cuenta.tipo_cuenta,
      moneda: cuenta.moneda,
      estado: cuenta.estado,
    });
    setFormError(null);
    setOpenEdit(true);
  };

  const selectedCreateCliente = clientes.find((c) => c.id === createForm.id_cliente) ?? null;
  const selectedEditCliente = clientes.find((c) => c.id === editForm.id_cliente) ?? null;

  const columns: GridColDef[] = [
    { field: "numero_cuenta", headerName: "No. Cuenta", width: 160 },
    {
      field: "cliente_nombre",
      headerName: "Cliente",
      flex: 1,
      valueGetter: (_value, row) => {
        const c = row.cliente;
        return c ? `${c.nombres} ${c.apellidos}` : "—";
      },
    },
    {
      field: "tipo_cuenta",
      headerName: "Tipo",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === "monetaria"
              ? "primary"
              : params.value === "ahorro"
                ? "success"
                : "secondary"
          }
          variant="outlined"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      width: 90,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "saldo",
      headerName: "Saldo",
      width: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => {
        const n = parseFloat(value);
        return isNaN(n) ? "0.00" : n.toFixed(2);
      },
    },
    {
      field: "saldo_disponible",
      headerName: "Disponible",
      width: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => {
        const n = parseFloat(value);
        return isNaN(n) ? "0.00" : n.toFixed(2);
      },
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value ? "Activa" : "Cerrada"}
          size="small"
          color={params.value ? "success" : "default"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => openEditModal(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedCuenta(params.row);
              setOpenDelete(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalanceIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Gestión de Cuentas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateModal}
        >
          Nueva Cuenta
        </Button>
      </Box>

      <Paper
        sx={{
          height: "calc(100vh - 200px)",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <DataGrid
          rows={cuentas}
          columns={columns}
          loading={loading}
          rowCount={totalRows}
          pageSizeOptions={[5, 10, 15, 25, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          disableRowSelectionOnClick
          getRowHeight={() => "auto"}
          getEstimatedRowHeight={() => 60}
          sx={{
            border: "none",
            padding: 1,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              color: "#333",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              padding: "12px 8px",
            },
            "& .MuiDataGrid-main": {
              overflow: "auto",
            },
          }}
        />
      </Paper>

      {/* MODAL CREAR CUENTA */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Registrar Nueva Cuenta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <Autocomplete
                fullWidth
                options={clientes}
                loading={loadingClientes}
                value={selectedCreateCliente}
                onChange={(_e, value) =>
                  setCreateForm((prev) => ({ ...prev, id_cliente: value?.id ?? null }))
                }
                getOptionLabel={(opt) => `${opt.nombres} ${opt.apellidos} — ${opt.dpi}`}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" required />
                )}
                noOptionsText="No se encontraron clientes"
              />
              <Button
                variant="outlined"
                sx={{ minWidth: 48, height: 56 }}
                onClick={() => {
                  setClienteForm({ ...emptyClienteForm });
                  setClienteFormError(null);
                  setOpenCreateCliente(true);
                }}
                title="Crear nuevo cliente"
              >
                <PersonAddIcon />
              </Button>
            </Box>

            <TextField
              label="Número de Cuenta"
              fullWidth
              required
              value={createForm.numero_cuenta}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, numero_cuenta: e.target.value }))
              }
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                label="Tipo de Cuenta"
                fullWidth
                required
                value={createForm.tipo_cuenta}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    tipo_cuenta: e.target.value as TipoCuenta,
                  }))
                }
              >
                {TIPO_CUENTA_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Moneda"
                fullWidth
                value={createForm.moneda}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    moneda: e.target.value as Moneda,
                  }))
                }
              >
                {MONEDA_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Saldo Disponible"
              type="number"
              fullWidth
              required
              value={createForm.saldo_disponible}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  saldo_disponible: e.target.value,
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{createForm.moneda}</InputAdornment>
                ),
              }}
              inputProps={{ min: 0.01, step: "0.01" }}
              helperText="Debe ser mayor a 0. El saldo inicial se asignará automáticamente."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL EDITAR CUENTA */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Cuenta</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <Autocomplete
                fullWidth
                options={clientes}
                loading={loadingClientes}
                value={selectedEditCliente}
                onChange={(_e, value) =>
                  setEditForm((prev) => ({ ...prev, id_cliente: value?.id ?? null }))
                }
                getOptionLabel={(opt) => `${opt.nombres} ${opt.apellidos} — ${opt.dpi}`}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" required />
                )}
                noOptionsText="No se encontraron clientes"
              />
              <Button
                variant="outlined"
                sx={{ minWidth: 48, height: 56 }}
                onClick={() => {
                  setClienteForm({ ...emptyClienteForm });
                  setClienteFormError(null);
                  setOpenCreateCliente(true);
                }}
                title="Crear nuevo cliente"
              >
                <PersonAddIcon />
              </Button>
            </Box>

            <TextField
              label="Número de Cuenta"
              fullWidth
              required
              value={editForm.numero_cuenta}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, numero_cuenta: e.target.value }))
              }
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                label="Tipo de Cuenta"
                fullWidth
                value={editForm.tipo_cuenta}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    tipo_cuenta: e.target.value as TipoCuenta,
                  }))
                }
              >
                {TIPO_CUENTA_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Moneda"
                fullWidth
                value={editForm.moneda}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    moneda: e.target.value as Moneda,
                  }))
                }
              >
                {MONEDA_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              select
              label="Estado"
              fullWidth
              value={editForm.estado ? "1" : "0"}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, estado: e.target.value === "1" }))
              }
            >
              <MenuItem value="1">Activa</MenuItem>
              <MenuItem value="0">Cerrada</MenuItem>
            </TextField>

            <Divider sx={{ my: 1 }}>Información de la cuenta</Divider>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Saldo"
                fullWidth
                value={
                  selectedCuenta
                    ? `${selectedCuenta.moneda} ${parseFloat(String(selectedCuenta.saldo)).toFixed(2)}`
                    : ""
                }
                slotProps={{ input: { readOnly: true } }}
              />
              <TextField
                label="Saldo Disponible"
                fullWidth
                value={
                  selectedCuenta
                    ? `${selectedCuenta.moneda} ${parseFloat(String(selectedCuenta.saldo_disponible)).toFixed(2)}`
                    : ""
                }
                slotProps={{ input: { readOnly: true } }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Fecha de Apertura"
                fullWidth
                value={
                  selectedCuenta?.fecha_apertura
                    ? new Date(selectedCuenta.fecha_apertura).toLocaleDateString()
                    : "—"
                }
                slotProps={{ input: { readOnly: true } }}
              />
              <TextField
                label="Fecha de Cierre"
                fullWidth
                value={
                  selectedCuenta?.fecha_cierre
                    ? new Date(selectedCuenta.fecha_cierre).toLocaleDateString()
                    : "—"
                }
                slotProps={{ input: { readOnly: true } }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleEdit} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : "Actualizar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL CERRAR CUENTA */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>¿Cerrar cuenta?</DialogTitle>
        <DialogContent>
          <Typography>
            Se cerrará la cuenta{" "}
            <strong>{selectedCuenta?.numero_cuenta}</strong>. El estado cambiará
            a inactivo y se registrará la fecha de cierre.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Cerrar Cuenta"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL CREAR CLIENTE RÁPIDO */}
      <Dialog
        open={openCreateCliente}
        onClose={() => setOpenCreateCliente(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Cliente</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          {clienteFormError && (
            <Alert severity="error">{clienteFormError}</Alert>
          )}
          <Divider sx={{ mb: 1 }}>Datos del Cliente</Divider>
          <TextField
            label="Nombres"
            fullWidth
            required
            value={clienteForm.nombres}
            onChange={(e) =>
              setClienteForm((prev) => ({ ...prev, nombres: e.target.value }))
            }
          />
          <TextField
            label="Apellidos"
            fullWidth
            required
            value={clienteForm.apellidos}
            onChange={(e) =>
              setClienteForm((prev) => ({ ...prev, apellidos: e.target.value }))
            }
          />
          <TextField
            label="DPI"
            fullWidth
            required
            value={clienteForm.dpi}
            onChange={(e) =>
              setClienteForm((prev) => ({ ...prev, dpi: e.target.value }))
            }
          />
          <TextField
            label="Dirección"
            fullWidth
            value={clienteForm.direccion}
            onChange={(e) =>
              setClienteForm((prev) => ({ ...prev, direccion: e.target.value }))
            }
          />
          <TextField
            label="Teléfono"
            fullWidth
            value={clienteForm.telefono}
            onChange={(e) =>
              setClienteForm((prev) => ({ ...prev, telefono: e.target.value }))
            }
          />
          <TextField
            label="Correo Electrónico"
            fullWidth
            type="email"
            value={clienteForm.correo_electronico}
            onChange={(e) =>
              setClienteForm((prev) => ({
                ...prev,
                correo_electronico: e.target.value,
              }))
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreateCliente(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateCliente}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Crear Cliente"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={mensaje.open}
        autoHideDuration={4000}
        onClose={() => setMensaje((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={mensaje.color}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {mensaje.texto}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function CuentasPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <AppLayout>
      <CuentasContent />
    </AppLayout>
  );
}

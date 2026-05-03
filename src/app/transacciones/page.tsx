"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import apiClient from "@/lib/apiClient";
import { 
  Box, Typography, Paper, CircularProgress, Alert, Button, 
  TextField, Snackbar, Grid, Card, CardContent, Divider,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Select, MenuItem, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Search as SearchIcon, ReceiptLong as ReceiptIcon } from "@mui/icons-material";

function TransaccionesContent() {
  const [tipoTransaccion, setTipoTransaccion] = useState<"deposito" | "retiro">("deposito");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [monto, setMonto] = useState("");
  const [referencia, setReferencia] = useState("");
  const [moneda, setMoneda] = useState("Q");
  const [cuentaInfo, setCuentaInfo] = useState<any>(null);
  const [comprobante, setComprobante] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mensaje, setMensaje] = useState({ open: false, texto: "", color: "success" as "success" | "error" });

  const showMsg = (texto: string, color: "success" | "error") => setMensaje({ open: true, texto, color });

  const handleBuscarCuenta = async () => {
    if (!numeroCuenta) return;
    setLoadingSearch(true);
    try {
      const res = await apiClient.get(`/cuentas/search/${numeroCuenta}`);
      if (res.data?.status) setCuentaInfo(res.data.data);
      else showMsg("Cuenta no encontrada.", "error");
    } catch { showMsg("Error al buscar la cuenta.", "error"); }
    finally { setLoadingSearch(false); }
  };

  const handleTransaccion = async () => {
    if (!cuentaInfo || !monto) return;
    setProcessing(true);

    const payload = {
      tipo_transaccion: tipoTransaccion,
      [tipoTransaccion === 'deposito' ? 'id_cuenta_destino' : 'id_cuenta_origen']: cuentaInfo.id,
      monto: parseFloat(monto),
      referencia: referencia || `${tipoTransaccion === 'deposito' ? 'Depósito' : 'Retiro'} en caja`,
      moneda: moneda 
    };

    try {
      const res = await apiClient.post("/transacciones", payload);
      if (res.data?.status) {
        setComprobante({ ...res.data.data, moneda: moneda });
        setOpenModal(true);
        setMonto(""); setReferencia(""); setCuentaInfo(null); setNumeroCuenta("");
      }
    } catch (error: any) {
      showMsg(error.response?.data?.message || "Error al procesar la transacción", "error");
    } finally { setProcessing(false); }
  };

  // Función para abrir comprobante en nueva ventana
  const handleImprimir = () => {
    const ventana = window.open("", "_blank", "width=600,height=600");
    if (ventana) {
      ventana.document.write(`
        <html>
          <head><title>Comprobante Derbancks</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <div style="text-align: center;">
              <h1>Comprobante Derbancks</h1>
              <p>-----------------------------------</p>
            </div>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date().toLocaleTimeString()}</p>
            <p><strong>Transacción:</strong> ${comprobante.tipo_transaccion.toUpperCase()}</p>
            <p><strong>Monto:</strong> ${comprobante.moneda} ${parseFloat(comprobante.monto).toFixed(2)}</p>
            <p><strong>Referencia:</strong> ${comprobante.referencia}</p>
            <p><strong>ID Aut:</strong> #${comprobante.id}</p>
            <p><strong>Estado:</strong> ${comprobante.estado.toUpperCase()}</p>
            <script>window.print();</script>
          </body>
        </html>
      `);
      ventana.document.close();
    }
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Operaciones de Caja</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel>¿Qué desea realizar?</FormLabel>
              <RadioGroup row value={tipoTransaccion} onChange={(e) => { setTipoTransaccion(e.target.value as any); setCuentaInfo(null); }}>
                <FormControlLabel value="deposito" control={<Radio />} label="Depositar" />
                <FormControlLabel value="retiro" control={<Radio />} label="Retirar" />
              </RadioGroup>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Número de Cuenta" fullWidth value={numeroCuenta} onChange={(e) => setNumeroCuenta(e.target.value)} />
              <Button variant="contained" onClick={handleBuscarCuenta} disabled={loadingSearch}>{loadingSearch ? <CircularProgress size={24}/> : <SearchIcon />}</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {cuentaInfo && (
            <Card sx={{ borderTop: '4px solid #2e7d32' }}>
              <CardContent>
                <Typography variant="h6">Titular: {cuentaInfo.cliente?.nombres} {cuentaInfo.cliente?.apellidos}</Typography>
                <TextField label="Monto" type="number" fullWidth sx={{ my: 2 }} value={monto} onChange={(e) => setMonto(e.target.value)} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Moneda</InputLabel>
                  <Select value={moneda} onChange={(e) => setMoneda(e.target.value)}>
                    <MenuItem value="Q">Quetzales (Q)</MenuItem>
                    <MenuItem value="$">Dólares ($)</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" color="success" fullWidth onClick={handleTransaccion} disabled={processing}>
                  {processing ? "Procesando..." : `Procesar ${tipoTransaccion.toUpperCase()}`}
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* COMPROBANTE BANCARIO */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        {/* Cambiado component a 'div' para evitar el error de h6 dentro de h2 */}
        <DialogTitle component="div" sx={{ textAlign: 'center', bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          <ReceiptIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
          <Typography variant="h6">Comprobante Derbancks</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {comprobante && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2"><strong>Fecha:</strong> {new Date().toLocaleDateString()}</Typography>
              <Typography variant="body2"><strong>Hora:</strong> {new Date().toLocaleTimeString()}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1"><strong>Transacción:</strong> {comprobante.tipo_transaccion.toUpperCase()}</Typography>
              <Typography variant="body1"><strong>Monto:</strong> {comprobante.moneda} {parseFloat(comprobante.monto).toFixed(2)}</Typography>
              <Typography variant="body2"><strong>Referencia:</strong> {comprobante.referencia}</Typography>
              <Typography variant="body2"><strong>ID Aut:</strong> #{comprobante.id}</Typography>
              <Typography variant="body2"><strong>Estado:</strong> {comprobante.estado.toUpperCase()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
          <Button onClick={handleImprimir} color="primary" variant="outlined" fullWidth>
            Imprimir Comprobante
          </Button>
          <Button onClick={() => setOpenModal(false)} color="success" variant="contained" fullWidth>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={mensaje.open} autoHideDuration={5000} onClose={() => setMensaje({ ...mensaje, open: false })}>
        <Alert severity={mensaje.color}>{mensaje.texto}</Alert>
      </Snackbar>
    </>
  );
}

export default function TransaccionesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <AppLayout><TransaccionesContent /></AppLayout>;
}
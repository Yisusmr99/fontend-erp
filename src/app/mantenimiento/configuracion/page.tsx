import AppLayout from "@/components/layout/AppLayout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import SettingsIcon from "@mui/icons-material/Settings";

export default function ConfiguracionPage() {
  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Configuración
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administra las configuraciones generales del sistema
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 6,
          borderRadius: 2,
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <SettingsIcon sx={{ fontSize: 56, color: "text.disabled" }} />
        <Typography variant="h6" color="text.secondary">
          Módulo en construcción
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Próximamente encontrarás aquí las opciones de configuración.
        </Typography>
      </Paper>
    </AppLayout>
  );
}

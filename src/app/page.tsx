import AppLayout from "@/components/layout/AppLayout";
import { Box, Typography, Paper, Grid } from "@mui/material";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
    </Paper>
  );
}

export default function Home() {
  return (
    <AppLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bienvenido al sistema de gestión Derbancks
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Usuarios activos" value="128" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Módulos disponibles" value="6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Sesiones hoy" value="34" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Alertas pendientes" value="3" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Contenido del módulo principal
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </AppLayout>
  );
}

'use client';

import { signOut } from 'next-auth/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function SinAccesoPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440, textAlign: 'center' }} elevation={3}>
        <CardContent sx={{ p: 5 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 36, color: 'error.contrastText' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Sin acceso
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Tu cuenta no tiene permisos para acceder al sistema. Comunícate con el administrador si crees que esto es un error.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

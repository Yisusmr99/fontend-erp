'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ModeSwitch from '../ModeSwitch';
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from './Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/v1';

interface TopBarProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function TopBar({ sidebarOpen, onMenuClick }: TopBarProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
    } catch {
      // Si falla el backend igual cerramos la sesión local
    }
    await signOut({ callbackUrl: '/login' });
  };

  const userInitials = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : '?';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED}px)`,
        ml: `${sidebarOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED}px`,
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: sidebarOpen
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, color: 'primary.main' }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <ModeSwitch />

        <IconButton sx={{ mr: 0.5, color: 'text.secondary' }}>
          <Badge badgeContent={3} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton onClick={handleAvatarClick} size="small" sx={{ ml: 0.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 16 }}>
            {userInitials}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { elevation: 3, sx: { minWidth: 200, mt: 0.5 } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {session?.user?.name ?? '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {session?.user?.email ?? '—'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" color="primary" />
            </ListItemIcon>
            Perfil
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

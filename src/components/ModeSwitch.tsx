'use client';

import { useColorScheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function ModeSwitch() {
  const { mode, setMode } = useColorScheme();

  return (
    <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
      <IconButton color="inherit" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

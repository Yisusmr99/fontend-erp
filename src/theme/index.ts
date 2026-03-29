import { createTheme } from '@mui/material/styles';

// Derbancks brand palette — teal primary, amber secondary, deep navy accents
const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0097A7',   // teal 700
          light: '#26C6DA',  // teal 400
          dark: '#006978',   // teal 900
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#F5A000',   // amber — matches logo arrows
          light: '#FFB833',
          dark: '#C27700',
          contrastText: '#ffffff',
        },
        background: {
          default: '#EFF8F9',
          paper: '#ffffff',
        },
        divider: '#B2DFE4',
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#26C6DA',   // teal 400 — brighter on dark BG
          light: '#4DD0DC',
          dark: '#0097A7',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#F5A000',
          light: '#FFB833',
          dark: '#C27700',
          contrastText: '#ffffff',
        },
        background: {
          default: '#071518',  // deep teal-navy
          paper: '#0C2226',
        },
        divider: '#153840',
      },
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          marginBottom: 2,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: '#B2DFE4',
        },
      },
    },
  },
});

export default theme;

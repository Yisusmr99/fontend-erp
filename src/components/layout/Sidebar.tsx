'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

export const DRAWER_WIDTH = 240;
export const DRAWER_WIDTH_COLLAPSED = 64;

const LOGO_HEIGHT = 44;

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/',
  },
    {
    label: 'Transacciones',
    icon: <CurrencyExchangeIcon />,
    href: '/transacciones',
  },
  {
  label: 'Clientes',
  icon: <PeopleIcon />,
  href: '/clientes',
  },
  {
    label: 'Cuentas',
    icon: <AccountBalanceIcon />,
    href: '/cuentas',
    },
  {
    label: 'Atención al cliente',
    icon: <SupportAgentIcon />,
    href: '/atencion-cliente',
  },
  {
    label: 'Usuarios',
    icon: <PeopleIcon />,
    href: '/usuarios',
  },
  {
    label: 'Mantenimiento',
    icon: <BuildIcon />,
    children: [
      { label: 'Roles', href: '/mantenimiento/roles' },
      { label: 'Configuración', href: '/mantenimiento/configuracion' },
      { label: 'Parámetros', href: '/mantenimiento/parametros' },
    ],
  },
];

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>(() =>
    NAV_ITEMS.filter((item) =>
      item.children?.some((c) => pathname.startsWith(c.href))
    ).map((item) => item.label)
  );

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: open
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
        },
      }}
    >
      {/* Logo header */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center',
          px: open ? 2 : 1,
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {/* {open ? (
          <Image
            src="/img/logo.png"
            alt="Derbancks"
            width={180}
            height={LOGO_HEIGHT}
            priority
            style={{ objectFit: 'contain', objectPosition: 'left center', display: 'block' }}
          />
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}
            >
              D
            </Typography>
          </Box>
        )} */}
      </Box>

      <Divider />

      <List component="nav" sx={{ px: 1, pt: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isExpanded = expandedItems.includes(item.label);
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : item.href
              ? pathname.startsWith(item.href)
              : false;
          const hasChildActive = item.children?.some((c) => pathname.startsWith(c.href)) ?? false;
          const highlighted = isActive || hasChildActive;

          return (
            <div key={item.label}>
              <Tooltip title={!open ? item.label : ''} placement="right">
                <ListItemButton
                  selected={highlighted}
                  onClick={() => {
                    if (item.children) {
                      toggleExpand(item.label);
                    } else if (item.href) {
                      router.push(item.href);
                    }
                  }}
                  sx={{
                    minHeight: 44,
                    px: 1.5,
                    justifyContent: open ? 'initial' : 'center',
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : 'auto',
                      justifyContent: 'center',
                      color: highlighted ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <>
                      <ListItemText primary={item.label} />
                      {item.children &&
                        (isExpanded ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        ))}
                    </>
                  )}
                </ListItemButton>
              </Tooltip>

              {item.children && open && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 1 }}>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.href}
                        selected={pathname === child.href}
                        onClick={() => router.push(child.href)}
                        sx={{
                          pl: 3,
                          minHeight: 38,
                          mb: 0.5,
                          '&.Mui-selected': {
                            bgcolor: 'secondary.main',
                            color: 'secondary.contrastText',
                            '&:hover': { bgcolor: 'secondary.dark' },
                          },
                        }}
                      >
                        <ListItemText
                          primary={child.label}
                          slotProps={{ primary: { variant: 'body2' } }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          );
        })}
      </List>
    </Drawer>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AddCircleOutline as CaptureIcon,
  Search as AuditIcon,
  Logout as LogoutIcon,
  Dashboard,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { employeeId, logout, permissions } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { 
      text: 'Menu', 
      icon: <Dashboard />, 
      path: '/dashboard',
      permission: 'capture'
    },
    { 
      text: 'Capturar', 
      icon: <CaptureIcon />, 
      path: '/dashboard/capture',
      permission: 'capture'
    },
    { 
      text: 'Auditar', 
      icon: <AuditIcon />, 
      path: '/dashboard/auditar',
      permission: 'audit'
    }
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
        <Box 
          sx={{ 
            width: 120, 
            height: 120, 
            position: 'relative',
            mb: -5,
            mt: -5
          }}
        >
          <Image
            src="/tristone.png"
            alt="Tristone Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Box>

      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const hasPermission = permissions.includes(item.permission);
          return (
            <ListItem key={item.text} disablePadding>
              <Tooltip 
                title={!hasPermission ? "No tiene permiso para acceder a esta función" : ""}
                placement="right"
              >
                <span>
                  <ListItemButton
                    selected={pathname === item.path}
                    onClick={() => hasPermission && router.push(item.path)}
                    disabled={!hasPermission}
                    sx={{
                      opacity: hasPermission ? 1 : 0.5,
                      '&.Mui-disabled': {
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </span>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              ID: {employeeId}
            </Typography>
            <Button
              color="inherit"
              onClick={logout}
              startIcon={<LogoutIcon />}
            >
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 
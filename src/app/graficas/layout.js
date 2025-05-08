'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function GraphsLayout({ children }) {
  const router = useRouter();
  const { employeeId, logout } = useAuth();
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            mr: 2,
            display: 'flex',
            alignItems: 'center'
          }}>
            <img
              src="/tristone.png"
              alt="Tristone Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Inventario Físico
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            ID: {employeeId}
          </Typography>
          <Button
            color="inherit"
            onClick={() => router.push('/dashboard')}
            sx={{ mr: 1 }}
          >
            Dashboard
          </Button>
          <IconButton
            color="inherit"
            onClick={logout}
            edge="end"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.primary.light}05 100%)`,
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 
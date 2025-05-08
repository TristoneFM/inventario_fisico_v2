'use client';

import { useState } from 'react';

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';

export default function GraphsLayout({ children }) {

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
          </Box>
   
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
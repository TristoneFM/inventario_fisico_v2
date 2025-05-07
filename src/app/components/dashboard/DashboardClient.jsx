'use client';

import { Typography, Grid, Button, Box, Tooltip } from '@mui/material';
import { AddCircleOutline as CaptureIcon, Search as AuditIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function DashboardClient() {
  const router = useRouter();
  const { permissions } = useAuth();

  const hasCapturePermission = permissions.includes('capture');
  const hasAuditPermission = permissions.includes('audit');

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sistema de Inventario Físico
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Seleccione una acción para comenzar
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Tooltip 
            title={!hasCapturePermission ? "No tiene permiso para capturar inventario" : ""}
            placement="top"
          >
            <span>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => hasCapturePermission && router.push('/dashboard/capture')}
                disabled={!hasCapturePermission}
                sx={{
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  opacity: hasCapturePermission ? 1 : 0.5,
                  '&:hover': {
                    backgroundColor: hasCapturePermission ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)',
                  },
                  '&.Mui-disabled': {
                    pointerEvents: 'none',
                  },
                }}
              >
                <CaptureIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                <Typography variant="h5" color="primary">
                  Capturar Inventario
                </Typography>
              </Button>
            </span>
          </Tooltip>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Tooltip 
            title={!hasAuditPermission ? "No tiene permiso para auditar inventario" : ""}
            placement="top"
          >
            <span>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => hasAuditPermission && router.push('/dashboard/auditar')}
                disabled={!hasAuditPermission}
                sx={{
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  opacity: hasAuditPermission ? 1 : 0.5,
                  '&:hover': {
                    backgroundColor: hasAuditPermission ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.1)',
                  },
                  '&.Mui-disabled': {
                    pointerEvents: 'none',
                  },
                }}
              >
                <AuditIcon sx={{ fontSize: 60, color: 'secondary.main' }} />
                <Typography variant="h5" color="secondary">
                  Auditar Inventario
                </Typography>
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
} 
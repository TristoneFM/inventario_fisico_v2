'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Grid,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';

// Colors for plantas - will cycle through these
const plantaColors = [
  { color: 'rgba(76, 175, 80, 0.50)', hoverColor: 'rgba(76, 175, 80, 0.4)' },    // Green
  { color: 'rgba(25, 118, 210, 0.50)', hoverColor: 'rgba(25, 118, 210, 0.4)' },  // Blue
  { color: 'rgba(255, 152, 0, 0.50)', hoverColor: 'rgba(255, 152, 0, 0.4)' },    // Orange
  { color: 'rgba(156, 39, 176, 0.50)', hoverColor: 'rgba(156, 39, 176, 0.4)' },  // Purple
  { color: 'rgba(0, 188, 212, 0.50)', hoverColor: 'rgba(0, 188, 212, 0.4)' },    // Cyan
  { color: 'rgba(244, 67, 54, 0.50)', hoverColor: 'rgba(244, 67, 54, 0.4)' },    // Red
  { color: 'rgba(255, 193, 7, 0.50)', hoverColor: 'rgba(255, 193, 7, 0.4)' },    // Amber
  { color: 'rgba(96, 125, 139, 0.50)', hoverColor: 'rgba(96, 125, 139, 0.4)' },  // Blue Grey
];

export default function PlantaSelectionClient() {
  const router = useRouter();
  const [plantas, setPlantas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlantas();
  }, []);

  const fetchPlantas = async () => {
    try {
      const response = await fetch('/api/plantas');
      const result = await response.json();

      if (result.success) {
        setPlantas(result.data);
      } else {
        setError(result.error || 'Error al cargar las plantas');
      }
    } catch (error) {
      console.error('Error fetching plantas:', error);
      setError('Error de conexión al cargar las plantas');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlantaColor = (index) => {
    return plantaColors[index % plantaColors.length];
  };

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Cargando plantas...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchPlantas}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Seleccionar Planta
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Elija la planta donde desea capturar el inventario
      </Typography>

      {plantas.length === 0 ? (
        <Alert severity="info">
          No se encontraron plantas configuradas. Por favor, verifique la tabla ubicaciones_conteo.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {plantas.map((planta, index) => {
            const colors = getPlantaColor(index);
            return (
              <Grid item xs={12} sm={6} md={4} key={planta}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => router.push(`/dashboard/capture/${encodeURIComponent(planta)}`)}
                  sx={{
                    height: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    backgroundColor: colors.color,
                    '&:hover': {
                      backgroundColor: colors.hoverColor,
                    },
                  }}
                >
                  <FactoryIcon sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{ color: 'inherit' }}>
                    {planta}
                  </Typography>
                </Button>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

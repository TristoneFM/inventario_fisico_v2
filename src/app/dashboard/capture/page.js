'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Grid,
  Button,
  Paper,
  Box,
} from '@mui/material';

// Mock data for areas
const areas = [
  { id: 'terminado', name: 'Terminado', color: 'rgba(76, 175, 80, 0.50)', hoverColor: 'rgba(76, 175, 80, 0.4)' }, // Green
  { id: 'vulcanizado', name: 'Vulcanizado', color: 'rgba(25, 118, 210, 0.50)', hoverColor: 'rgba(25, 118, 210, 0.4)' }, // Blue
  { id: 'materia-prima', name: 'Materia Prima', color: 'rgba(255, 152, 0, 0.50)', hoverColor: 'rgba(255, 152, 0, 0.4)' }, // Orange
  { id: 'extrusion', name: 'Extrusión', color: 'rgba(156, 39, 176, 0.50)', hoverColor: 'rgba(156, 39, 176, 0.4)' }, // Purple
  { id: 'subensamble', name: 'Subensamble', color: 'rgba(0, 188, 212, 0.50)', hoverColor: 'rgba(0, 188, 212, 0.4)' }, // Cyan
];

export default function AreaSelectionPage() {
  const router = useRouter();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Seleccionar Área
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Elija el área donde desea capturar el inventario
      </Typography>

      <Grid container spacing={3}>
        {areas.map((area) => (
          <Grid item xs={12} sm={6} md={4} key={area.id}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => router.push(`/dashboard/capture/${area.id}`)}
              sx={{
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                backgroundColor: area.color,
                '&:hover': {
                  backgroundColor: area.hoverColor,
                },
              }}
            >
              <Typography variant="h6" sx={{ color: 'inherit' }}>
                {area.name}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 
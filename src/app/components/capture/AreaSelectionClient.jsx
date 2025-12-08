'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Typography,
  Grid,
  Button,
  Box,
  Breadcrumbs,
  Link,
} from '@mui/material';

// All available areas
const allAreas = [
  { id: 'terminado', name: 'Terminado', color: 'rgba(76, 175, 80, 0.50)', hoverColor: 'rgba(76, 175, 80, 0.4)' }, // Green
  { id: 'vulcanizado', name: 'Vulcanizado', color: 'rgba(25, 118, 210, 0.50)', hoverColor: 'rgba(25, 118, 210, 0.4)' }, // Blue
  { id: 'materia-prima', name: 'Materia Prima', color: 'rgba(255, 152, 0, 0.50)', hoverColor: 'rgba(255, 152, 0, 0.4)' }, // Orange
  { id: 'extrusion', name: 'Extrusión', color: 'rgba(156, 39, 176, 0.50)', hoverColor: 'rgba(156, 39, 176, 0.4)' }, // Purple
  { id: 'subensamble', name: 'Subensamble', color: 'rgba(0, 188, 212, 0.50)', hoverColor: 'rgba(0, 188, 212, 0.4)' }, // Cyan
];

export default function AreaSelectionClient() {
  const router = useRouter();
  const { planta } = useParams();
  const decodedPlanta = decodeURIComponent(planta);

  // Filter areas based on selected planta
  const areas = useMemo(() => {
    // If planta is FEDERAL, only show Materia Prima
    if (decodedPlanta.toUpperCase() === 'FEDERAL') {
      return allAreas.filter(area => area.id === 'materia-prima');
    }
    // Otherwise show all areas
    return allAreas;
  }, [decodedPlanta]);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push('/dashboard/capture')}
          sx={{ textDecoration: 'none' }}
        >
          Plantas
        </Link>
        <Typography color="text.primary">{decodedPlanta}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        Seleccionar Área
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Planta: <strong>{decodedPlanta}</strong>
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
              onClick={() => router.push(`/dashboard/capture/${encodeURIComponent(planta)}/${area.id}`)}
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
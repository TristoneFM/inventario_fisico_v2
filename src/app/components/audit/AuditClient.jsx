'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const areaColorMap = [
  {
    id: 'terminado',
    color: 'rgba(76, 175, 79, 0.50)',
    hoverColor: 'rgba(76, 175, 80, 0.4)',
  }, // Green
  {
    id: 'vulcanizado',
    color: 'rgba(25, 118, 210, 0.50)',
    hoverColor: 'rgba(25, 118, 210, 0.4)',
  }, // Blue
  {
    id: 'materia-prima',
    color: 'rgba(255, 153, 0, 0.50)',
    hoverColor: 'rgba(255, 152, 0, 0.4)',
  }, // Orange
  {
    id: 'extrusion',
    color: 'rgba(155, 39, 176, 0.50)',
    hoverColor: 'rgba(156, 39, 176, 0.4)',
  }, // Purple
  {
    id: 'subensamble',
    color: 'rgba(0, 187, 212, 0.50)',
    hoverColor: 'rgba(0, 188, 212, 0.4)',
  }, // Cyan
];

const areaNameMap = {
  mp: 'Materia Prima',
  green: 'Extrusion',
  terminado: 'Terminado',
  vulcanizado: 'Vulcanizado',
  subensamble: 'Subensamble',
};

export default function AuditClient() {
  const [areas, setAreas] = useState([]);
  const [racks, setRacks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchAuditoriaData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auditoria', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();

      const areasMap = new Map();
      data.forEach((record) => {
        if (!areasMap.has(record.area_ubicacion)) {
          areasMap.set(record.area_ubicacion, new Map());
        }
        areasMap.get(record.area_ubicacion).set(
          record.id_ubicacion,
          record.estado_auditoria
        );
      });

      const areasArray = Array.from(areasMap.keys()).sort();
      const racksByArea = {};

      areasArray.forEach((area) => {
        const racksMap = areasMap.get(area);
        racksByArea[area] = Array.from(racksMap.entries()).sort(
          ([a], [b]) => a.localeCompare(b, undefined, { numeric: true })
        );
      });

      setAreas(areasArray);
      setRacks(racksByArea);
    } catch (error) {
      console.error('Error fetching auditoria data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset states first
    setAreas([]);
    setRacks({});
    fetchAuditoriaData();

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchAuditoriaData, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchAuditoriaData]);

  const handleRackClick = useCallback((rackId) => {
    router.push(`/dashboard/auditar/${rackId}`);
  }, [router]);

  const totalRacks = Object.values(racks).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const totalAudited = Object.values(racks).reduce(
    (sum, arr) => sum + arr.filter(([_, estado]) => estado === 1).length,
    0
  );
  const globalPercentage =
    totalRacks > 0 ? (totalAudited / totalRacks) * 100 : 0;

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Auditoría de Racks
      </Typography>

      {/* 🌐 Global Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Progreso General: {Math.round(globalPercentage)}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={globalPercentage}
          sx={{
            height: 16,
            borderRadius: 8,
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4caf50',
            },
            backgroundColor: '#e0e0e0',
          }}
        />
      </Box>

      {areas.map((area) => {
        const areaColors =
          areaColorMap.find((a) => a.id === area.toLowerCase()) || {
            color: 'rgba(158, 158, 158, 0.5)',
            hoverColor: 'rgba(158, 158, 158, 0.2)',
          };

        return (
          <Paper key={area} sx={{ p: 3, mb: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                letterSpacing: 1,
                color: `${areaColors.color}`,
                textTransform: 'uppercase',
                borderBottom: `2px solid ${areaColors.color}`,
                mb: 2,
                pb: 0.5,
              }}
            >
              {areaNameMap[area] || area}
            </Typography>

            {/* 📊 Area Progress Bar */}
            {(() => {
              const total = racks[area]?.length || 0;
              const green = racks[area]?.filter(
                ([_, estado]) => estado === 1
              ).length;
              const percentage = total > 0 ? (green / total) * 100 : 0;

              return (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Avance: {Math.round(percentage)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: areaColors.color,
                      },
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                </Box>
              );
            })()}

            <Grid container spacing={1}>
              {racks[area]?.map(([rack, estado]) => (
                <Grid item xs={4} sm={3} md={2} lg={1.5} key={rack}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleRackClick(rack)}
                    sx={{
                      height: '40px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,
                      py: 0.5,
                      minWidth: 'auto',
                      backgroundColor:
                        estado === 1
                          ? areaColors.color
                          : 'rgba(219, 219, 219, 0.7)',
                      '&:hover': {
                        backgroundColor:
                          estado === 1
                            ? areaColors.hoverColor
                            : 'rgba(219, 219, 219, 0.88)',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: estado === 1 ? 'inherit' : 'black',
                      }}
                    >
                      {rack}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        );
      })}
    </Box>
  );
} 
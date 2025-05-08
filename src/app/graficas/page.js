'use client';

import { Box, Typography, Paper, Grid, LinearProgress, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GraphsPage() {
  const [serialData, setSerialData] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serialResponse, ticketResponse] = await Promise.all([
          fetch('/api/dashboard/capture-stats'),
          fetch('/api/dashboard/ticket-stats')
        ]);

        if (!serialResponse.ok || !ticketResponse.ok) throw new Error('Error fetching data');
        
        const serialData = await serialResponse.json();
        const ticketData = await ticketResponse.json();
        
        setSerialData(serialData);
        setTicketData(ticketData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for every 30 seconds
    const intervalId = setInterval(fetchData, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <Typography>Cargando...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!serialData || !ticketData) return null;

  const StatSection = ({ title, data, type }) => {
    const chartData = [
      { name: 'Capturados', value: data.captured },
      { name: 'Pendientes', value: data.pending }
    ];

    const COLORS = type === 'Seriales' 
      ? ['#2196F3', '#FFD700']  // Blue and Yellow for Seriales
      : ['#9C27B0', '#757575']; // Purple and Gray for Tickets

    const progressColors = type === 'Seriales'
      ? {
          backgroundColor: '#FFD700',
          barColor: '#2196F3'
        }
      : {
          backgroundColor: '#757575',
          barColor: '#9C27B0'
        };

    return (
      <Box sx={{ height: '100%' }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: type === 'Seriales' ? '#2196F3' : '#9C27B0',
            fontWeight: 600
          }}
        >
          {title}
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: type === 'Seriales' ? '#2196F3' : '#9C27B0',
                  fontWeight: 500
                }}
              >
                {type} Totales
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                {data.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de {type.toLowerCase()} en el sistema
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: type === 'Seriales' ? '#2196F3' : '#9C27B0',
                  fontWeight: 500
                }}
              >
                {type} Capturados
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                {data.captured}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {type} capturados hasta el momento
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: type === 'Seriales' ? '#2196F3' : '#9C27B0',
              fontWeight: 500
            }}
          >
            Progreso de Captura
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {data.percentage}% Completado
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={data.percentage} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: progressColors.backgroundColor,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progressColors.barColor
                }
              }} 
            />
          </Box>
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: type === 'Seriales' ? '#2196F3' : '#9C27B0',
              fontWeight: 500
            }}
          >
            Distribución
          </Typography>
          <Box sx={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StatSection 
            title="Seriales" 
            data={serialData} 
            type="Seriales"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <StatSection 
            title="Tickets" 
            data={ticketData} 
            type="Tickets"
          />
        </Grid>
      </Grid>
    </Box>
  );
} 
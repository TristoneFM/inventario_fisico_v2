'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Typography,
  Grid,
  Button,
  Box,
  Breadcrumbs,
  Link,
  Pagination,
  Stack,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Mock data for racks by area
const generateRacks = (prefix, count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    name: `Rack ${prefix}${i + 1}`,
  }));
};

const mockRacks = {
  'terminado': generateRacks('T', 50),
  'vulcanizado': generateRacks('V', 50),
  'materia-prima': generateRacks('MP', 50),
  'extrusion': generateRacks('E', 50),
  'subensamble': generateRacks('S', 50),
};

// Area names for display
const areaNames = {
  'terminado': 'Terminado',
  'vulcanizado': 'Vulcanizado',
  'materia-prima': 'Materia Prima',
  'extrusion': 'Extrusión',
  'subensamble': 'Subensamble',
};

// Area colors
const areaColors = {
  'terminado': { color: 'rgba(76, 175, 80, 0.5)', hoverColor: 'rgba(76, 175, 80, 0.4)', textColor: 'rgb(255, 255, 255)' }, // Green
  'vulcanizado': { color: 'rgba(25, 118, 210, 0.5)', hoverColor: 'rgba(25, 118, 210, 0.4)', textColor: 'rgb(255, 255, 255)' }, // Blue
  'materia-prima': { color: 'rgba(255, 152, 0, 0.5)', hoverColor: 'rgba(255, 152, 0, 0.4)', textColor: 'rgb(255, 255, 255)' }, // Orange
  'extrusion': { color: 'rgba(156, 39, 176, 0.5)', hoverColor: 'rgba(156, 39, 176, 0.4)', textColor: 'rgb(255, 255, 255)' }, // Purple
  'subensamble': { color: 'rgba(0, 188, 212, 0.5)', hoverColor: 'rgba(0, 188, 212, 0.4)', textColor: 'rgb(255, 255, 255)' }, // Cyan
};

const RACKS_PER_PAGE = 24;

export default function AreaSelectionPage() {
  const { area } = useParams();
  const router = useRouter();
  const areaName = areaNames[area] || 'Área';
  const areaColor = areaColors[area] || areaColors['terminado'];
  
  const [racks, setRacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const itemsPerPage = 24;
  const searchInputRef = useRef(null);

  // Fetch racks from API
  useEffect(() => {
    const fetchRacks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/racks?area=${area}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error fetching racks');
        }

        setRacks(data.racks);
        setError(null);
      } catch (error) {
        console.error('Error fetching racks:', error);
        setError('Error al cargar los racks');
      } finally {
        setLoading(false);
      }
    };

    fetchRacks();
  }, [area]);

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Also focus search input when racks are loaded
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      console.log('Search query:', searchQuery);
      
      // Find exact match first
      const exactMatch = racks.find(rack => 
        rack.id.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (exactMatch) {
        console.log('Found exact match:', exactMatch);
        router.push(`/dashboard/capture/${area}/${exactMatch.id}`);
        return;
      }
      
      // If no exact match, find partial match
      const partialMatch = racks.find(rack => 
        rack.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (partialMatch) {
        console.log('Found partial match:', partialMatch);
        router.push(`/dashboard/capture/${area}/${partialMatch.id}`);
        return;
      }
      
      // If no match found, show error
      setError('Rack no encontrado');
    }
  };

  const handleRackClick = (rackId) => {
    router.push(`/dashboard/capture/${area}/${rackId}`);
  };

  const filteredRacks = racks.filter(rack =>
    rack.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedRacks = filteredRacks.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRacks.length / itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push('/dashboard/capture')}
          sx={{ textDecoration: 'none' }}
        >
          Capturar
        </Link>
        <Typography color="text.primary">{areaName}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" gutterBottom sx={{ 
        backgroundColor: areaColor.color,
        color: areaColor.textColor,
        p: 2,
        borderRadius: 1,
        mb: 2
      }}>
        {areaName}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar rack..."
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
        inputRef={searchInputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={1}>
        {paginatedRacks.map((rack) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={rack.id}>
            <Paper
              sx={{
                p: 1.5,
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: areaColor.color,
                '&:hover': {
                  backgroundColor: areaColor.hoverColor,
                },
              }}
              onClick={() => handleRackClick(rack.id)}
            >
              <Typography variant="subtitle1" align="center" sx={{ color: areaColor.textColor }}>
                {rack.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 
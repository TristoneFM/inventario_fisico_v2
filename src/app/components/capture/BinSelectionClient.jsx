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
  'subensamble': { color: 'rgba(0, 188, 212, 0.5)', hoverColor: 'rgba(0, 188, 212, 0.4)', textColor: 'rgb(255, 255, 255)'}, // Cyan
};

export default function BinSelectionClient() {
  const { planta, area, rack } = useParams();
  const router = useRouter();
  const areaName = areaNames[area] || 'Área';
  const areaColor = areaColors[area] || areaColors['terminado'];
  const decodedPlanta = decodeURIComponent(planta);
  
  const [bins, setBins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const itemsPerPage = 24;
  const searchInputRef = useRef(null);

  // Fetch bins from API
  useEffect(() => {
    const fetchBins = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/bins?planta=${encodeURIComponent(planta)}&area=${area}&rack=${rack}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error fetching bins');
        }

        setBins(data.bins);
        setError(null);
      } catch (error) {
        console.error('Error fetching bins:', error);
        setError('Error al cargar los bins');
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, [planta, area, rack]);

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Also focus search input when bins are loaded
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
      const exactMatch = bins.find(bin => 
        bin.id.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (exactMatch) {
        console.log('Found exact match:', exactMatch);
        if (area === 'extrusion' || area === 'vulcanizado') {
          router.push(`/dashboard/capture/${encodeURIComponent(planta)}/${area}/${rack}/${exactMatch.id}/special-capture`);
        } else {
          router.push(`/dashboard/capture/${encodeURIComponent(planta)}/${area}/${rack}/${exactMatch.id}`);
        }
        return;
      }
      
      // If no exact match, find partial match
      const partialMatch = bins.find(bin => 
        bin.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (partialMatch) {
        console.log('Found partial match:', partialMatch);
        if (area === 'extrusion' || area === 'vulcanizado') {
          router.push(`/dashboard/capture/${encodeURIComponent(planta)}/${area}/${rack}/${partialMatch.id}/special-capture`);
        } else {
          router.push(`/dashboard/capture/${encodeURIComponent(planta)}/${area}/${rack}/${partialMatch.id}`);
        }
        return;
      }
      
      // If no match found, show error
      setError('Bin no encontrado');
    }
  };

  const handleBinClick = (binId) => {
    if (area === 'extrusion' || area === 'vulcanizado') {
      router.push(`/dashboard/capture/${encodeURIComponent(planta)}/${area}/${rack}/${binId}/special-capture`);
    } else {
      router.push(`/dashboard/capture/${encodeURIComponent(planta)}/${area}/${rack}/${binId}`);
    }
  };

  const filteredBins = bins.filter(bin =>
    bin.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedBins = filteredBins.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBins.length / itemsPerPage);

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
          Plantas
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push(`/dashboard/capture/${encodeURIComponent(planta)}`)}
          sx={{ textDecoration: 'none' }}
        >
          {decodedPlanta}
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push(`/dashboard/capture/${encodeURIComponent(planta)}/${area}`)}
          sx={{ textDecoration: 'none' }}
        >
          {areaName}
        </Link>
        <Typography color="text.primary">Rack {rack}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" gutterBottom sx={{ 
        backgroundColor: areaColor.color,
        color: areaColor.textColor,
        p: 2,
        borderRadius: 1,
        mb: 2
      }}>
        Rack {rack}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar bin..."
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
        {paginatedBins.map((bin) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={bin.id}>
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
              onClick={() => handleBinClick(bin.id)}
            >
              <Typography variant="subtitle1" align="center" sx={{ color: areaColor.textColor }}>
                {bin.name}
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
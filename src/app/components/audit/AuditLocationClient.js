'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Check as CheckIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AuditLocationClient() {
  const { id } = useParams();
  const router = useRouter();
  const [serials, setSerials] = useState([]);
  const [scannedSerial, setScannedSerial] = useState('');
  const [loading, setLoading] = useState(true);
  const [estadoAuditoria, setEstadoAuditoria] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchSerials = useCallback(async () => {
    try {
      const response = await fetch(`/api/auditoria/${id}/serials`);
      const data = await response.json();
      // Add prefix to serials for display
      const serialsWithPrefix = data.map(serial => ({
        ...serial,
        displaySerial: `${serial.serial}` // Add S prefix for display
      }));
      setSerials(serialsWithPrefix);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching serials:', error);
      setLoading(false);
      toast.error('Error al cargar los seriales');
    }
  }, [id]);

  const fetchEstadoAuditoria = useCallback(async () => {
    try {
      const response = await fetch(`/api/auditoria/${id}/status`);
      const data = await response.json();
      setEstadoAuditoria(data.estado_auditoria);
    } catch (error) {
      console.error('Error fetching audit status:', error);
    }
  }, [id]);

  useEffect(() => {
    // Initial fetch
    fetchSerials();
    fetchEstadoAuditoria();

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      console.log('Refreshing serials...'); // Debug log
      fetchSerials();
      fetchEstadoAuditoria();
    }, 30000);

    // Cleanup interval on component unmount
    return () => {
      console.log('Cleaning up interval...'); // Debug log
      clearInterval(intervalId);
    };
  }, [fetchSerials, fetchEstadoAuditoria]);

  const validateSerial = (serial) => {
    return serial.match(/^[SsMm]/);
  };

  const handleSerialChange = (event) => {
    setScannedSerial(event.target.value);
  };

  const handleSerialSubmit = async (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
      toast.error('No hay usuario autenticado');
      return;
    }

    const serial = scannedSerial.trim();
    
    if (serial.length > 0) {
      // Validate serial format
      if (!validateSerial(serial)) {
        toast.error('El serial debe comenzar con S, s, M o m');
        setTimeout(() => {
          setScannedSerial('');
        }, 500);
        return;
      }

      try {
        const response = await fetch(`/api/auditoria/${id}/audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            serial,
            emp_id: employeeId 
          }),
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
          // Refresh the serials list
          const serialsResponse = await fetch(`/api/auditoria/${id}/serials`);
          const serialsData = await serialsResponse.json();
          // Add prefix to serials for display
          const serialsWithPrefix = serialsData.map(serial => ({
            ...serial,
            displaySerial: `${serial.serial}` // Add S prefix for display
          }));
          setSerials(serialsWithPrefix);
          
          // Check audit status after successful audit
          const statusResponse = await fetch(`/api/auditoria/${id}/status`);
          const statusData = await statusResponse.json();
          setEstadoAuditoria(statusData.estado_auditoria);
          
          // Show success message
          toast.success('Serial auditado correctamente');
          
          // If audit is completed, show success modal
          if (statusData.estado_auditoria === 1) {
            setShowSuccess(true);
          }
        } else {
          // Show error message
          toast.error(data.error || 'Error al auditar serial');
        }
      } catch (error) {
        console.log(error);
        console.error('Error updating audit status:', error);
        toast.error('Error al auditar serial');
      }
      
      // Clear input after attempt
      setTimeout(() => {
        setScannedSerial('');
      }, 500);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const auditedCount = serials.filter(s => s.serial_auditado === 1).length;
  const progress = (auditedCount / serials.length) * 100;

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="colored"
        style={{
          top: '1rem',
          right: '1rem'
        }}
      />
      
      <Typography variant="h4" gutterBottom>
        Auditoría de Rack {id}
      </Typography>

      {/* Progress Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {progress >= 10 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon color="success" />
              Progreso: {Math.round(progress)}%
            </Box>
          ) : (
            `Progreso: ${Math.round(progress)}%`
          )}
        </Typography>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                borderRadius: 5,
              }
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {auditedCount} de {serials.length} seriales auditados
        </Typography>
        {estadoAuditoria === 1 && (
          <Box sx={{ 
            width: '100%', 
            mt: 2, 
            p: 2, 
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: 1,
            textAlign: 'center'
          }}>
            <Typography variant="body1" color="success.main">
              ¡Felicitaciones! Has completado la auditoría
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Scanner Input */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Escanear Serial
        </Typography>
        <TextField
          fullWidth
          value={scannedSerial}
          onChange={handleSerialChange}
          onKeyPress={handleSerialSubmit}
          placeholder="Escanee el serial"
          autoFocus
          sx={{ mb: 2 }}
        />
      </Paper>

      {/* Serials Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {serials.map((serial) => (
                    <Chip
                      key={serial.serial}
                      label={serial.displaySerial}
                      color={serial.serial_auditado === 1 ? "success" : "default"}
                      icon={serial.serial_auditado === 1 ? <CheckIcon /> : null}
                      sx={{
                        '& .MuiChip-icon': {
                          color: 'inherit'
                        },
                        backgroundColor: serial.serial_auditado === 1 ? 'rgba(76, 175, 80, 0.5)' : 'inherit',
                        '&:hover': {
                          backgroundColor: serial.serial_auditado === 1 ? 'rgba(76, 175, 80, 0.7)' : 'inherit'
                        },
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        '&:hover': {
                          border: '1px solid rgba(0, 0, 0, 0.24)'
                        },
                        width: '135px',
                        justifyContent: 'center'
                      }}
                    />
                  ))}
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Success Dialog */}
      <Dialog
        open={showSuccess}
        onClose={handleSuccessClose}
        aria-labelledby="success-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="success-dialog-title" sx={{ textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" component="div">
            ¡Auditoría Completada!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
            Has completado exitosamente la auditoría del rack {id}.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={handleSuccessClose} 
            color="primary" 
            variant="contained"
            size="large"
            sx={{ minWidth: '150px' }}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
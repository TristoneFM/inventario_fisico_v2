'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
  Typography,
  Box,
  Breadcrumbs,
  Link,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  DialogContentText,
  InputBase,
  Divider,
  Snackbar,
  Alert,
  Modal,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  'terminado': { color: 'rgba(76, 175, 80, 0.5)', hoverColor: 'rgba(76, 175, 80, 0.2)', textColor: 'rgb(255, 255, 255)' }, // Green
  'vulcanizado': { color: 'rgba(25, 118, 210, 0.5)', hoverColor: 'rgba(25, 118, 210, 0.2)', textColor: 'rgb(255, 255, 255)' }, // Blue
  'materia-prima': { color: 'rgba(255, 152, 0, 0.5)', hoverColor: 'rgba(255, 152, 0, 0.2)', textColor: 'rgb(255, 255, 255)' }, // Orange
  'extrusion': { color: 'rgba(156, 39, 176, 0.5)', hoverColor: 'rgba(156, 39, 176, 0.2)', textColor: 'rgb(255, 255, 255)' }, // Purple
  'subensamble': { color: 'rgba(0, 188, 212, 0.5)', hoverColor: 'rgba(0, 188, 212, 0.2)', textColor: 'rgb(255, 255, 255)' }, // Cyan
};

// Mock database of existing serials
const mockSerialDatabase = [
  { serial: 'ABC123', partNumbers: [
    { id: 'PN001', name: 'PART-001' },
    { id: 'PN002', name: 'PART-002' }
  ] },
  { serial: 'DEF456', partNumbers: [
    { id: 'PN003', name: 'PART-003' },
    { id: 'PN004', name: 'PART-004' }
  ] },
  { serial: 'GHI789', partNumbers: [
    { id: 'PN005', name: 'PART-005' }
  ] },
  { serial: 'JKL012', partNumbers: [
    { id: 'PN006', name: 'PART-006' }
  ] },
  { serial: 'MNO345', partNumbers: [
    { id: 'PN007', name: 'PART-007' }
  ] },
];

export default function SerialCaptureClient() {
  const { area, rack, bin } = useParams();
  const router = useRouter();
  const { employeeId } = useAuth();
  const areaName = areaNames[area] || 'Área';
  const areaColor = areaColors[area] || areaColors['terminado'];
  
  const [serials, setSerials] = useState([]);
  const [serialInput, setSerialInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [partNumber, setPartNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [existingSerials, setExistingSerials] = useState([]);
  const [newSerials, setNewSerials] = useState([]);
  const [serialData, setSerialData] = useState([]); // Store material data for each serial
  const [showObsoleteModal, setShowObsoleteModal] = useState(false);
  
  // Refs for auto-focusing inputs
  const serialInputRef = useRef(null);
  const quantityVerificationRef = useRef(null);
  
  // Quantity verification
  const [quantityVerification, setQuantityVerification] = useState('');
  const [quantityError, setQuantityError] = useState(false);
  
  // Add ref for quantity input
  const quantityInputRef = useRef(null);
  
  // Add ref for part number input
  const partNumberInputRef = useRef(null);
  
  // Show error dialog
  const [showError, setShowError] = useState(false);
  
  // New part number error state
  const [partNumberError, setPartNumberError] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  
  // Show delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serialToDelete, setSerialToDelete] = useState(null);
  
  // Focus serial input when component mounts
  useEffect(() => {
    if (serialInputRef.current) {
      serialInputRef.current.focus();
    }
  }, []);
  
  // Focus serial input when modal closes
  useEffect(() => {
    if (!showModal && serialInputRef.current) {
      serialInputRef.current.focus();
    }
  }, [showModal]);
  
  // Focus quantity verification input when confirmation dialog opens
  useEffect(() => {
    if (showConfirmation && quantityVerificationRef.current) {
      setTimeout(() => {
        quantityVerificationRef.current.focus();
      }, 100);
    }
  }, [showConfirmation]);

  // Focus part number input when modal opens
  useEffect(() => {
    if (showModal && partNumberInputRef.current) {
      // Small delay to ensure the modal is fully rendered
      setTimeout(() => {
        partNumberInputRef.current.focus();
      }, 100);
    }
  }, [showModal]);

  const handleSerialChange = (event) => {
    setSerialInput(event.target.value);
  };

  const handleSerialKeyDown = (event) => {
    
    if (event.key === 'Enter') {
      event.preventDefault();
      if (serialInput.length === 10 || serialInput.length === 11 && (serialInput.startsWith('S') || serialInput.startsWith('M') || serialInput.startsWith('s') || serialInput.startsWith('m'))) {
        handleAddSerial();
      } else {
        toast.error('Serial Incorrecto', {
          position: "top-right",
          autoClose: 1000,
        });
        setSerialInput('');
      }
    }
  };

  const handleModalClose = () => {
    setSerialInput('');
    setShowModal(false);
    setSelectedSerial(null);
    setPartNumber('');
    setQuantity('');
    setPartNumberError('');
    setMaterialDescription('');
    // Focus the serial input after closing all modals
    if (serialInputRef.current) {
      serialInputRef.current.focus();
    }
  };

  const handleModalOpen = (serial) => {
    setSelectedSerial({ serial });
    setShowModal(true);
    // Focus after state updates
    setTimeout(() => {
      if (partNumberInputRef.current) {
        partNumberInputRef.current.focus();
      }
    }, 100);
  };

  const handleAddSerial = async () => {
    if (!employeeId) {
      toast.error('No se encontró el ID del empleado', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (serialInput.trim()) {
      const serial = serialInput.trim();
      
      // Validate serial format
      if (!/^[SsMm].+/.test(serial)) {
        toast.error('Serial Invalido', {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setSerialInput('');
        if (serialInputRef.current) {
          serialInputRef.current.focus();
        }
        return;
      }

      // Remove S/M prefix
      const cleanSerial = serial.substring(1);

      // Check if serial is already in the list (duplicate)
      if (serials.includes(cleanSerial)) {
        toast.error(`El serial ${cleanSerial} ya ha sido capturado`, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setSerialInput('');
        // Focus the input after showing error
        if (serialInputRef.current) {
          serialInputRef.current.focus();
        }
        return;
      }
      
      try {
        // Check if serial exists in material table and if it's already captured
        const response = await fetch(`/api/capture/check-serial?serial=${cleanSerial}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.isCaptured) {
          toast.error(`El serial ${cleanSerial} ya ha sido capturado anteriormente`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setSerialInput('');
          if (serialInputRef.current) {
            serialInputRef.current.focus();
          }
          return;
        }

        if (data.exists) {
          // Store the serial and its data
          setSerials([...serials, cleanSerial]);
          setExistingSerials([...existingSerials, cleanSerial]);
          setSerialData([...serialData, {
            serial: cleanSerial,
            material: data.material.material,
            material_description: data.material.material_description,
            stock: data.material.stock
          }]);
          setSerialInput('');
          
          // Show success message
          toast.success(`Serial ${cleanSerial} agregado a la lista`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          // Focus the input after adding a serial
          if (serialInputRef.current) {
            serialInputRef.current.focus();
          }
        } else {
          // If serial doesn't exist in material table, show the obsolete modal first
          setSelectedSerial({ serial: cleanSerial });
          setShowObsoleteModal(true);
        }
      } catch (error) {
        toast.error('Error al verificar el serial', {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleRemoveSerial = (index) => {
    const serialToRemove = serials[index];
    const newSerials = [...serials];
    newSerials.splice(index, 1);
    setSerials(newSerials);
    
    // Also remove from the appropriate tracking array and serialData
    if (existingSerials.includes(serialToRemove)) {
      setExistingSerials(existingSerials.filter(s => s !== serialToRemove));
    } else if (newSerials.includes(serialToRemove)) {
      setNewSerials(newSerials.filter(s => s !== serialToRemove));
    }
    setSerialData(serialData.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      quantityVerificationRef.current?.focus();
    }, 100);
  };

  const handleConfirmSave = async () => {
    const enteredQuantity = parseInt(quantityVerification);
    if (enteredQuantity !== serials.length) {
      setQuantityError(true);
      return;
    }
    setQuantityError(false);
    setShowConfirmation(false);

    try {
      // Insert all serials
      for (const data of serialData) {
        const response = await fetch('/api/capture/insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serial: data.serial,
            employeeId: employeeId,
            bin: bin,
            rack: rack,
            area: area,
            material: data.material,
            material_description: data.material_description,
            stock: data.stock,
            serial_obsoleto: data.serial_obsoleto || 0  // Pass the flag to API
          }),
        });

        const result = await response.json();
        if (result.error) {
          setShowError(true);
          return;
        }
      }

      setShowSuccess(true);
    } catch (error) {
      setShowError(true);
    }
  };

  const handleCancelSave = () => {
    setShowConfirmation(false);
    setQuantityVerification('');
    setQuantityError(false);
  };

  const handleQuantityChange = (e) => {
    setQuantityVerification(e.target.value);
    setQuantityError(false);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push(`/dashboard/capture/${area}/${rack}`);
  };

  const handlePartNumberChange = (e) => {
    const value = e.target.value;
    // Remove P prefix if present (case insensitive)
    const cleanValue = value.replace(/^[Pp]/, '');
    setPartNumber(cleanValue);
    setPartNumberError('');
    setMaterialDescription('');
  };

  const checkPartNumber = async (value) => {
    if (value) {
      try {
        // Remove P prefix if present (case insensitive)
        const cleanValue = value.replace(/^[Pp]/, '');
        const response = await fetch(`/api/capture/check-part-number?partNumber=${cleanValue}`);
        const result = await response.json();

        if (result.error) {
          setPartNumberError(result.error);
        } else {
          setMaterialDescription(result.data.material_description);
        }
      } catch (error) {
        setPartNumberError('Error al verificar el número de parte');
      }
    }
  };

  const handlePartNumberKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      checkPartNumber(event.target.value);
      // Focus the quantity input when Enter is pressed in part number field
      if (quantityInputRef.current) {
        quantityInputRef.current.focus();
      }
    }
  };

  const handlePartNumberBlur = (event) => {
    checkPartNumber(event.target.value);
  };

  const handleModalSave = () => {
    if (partNumber && quantity && !partNumberError) {
      // Add to serials list
      setSerials([...serials, selectedSerial.serial]);
      setNewSerials([...newSerials, selectedSerial.serial]);
      
      // Add to serialData with part number as material and quantity as stock
      setSerialData([...serialData, {
        serial: selectedSerial.serial,
        material: partNumber,
        material_description: materialDescription,
        stock: parseInt(quantity),
        serial_obsoleto: 1  // Flag for obsolete serial
      }]);

      // Show success message
      toast.success(`Serial ${selectedSerial.serial} agregado a la lista`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setSerialInput('');
      handleModalClose();
    }
  };

  const handleQuantityKeyDown = (event) => {

    const cleanValue = quantity.replace(/[Qq]/, '');
    setQuantity(cleanValue);
    if (event.key === 'Enter' && partNumber && quantity) {
      event.preventDefault();
      handleModalSave();
    }
  };

  const handleErrorClose = () => {
    setShowError(false);
    // Clear all lists
    setSerials([]);
    setSerialData([]);
    setExistingSerials([]);
    setNewSerials([]);
    // Focus the serial input
    if (serialInputRef.current) {
      serialInputRef.current.focus();
    }
  };

  const handleQuantityVerificationKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConfirmSave();
    }
  };

  const handleDeleteClick = (serial) => {
    setSerialToDelete(serial);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (serialToDelete) {
      setSerials(serials.filter(s => s !== serialToDelete));
      setShowDeleteConfirm(false);
      setSerialToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSerialToDelete(null);
  };

  const handleObsoleteClose = () => {
    setShowObsoleteModal(false);
    // After closing obsolete modal, show the part number modal
    setShowModal(true);
  };

  return (
    <Box>
      <ToastContainer
      theme="colored"
       />
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push('/dashboard/capture')}
          sx={{ textDecoration: 'none' }}
        >
          Capturar
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push(`/dashboard/capture/${area}`)}
          sx={{ textDecoration: 'none' }}
        >
          {areaName}
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => router.push(`/dashboard/capture/${area}/${rack}`)}
          sx={{ textDecoration: 'none' }}
        >
          Rack {rack}
        </Link>
        <Typography color="text.primary">Bin {bin}</Typography>
      </Breadcrumbs>

      <Typography variant="h5" gutterBottom sx={{ 
        backgroundColor: areaColor.color,
        color: areaColor.textColor,
        p: 2,
        borderRadius: 1,
        mb: 2
      }}>
        Rack {rack} / Bin {bin}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ingresar Serial
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <TextField
                fullWidth
                label="Serial"
                variant="outlined"
                value={serialInput}
                onChange={handleSerialChange}
                onKeyDown={handleSerialKeyDown}
                inputRef={serialInputRef}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              fullWidth
              size="large"
              disabled={serials.length === 0}
              sx={{ 
                py: 2,
                fontSize: '1.1rem',
                mt: 2
              }}
            >
              Terminar Captura
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Seriales Capturados
            </Typography>
            
            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {serials.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No hay seriales capturados
                </Typography>
              ) : (
                <List>
                  {serials.map((serial, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        bgcolor: existingSerials.includes(serial) 
                          ? 'rgba(76, 175, 80, 0.1)' // Light green for existing serials
                          : newSerials.includes(serial)
                            ? 'rgba(244, 67, 54, 0.1)' // Light red for new serials
                            : 'transparent',
                      }}
                    >
                      <ListItemText primary={serial} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteClick(serial)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onClose={handleCancelSave}>
        <DialogTitle>Confirmar Captura</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Para confirmar que ha capturado todos los seriales correctamente, por favor ingrese la cantidad de seriales capturados:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Cantidad de Seriales"
            type="number"
            fullWidth
            variant="outlined"
            value={quantityVerification}
            onChange={handleQuantityChange}
            onKeyDown={handleQuantityVerificationKeyDown}
            error={quantityError}
            helperText={quantityError ? "La cantidad ingresada no coincide con los seriales capturados" : ""}
            inputRef={quantityVerificationRef}
            inputProps={{ 
              min: 0,
              step: 1,
              pattern: "[0-9]*"
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSave}>Cancelar</Button>
          <Button 
            onClick={handleConfirmSave} 
            variant="contained" 
            color="primary"
            disabled={!quantityVerification}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

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
            ¡Guardado Exitoso!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
            Se han guardado correctamente {serials.length} seriales en el Bin {bin}.
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

      {/* Error Dialog */}
      <Dialog
        open={showError}
        onClose={handleErrorClose}
        aria-labelledby="error-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="error-dialog-title" sx={{ textAlign: 'center' }}>
          <CancelIcon color="error" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" component="div">
            Error al Guardar
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
            Algunos seriales no se guardaron correctamente. Por favor verifique todos los seriales escaneados.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={handleErrorClose} 
            color="primary" 
            variant="contained"
            size="large"
            sx={{ minWidth: '150px' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Serial Obsoleto Modal */}
      <Dialog
        open={showObsoleteModal}
        onClose={handleObsoleteClose}
        aria-labelledby="obsolete-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="obsolete-dialog-title" sx={{ textAlign: 'center' }}>
          <WarningIcon color="warning" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" component="div">
            Serial Obsoleto
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
            El serial {selectedSerial?.serial} se guardara como obsoleto, debe capturar el numero de parte y cantidad en la siguiente ventana
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={handleObsoleteClose} 
            color="primary" 
            variant="contained"
            size="large"
            sx={{ minWidth: '150px' }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Part Number Modal */}
      <Modal
        open={showModal}
        onClose={handleModalClose}
        aria-labelledby="part-number-modal"
        disableAutoFocus
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
          zIndex: 1300,
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Serial Obsoleto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            El serial {selectedSerial?.serial} no existe en la base de datos. Por favor, ingrese el número de parte y la cantidad.
          </Typography>
          
          <TextField
            fullWidth
            label="Número de Parte"
            value={partNumber}
            onChange={handlePartNumberChange}
            onKeyDown={handlePartNumberKeyDown}
            onBlur={handlePartNumberBlur}
            inputRef={partNumberInputRef}
            error={!!partNumberError}
            helperText={partNumberError}
            sx={{ mb: 2 }}
          />

          {materialDescription && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Descripción: {materialDescription}
            </Typography>
          )}
          
          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleQuantityKeyDown}
            inputRef={quantityInputRef}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleModalClose}>Cancelar</Button>
            <Button 
              variant="contained" 
              onClick={handleModalSave}
              disabled={!partNumber || !quantity || !!partNumberError}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="delete-dialog-title" sx={{ textAlign: 'center' }}>
          <CancelIcon color="error" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h5" component="div">
            Confirmar Eliminación
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
            ¿Está seguro que desea eliminar el serial {serialToDelete}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            color="primary" 
            variant="outlined"
            size="large"
            sx={{ minWidth: '150px' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            size="large"
            sx={{ minWidth: '150px' }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
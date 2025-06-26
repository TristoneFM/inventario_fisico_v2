'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  DialogContentText,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/app/context/AuthContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import { playSound } from '@/lib/soundUtils';

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

// Mock part numbers for extrusion and vulcanizado
const mockPartNumbers = [
  { id: 'EXT001', name: 'Extrusión-001', category: 'extrusion' },
  { id: 'EXT002', name: 'Extrusión-002', category: 'extrusion' },
  { id: 'EXT003', name: 'Extrusión-003', category: 'extrusion' },
  { id: 'VUL001', name: 'Vulcanizado-001', category: 'vulcanizado' },
  { id: 'VUL002', name: 'Vulcanizado-002', category: 'vulcanizado' },
  { id: 'VUL003', name: 'Vulcanizado-003', category: 'vulcanizado' },
];

export default function SpecialCaptureClient() {
  const { area, rack, bin } = useParams();
  const router = useRouter();
  const { employeeId } = useAuth();
  const areaName = areaNames[area] || 'Área';
  const areaColor = areaColors[area] || areaColors['terminado'];
  
  const [serials, setSerials] = useState([]);
  const [serialInput, setSerialInput] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [confirmQuantity, setConfirmQuantity] = useState('');
  const [quantityVerification, setQuantityVerification] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [partNumbers, setPartNumbers] = useState([]);
  const [quantityError, setQuantityError] = useState(false);
  const [confirmQuantityError, setConfirmQuantityError] = useState(false);
  const [showObsoleteModal, setShowObsoleteModal] = useState(false);
  const [currentSerial, setCurrentSerial] = useState('');
  const [isObsolete, setIsObsolete] = useState(false);
  const [materialDescription, setMaterialDescription] = useState('');
  const [serialValidatedByEnter, setSerialValidatedByEnter] = useState(false);
  
  // Refs for auto-focusing inputs
  const serialInputRef = useRef(null);
  const partNumberInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const confirmQuantityInputRef = useRef(null);
  const quantityVerificationRef = useRef(null);
  
  // Focus serial input when component mounts
  useEffect(() => {
    if (serialInputRef.current) {
      serialInputRef.current.focus();
    }
  }, []);
  
  // Focus quantity verification input when confirmation dialog opens
  useEffect(() => {
    if (showConfirmation && quantityVerificationRef.current) {
      setTimeout(() => {
        quantityVerificationRef.current.focus();
      }, 100);
    }
  }, [showConfirmation]);

  // Filter part numbers based on area
  useEffect(() => {
    const filteredPartNumbers = mockPartNumbers.filter(pn => pn.category === area);
    setPartNumbers(filteredPartNumbers);
  }, [area]);

  const handleSerialChange = (event) => {
    setSerialInput(event.target.value.toUpperCase());
  };

  const validateSerial = async () => {
    const serial = serialInput.trim();
    
    // Only validate if there's a value
    if (!serial) return;
    
    // Validate serial format (must start with S and be 10-11 characters total)
    if (!serial.match(/^[Ss].{9,10}$/)) {
      playSound('error');
      toast.error('Serial invalido');
      setSerialInput('');
      if (serialInputRef.current) {
        serialInputRef.current.focus();
      }
      return false;
    }

    try {
      // Remove S prefix for API check
      let serialWithoutS;
      if (serial.startsWith('S') || serial.startsWith('s')) {
         serialWithoutS = serial.substring(1);
      } else {
         serialWithoutS = serial;
      }
      
      // Check if serial exists in material table
      const materialResponse = await fetch(`/api/capture/check-serial?serial=${serialWithoutS}`);
      const materialData = await materialResponse.json();

      if (!materialData.exists) {
        setCurrentSerial(serial);
        setShowObsoleteModal(true);
        setIsObsolete(true);
        playSound('error');
        return false;
      }

      // Check if serial has already been captured
      const captureResponse = await fetch(`/api/capture/special?serial=${serialWithoutS}`);
      const captureData = await captureResponse.json();

      if (captureData.exists) {
        playSound('error');
        toast.error('Este serial ya ha sido capturado');
        setSerialInput('');
        if (serialInputRef.current) {
          serialInputRef.current.focus();
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking serial:', error);
      playSound('error');
      toast.error('Error al verificar el serial');
      return false;
    }
  };

  const handleSerialKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setSerialValidatedByEnter(true);
      const isValid = await validateSerial();
      if (isValid && partNumberInputRef.current) {
        partNumberInputRef.current.focus();
      }
      // Reset the flag after a short delay
      setTimeout(() => setSerialValidatedByEnter(false), 100);
    }
  };

  const handleSerialBlur = async () => {
    // Skip validation if it was already triggered by Enter key
    if (serialValidatedByEnter) {
      return;
    }
    const isValid = await validateSerial();
    if (isValid && partNumberInputRef.current) {
      partNumberInputRef.current.focus();
    }
  };

  const handlePartNumberChange = (event) => {
    setPartNumber(event.target.value.toUpperCase());
  };

  const validatePartNumber = async () => {
    const partNumberValue = partNumber.trim();
    
    // Only validate if there's a value
    if (!partNumberValue) return;
    
    // Validate part number format (must start with P and be at least 2 characters)
    if (!partNumberValue.match(/^[Pp]./)) {
      playSound('error');
      toast.error('Número de parte inválido');
      setPartNumber('');
      if (partNumberInputRef.current) {
        partNumberInputRef.current.focus();
      }
      return false;
    }

    try {
      // Remove P prefix for API 
      let partNumberWithoutP;
      if (partNumberValue.startsWith('P') || partNumberValue.startsWith('p')) {
        partNumberWithoutP = partNumberValue.substring(1);
      } else {
        partNumberWithoutP = partNumberValue;
      }
      
      // Check if part number exists
      const response = await fetch(`/api/capture/check-part-number?partNumber=${partNumberWithoutP}`);
      const data = await response.json();

      if (!data.success) {
        playSound('error');
        toast.error('Número de parte no encontrado');
        setPartNumber('');
        if (partNumberInputRef.current) {
          partNumberInputRef.current.focus();
        }
        return false;
      }

      // Store the material description
      setMaterialDescription(data.data.material_description);
      return true;
    } catch (error) {
      console.error('Error checking part number:', error);
      playSound('error');
      toast.error('Error al verificar el número de parte');
      return false;
    }
  };

  const handlePartNumberKeyDown = async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const isValid = await validatePartNumber();
      if (isValid && quantityInputRef.current) {
        quantityInputRef.current.focus();
      }
    }
  };

  const handlePartNumberBlur = async () => {
    const isValid = await validatePartNumber();
    if (isValid && quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  };

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

  const handleQuantityKeyDown = (event) => {
    if (event.key === 'Enter' && serialInput && partNumber && quantity) {
      event.preventDefault();
      // Focus the confirm quantity input when Enter is pressed in quantity field
      if (confirmQuantityInputRef.current) {
        confirmQuantityInputRef.current.focus();
      }
    }
  };

  const handleConfirmQuantityChange = (event) => {
    setConfirmQuantity(event.target.value);
    setConfirmQuantityError(false);
  };

  const handleConfirmQuantityKeyDown = (event) => {
    if (event.key === 'Enter' && serialInput && partNumber && quantity && confirmQuantity) {
      event.preventDefault();
      handleAddSerial();
    }
  };

  const handleObsoleteClose = () => {
    setShowObsoleteModal(false);
    // Set flag to prevent blur validation when focusing part number input
    setSerialValidatedByEnter(true);
    // Add a small delay to ensure modal is closed before focusing
    setTimeout(() => {
      if (partNumberInputRef.current) {
        partNumberInputRef.current.focus();
      }
      // Reset the flag after focusing
      setTimeout(() => setSerialValidatedByEnter(false), 50);
    }, 100);
  };

  const handleAddSerial = async () => {
    if (serialInput.trim() && partNumber && quantity && confirmQuantity) {
      // Verify that confirm quantity matches quantity
      if (parseInt(confirmQuantity) !== parseInt(quantity)) {
        setConfirmQuantityError(true);
        return;
      }

      try {
        // Remove S prefix for API calls
        const serialWithoutS = serialInput.trim().substring(1);
        // Remove P prefix for part number
        const partNumberWithoutP = partNumber.trim().substring(1);
        
        // Check if serial exists
        const response = await fetch(`/api/capture/special?serial=${serialWithoutS}`);
        const data = await response.json();

        if (data.exists) {
          playSound('error');
          toast.error('Este serial ya ha sido capturado');
          // Clear all inputs
          setSerialInput('');
          setPartNumber('');
          setQuantity('');
          setConfirmQuantity('');
          // Focus on serial input
          if (serialInputRef.current) {
            serialInputRef.current.focus();
          }
          return;
        }

        // Insert the serial immediately
        const insertResponse = await fetch('/api/capture/special', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serial: serialWithoutS,
            partNumber: partNumberWithoutP,
            materialDescription,
            quantity: parseInt(quantity),
            area,
            rack,
            bin,
            employeeId,
            isObsolete
          }),
        });

        const insertResult = await insertResponse.json();

        if (!insertResponse.ok) {
          throw new Error(insertResult.error || 'Error al guardar el serial');
        }

        // Add to the list for display
        setSerials([...serials, {
          serial: serialInput.trim(),
          partNumber,
          quantity: parseInt(quantity),
          isObsolete
        }]);
        
        // Reset inputs and state
        setSerialInput('');
        setPartNumber('');
        setQuantity('');
        setConfirmQuantity('');
        setIsObsolete(false);
        
        // Show success message
        playSound('success');
        toast.success(`Serial ${serialInput.trim()} capturado exitosamente`, {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Focus the serial input after adding
        if (serialInputRef.current) {
          serialInputRef.current.focus();
        }
      } catch (error) {
        console.error('Error capturing serial:', error);
        playSound('error');
        toast.error(error.message || 'Error al capturar el serial', {
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
    const newSerials = [...serials];
    newSerials.splice(index, 1);
    setSerials(newSerials);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push(`/dashboard/capture/${area}/${rack}`);
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
              Ingresar Datos
            </Typography>
            
            <TextField
              fullWidth
              label="Serial"
              variant="outlined"
              value={serialInput}
              onChange={handleSerialChange}
              onKeyDown={handleSerialKeyDown}
              onBlur={handleSerialBlur}
              inputRef={serialInputRef}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Número de Parte"
              variant="outlined"
              value={partNumber}
              onChange={handlePartNumberChange}
              onKeyDown={handlePartNumberKeyDown}
              onBlur={handlePartNumberBlur}
              inputRef={partNumberInputRef}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Cantidad"
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              onKeyDown={handleQuantityKeyDown}
              inputRef={quantityInputRef}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Confirmar Cantidad"
              type="number"
              value={confirmQuantity}
              onChange={handleConfirmQuantityChange}
              onKeyDown={handleConfirmQuantityKeyDown}
              inputRef={confirmQuantityInputRef}
              error={confirmQuantityError}
              helperText={confirmQuantityError ? "La cantidad de confirmación no coincide con la cantidad ingresada" : ""}
              sx={{ mb: 3 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddSerial}
              fullWidth
              size="large"
              sx={{ 
                py: 2,
                fontSize: '1.1rem',
                mb: 2
              }}
              disabled={!serialInput || !partNumber || !quantity || !confirmQuantity}
            >
              Guardar Serial
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seriales Capturados ({serials.length})
            </Typography>
            <List>
              {serials.map((item, index) => (
                <ListItem 
                  key={index} 
                  divider
                  sx={{ 
                    backgroundColor: item.isObsolete ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                    '&:hover': {
                      backgroundColor: item.isObsolete ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                      color: item.isObsolete ? 'rgb(244, 67, 54)' : 'rgb(76, 175, 80)',
                      '& .MuiListItemText-primary': {
                        color: item.isObsolete ? 'rgb(244, 67, 54)' : 'rgb(76, 175, 80)'
                      },
                      '& .MuiListItemText-secondary': {
                        color: item.isObsolete ? 'rgb(244, 67, 54)' : 'rgb(76, 175, 80)'
                      }
                    }
                  }}
                >
                  <ListItemText 
                    primary={item.serial} 
                    secondary={`Parte: ${item.partNumber} | Cantidad: ${item.quantity}`} 
                  />
                </ListItem>
              ))}
              {serials.length === 0 && (
                <ListItem>
                  <ListItemText primary="No hay seriales capturados" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Obsolete Serial Modal */}
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
            El serial {currentSerial} no se encontró en la tabla de materiales.
            Se guardará como serial obsoleto.
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

      {/* Success Dialog */}
      <Dialog open={showSuccess} onClose={handleSuccessClose}>
        <DialogTitle>Captura Completada</DialogTitle>
        <DialogContent>
          <DialogContentText>
            La captura de seriales se ha completado exitosamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained" color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 
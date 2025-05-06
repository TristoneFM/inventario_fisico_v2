'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError('Por favor ingrese su ID de empleado');
      return;
    }
    // Here you would typically handle the login logic
    console.log('Login attempt with employee ID:', employeeId);
    // For now, we'll just redirect to the dashboard
    router.push('/dashboard');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Inventario Físico
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="employeeId"
              label="ID de Empleado"
              name="employeeId"
              autoComplete="off"
              autoFocus
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Ingresar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

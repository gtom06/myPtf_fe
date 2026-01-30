import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Container, 
  Paper, Alert, CircularProgress 
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Credenziali non valide');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setLoading(false);
      if (onLogin) onLogin(username);
    } catch (err) {
      setError('Errore di connessione al server');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      {/* Paper crea l'effetto "foglio bianco" sollevato con ombra */}
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
        
        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Accedi'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;
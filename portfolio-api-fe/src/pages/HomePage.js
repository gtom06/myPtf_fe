import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Button, Box, Alert, CircularProgress } from '@mui/material';
import { fetchWithAuth } from '../utils/fetchWithAuth';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function HomePage({ onLogout }) {
    const [portfolios, setPortfolios] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCards, setShowCards] = useState(false);

    useEffect(() => {
        let timeoutId;
        fetchWithAuth(`${API_URL}/portfolios/`, {}, onLogout)
            .then(res => {
                if (!res.ok) throw new Error('Errore nel recupero dei portafogli');
                return res.json();
            })
            .then(data => setPortfolios(data))
            .catch(err => setError(err.message))
            .finally(() => {
                // Mostra lo spinner per almeno 0.5 secondi
                timeoutId = setTimeout(() => {
                    setShowCards(true);
                    setLoading(false);
                }, 500);
            });
        return () => clearTimeout(timeoutId);
    }, [onLogout]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        if (onLogout) onLogout();
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">Portafogli</Typography>
                <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={3}>
                {!showCards ? (
                    <Grid item xs={12} display="flex" justifyContent="center">
                        <CircularProgress />
                    </Grid>
                ) : portfolios.length === 0 && !error ? (
                    <Grid item xs={12}>
                        <Typography variant="body1">Nessun portafoglio disponibile.</Typography>
                    </Grid>
                ) : (
                    portfolios.map((p) => (
                        <Grid item xs={12} sm={6} md={4} key={p.id || p.name}>
                            <Card elevation={3}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {p.name || 'Portafoglio'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {`Broker: ${p.broker || '-'} | Creato il: ${p.created_at ? new Date(p.created_at).toLocaleDateString('it-IT') : '-'}`}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}

export default HomePage;

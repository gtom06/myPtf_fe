import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Button, Box, Alert, CircularProgress } from '@mui/material';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function HomePage({ onLogout }) {
    const [portfolios, setPortfolios] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/portfolios/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error('Errore nel recupero dei portafogli');
                return res.json();
            })
            .then(data => setPortfolios(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        if (onLogout) onLogout();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">Portafogli</Typography>
                <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={3}>
                {portfolios.length === 0 && !error && (
                    <Grid item xs={12}>
                        <Typography variant="body1">Nessun portafoglio disponibile.</Typography>
                    </Grid>
                )}
                {portfolios.map((p) => (
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
                ))}
            </Grid>
        </Container>
    );
}

export default HomePage;

import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Card, CardContent, Grid, 
    Box, Alert, CircularProgress 
} from '@mui/material';
import { fetchWithAuth } from '../utils/fetchWithAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function HomePage({ onLogout }) {
    const [portfolios, setPortfolios] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWithAuth(`${API_URL}/portfolios/`, {}, onLogout)
            .then(res => {
                if (!res.ok) throw new Error('Errore nel recupero dei portafogli');
                return res.json();
            })
            .then(data => setPortfolios(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [onLogout]);

    const handleCardClick = (portfolio) => {
        // --- SALVATAGGIO IN LOCAL STORAGE ---
        localStorage.setItem('selectedPortfolioId', portfolio.id);
        localStorage.setItem('selectedPortfolioName', portfolio.name);
        // Salviamo l'intero oggetto per recuperarlo subito nell'altra pagina
        localStorage.setItem('selectedPortfolioData', JSON.stringify(portfolio));
        
        // Navigazione custom
        window.history.pushState({}, '', '/portfolio-chart');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                I Tuoi Portafogli
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {loading ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    portfolios.map((p) => (
                        <Grid item xs={12} sm={6} md={4} key={p.id}>
                            <Card 
                                elevation={3} 
                                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'scale(1.02)' }, transition: '0.2s' }}
                                onClick={() => handleCardClick(p)}
                            >
                                <CardContent>
                                    <Typography variant="h6">{p.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Broker: {p.broker || 'N/D'}
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
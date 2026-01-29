import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Grid, Button, Box, Alert, CircularProgress, IconButton } from '@mui/material';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import PortfolioChart from './PortfolioChart';
import { logoutAll } from '../utils/logout';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function HomePage({ onLogout }) {
    const [portfolios, setPortfolios] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCards, setShowCards] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [portfolioData, setPortfolioData] = useState(null);
    const [chartLoading, setChartLoading] = useState(false);
    const [chartError, setChartError] = useState('');

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
                timeoutId = setTimeout(() => {
                    setShowCards(true);
                    setLoading(false);
                }, 500);
            });
        return () => clearTimeout(timeoutId);
    }, [onLogout]);


    const handleCardClick = (portfolio) => {
        setSelectedPortfolio(portfolio);
        setChartLoading(true);
        setChartError('');
        setPortfolioData(null);
        // Caching: chiave per ogni portafoglio
        const cacheKey = `portfolio-value-history-${portfolio.id}`;
        const cacheStr = localStorage.getItem(cacheKey);
        let cache;
        try {
            cache = cacheStr ? JSON.parse(cacheStr) : null;
        } catch {
            cache = null;
        }
        // Cache valida per 30 minuti
        const isValid = cache && cache.timestamp && (Date.now() - cache.timestamp < 30 * 60 * 1000);
        if (isValid && cache.data) {
            setPortfolioData(cache.data);
            setChartLoading(false);
        } else {
            fetchWithAuth(`${API_URL}/portfolios/${portfolio.id}/value-history`, {}, onLogout)
                .then(res => {
                    if (!res.ok) throw new Error('Errore nel recupero dei dati del portafoglio');
                    return res.json();
                })
                .then(data => {
                    setPortfolioData(data);
                    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
                })
                .catch(err => setChartError(err.message))
                .finally(() => setChartLoading(false));
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box mb={3}>
                <Typography variant="h4" component="h1">Portafogli</Typography>
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
                            <Card elevation={3} sx={{ cursor: 'pointer' }} onClick={() => handleCardClick(p)}>
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
            {selectedPortfolio && (
                <Box mt={4}>
                    <Typography variant="h5" gutterBottom>
                        {selectedPortfolio.name || 'Portafoglio'} - Andamento
                    </Typography>
                    {chartLoading && <CircularProgress />}
                    {chartError && <Alert severity="error">{chartError}</Alert>}
                    {portfolioData && <PortfolioChart data={portfolioData} />}
                </Box>
            )}
        </Container>
    );
}

export default HomePage;

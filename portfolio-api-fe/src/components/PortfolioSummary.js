import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Divider, Stack, CircularProgress, Grid } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function PortfolioSummary({ portfolioId }) {
    const cacheKey = `lastValue_${portfolioId}`;
    const cachedData = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    const [lastValue, setLastValue] = useState(cachedData);
    const [loading, setLoading] = useState(!cachedData);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (!portfolioId) return;
        fetch(`${API_URL}/portfolios/${portfolioId}/value-last`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
        .then(res => {
            if (res.status === 401) {
                localStorage.clear();
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
                throw new Error('Token scaduto');
            }
            return res.json();
        })
        .then(data => {
            setLastValue(data);
            localStorage.setItem(cacheKey, JSON.stringify(data));
        })
        .catch(err => console.error("Errore Summary:", err))
        .finally(() => setLoading(false));
    }, [portfolioId, cacheKey]);

    if (loading && !lastValue) return <CircularProgress />;

    if (!lastValue) return null;
    const isPositive = (lastValue.abs_diff || 0) >= 0;

    return (
        <Paper elevation={2} sx={{ 
            p: 3, 
            borderRadius: 2, 
            minHeight: '550px', // Stessa altezza del grafico
            display: 'flex', 
            flexDirection: 'column', 
            borderTop: `4px solid ${isPositive ? '#2e7d32' : '#d32f2f'}` 
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold">Riepilogo Asset</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Aggiornato il: {formatDate(lastValue.date)}
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={3} sx={{ flex: 1, justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Valore Attuale</Typography>
                    <Typography variant="h3" fontWeight="bold">€ {lastValue.total_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</Typography>
                </Box>

                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>Profitto / Perdita</Typography>
                    <Typography variant="h5" color={isPositive ? "success.main" : "error.main"} fontWeight="medium">
                        {isPositive ? '+' : ''}€ {lastValue.abs_diff} ({lastValue.perc_diff}%)
                    </Typography>
                </Box>

                <Divider />

                <Grid container spacing={2} sx={{ mt: 'auto' }}>
                    <Grid item xs={6}>
                        <Typography variant="caption" display="block" color="text.secondary">Investito</Typography>
                        <Typography variant="body1" fontWeight="medium">€ {lastValue.invested}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" display="block" color="text.secondary">Dividendi net</Typography>
                        <Typography variant="body1" fontWeight="medium">€ {lastValue.net_dividends}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" display="block" color="text.secondary">Cedole net</Typography>
                        <Typography variant="body1" fontWeight="medium">€ {lastValue.net_bonds}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" display="block" color="text.secondary">Interessi net</Typography>
                        <Typography variant="body1" fontWeight="medium">€ {lastValue.net_interests}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" display="block" color="text.secondary">Tasse</Typography>
                        <Typography variant="body1" color="error.light">€ {lastValue.taxes_paid}</Typography>
                    </Grid>
                </Grid>
            </Stack>
        </Paper>
    );
}

export default PortfolioSummary;
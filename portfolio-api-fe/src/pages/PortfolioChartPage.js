import React, { useEffect, useState } from 'react';
import { Container, Box, CircularProgress, Typography, Grid, Button } from '@mui/material';
import PortfolioChart from '../components/PortfolioChart';
import PortfolioSummary from '../components/PortfolioSummary';
import PositionsTable from '../components/PositionsTable'; 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function PortfolioChartPage() {
    const portfolioId = localStorage.getItem('selectedPortfolioId');
    const portfolioInfo = JSON.parse(localStorage.getItem('selectedPortfolioData') || '{}');
    const cachedHistory = JSON.parse(localStorage.getItem(`history_${portfolioId}`) || 'null');

    const [data, setData] = useState(cachedHistory);
    const [loading, setLoading] = useState(!cachedHistory);

    useEffect(() => {
        if (!portfolioId) return;
        fetch(`${API_URL}/portfolios/${portfolioId}/value-history`, {
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
        .then(d => {
            setData(d);
            localStorage.setItem(`history_${portfolioId}`, JSON.stringify(d));
        })
        .catch(err => console.error("Errore fetch storico:", err))
        .finally(() => setLoading(false));
    }, [portfolioId]);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 10 }}> 
            <Box display="flex" alignItems="center" mb={4}>
                <Button variant="outlined" onClick={() => window.history.back()} sx={{ mr: 2, minWidth: '40px', fontWeight: 'bold', borderRadius: 2 }}>
                    ← Torna Indietro
                </Button>
                <Typography variant="h4" fontWeight="bold">
                    {portfolioInfo.name || 'Dettaglio Portafoglio'}
                </Typography>
            </Box>

            <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={8}>
                    {loading && !data ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="550px" bgcolor="white" borderRadius={2} border="1px solid #eee">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <PortfolioChart data={data} />
                    )}
                </Grid>
                <Grid item xs={12} md={4}>
                    <PortfolioSummary portfolioId={portfolioId} />
                </Grid>
                <Grid item xs={12}>
                    <PositionsTable portfolioId={portfolioId} />
                </Grid>
            </Grid>
        </Container>
    );
}

export default PortfolioChartPage;
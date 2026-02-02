import React, { useState, useEffect } from 'react';
import { 
    Paper, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, Stack, Box, Divider, CircularProgress 
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function PositionsTable({ portfolioId }) {
    const [selectedRange, setSelectedRange] = useState('Max');
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('gainLoss'); // Campo di ordinamento
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' o 'desc'

    useEffect(() => {
        if (!portfolioId) return;
        
        console.log('Fetching positions for portfolio:', portfolioId);
        setLoading(true);
        fetch(`${API_URL}/portfolios/${portfolioId}/positions/performance`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
        .then(res => {
            console.log('Response status:', res.status);
            if (res.status === 401) {
                // Token scaduto - logout
                localStorage.clear();
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
                throw new Error('Token scaduto');
            }
            return res.json();
        })
        .then(data => {
            console.log('Positions performance data:', data);
            setPositions(Array.isArray(data) ? data : []);
        })
        .catch(err => {
            console.error("Errore fetch positions:", err);
            setPositions([]);
        })
        .finally(() => setLoading(false));
    }, [portfolioId]);

    if (loading) {
        return (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, borderTop: '4px solid #1976d2' }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            </Paper>
        );
    }

    if (!positions || positions.length === 0) {
        return (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, borderTop: '4px solid #1976d2' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Posizioni Aperte</Typography>
                <Typography color="text.secondary">Nessuna posizione disponibile</Typography>
            </Paper>
        );
    }

    // Funzione per ottenere la performance nel range selezionato
    const getRangePerformance = (pos) => {
        switch(selectedRange) {
            case '1W': return pos.diff_1w_perc;
            case '1M': return pos.diff_1m_perc;
            case 'YTD': return pos.diff_ytd_perc;
            case '1Y': return pos.diff_1y_perc;
            case 'Max': return pos.diff_max_perc;
            default: return pos.diff_max_perc;
        }
    };

    const getRangePrice = (pos) => {
        // Calcola il prezzo all'inizio del range usando la differenza assoluta divisa per quantità
        const quantity = pos.quantity || 1;
        switch(selectedRange) {
            case '1W': return pos.current_price - (pos.diff_1w_abs / quantity);
            case '1M': return pos.current_price - (pos.diff_1m_abs / quantity);
            case 'YTD': return pos.current_price - (pos.diff_ytd_abs / quantity);
            case '1Y': return pos.current_price - (pos.diff_1y_abs / quantity);
            case 'Max': return pos.average_price;
            default: return pos.average_price;
        }
    };

    // Funzione per gestire l'ordinamento
    const handleSort = (field) => {
        if (sortBy === field) {
            // Inverti la direzione se è già il campo selezionato
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('desc'); // Default a discendente per nuovi campi
        }
    };

    // Ordina le posizioni
    const sortedPositions = [...positions].sort((a, b) => {
        let aValue, bValue;

        if (sortBy === 'name') {
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
            if (sortDirection === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        } else if (sortBy === 'rangePerf') {
            aValue = getRangePerformance(a);
            bValue = getRangePerformance(b);
        } else if (sortBy === 'gainLoss') {
            aValue = (a.current_price - a.average_price) * a.quantity;
            bValue = (b.current_price - b.average_price) * b.quantity;
        } else if (sortBy === 'currentValue') {
            aValue = a.current_price * a.quantity;
            bValue = b.current_price * b.quantity;
        } else if (sortBy === 'invested') {
            aValue = a.invested || 0;
            bValue = b.invested || 0;
        } else {
            return 0;
        }

        if (sortDirection === 'asc') {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    });

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, borderTop: '4px solid #1976d2' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold">Posizioni Aperte</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Stack direction="row" spacing={1} mb={3} justifyContent="center" bgcolor="grey.50" p={0.5} borderRadius={2}>
                {['1W', '1M', 'YTD', '1Y', 'Max'].map(r => (
                    <Button 
                        key={r} 
                        size="small" 
                        variant={selectedRange === r ? "contained" : "text"} 
                        onClick={() => setSelectedRange(r)} 
                        sx={{ minWidth: '50px' }}
                    >
                        {r}
                    </Button>
                ))}
            </Stack>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell 
                                sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'grey.100' } }}
                                onClick={() => handleSort('name')}
                            >
                                <strong>Nome / Ticker {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}</strong>
                            </TableCell>
                            <TableCell align="right"><strong>Quantità</strong></TableCell>
                            <TableCell align="right"><strong>Prezzo Carico</strong></TableCell>
                            <TableCell align="right"><strong>Prezzo ({selectedRange})</strong></TableCell>
                            <TableCell align="right"><strong>Prezzo Attuale</strong></TableCell>
                            <TableCell 
                                align="right" 
                                sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'grey.100' } }}
                                onClick={() => handleSort('invested')}
                            >
                                <strong>Investito {sortBy === 'invested' && (sortDirection === 'asc' ? '↑' : '↓')}</strong>
                            </TableCell>
                            <TableCell 
                                align="right" 
                                sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'grey.100' } }}
                                onClick={() => handleSort('currentValue')}
                            >
                                <strong>Controvalore {sortBy === 'currentValue' && (sortDirection === 'asc' ? '↑' : '↓')}</strong>
                            </TableCell>
                            <TableCell 
                                align="right" 
                                sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'grey.100' } }}
                                onClick={() => handleSort('rangePerf')}
                            >
                                <strong>Var. {selectedRange} {sortBy === 'rangePerf' && (sortDirection === 'asc' ? '↑' : '↓')}</strong>
                            </TableCell>
                            <TableCell 
                                align="right" 
                                sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'grey.100' } }}
                                onClick={() => handleSort('gainLoss')}
                            >
                                <strong>P&L Totale {sortBy === 'gainLoss' && (sortDirection === 'asc' ? '↑' : '↓')}</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPositions.map((pos) => {
                            const rangePerf = getRangePerformance(pos);
                            const rangePrice = getRangePrice(pos);
                            const gainLoss = (pos.current_price - pos.average_price) * pos.quantity;
                            const gainLossPerc = pos.diff_max_perc;
                            const currentValue = pos.current_price * pos.quantity;
                            const invested = pos.invested || 0;
                            
                            return (
                                <TableRow key={pos.ticker} hover>
                                    <TableCell>
                                        <strong>{pos.name}</strong>
                                        <Typography variant="caption" display="block" color="text.secondary">{pos.ticker}</Typography>
                                    </TableCell>
                                    <TableCell align="right">{pos.quantity?.toFixed(2) || 'N/A'}</TableCell>
                                    <TableCell align="right">€{pos.average_price?.toFixed(2) || 'N/A'}</TableCell>
                                    <TableCell align="right">€{rangePrice?.toFixed(2) || 'N/A'}</TableCell>
                                    <TableCell align="right">€{pos.current_price?.toFixed(2) || 'N/A'}</TableCell>
                                    <TableCell align="right">
                                        <strong>€{invested.toFixed(2)}</strong>
                                    </TableCell>
                                    <TableCell align="right">
                                        <strong>€{currentValue.toFixed(2)}</strong>
                                    </TableCell>
                                    <TableCell 
                                        align="right" 
                                        sx={{ 
                                            color: rangePerf >= 0 ? 'success.main' : 'error.main',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {rangePerf >= 0 ? '+' : ''}{rangePerf?.toFixed(2) || 'N/A'}%
                                    </TableCell>
                                    <TableCell 
                                        align="right"
                                        sx={{ 
                                            color: gainLoss >= 0 ? 'success.main' : 'error.main',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        €{gainLoss.toFixed(2)} ({gainLossPerc >= 0 ? '+' : ''}{gainLossPerc?.toFixed(2)}%)
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default PositionsTable;

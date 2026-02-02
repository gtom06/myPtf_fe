import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography, Button, Stack, Paper, Divider, useTheme } from '@mui/material';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function filterByRange(values, range) {
    if (!values || !values.length) return [];
    const lastDate = new Date(values[values.length - 1].date);
    let fromDate = new Date(lastDate);
    if (range === '1D') fromDate.setDate(lastDate.getDate() - 1);
    else if (range === '1W') fromDate.setDate(lastDate.getDate() - 7);
    else if (range === '1M') fromDate.setMonth(lastDate.getMonth() - 1);
    else if (range === 'YTD') fromDate = new Date(lastDate.getFullYear(), 0, 1);
    else if (range === '1Y') fromDate.setFullYear(lastDate.getFullYear() - 1);
    else return values;
    return values.filter(v => new Date(v.date) >= fromDate);
}

function PortfolioChart({ data }) {
    const theme = useTheme();
    const [range, setRange] = useState('Max');
    const [chartType, setChartType] = useState('valore');

    if (!data || !data.daily_values) return null;

    const filtered = data.daily_values.filter(v => !(v.total_value === 0 && v.invested === 0));
    const ranged = filterByRange(filtered, range);

    // Calcola percentuali relative al primo punto del range selezionato
    const percentageData = ranged.length > 0
        ? ranged.map(v => {
            const initialPerf = ranged[0].perc_diff; // Performance iniziale del range
            const currentPerf = v.perc_diff; // Performance attuale
            return currentPerf - initialPerf; // Differenza relativa
          })
        : ranged.map(v => v.perc_diff);

    const chartData = {
        labels: ranged.map(v => new Date(v.date).toLocaleDateString('it-IT')),
        datasets: chartType === 'valore' ? [
            {
                label: 'Valore Totale',
                data: ranged.map(v => v.total_value),
                borderColor: theme.palette.primary.main,
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
            },
            {
                label: 'Investito',
                data: ranged.map(v => v.invested),
                borderColor: theme.palette.grey[500],
                borderDash: [5, 5],
                fill: false,
                tension: 0.1,
                pointRadius: 0,
            }
        ] : [
            {
                label: 'Performance (%)',
                data: percentageData,
                borderColor: '#2ecc40',
                backgroundColor: 'rgba(46, 204, 64, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Importante per controllare l'altezza manualmente
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { position: 'top', align: 'end', labels: { usePointStyle: true } },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: { 
                grid: { 
                    color: (context) => {
                        if (context.tick.value === 0) {
                            return '#666666'; // Linea dello 0 più scura
                        }
                        return '#f5f5f5';
                    },
                    lineWidth: (context) => {
                        if (context.tick.value === 0) {
                            return 2; // Linea dello 0 più spessa
                        }
                        return 1;
                    }
                }
            }
        }
    };

    return (
        <Paper elevation={2} sx={{ 
            p: 3, 
            borderRadius: 2, 
            minHeight: '550px', // Altezza fissata
            display: 'flex', 
            flexDirection: 'column',
            borderTop: '4px solid #1976d2' // Bordo blu per simmetria
        }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight="bold">Andamento Portafoglio</Typography>
                <Stack direction="row" spacing={1}>
                    <Button size="small" variant={chartType === 'valore' ? "contained" : "text"} onClick={() => setChartType('valore')}> Valore </Button>
                    <Button size="small" variant={chartType === 'performance' ? "contained" : "text"} onClick={() => setChartType('performance')}> % </Button>
                </Stack>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1} mb={2} justifyContent="center" bgcolor="grey.50" p={0.5} borderRadius={2}>
                {['1W', '1M', 'YTD', '1Y', 'Max'].map(r => (
                    <Button key={r} size="small" variant={range === r ? "contained" : "text"} onClick={() => setRange(r)} sx={{ minWidth: '50px' }}> {r} </Button>
                ))}
            </Stack>
            <Box sx={{ flex: 1, minHeight: 0 }}>
                <Line data={chartData} options={options} />
            </Box>
        </Paper>
    );
}

export default PortfolioChart;
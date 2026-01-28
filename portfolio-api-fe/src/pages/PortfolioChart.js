
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

// Registrazione scale ed elementi Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


function filterByRange(values, range) {
  if (!values.length) return values;
  const now = new Date(values[values.length - 1].date);
  let fromDate;
  switch (range) {
    case '1D':
      fromDate = new Date(now); fromDate.setDate(now.getDate() - 1); break;
    case '1W':
      fromDate = new Date(now); fromDate.setDate(now.getDate() - 7); break;
    case '1M':
      fromDate = new Date(now); fromDate.setMonth(now.getMonth() - 1); break;
    case 'YTD':
      fromDate = new Date(now.getFullYear(), 0, 1); break;
    case '1Y':
      fromDate = new Date(now); fromDate.setFullYear(now.getFullYear() - 1); break;
    case 'Max':
    default:
      return values;
  }
  return values.filter(v => new Date(v.date) >= fromDate);
}


function PortfolioChart({ data }) {
  const [range, setRange] = useState('Max');
  const [chartType, setChartType] = useState('valore'); // 'valore' o 'performance'
  if (!data || !data.daily_values) return null;

  // Filtro: escludi giorni con entrambi i valori a zero
  const filtered = data.daily_values.filter(v => !(v.total_value === 0 && v.invested === 0));
  const ranged = filterByRange(filtered, range);

  let chartData;
  if (chartType === 'valore') {
    chartData = {
      labels: ranged.map(v => new Date(v.date).toLocaleDateString('it-IT')),
      datasets: [
        {
          label: 'Valore Totale',
          data: ranged.map(v => v.total_value),
          fill: false,
          borderColor: '#1976d2', // colore fisso
          pointBackgroundColor: '#1976d2',
          pointHoverBackgroundColor: (ctx) => {
            const v = ranged[ctx.dataIndex];
            if (!v) return '#888';
            return v.total_value >= v.invested ? '#2ecc40' : '#e74c3c';
          },
          tension: 0.1,
        },
        {
          label: 'Investito',
          data: ranged.map(v => v.invested),
          fill: false,
          borderColor: '#6666cc', // colore fisso
          pointBackgroundColor: '#6666cc',
          pointHoverBackgroundColor: (ctx) => {
            const v = ranged[ctx.dataIndex];
            if (!v) return '#888';
            return v.total_value >= v.invested ? '#2ecc40' : '#e74c3c';
          },
          borderDash: [6, 4],
          tension: 0.1,
        },
      ],
    };
  } else {
    // Colora ogni segmento: verde se positivo, rosso se negativo
    chartData = {
      labels: ranged.map(v => new Date(v.date).toLocaleDateString('it-IT')),
      datasets: [
        {
          label: 'Performance (%)',
          data: ranged.map(v => v.perc_diff),
          fill: false,
          borderColor: (ctx) => {
            if (!ctx.chart || !ctx.p0DataIndex) return '#888';
            const v = ranged[ctx.p0DataIndex];
            if (!v) return '#888';
            return v.perc_diff >= 0 ? '#2ecc40' : '#e74c3c';
          },
          segment: {
            borderColor: ctx => {
              const v1 = ranged[ctx.p0DataIndex]?.perc_diff;
              const v2 = ranged[ctx.p1DataIndex]?.perc_diff;
              if (v1 >= 0 && v2 >= 0) return '#2ecc40';
              if (v1 < 0 && v2 < 0) return '#e74c3c';
              return '#888';
            }
          },
          pointBackgroundColor: (ctx) => {
            const v = ranged[ctx.dataIndex];
            if (!v) return '#888';
            return v.perc_diff >= 0 ? '#2ecc40' : '#e74c3c';
          },
          tension: 0.1,
        },
      ],
    };
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartType === 'valore' ? ' Valore Portafoglio' : 'Performance (%)',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const idx = context.dataIndex;
            const v = ranged[idx];
            if (!v) return '';
            // Mostra sempre tutti i dati rilevanti, ma evidenzia la serie selezionata
            // Formatta a due decimali
            const fmt = n => {
              const num = Number(n);
              return isNaN(num) ? n : num.toFixed(2);
            };
            let lines = [];
            if (chartType === 'valore') {
              if (context.dataset.label === 'Valore Totale') {
                lines.push(`Valore Totale: ${fmt(v.total_value)}`);
              }
              if (context.dataset.label === 'Investito') {
                lines.push(`Investito: ${fmt(v.invested)}`);
              }
              lines.push(`Diff assoluto: ${fmt(v.abs_diff)}`);
              lines.push(`Performance: ${fmt(v.perc_diff)}%`);
            } else {
              lines.push(`Performance: ${fmt(v.perc_diff)}%`);
              lines.push(`Valore Totale: ${fmt(v.total_value)}`);
              lines.push(`Investito: ${fmt(v.invested)}`);
              lines.push(`Diff assoluto: ${fmt(v.abs_diff)}`);
            }
            return lines;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Data',
        },
      },
      y: {
        title: {
          display: true,
          text: chartType === 'valore' ? 'Valore' : 'Performance (%)',
        },
      },
    },
  };

  return (
    <Box mt={3}>
      <Typography variant="h6">
        {chartType === 'valore' ? 'Andamento Valore Portafoglio' : 'Performance (%)'}
      </Typography>
      <Box mb={2}>
        <span style={{marginRight: 16}}>
          <button
            style={{
              marginRight: 4,
              padding: '4px 10px',
              background: chartType === 'valore' ? '#1976d2' : '#eee',
              color: chartType === 'valore' ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            onClick={() => setChartType('valore')}
          >
            Valore portafoglio
          </button>
          <button
            style={{
              marginLeft: 4,
              padding: '4px 10px',
              background: chartType === 'performance' ? '#1976d2' : '#eee',
              color: chartType === 'performance' ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            onClick={() => setChartType('performance')}
          >
            Performance
          </button>
        </span>
        {['1D', '1W', '1M', 'YTD', '1Y', 'Max'].map(r => (
          <button
            key={r}
            style={{
              marginRight: 8,
              padding: '4px 10px',
              background: r === range ? '#1976d2' : '#eee',
              color: r === range ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </Box>
      <Line data={chartData} options={chartOptions} />
    </Box>
  );
}

export default PortfolioChart;

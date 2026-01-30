import React, { useState, useEffect } from 'react';
import { CssBaseline, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PortfolioChartPage from './pages/PortfolioChartPage'; 
import Header from './components/Header';
import Footer from './components/Footer';
import { logoutAll } from './utils/logout';

function App() {
  // --- 1. HOOKS ---
  const [user, setUser] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser('utente');
    }
  }, []);

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // --- 2. LOGICA ---
  const handleLogout = () => {
    logoutAll();
    setUser(null);
    window.history.pushState({}, '', '/login');
    setCurrentPath('/login');
  };

  // Stile per il contenitore principale: garantisce che il footer stia in fondo
  const appStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  // --- 3. GESTIONE ROTTE ---
  let pageContent;

  if (!user) {
    // Layout per Login (centrato verticalmente)
    return (
      <Box sx={appStyle}>
        <CssBaseline />
        <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoginPage onLogin={username => {
            setUser(username);
            window.history.pushState({}, '', '/homepage');
            setCurrentPath('/homepage');
          }} />
        </Box>
        <Footer />
      </Box>
    );
  }

  // Logica per le pagine autenticate
  if (currentPath === '/portfolio-chart') {
    const selectedPortfolioId = localStorage.getItem('selectedPortfolioId');
    if (!selectedPortfolioId) {
      window.history.pushState({}, '', '/homepage');
      pageContent = <HomePage onLogout={handleLogout} />;
    } else {
      pageContent = <PortfolioChartPage />;
    }
  } else {
    // Default a HomePage per /homepage, / o rotte sconosciute
    pageContent = <HomePage onLogout={handleLogout} />;
  }

  return (
    <Box sx={appStyle}>
      <CssBaseline />
      <Header onLogout={handleLogout} />
      
      {/* flex: 1 qui è il segreto: 
          prende tutto lo spazio tra Header e Footer 
      */}
      <Box component="main" sx={{ flex: 1 }}>
        {pageContent}
      </Box>
      
      <Footer />
    </Box>
  );
}

export default App;
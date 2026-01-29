import React, { useState, useEffect } from 'react';
import { CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import Footer from './components/Footer';
import { logoutAll } from './utils/logout';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Se c'è un token, considera l'utente autenticato
    const token = localStorage.getItem('token');
    if (token) {
      setUser('utente');
    }
  }, []);

  const appStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  if (!user) {
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
    }
    return (
      <div style={appStyle}>
        <CssBaseline />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <LoginPage onLogin={username => {
            setUser(username);
            window.history.pushState({}, '', '/homepage');
          }} />
        </div>
        <Footer />
      </div>
    );
  }
  const handleLogout = () => {
    logoutAll();
    setUser(null);
    window.history.pushState({}, '', '/login');
  };
  if (window.location.pathname !== '/homepage') {
    window.history.pushState({}, '', '/homepage');
  }
  return (
    <div style={appStyle}>
      <CssBaseline />
      <Header onLogout={handleLogout} />
      <div style={{ flex: 1 }}>
        <HomePage onLogout={handleLogout} />
      </div>
      <Footer />
    </div>
  );
}

export default App;

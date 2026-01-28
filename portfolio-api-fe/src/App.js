import React, { useState, useEffect } from 'react';
import { CssBaseline } from '@mui/material';
import LoginPage from './LoginPage';
import HomePage from './HomePage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Se c'è un token, considera l'utente autenticato
    const token = localStorage.getItem('token');
    if (token) {
      // Puoi decodificare il token per ottenere lo username, oppure usare un valore fittizio
      setUser('utente');
    }
  }, []);

  if (!user) {
    // Aggiorna l'URL se non già su /login
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
    }
    return <LoginPage onLogin={username => {
      setUser(username);
      // Aggiorna l'URL su homepage dopo login
      window.history.pushState({}, '', '/homepage');
    }} />;
  }
  const handleLogout = () => {
    setUser(null);
    // Aggiorna l'URL su /login dopo logout
    window.history.pushState({}, '', '/login');
  };
  // Aggiorna l'URL su /homepage se non già lì
  if (window.location.pathname !== '/homepage') {
    window.history.pushState({}, '', '/homepage');
  }
  return (
    <>
      <CssBaseline />
      <HomePage onLogout={handleLogout} />
    </>
  );
}

export default App;

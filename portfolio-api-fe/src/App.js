import React, { useState } from 'react';
import { CssBaseline, Container, Typography, Button } from '@mui/material';
import LoginPage from './LoginPage';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm" style={{ marginTop: 40 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Portfolio App
        </Typography>
        <Button variant="contained" color="primary" fullWidth>
          Material UI Button
        </Button>
        <h2>Benvenuto, {user}!</h2>
      </Container>
    </>
  );
}

export default App;

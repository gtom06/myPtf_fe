import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function Header({ onLogout }) {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: 1 }}>
          <span role="img" aria-label="portfolio">💼</span> My Portfolio
        </Typography>
        {onLogout && (
          <Button color="inherit" variant="outlined" onClick={onLogout} sx={{ ml: 2, bgcolor: 'white', color: 'primary.main', borderColor: 'white', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}>
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;

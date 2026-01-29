import React from 'react';
import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box component="footer" sx={{ py: 2, bgcolor: 'grey.100', textAlign: 'center', borderTop: 1, borderColor: 'grey.300', position: 'fixed', left: 0, bottom: 0, width: '100vw', zIndex: 1300 }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} My Portfolio. Tutti i diritti riservati.
      </Typography>
    </Box>
  );
}

export default Footer;

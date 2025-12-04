import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import AuthProvider and AuthWrapper
import { AuthProvider } from './contexts/AuthContext';
import AuthWrapper from './AuthWrapper';

// Define a dark theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(232, 64%, 30%)', // --primary
    },
    background: {
      default: 'hsl(0, 0%, 96.1%)', // --background
      paper: 'hsl(0, 0%, 100%)', // --card
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AuthWrapper />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

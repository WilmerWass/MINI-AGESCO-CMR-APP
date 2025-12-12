import React from 'react';
import { HashRouter } from 'react-router-dom';
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
      <HashRouter>
        <AuthProvider>
          <AuthWrapper />
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;

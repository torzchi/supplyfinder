import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import Sidebar from './components/Sidebar';
import GeminiChat from './components/GeminiChat';
import CypherForm from './components/CypherForm';
import Card from './components/Card';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3182ce',
      dark: '#2d3748',
      light: '#63b3ed',
    },
    secondary: {
      main: '#38a169',
    },
    background: {
      default: '#f7fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App = () => {
  const [currentPage, setCurrentPage] = useState('chat');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'chat':
        return <GeminiChat />;
      case 'cypher':
        return <CypherForm />;
      case 'Shop':
        return <Card />;
      default:
        return <Card />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar onNavigate={handleNavigate} currentPage={currentPage} />
        {renderContent()}
      </Box>
    </ThemeProvider>
  );
};

export default App;
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import Header from './components/Header'; // Import the Header component
import Sidebar from './components/Navbar';
import GeminiChat from './components/GeminiChat';
import CypherForm from './components/CypherForm';
import Shop from './components/Shop';
import Homepage from './components/Homepage';
import SuppliersPage from './components/SuppliersPage';
import AddProductForm from './components/AddProductForm';
import AssistantChat from './components/AssistantChat';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3182ce',
      dark: '#  ',
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

const AppLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', m: 0, p: 0 }}>
      <Header />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Main layout route that contains Header and Sidebar */}
          <Route element={<AppLayout />}>
            {/* Index route (default when path is '/') */}
            <Route index element={<Homepage />} />
            {/* Other routes */}
            <Route path="chat" element={<GeminiChat />} />
            <Route path="cypher" element={<CypherForm />} />
            <Route path="shop" element={<Shop />} />
            <Route path="home" element={<Homepage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="add-product" element={<AddProductForm />} />
            <Route path="assistant" element={<AssistantChat />} />
            {/* Optional: 404 catch-all route */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

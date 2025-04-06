import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
// Removed IconButton, Badge, ShoppingCartIcon as they weren't used in the provided snippet
// Removed CategoryTabs import
import SearchBar from './SearchBar';

// Remove category-related props from the function signature
const Header = ({ searchTerm, setSearchTerm }) => {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}
        >
          ModernHaus {/* Removed the SearchBar from inside Typography */}
        </Typography>

        {/* Moved SearchBar directly into Toolbar for better structure */}
        <Box sx={{ width: { xs: '100%', sm: '50%' }, ml: { sm: 2 } }}> {/* Allow search bar to take space */}
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </Box>

        {/* This Box was empty before, potentially for icons - kept it for now */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }} />

      </Toolbar>
      {/* Removed the entire Box and Container that previously held CategoryTabs */}
    </AppBar>
  );
};

export default Header;
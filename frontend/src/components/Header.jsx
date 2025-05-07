import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const Header = ({ categories, activeCategory, setActiveCategory }) => {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (inputValue.trim()) {
      navigate(`/shop?category=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}
        >
          SupplyFinder
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, display: 'flex', alignItems: 'center' }}>
            <InputBase
              placeholder="Search products..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                bgcolor: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                flexGrow: 1,
              }}
            />
            <IconButton onClick={handleSearch} sx={{ ml: 1, bgcolor: 'white', borderRadius: 2 }}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' } }} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;

import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, Container } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CategoryTabs from './CategoryTabs';
import SearchBar from './SearchBar';
const Header = ({ categories, activeCategory, setActiveCategory,  searchTerm, 
    setSearchTerm }) => {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}
        >
          ModernHaus

        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>

          <Box sx={{ width: '50%' }}>
            <SearchBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
            />
            </Box>
        </Box>
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <IconButton size="large" color="inherit">
            <Badge badgeContent={0} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
      <Box sx={{ bgcolor: 'primary.dark' }}>
        <Container maxWidth="lg">
          <CategoryTabs 
            categories={categories} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
          />
        </Container>
      </Box>
    </AppBar>
  );
};

export default Header;
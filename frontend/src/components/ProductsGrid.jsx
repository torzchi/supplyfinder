import React from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Button } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import ProductCard from './ProductCard';

const ProductsGrid = ({ loading, error, filteredProducts, expandedProduct, toggleProductExpansion, onExtendedSearch, onExtendedAPISearch, APISearch, isScraped }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark', borderRadius: 2 }}
      >
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No products found</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your search or filter settings.
          </Typography>
          <Button variant="contained" color="primary" onClick={onExtendedSearch}>
            Extended AI Search
          </Button>
          <Button variant="contained" color="primary" onClick={onExtendedAPISearch} sx={{ ml: 2 }}>
            Extended API Search
          </Button>
          <Button variant="contained" color="primary" onClick={APISearch} sx={{ ml: 2 }}>
            Web Scrape
          </Button>
        </Paper>
      </Grid>
    );
  }

  return (
    <Grid container spacing={4}>
      {filteredProducts.map((product) => (
        <Grid item key={product.id} xs={12} sm={6} md={6} lg={4} sx={{ height: '100%' }}>
          <ProductCard
            product={product}
            expandedProduct={expandedProduct}
            toggleProductExpansion={toggleProductExpansion}
            isScraped={isScraped}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductsGrid;

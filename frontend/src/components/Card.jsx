import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Avatar, styled } from '@mui/material';

const ContentContainer = styled(Box)(({ theme }) => ({
  marginLeft: '250px', // Match sidebar width
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch', // Center content horizontally
  height: '100vh',
  width: 'calc(100% - 250px)',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

// Larger avatar for providers
const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(8),
  height: theme.spacing(8),
  fontSize: '1.5rem',
  marginRight: theme.spacing(2),
}));

const products = [
  {
    id: 1,
    name: 'Product A',
    description: 'High-quality product with advanced features.',
    providers: [
      { id: 1, name: 'Provider X', location: 'New York' },
      { id: 2, name: 'Provider Y', location: 'Los Angeles' },
    ],
  },
  {
    id: 2,
    name: 'Product B',
    description: 'Eco-friendly and sustainable product.',
    providers: [
      { id: 3, name: 'Provider Z', location: 'Chicago' },
    ],
  },
  // Add more products as needed
];

// Separate component for provider cards
const ProviderCard = ({ provider }) => {
  return (
    <Card variant="outlined" sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
         
          <Box>
            <Typography variant="h6">{provider.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {provider.location}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ProductCard = ({ product }) => {
  return (
    <Card sx={{ mb: 6, width: '100%' }}>
      <CardContent>
        <Typography variant="h4" component="div" sx={{ mb: 2 }}>
          {product.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {product.description}
        </Typography>
        
        <Typography variant="h5" sx={{ mb: 3 }}>
          Providers:
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {product.providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const ProductsDisplay = () => {
  return (
    <ContentContainer>
      <Typography variant="h3" sx={{ mb: 6, alignSelf: 'flex-start' }}>
        Products
      </Typography>
      
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ContentContainer>
  );
};

export default ProductsDisplay;
import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getCategoryIcon } from './CategoryTabs';
import SupplierNews from './SupplierNews';

// Sample category data with image URLs
const mainCategories = [
  {
    name: 'Sofa',
    imageUrl: '/sofa.jpg',
    description: 'Comfortable seating for your living room',
    featured: true
  },
  {
    name: 'Chair',
    imageUrl: '/chair.jpg',
    description: 'Stylish seating options for every space'
  },
  {
    name: 'Table',
    imageUrl: '/table.jpg',
    description: 'Dining and coffee tables for your home'
  },
  {
    name: 'Bed',
    imageUrl: '/bed.jpg',
    description: 'Rest and relax with our comfortable beds'
  },
  {
    name: 'Desk',
    imageUrl: '/desk.jpg',
    description: 'Spacious desks for storage'
  },
  {
    name: 'Shelf',
    imageUrl: '/shelf.jpg',
    description: 'Cabinets and shelves for organization'
  }
];

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    // Navigate to the shop page with category as URL parameter
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/api/placeholder/1920/600")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                Modern Furniture for Modern Living
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                Find the perfect pieces for your home with our curated selection
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/shop')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: theme.shadows[4]
                }}
              >
                Shop All Products
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Category Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Featured Categories
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse our most popular furniture collections
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {mainCategories.map((category) => (
            <Grid item key={category.name} xs={12} sm={6} md={4}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8]
                  },
                  cursor: 'pointer'
                }}
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={category.imageUrl}
                  alt={category.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getCategoryIcon(category.name)}
                    <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                      {category.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Supplier News Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <SupplierNews />
      </Container>

      {/* Call to Action */}
      <Box sx={{ bgcolor: 'grey.100', py: 6, mt: 6 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Find the perfect furniture for your home
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Browse our extensive collection of high-quality furniture from trusted suppliers
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/shop')}
          >
            Explore All Products
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;

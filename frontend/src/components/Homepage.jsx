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
    name: 'Canapea',
    imageUrl: '/sofa.jpg',
    description: 'Comfortabile pentru odihna de zi cu zi',
    featured: true
  },
  {
    name: 'Scaun',
    imageUrl: '/chair.jpg',
    description: 'Opțiuni de scaune elegante pentru fiecare spațiu'
  },
  {
    name: 'Masa',
    imageUrl: '/table.jpg',
    description: 'Mese de sufragerie și de cafea pentru casa ta'
  },
  {
    name: 'Pat',
    imageUrl: '/bed.jpg',
    description: 'Ofera odihna si relaxare'
  },
  {
    name: 'Birou',
    imageUrl: '/desk.jpg',
    description: 'Birouri spatioase pentru stocare'
  },
  {
    name: 'Raft',
    imageUrl: '/shelf.jpg',
    description: 'Rafturi pentru organizare'
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
                Descopera produsele oferite 
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                Vizualizeaza toate produsele de la furnizorii tai preferati
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
                 Catalog produse
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Category Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
        Cauta dupa categoriile populare
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          
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
      
    </Box>
  );
};

export default HomePage;

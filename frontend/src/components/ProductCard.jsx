import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CardActions
} from '@mui/material';
import EcoIcon from '@mui/icons-material/Recycling';
import BusinessIcon from '@mui/icons-material/Business';
import { getCategoryIcon } from './CategoryTabs';
import SuppliersList from './SuppliersList';

const ProductCard = ({ product }) => {
  const lowestPrice = Math.min(...product.suppliers.map(s => s.price));

  const handleViewDetails = () => {
    const url = product.suppliers && product.suppliers.length > 0 ? product.suppliers[0].url : null;
    if (!url) {
      console.error("Product URL is undefined or not available:", product);
      return;
    }
    console.log("Opening URL:", url);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      elevation={3}
      sx={{
        height: '800px', // Fixed height for all cards
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: "100%",
          height: 400,
          objectFit: 'fill'
        }}
        image={product.imageUrl}
        alt={product.name}
      />
      <CardContent sx={{ 
        flexGrow: 1, 
        px: 3, 
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 400px - 72px)', // Subtract image height and button height
        overflow: 'hidden'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </Typography>
          {product.climateFriendly && (
            <Chip
              icon={<EcoIcon />}
              label="Eco"
              color="success"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {getCategoryIcon(product.category)}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {product.category}
          </Typography>
        </Box>

        <Typography variant="h5" color="primary.main" sx={{ mt: 2, fontWeight: 500 }}>
          From ${lowestPrice.toFixed(2)}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ fontSize: '0.875rem', color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary">
            {product.suppliers.length} Supplier{product.suppliers.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Box sx={{ mt: 2, flexGrow: 1, minHeight: 0 }}>
          <SuppliersList suppliers={product.suppliers} />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 1 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleViewDetails}
          disabled={!(product.suppliers && product.suppliers.length > 0 && product.suppliers[0].url)}
          size="large"
          sx={{ borderRadius: 1.5, py: 1 }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;

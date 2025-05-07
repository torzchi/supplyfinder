import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardActions
} from '@mui/material';
import EcoIcon from '@mui/icons-material/Recycling';
import BusinessIcon from '@mui/icons-material/Business';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getCategoryIcon } from './CategoryTabs';
import SuppliersList from './SuppliersList';

const ProductCard = ({ product, expandedProduct, toggleProductExpansion }) => {
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
        height: '100%',
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
          height: 400, // Increased height
          objectFit: 'fill'
        }}
        image={product.imageUrl}
        alt={product.name}
      />
      <CardContent sx={{ flexGrow: 1, px: 3, py: 2 }}>
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
      </CardContent>

      <Box sx={{ px: 3, pb: 1 }}>
        <Accordion
          expanded={expandedProduct === product.id}
          onChange={() => toggleProductExpansion(product.id)}
          elevation={0}
          sx={{
            bgcolor: 'grey.50',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 1, py: 0, minHeight: 36, '& .MuiAccordionSummary-content': { margin: '4px 0' } }}
          >
            <BusinessIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'primary.main' }} />
            <Typography variant="body2">
              {product.suppliers.length} Supplier{product.suppliers.length !== 1 ? 's' : ''}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, pt: 1 }}>
            <SuppliersList suppliers={product.suppliers} />
          </AccordionDetails>
        </Accordion>
      </Box>

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

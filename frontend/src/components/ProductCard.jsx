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
  
  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
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
        
        <Typography variant="h6" color="primary.main" sx={{ mt: 2 }}>
          From ${lowestPrice.toFixed(2)}
        </Typography>
      </CardContent>

      <Box sx={{ px: 2, pb: 1 }}>
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

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button variant="contained" color="primary" fullWidth>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CardActions,
  IconButton,
  Tooltip
} from '@mui/material';
import EcoIcon from '@mui/icons-material/Recycling';
import BusinessIcon from '@mui/icons-material/Business';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { getCategoryIcon } from './CategoryTabs';
import SuppliersList from './SuppliersList';

const ProductCard = ({ product, isScraped = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSaveToDatabase = async () => {
    if (!isScraped || isSaved) return;
    
    try {
      setIsSaving(true);
      const supplier = product.suppliers[0];
      const productUrl = supplier.url || '';
      
      const cypherQuery = `
        MERGE (l:Locatie {country: '${supplier.country || 'Unknown'}'})
        MERGE (f:Furnizor {name: '${supplier.name}'})
        ON CREATE SET f.address = '${supplier.address || ''}', f.contact = '${supplier.contact || ''}', f.rating = ${parseFloat(supplier.rating) || 0}
        MERGE (f)-[:LOCATED_IN]->(l)
        CREATE (p:Produs {
          name: '${product.name}',
          category: '${product.category}',
          photo: '${product.imageUrl}',
          climateFriendly: ${product.climateFriendly || false},
          url: '${productUrl}'
        })
        CREATE (f)-[:PROVIDE {price: '${supplier.price}', condition: 'New'}]->(p)
        RETURN p
      `;

      const response = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: cypherQuery,
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      setIsSaved(true);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
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
        {isScraped && (
          <Tooltip title={isSaved ? "Saved to database" : "Save to database"}>
            <IconButton
              onClick={handleSaveToDatabase}
              disabled={isSaving || isSaved}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}
            >
              {isSaved ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon color="error" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <CardContent sx={{ 
        flexGrow: 1, 
        px: 3, 
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 400px - 72px)',
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
          From {lowestPrice.toFixed(2)} lei
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

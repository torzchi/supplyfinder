import ReactCountryFlag from "react-country-flag";
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  Box,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EcoIcon from '@mui/icons-material/Recycling';
import ChairIcon from '@mui/icons-material/Chair';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import WeekendIcon from '@mui/icons-material/Weekend';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ProductSupplierPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Determine category based on product name
  const getCategoryFromName = (name) => {
    if (!name) return "Other";
    const nameLower = name.toLowerCase();
    if (nameLower.includes("scaun") || nameLower.includes("chair")) return "Chairs";
    if (nameLower.includes("masa") || nameLower.includes("table")) return "Tables";
    if (nameLower.includes("canapea") || nameLower.includes("sofa")) return "Sofas";
    if (nameLower.includes("pat") || nameLower.includes("dormitor") || nameLower.includes("bedroom")) return "Bedroom";
    return "Other";
  };

  // Get an icon based on the category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Chairs":
        return <ChairIcon fontSize="small" />;
      case "Tables":
        return <TableRestaurantIcon fontSize="small" />;
      case "Sofas":
        return <WeekendIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Improved price parsing function
  const parsePrice = (price) => {
    if (price === null || price === undefined) return 0;
    
    // If already a number, return it
    if (typeof price === 'number') return price;
    
    // If string, remove any non-numeric characters except decimal point
    if (typeof price === 'string') {
      const numericString = price.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(numericString);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  };

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const cypherQuery = JSON.stringify({
          query: `MATCH (f:Furnizor)-[:PROVIDE]->(p:Produs)
                  OPTIONAL MATCH (f)-[:LOCATED_IN]->(l:Locatie)
                  RETURN p.name AS productName, p.price AS price, p.photo AS photo, 
                         p.climateFriendly AS climateFriendly, id(p) AS id, 
                         f.name AS supplierName, f.address AS address, l.country AS country
                  ORDER BY p.name`
        });

        const response = await fetch('http://localhost:8080/api/cypher/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: cypherQuery,
        });

        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        // Group suppliers by product
        const productsMap = new Map();
        
        data.forEach(record => {
          const productId = record.id;
          
          if (!productsMap.has(productId)) {
            productsMap.set(productId, {
              id: productId,
              name: record.productName,
              price: parsePrice(record.price), // Use the parsePrice function here
              imageUrl: record.photo || '/api/placeholder/600/400',
              climateFriendly: record.climateFriendly === 'true',
              category: getCategoryFromName(record.productName),
              suppliers: []
            });
          }
          
          const product = productsMap.get(productId);
          product.suppliers.push({
            name: record.supplierName,
            address: record.address || 'Unknown',
            country: record.country || 'Unknown'
          });
        });

        setProducts(Array.from(productsMap.values()));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Product Catalog
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <CardMedia
                        component="img"
                        image={product.imageUrl}
                        alt={product.name}
                        sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                      />
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant="h5" gutterBottom>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getCategoryIcon(product.category)}
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          {product.category}
                        </Typography>
                        {product.climateFriendly && (
                          <Chip
                            icon={<EcoIcon />}
                            label="Eco-Friendly"
                            size="small"
                            color="success"
                            sx={{ ml: 2 }}
                          />
                        )}
                      </Box>
                      <Typography variant="h6" color="primary">
                        ${product.price.toFixed(2)}
                      </Typography>
                      
                      <Accordion 
                        expanded={expandedProduct === product.id}
                        onChange={() => toggleProductExpansion(product.id)}
                        sx={{ mt: 2 }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon sx={{ mr: 1 }} />
                            {product.suppliers.length} Available Supplier{product.suppliers.length !== 1 ? 's' : ''}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {product.suppliers.map((supplier, index) => (
                              <React.Fragment key={index}>
                                <ListItem>
                                  <ListItemText
                                    primary={supplier.name}
                                    secondary={
                                      <>
                                    <Typography component="span" variant="body2" display="block">
                                            <LocalShippingIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            {supplier.address}
                                            {(() => {
                                              // Extract last 2 letters (assuming they're the country code)
                                              const address = supplier.address || '';
                                              const lastTwoLetters = address.trim().slice(-2).toUpperCase();
                                              
                                              // Only show flag if we have exactly 2 letters (no numbers/symbols)
                                              if (/^[A-Z]{2}$/.test(lastTwoLetters)) {
                                                return (
                                                  <ReactCountryFlag 
                                                    countryCode={lastTwoLetters}
                                                    style={{
                                                      marginLeft: '8px',
                                                      fontSize: '1em',
                                                      verticalAlign: 'middle'
                                                    }}
                                                    svg
                                                    title={lastTwoLetters}
                                                  />
                                                );
                                              }
                                              return null;
                                            })()}
                                      </Typography>
                                      </>
                                    }
                                  />
                                </ListItem>
                                {index < product.suppliers.length - 1 && <Divider />}
                              </React.Fragment>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProductSupplierPage;
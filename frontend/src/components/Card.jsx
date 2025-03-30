import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Paper, 
  Box,
  Chip,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import EcoIcon from '@mui/icons-material/Recycling';
import ChairIcon from '@mui/icons-material/Chair';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import WeekendIcon from '@mui/icons-material/Weekend';

// Mock suppliers data - you would also fetch this from your database if available
const mockSuppliers = {
  1: [
    { id: 101, name: "Furniture Direct", location: "Bucharest, Romania", reliability: 4.9 },
    { id: 102, name: "Wood Specialists", location: "Cluj, Romania", reliability: 4.7 },
  ],
  2: [
    { id: 201, name: "Home Furnishing Co.", location: "Timisoara, Romania", reliability: 4.6 },
  ],
  3: [
    { id: 301, name: "Modern Furniture", location: "Iasi, Romania", reliability: 4.5 },
    { id: 302, name: "Classic Interiors", location: "Brasov, Romania", reliability: 4.8 },
  ]
};

// Furniture categories based on your data
const defaultCategories = ["Chairs", "Tables", "Sofas", "Bedroom", "Other"];

const ProductSupplierPage = () => {
  const [products, setProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(defaultCategories);

  // Determine category based on product name
  const getCategoryFromName = (name) => {
    if (!name) return "Other";
    
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes("scaun") || nameLower.includes("chair")) {
      return "Chairs";
    } else if (nameLower.includes("masa") || nameLower.includes("table")) {
      return "Tables";
    } else if (nameLower.includes("canapea") || nameLower.includes("sofa")) {
      return "Sofas";
    } else if (nameLower.includes("pat") || nameLower.includes("dormitor") || nameLower.includes("bedroom")) {
      return "Bedroom";
    } else {
      return "Other";
    }
  };

  // Parse price string to float
  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    
    // If it's already a number, return it
    if (typeof priceString === 'number') return priceString;
    
    // Handle string prices like "$1,899.00"
    if (typeof priceString === 'string') {
      return parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;
    }
    
    return 0;
  };

  // Fetch products from the graph database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const cypherQuery = `
          MATCH (p:Produs)
          RETURN p.name as name, p.photo as photo, p.price as price, p.climateFriendly as climateFriendly, id(p) as id
        `;
        
        const response = await fetch('http://localhost:8080/api/cypher/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: cypherQuery,
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        let data = await response.json();
        
        // Filter out entries with null names or completely empty entries
        data = data.filter(record => record && record.name);
        
        // Transform the data to match our application structure
        const transformedProducts = data.map(record => {
          // Use the helper function to determine category
          const category = getCategoryFromName(record.name);
          
          // Parse the price properly
          const parsedPrice = parsePrice(record.price);
          
          // Generate a description based on available data
          const nameParts = record.name ? record.name.split(' ') : [];
          let description = "Quality furniture piece";
          
          if (nameParts.length > 1) {
            description = `${category} made with quality materials${record.climateFriendly === "true" ? ', eco-friendly' : ''}`;
          }
          
          // Assign a rating between 3.5 and 5.0
          const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
          
          // Get a supplier group based on product id
          const supplierGroupId = (record.id % 3) + 1;
          
          return {
            id: record.id,
            name: record.name,
            description: description,
            price: parsedPrice,
            category: category,
            rating: parseFloat(rating),
            imageUrl: record.photo || "/api/placeholder/600/400",
            climateFriendly: record.climateFriendly === "true",
            suppliers: mockSuppliers[supplierGroupId] || []
          };
        });
        
        setProducts(transformedProducts);
        
        // Extract unique categories from transformed products
        const uniqueCategories = [...new Set(transformedProducts.map(product => product.category))];
        setCategories(uniqueCategories.length > 0 ? uniqueCategories : defaultCategories);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const toggleProductExpansion = (productId) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(productId);
    }
  };

  const handleCategoryChange = (event, category) => {
    if (event.target.checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    }
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Get icon based on category
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

  // Apply filters
  useEffect(() => {
    if (products.length === 0) return;
    
    let results = products;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name && product.name.toLowerCase().includes(query) || 
        product.description && product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      results = results.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    
    // Apply price range filter
    results = results.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    setFilteredProducts(results);
  }, [searchQuery, selectedCategories, priceRange, products]);

  // Get the maximum price from products for slider
  const maxPrice = products.length > 0 
    ? Math.ceil(Math.max(...products.map(p => p.price || 0)) * 1.2) // Add 20% buffer
    : 2000;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Furniture Catalog
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Browse our selection of quality furniture and available suppliers
      </Typography>
      
      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search Products"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="filter-panel-content"
                id="filter-panel-header"
              >
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterListIcon sx={{ mr: 1 }} />
                  Filters
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Category Filter */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Product Categories
                    </Typography>
                    <FormGroup>
                      {categories.map(category => (
                        <FormControlLabel
                          key={category}
                          control={
                            <Checkbox 
                              checked={selectedCategories.includes(category)}
                              onChange={(e) => handleCategoryChange(e, category)}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getCategoryIcon(category)}
                              <span style={{ marginLeft: '8px' }}>{category}</span>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                  
                  {/* Price Range Filter */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Price Range
                    </Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={priceRange}
                        onChange={handlePriceChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={maxPrice > 0 ? maxPrice : 2000}
                        marks={[
                          { value: 0, label: '$0' },
                          { value: maxPrice / 2, label: `$${Math.floor(maxPrice / 2)}` },
                          { value: maxPrice, label: `$${maxPrice}` },
                        ]}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2">
                          ${priceRange[0]}
                        </Typography>
                        <Typography variant="body2">
                          ${priceRange[1]}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {error && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography variant="h6" color="error">
            Error loading products
          </Typography>
          <Typography variant="body2">
            {error}. Showing available products.
          </Typography>
        </Paper>
      )}
      
      {/* Results Summary */}
      {!loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      )}
      
      {/* Product List */}
      <Grid container spacing={4}>
        {!loading && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Grid item xs={12} key={product.id}>
              <Card 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: expandedProduct === product.id ? 6 : 1,
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
                onClick={() => toggleProductExpansion(product.id)}
              >
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', md: 200 },
                    height: { xs: 200, md: 'auto' }
                  }}
                  image={product.imageUrl}
                  alt={product.name || "Furniture item"}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h5" component="h2">
                        {product.name || "Untitled Product"}
                      </Typography>
                      <Box>
                        <Chip 
                          icon={getCategoryIcon(product.category)}
                          label={product.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ mr: 1 }}
                        />
                        {product.climateFriendly && (
                          <Chip 
                            icon={<EcoIcon />}
                            label="Eco-Friendly" 
                            size="small" 
                            color="success" 
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={parseFloat(product.rating)} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.rating})
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color={product.price ? "primary" : "text.secondary"}>
                      {product.price ? `$${product.price.toFixed(2)}` : "Price upon request"}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <BusinessIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">
                        {product.suppliers.length} Supplier{product.suppliers.length !== 1 ? 's' : ''} Available
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
              
              {expandedProduct === product.id && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    mt: -1, 
                    pt: 2, 
                    px: 3, 
                    pb: 3, 
                    borderTop: '1px solid #eee',
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalShippingIcon sx={{ mr: 1 }} />
                    Suppliers for {product.name || "this product"}
                  </Typography>
                  <List>
                    {product.suppliers.map((supplier, index) => (
                      <React.Fragment key={supplier.id}>
                        {index > 0 && <Divider component="li" />}
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={supplier.name}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {supplier.location}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                    Reliability:
                                  </Typography>
                                  <Rating value={supplier.reliability} precision={0.1} readOnly size="small" />
                                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    ({supplier.reliability})
                                  </Typography>
                                </Box>
                              </React.Fragment>
                            }
                          />
                          <Chip 
                            label="Contact" 
                            variant="outlined" 
                            size="small" 
                            color="primary"
                            sx={{ alignSelf: 'center' }}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
          ))
        ) : !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No products found matching your criteria
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your filters or search query
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ProductSupplierPage;
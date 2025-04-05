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
  ListItemText,
  AppBar,
  Toolbar,
  InputBase,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Badge
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EcoIcon from '@mui/icons-material/Recycling';
import ChairIcon from '@mui/icons-material/Chair';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import WeekendIcon from '@mui/icons-material/Weekend';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import BedIcon from '@mui/icons-material/Bed';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import HistoryIcon from '@mui/icons-material/History';
import BuildIcon from '@mui/icons-material/Build';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const FurnitureMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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
        return <ChairIcon />;
      case "Tables":
        return <TableRestaurantIcon />;
      case "Sofas":
        return <WeekendIcon />;
      case "Bedroom":
        return <BedIcon />;
      default:
        return <CategoryIcon />;
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

  // Get an icon for condition
  const getConditionBadge = (condition) => {
    if (!condition) return null;
    
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes("new")) {
      return <Chip icon={<NewReleasesIcon />} label="New" color="success" size="small" />;
    } else if (conditionLower.includes("used")) {
      return <Chip icon={<HistoryIcon />} label="Used" color="warning" size="small" />;
    } else if (conditionLower.includes("refurbished")) {
      return <Chip icon={<BuildIcon />} label="Refurbished" color="info" size="small" />;
    }
    
    return <Chip label={condition} size="small" />;
  };

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const cypherQuery = JSON.stringify({
          query: `
            MATCH (f:Furnizor)-[r:PROVIDE]->(p:Produs)
            OPTIONAL MATCH (f)-[:LOCATED_IN]->(l:Locatie)
            RETURN 
              p.name AS productName,
              r.price AS supplierPrice,
              r.condition AS supplierCondition,
              p.photo AS photo,
              p.climateFriendly AS climateFriendly,
              id(p) AS id,
              f.name AS supplierName,
              f.address AS address,
              l.country AS country
            ORDER BY p.name, supplierPrice
          `
        });

        // This would be replaced with your actual fetch call
        // For now, we'll simulate a response
      
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
              imageUrl: record.photo || '/api/placeholder/600/400',
              climateFriendly: record.climateFriendly === 'true',
              category: getCategoryFromName(record.productName),
              suppliers: []
            });
          }
          
          const product = productsMap.get(productId);
          product.suppliers.push({
            name: record.supplierName,
            price: parsePrice(record.supplierPrice),
            condition: record.supplierCondition,
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

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get all unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}
          >
            ModernHaus
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Search>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton size="large" color="inherit">
              <Badge badgeContent={0} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
        
        {/* Category tabs */}
        <Box sx={{ bgcolor: 'primary.dark' }}>
          <Container maxWidth="lg">
            <Tabs
              value={categories.indexOf(activeCategory)}
              onChange={(_, newValue) => setActiveCategory(categories[newValue])}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
              sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' }, '& .Mui-selected': { color: 'white' } }}
              TabIndicatorProps={{
                style: {
                  backgroundColor: 'white',
                }
              }}
            >
              {categories.map(category => (
                <Tab 
                  key={category} 
                  label={category} 
                  icon={getCategoryIcon(category)} 
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Container>
        </Box>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper 
            elevation={0} 
            sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark', borderRadius: 2 }}
          >
            <Typography>{error}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredProducts.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>No products found</Typography>
                  <Typography color="text.secondary">
                    Try adjusting your search or selecting a different category.
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              filteredProducts.map((product) => (
                <Grid item key={product.id} xs={12}>
                  <Card elevation={2}>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4} md={3}>
                          <CardMedia
                            component="img"
                            height="220"
                            image={product.imageUrl}
                            alt={product.name}
                            sx={{ borderRadius: 1, objectFit: 'cover' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={8} md={9}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h5" component="h2" gutterBottom>
                                {product.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getCategoryIcon(product.category)}
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                  {product.category}
                                </Typography>
                              </Box>
                            </Box>
                            {product.climateFriendly && (
                              <Chip
                                icon={<EcoIcon />}
                                label="Eco-Friendly"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          
                          <Accordion 
                            expanded={expandedProduct === product.id}
                            onChange={() => toggleProductExpansion(product.id)}
                            elevation={0}
                            sx={{ 
                              mt: 2, 
                              bgcolor: 'grey.50',
                              '&:before': { display: 'none' }
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{ bgcolor: 'grey.100', borderRadius: 1 }}
                            >
                              <BusinessIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                              <Typography>
                                {product.suppliers.length} Supplier{product.suppliers.length !== 1 ? 's' : ''} Available
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0, mt: 2 }}>
                              <Paper variant="outlined">
                                <List disablePadding>
                                  {product.suppliers.map((supplier, index) => (
                                    <React.Fragment key={index}>
                                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                        <ListItemText
                                          primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                              <Typography variant="subtitle1">{supplier.name}</Typography>
                                              <Typography variant="h6" color="primary.main">
                                                ${supplier.price.toFixed(2)}
                                              </Typography>
                                            </Box>
                                          }
                                          secondary={
                                            <React.Fragment>
                                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <LocalShippingIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                                <Typography
                                                  component="span"
                                                  variant="body2"
                                                  color="text.primary"
                                                >
                                                  {supplier.address}
                                                </Typography>
                                              </Box>
                                              <Box sx={{ mt: 1 }}>
                                                {getConditionBadge(supplier.condition)}
                                              </Box>
                                            </React.Fragment>
                                          }
                                        />
                                      </ListItem>
                                      {index < product.suppliers.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                  ))}
                                </List>
                              </Paper>
                            </AccordionDetails>
                          </Accordion>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button variant="contained" color="primary">
                              View Details
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>
      
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 ModernHaus. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default FurnitureMarketplace;
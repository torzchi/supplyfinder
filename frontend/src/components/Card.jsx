import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import Header from './Header';
import MarketplaceSkeleton from './MarketplaceSkeleton';
import FilterPanel from './FilterPanel';
import ProductsGrid from './ProductsGrid';
import { getCategoryFromName } from './utils.js';
import { parsePrice } from './utils.js';

const FurnitureMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // New state for filters
  const [activeCategories, setActiveCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showEcoFriendly, setShowEcoFriendly] = useState(false);

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

        const productsList = Array.from(productsMap.values());
        setProducts(productsList);
        
        // Initialize active categories with all available categories
        const availableCategories = [...new Set(productsList.map(p => p.category))];
        setActiveCategories(availableCategories);
        
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply all filters to products
  const filteredProducts = products.filter(product => {
    // Search term filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter - either from tabs or side panel
    const matchesCategory = activeCategory === 'All' || 
                             product.category === activeCategory ||
                             activeCategories.includes(product.category);
    
    // Price range filter - check if any supplier price is within range
    const lowestPrice = Math.min(...product.suppliers.map(s => s.price));
    const matchesPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
    
    // Eco-friendly filter
    const matchesEco = !showEcoFriendly || product.climateFriendly;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesEco;
  });

  // Get all unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))];

  // Set active category from tabs
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    
    // If selecting a specific category from tabs, update side filter too
    if (category !== 'All') {
      if (!activeCategories.includes(category)) {
        setActiveCategories([...activeCategories, category]);
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
       <Header
    categories={categories}
    activeCategory={activeCategory}
    setActiveCategory={handleCategoryChange}
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
  />

      {/* Centered search bar */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 2 }}>
  
      </Container>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Grid container spacing={3}>
          {/* Left-side filter panel */}
          <Grid item xs={12} md={3}>
            <FilterPanel 
              categories={categories.filter(c => c !== 'All')}
              activeCategories={activeCategories}
              setActiveCategories={setActiveCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              showEcoFriendly={showEcoFriendly}
              setShowEcoFriendly={setShowEcoFriendly}
            />
          </Grid>

          {/* Main content area */}
          <Grid item xs={12} md={9}>
            {loading ? (
              // Show the bundled skeleton while loading
              <MarketplaceSkeleton />
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h1" fontWeight={600}>
                    {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
                  </Typography>
                </Box>
                <ProductsGrid 
                  error={error}
                  filteredProducts={filteredProducts}
                  expandedProduct={expandedProduct}
                  toggleProductExpansion={toggleProductExpansion}
                />
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FurnitureMarketplace;
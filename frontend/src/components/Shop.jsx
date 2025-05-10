import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header.jsx';
import MarketplaceSkeleton from './MarketplaceSkeleton.jsx';
import FilterPanel from './FilterPanel.jsx';
import ProductsGrid from './ProductsGrid.jsx';
import { getCategoryFromName, parsePrice } from './utils.js';

const FurnitureMarketplace = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const urlCategory = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);

  const [activeCategory, setActiveCategory] = useState(urlCategory || 'All');
  const [searchTerm, setSearchTerm] = useState(urlCategory || '');

  const [activeCategories, setActiveCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showEcoFriendly, setShowEcoFriendly] = useState(false);
  
  // New state to track if extended search was performed
  const [extendedSearchPerformed, setExtendedSearchPerformed] = useState(false);
  // State to store extended search results
  const [extendedSearchResults, setExtendedSearchResults] = useState(null);

  // Sync activeCategory and searchTerm with URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category') || 'All';
    setActiveCategory(categoryFromUrl);
    setSearchTerm(categoryFromUrl);
  }, [location.search]);

  useEffect(() => {
    if (activeCategory && activeCategory !== 'All') {
      navigate(`?category=${encodeURIComponent(activeCategory)}`, { replace: true });
    } else {
      navigate('/shop', { replace: true });
    }
  }, [activeCategory, navigate]);

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
  
        let finalQuery = '';
        const categoryParamValue = activeCategory ? activeCategory.trim().toLowerCase() : '';
        const searchTermValue = searchTerm.trim().toLowerCase();
  
        const baseMatch = `
          MATCH (f:Furnizor)-[r:PROVIDE]->(p:Produs)
          OPTIONAL MATCH (f)-[:LOCATED_IN]->(l:Locatie)
        `;
  
        const returnBlock = `
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
        `;
  
        if (activeCategory && activeCategory !== 'All') {
          finalQuery = `
            ${baseMatch}
            WHERE toLower(p.name) CONTAINS "${categoryParamValue.replace(/"/g, '\\"')}" 
            ${returnBlock}
          `;
        } else if (searchTermValue) {
          finalQuery = `
            ${baseMatch}
            WHERE toLower(p.name) CONTAINS "${searchTermValue.replace(/"/g, '\\"')}"
            ${returnBlock}
          `;
        } else {
          finalQuery = `${baseMatch} ${returnBlock}`;
        }
  
        console.log("Sending Cypher Query:", finalQuery);
  
        const response = await fetch('http://localhost:8080/api/cypher/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: finalQuery,
        });
  
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();

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
  }, [activeCategory]);

  const APISearch = async () => {
    try {
      setLoading(true);

      const query = encodeURIComponent(searchTerm);
      const apiUrl = `http://localhost:8080/api/searching/${query}`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Extended API search failed');

      const data = await response.json();

      console.log("search term:", searchTerm);
      console.log("Extended search response:", data);

      const productsList = data.map(item => ({
        id: Date.now() + Math.random(), // Temporary unique ID
        name: item.nume,
        imageUrl: item.poza,
        climateFriendly: false,
        category: getCategoryFromName(item.nume),
        suppliers: [
          {
            name: item.furnizor.nume,
            address: item.furnizor.adresa,
            url : item.url,
            price: parsePrice(item.pret),
            country: 'Romania',
            condition: 'New',
            contact: item.furnizor.contact
          }
        ]
      }));

      // Set the extended search results directly
      setExtendedSearchResults(productsList);

      // Flag that extended search was performed
      setExtendedSearchPerformed(true);

      // Reset the category filters
      setActiveCategory('All');

    } catch (err) {
      console.error('Error in extended API search:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onExtendedApiSearch = async () => {
    try {
      setLoading(true);
  
      const query = encodeURIComponent(searchTerm);
      const apiUrl = `http://localhost:8080/api/search/fetch?query=${query}&page=1&country=US&sort_by=RELEVANCE&product_condition=ALL&is_prime=false&deals_and_discounts=NONE`;
  
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Extended API search failed');

      let rawText = await response.text();
  
        
      console.log("search term:", searchTerm);
      console.log("Extended search response:", rawText);
  
      // Wait for backend to save data, then refetch Cypher data
      console.log("Extended API Search triggered, refetching Cypher data...");
      console.log(response.json);
  
      // Reset extended search (in case AI search was used before)
      setExtendedSearchPerformed(false);
      setExtendedSearchResults(null);
  
      // Trigger useEffect by tweaking activeCategory (force requery)
      setActiveCategory('All');
  
    } catch (err) {
      console.error('Error in extended API search:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  


  const onExtendedSearch = async () => {
    try {
      setLoading(true);
  
      const response = await fetch(`http://localhost:8080/generate?prompt=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Extended search failed');
  
      let rawText = await response.text();
  
      // Clean up response: remove leading/trailing ```
      if (rawText.trim().startsWith('```')) {
        rawText = rawText.trim().replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }
  
      const data = JSON.parse(rawText);
      console.log("search term:", searchTerm);
      console.log("Extended search response:", data);
  
      const produs = data.produs;
      const furnizor = produs.furnizor;
  
      const newProduct = {
        id: Date.now(), // Temporary ID
        name: produs.nume,
        imageUrl: '/chair.jpg' || produs.imagine,
        climateFriendly: false,
        category: getCategoryFromName(produs.nume),
        suppliers: [
          {
            name: furnizor.nume || 'Unknown',
            address: furnizor.adresa || 'Unknown',
            price: parsePrice(produs.pret),
            country: 'Unknown',
            condition: 'New',
            contact: furnizor.contact || ''
          }
        ]
      };
  
      // Set the extended search results directly
      setExtendedSearchResults([newProduct]);
      
      // Flag that extended search was performed
      setExtendedSearchPerformed(true);
      
      // Reset the category filters
      setActiveCategory('All');
  
    } catch (err) {
      console.error('Error in extended search:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine which products to display
  const displayProducts = extendedSearchPerformed ? extendedSearchResults : products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      activeCategory === 'All' || 
      product.category === activeCategory ||
      activeCategories.includes(product.category);

    const lowestPrice = Math.min(...product.suppliers.map(s => s.price));
    const matchesPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];

    const matchesEco = !showEcoFriendly || product.climateFriendly;

    return matchesSearch && matchesCategory && matchesPrice && matchesEco;
  });

  const categories = ['All', ...new Set(products.map(product => product.category))];

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Reset extended search state when changing categories
    setExtendedSearchPerformed(false);
    setExtendedSearchResults(null);
    
    if (category !== 'All') {
      if (!activeCategories.includes(category)) {
        setActiveCategories([...activeCategories, category]);
      }
    }
  };

  // Reset extended search when filter changes
  const handleFilterChange = () => {
    setExtendedSearchPerformed(false);
    setExtendedSearchResults(null);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FilterPanel 
              priceRange={priceRange}
              setPriceRange={(range) => {
                setPriceRange(range);
                handleFilterChange();
              }}
              disabled={extendedSearchPerformed}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            {loading ? (
              <MarketplaceSkeleton />
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" component="h1" fontWeight={600}>
                    {extendedSearchPerformed ? 'Extended Search Results' : (
                      <>
                        {displayProducts.length} Product{displayProducts.length !== 1 ? 's' : ''} Found
                        {activeCategory !== 'All' && !extendedSearchPerformed && ` in ${activeCategory}`}
                      </>
                    )}
                  </Typography>
                  {extendedSearchPerformed && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Showing custom results for "{searchTerm}". 
                      <Box component="span" 
                        sx={{ 
                          color: 'primary.main', 
                          textDecoration: 'underline', 
                          cursor: 'pointer',
                          ml: 1
                        }}
                        onClick={() => {
                          setExtendedSearchPerformed(false);
                          setExtendedSearchResults(null);
                        }}
                      >
                        Return to regular search
                      </Box>
                    </Typography>
                  )}
                </Box>
                <ProductsGrid 
                  error={error}
                  filteredProducts={displayProducts}
                  expandedProduct={expandedProduct}
                  toggleProductExpansion={toggleProductExpansion}
                  onExtendedSearch={onExtendedSearch}
                  onExtendedAPISearch={onExtendedApiSearch}
                  APISearch={APISearch}
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
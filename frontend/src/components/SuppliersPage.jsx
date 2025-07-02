import React, { useState, useEffect } from 'react';
import { 
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Box,
  CircularProgress,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Header from './Header';
import ReactCountryFlag from "react-country-flag";
import ProductCard from './ProductCard';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', rating: '', address: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const cypherQuery = JSON.stringify({
          query: `
            MATCH (f:Furnizor)-[:LOCATED_IN]->(l:Locatie)
            WITH f, l, COUNT { MATCH (f)-[:PROVIDE]->(:Produs) } AS productCount
            RETURN 
              f.name AS name,
              f.address AS address,
              productCount,
              toFloat(f.rating) AS rating
            ORDER BY rating DESC
          `
        });

        const response = await fetch('http://localhost:8080/api/cypher/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: cypherQuery,
        });

        if (!response.ok) throw new Error('Failed to fetch suppliers');
        const data = await response.json();

        const formattedSuppliers = data.map(supplier => {
          const address = supplier.address || '';
          const countryCode = address.trim().slice(-2).toUpperCase();
          
          // Validate country code (must be letters)
          const isValidCountryCode = /^[A-Z]{2}$/.test(countryCode);

          return {
            name: supplier.name,
            address,
            productCount: supplier.productCount,
            rating: supplier.rating ? parseFloat(supplier.rating).toFixed(1) : 'N/A',
            countryCode: isValidCountryCode ? countryCode : ''
          };
        });

        // Filter out invalid country codes
        const countries = [...new Set(formattedSuppliers
          .map(s => s.countryCode)
          .filter(code => code.length === 2))]
          .sort();

        setSuppliers(formattedSuppliers);
        setAvailableCountries(countries);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleSupplierClick = async (supplier) => {
    setSelectedSupplier(supplier);
    setProductsLoading(true);
    
    try {
      const cypherQuery = `
        MATCH (f:Furnizor {name: '${supplier.name}'})-[r:PROVIDE]->(p:Produs)
        OPTIONAL MATCH (f)-[:LOCATED_IN]->(l:Locatie)
        RETURN 
          p.name AS productName,
          p.category AS category,
          p.photo AS photo,
          p.climateFriendly AS climateFriendly,
          p.url AS productUrl,
          f.name AS supplierName,
          f.address AS address,
          l.country AS country,
          r.condition AS condition,
          r.price AS supplierPrice
        ORDER BY p.name
      `;

      const response = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: cypherQuery,
      });

      if (!response.ok) throw new Error('Failed to fetch supplier products');
      const data = await response.json();

      // Format products for ProductCard component
      const productsMap = new Map();
      
      data.forEach(record => {
        const productId = record.productName; // Using name as ID since we don't have product ID
        if (!productsMap.has(productId)) {
          productsMap.set(productId, {
            id: productId,
            name: record.productName,
            imageUrl: record.photo || '/api/placeholder/600/400',
            climateFriendly: record.climateFriendly === 'true',
            category: record.category || 'Unknown',
            suppliers: []
          });
        }
        const product = productsMap.get(productId);
        product.suppliers.push({
          name: record.supplierName,
          price: parseFloat(record.supplierPrice) || 0,
          condition: record.condition || 'New',
          address: record.address || 'Unknown',
          country: record.country || 'Unknown',
          url: record.productUrl || null
        });
      });

      setSupplierProducts(Array.from(productsMap.values()));
    } catch (err) {
      console.error('Error fetching supplier products:', err);
      setSupplierProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setEditForm({
      name: supplier.name,
      rating: supplier.rating !== 'N/A' ? supplier.rating : '',
      address: supplier.address
    });
  };

  const handleEditCancel = () => {
    setEditingSupplier(null);
    setEditForm({ name: '', rating: '', address: '' });
  };

  const handleEditSave = async () => {
    if (!editingSupplier) return;
    
    setSaving(true);
    try {
      const cypherQuery = `
        MATCH (f:Furnizor {name: '${editingSupplier.name}'})
        SET f.name = '${editForm.name}',
            f.rating = ${editForm.rating || 0},
            f.address = '${editForm.address}'
        RETURN f
      `;

      const response = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: cypherQuery,
      });

      if (!response.ok) throw new Error('Failed to update supplier');

      // Update local state
      setSuppliers(prev => prev.map(s => 
        s.name === editingSupplier.name 
          ? {
              ...s,
              name: editForm.name,
              rating: editForm.rating ? parseFloat(editForm.rating).toFixed(1) : 'N/A',
              address: editForm.address
            }
          : s
      ));

      setEditingSupplier(null);
      setEditForm({ name: '', rating: '', address: '' });
    } catch (err) {
      console.error('Error updating supplier:', err);
      alert('Failed to update supplier. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSuppliers = selectedCountry
    ? suppliers.filter(s => s.countryCode === selectedCountry)
    : suppliers;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">Error loading suppliers: {error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2 }}>
        Our Trusted Suppliers
      </Typography>

      {/* 🌍 Country Filter */}
      <FormControl sx={{ minWidth: 200, mb: 4 }}>
        <InputLabel id="country-select-label">Filter by Country</InputLabel>
        <Select
          labelId="country-select-label"
          value={selectedCountry}
          label="Filter by Country"
          onChange={handleCountryChange}
        >
          <MenuItem value="">All Countries</MenuItem>
          {availableCountries.map(code => (
            <MenuItem key={code} value={code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReactCountryFlag
                  countryCode={code}
                  svg
                  style={{
                    width: '1.5em',
                    height: '1.5em',
                  }}
                />
                {code}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {filteredSuppliers.map((supplier, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
              onClick={() => handleSupplierClick(supplier)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {supplier.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    {editingSupplier?.name === supplier.name ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mb: 1 }}
                      />
                    ) : (
                      <Typography variant="h6" component="h2">
                        {supplier.name}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {supplier.countryCode && (
                        <ReactCountryFlag
                          countryCode={supplier.countryCode}
                          svg
                          style={{
                            width: '1.5em',
                            height: '1.5em',
                          }}
                        />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {supplier.countryCode}
                      </Typography>
                    </Box>
                  </Box>
                  <Box onClick={(e) => e.stopPropagation()}>
                    {editingSupplier?.name === supplier.name ? (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Save">
                          <IconButton 
                            size="small" 
                            onClick={handleEditSave}
                            disabled={saving}
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton size="small" onClick={handleEditCancel}>
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Tooltip title="Edit supplier">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditClick(supplier)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {editingSupplier?.name === supplier.name ? (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Address"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Rating"
                      type="number"
                      inputProps={{ min: 0, max: 5, step: 0.1 }}
                      value={editForm.rating}
                      onChange={(e) => setEditForm(prev => ({ ...prev, rating: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Box>
                ) : (
                  <Typography variant="body1" paragraph>
                    {supplier.address}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                  <Chip 
                    label={`${supplier.productCount} products`} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={`Rating: ${supplier.rating}`}
                    color={supplier.rating !== 'N/A' ? 
                      (supplier.rating >= 4 ? 'success' : 
                       supplier.rating >= 3 ? 'warning' : 'error') : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Supplier Products Dialog */}
      <Dialog 
        open={!!selectedSupplier} 
        onClose={() => setSelectedSupplier(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {selectedSupplier?.name.charAt(0)}
            </Avatar>
            <Typography variant="h6">
              {selectedSupplier?.name} - Products
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {productsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : supplierProducts.length > 0 ? (
            <Grid container spacing={3}>
              {supplierProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No products found for this supplier.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSupplier(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuppliersPage;

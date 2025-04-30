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
  FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableCountries, setAvailableCountries] = useState([]);
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
          const countryCode = address.slice(-2).toUpperCase();

          return {
            name: supplier.name,
            address,
            productCount: supplier.productCount,
            rating: supplier.rating ? parseFloat(supplier.rating).toFixed(1) : 'N/A',
            countryCode
          };
        });

        const countries = [...new Set(formattedSuppliers.map(s => s.countryCode))].sort();

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
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Header categories={[]} activeCategory="" setActiveCategory={() => {}} />

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
                <img 
                  src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`} 
                  alt={code}
                  style={{ width: 20, height: 14, marginRight: 8 }}
                />
                {code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Grid container spacing={3}>
          {filteredSuppliers.map((supplier, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {supplier.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {supplier.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                          src={`https://flagcdn.com/w20/${supplier.countryCode.toLowerCase()}.png`} 
                          alt={supplier.countryCode}
                          style={{ width: 20, height: 14, marginRight: 8 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {supplier.countryCode}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body1" paragraph>
                    {supplier.address}
                  </Typography>

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
      </Container>
    </Box>
  );
};

export default SuppliersPage;

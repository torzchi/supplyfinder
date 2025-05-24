import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Grid,
  Autocomplete,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  backgroundColor: theme.palette.grey[50],
  padding: theme.spacing(4),
}));

const FormWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '1200px',
  margin: '0 auto',
  width: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.shadows[3],
  borderRadius: theme.spacing(2),
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[1],
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(4, 0),
  '&::before, &::after': {
    borderColor: theme.palette.primary.main,
  },
}));

const categories = [
  'Furniture',
  'Lighting',
  'Decor',
  'Kitchen',
  'Bathroom',
  'Outdoor',
  'Textiles',
  'Art',
];

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    photo: '',
    climateFriendly: false,
    supplierName: '',
    supplierAddress: '',
    supplierContact: '',
    supplierCountry: '',
    supplierRating: '',
    productCondition: 'New',
    url: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isNewSupplier, setIsNewSupplier] = useState(false);

  const productConditions = ['New', 'Used - Like New', 'Used - Very Good', 'Used - Good', 'Used - Acceptable'];

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const cypherQuery = `
          MATCH (f:Furnizor)-[:LOCATED_IN]->(l:Locatie)
          RETURN f.name AS name, f.address AS address, f.contact AS contact, 
                 f.rating AS rating, l.country AS country
          ORDER BY f.name
        `;

        const response = await fetch('http://localhost:8080/api/cypher/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: cypherQuery,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suppliers');
        }

        const data = await response.json();
        setSuppliers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setErrorMessage('Failed to load suppliers');
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSupplierSelect = (event, newValue) => {
    setSelectedSupplier(newValue);
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        supplierName: newValue.name,
        supplierAddress: newValue.address || '',
        supplierContact: newValue.contact || '',
        supplierCountry: newValue.country || '',
        supplierRating: newValue.rating || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        supplierName: '',
        supplierAddress: '',
        supplierContact: '',
        supplierCountry: '',
        supplierRating: '',
      }));
    }
  };

  const handleNewSupplierToggle = (event) => {
    setIsNewSupplier(event.target.checked);
    if (event.target.checked) {
      setSelectedSupplier(null);
      setFormData((prev) => ({
        ...prev,
        supplierName: '',
        supplierAddress: '',
        supplierContact: '',
        supplierCountry: '',
        supplierRating: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let cypherQuery;
      
      if (isNewSupplier) {
        // Create new supplier, location, and product with relationship
        cypherQuery = `
          MERGE (l:Locatie {country: '${formData.supplierCountry}'})
          CREATE (f:Furnizor {
            name: '${formData.supplierName}',
            address: '${formData.supplierAddress}',
            contact: '${formData.supplierContact}',
            rating: ${parseFloat(formData.supplierRating) || 0}
          })
          CREATE (f)-[:LOCATED_IN]->(l)
          CREATE (p:Produs {
            name: '${formData.name}',
            category: '${formData.category}',
            photo: '${formData.photo}',
            climateFriendly: ${formData.climateFriendly},
            url: '${formData.url}'
          })
          CREATE (f)-[:PROVIDE {price: '${formData.price}', condition: '${formData.productCondition}'}]->(p)
          RETURN p
        `;
      } else {
        // Use existing supplier
        cypherQuery = `
          MATCH (f:Furnizor {name: '${formData.supplierName}'})
          CREATE (p:Produs {
            name: '${formData.name}',
            category: '${formData.category}',
            photo: '${formData.photo}',
            climateFriendly: ${formData.climateFriendly},
            url: '${formData.url}'
          })
          CREATE (f)-[:PROVIDE {price: '${formData.price}', condition: '${formData.productCondition}'}]->(p)
          RETURN p
        `;
      }

      const response = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: cypherQuery,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding product');
      }

      setSuccessMessage('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        category: '',
        photo: '',
        climateFriendly: false,
        supplierName: '',
        supplierAddress: '',
        supplierContact: '',
        supplierCountry: '',
        supplierRating: '',
        productCondition: 'New',
        url: '',
      });
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error adding product:', error);
      setErrorMessage(error.message || 'Failed to add product');
    }
  };

  return (
    <ContentContainer>
      <FormWrapper>
        

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <StyledDivider>
            <Typography variant="h6" sx={{ color: 'primary.main', px: 2 }}>
              Product Details
            </Typography>
          </StyledDivider>

          <FormSection>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
                    startAdornment: <Typography sx={{ mr: 1 }}>lei</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Product Condition"
                  name="productCondition"
                  value={formData.productCondition}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                >
                  {productConditions.map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {condition}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Photo URL"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product URL"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  placeholder="Optional: Link to product page"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.climateFriendly}
                      onChange={handleChange}
                      name="climateFriendly"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      Climate Friendly
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </FormSection>

          <StyledDivider>
            <Typography variant="h6" sx={{ color: 'primary.main', px: 2 }}>
              Supplier Information
            </Typography>
          </StyledDivider>

          <FormSection>
            <FormControlLabel
              control={
                <Switch
                  checked={isNewSupplier}
                  onChange={handleNewSupplierToggle}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" sx={{ color: 'text.primary' }}>
                  Add New Supplier
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            {!isNewSupplier ? (
              <Grid item xs={12}>
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) => option.name}
                  value={selectedSupplier}
                  onChange={handleSupplierSelect}
                  loading={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Supplier"
                      required
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Supplier Name"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Supplier Address"
                    name="supplierAddress"
                    value={formData.supplierAddress}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Supplier Contact"
                    name="supplierContact"
                    value={formData.supplierContact}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Supplier Country"
                    name="supplierCountry"
                    value={formData.supplierCountry}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Supplier Rating"
                    name="supplierRating"
                    type="number"
                    value={formData.supplierRating}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                    InputProps={{
                      inputProps: { min: 0, max: 5, step: 0.1 }
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </FormSection>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 4,
                }
              }}
            >
              Add Product
            </Button>
          </Box>
        </form>
      </FormWrapper>
    </ContentContainer>
  );
};

export default AddProductForm; 
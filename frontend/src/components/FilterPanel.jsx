import React from 'react';
import { 
  Box, 
  Typography, 
  Slider,
  Paper,
  Button,
  Stack,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ApiIcon from '@mui/icons-material/Api';
import PsychologyIcon from '@mui/icons-material/Psychology';

const FilterPanel = ({ 
  priceRange, 
  setPriceRange,
  disabled,
  onExtendedSearch,
  onExtendedApiSearch,
  onAPISearch
}) => {
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2,
        height: '100%',
        position: 'sticky',
        top: '16px'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Filters
      </Typography>
      
      <Box sx={{ px: 1, pt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="on"
          disableSwap
          min={0}
          max={2000}
          disabled={disabled}
          marks={[
            { value: 0, label: '$0' },
            { value: 1000, label: '$1000' },
            { value: 2000, label: '$2000' }
          ]}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Extended Search
      </Typography>
      <Stack spacing={2}>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={onAPISearch}
          disabled={disabled}
          fullWidth
        >
          Web Scrape
        </Button>
        <Button
          variant="outlined"
          startIcon={<ApiIcon />}
          onClick={onExtendedApiSearch}
          disabled={disabled}
          fullWidth
        >
          Amazon API
        </Button>
        <Button
          variant="outlined"
          startIcon={<PsychologyIcon />}
          onClick={onExtendedSearch}
          disabled={disabled}
          fullWidth
        >
          AI Search
        </Button>
      </Stack>
    </Paper>
  );
};

export default FilterPanel;
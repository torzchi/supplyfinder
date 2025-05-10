import React from 'react';
import { 
  Box, 
  Typography, 
  Slider,
  Paper
} from '@mui/material';

const FilterPanel = ({ 
  priceRange, 
  setPriceRange,
  disabled
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
        Price Range
      </Typography>
      
      <Box sx={{ px: 1, pt: 2 }}>
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
    </Paper>
  );
};

export default FilterPanel;
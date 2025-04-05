import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Checkbox, 
  Slider, 
  Divider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getCategoryIcon } from './CategoryTabs';

const FilterPanel = ({ 
  categories, 
  activeCategories, 
  setActiveCategories, 
  priceRange, 
  setPriceRange,
  showEcoFriendly,
  setShowEcoFriendly
}) => {
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    eco: true
  });

  const handleCategoryToggle = (category) => () => {
    const currentIndex = activeCategories.indexOf(category);
    const newActiveCategories = [...activeCategories];

    if (currentIndex === -1) {
      newActiveCategories.push(category);
    } else {
      newActiveCategories.splice(currentIndex, 1);
    }

    setActiveCategories(newActiveCategories);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded({ ...expanded, [panel]: isExpanded });
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

      <Accordion 
        expanded={expanded.categories} 
        onChange={handleAccordionChange('categories')}
        disableGutters
        elevation={0}
        sx={{ '&:before': { display: 'none' }, mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ px: 0 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Categories</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <List dense disablePadding>
            {categories.filter(cat => cat !== 'All').map((category) => (
              <ListItem 
                key={category} 
                dense 
                disablePadding 
                sx={{ py: 0.5 }}
                onClick={handleCategoryToggle(category)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={activeCategories.includes(category)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                  />
                </ListItemIcon>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getCategoryIcon(category)}
                </ListItemIcon>
                <ListItemText primary={category} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      <Accordion 
        expanded={expanded.price} 
        onChange={handleAccordionChange('price')}
        disableGutters
        elevation={0}
        sx={{ '&:before': { display: 'none' }, mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ px: 0 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box sx={{ px: 1, pt: 2 }}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="on"
              disableSwap
              min={0}
              max={2000}
              marks={[
                { value: 0, label: '$0' },
                { value: 1000, label: '$1000' },
                { value: 2000, label: '$2000' }
              ]}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      <Accordion 
        expanded={expanded.eco} 
        onChange={handleAccordionChange('eco')}
        disableGutters
        elevation={0}
        sx={{ '&:before': { display: 'none' }, mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ px: 0 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Features</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={showEcoFriendly}
                onChange={(e) => setShowEcoFriendly(e.target.checked)}
                color="success"
              />
            }
            label="Eco-Friendly"
          />
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
export default FilterPanel;
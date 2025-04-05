import React from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import ChairIcon from '@mui/icons-material/Chair';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import WeekendIcon from '@mui/icons-material/Weekend';
import BedIcon from '@mui/icons-material/Bed';
import CategoryIcon from '@mui/icons-material/Category';

export const getCategoryIcon = (category) => {
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

const CategoryTabs = ({ categories, activeCategory, setActiveCategory }) => {
  return (
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
  );
};

export default CategoryTabs;
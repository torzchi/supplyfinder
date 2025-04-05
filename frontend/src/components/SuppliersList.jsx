import React from 'react';
import { Typography, Box, ListItem, ListItemText, List, Paper, Divider, Chip } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import HistoryIcon from '@mui/icons-material/History';
import BuildIcon from '@mui/icons-material/Build';

export const getConditionBadge = (condition) => {
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

const SuppliersList = ({ suppliers }) => {
  return (
    <Paper variant="outlined">
      <List disablePadding>
        {suppliers.map((supplier, index) => (
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
            {index < suppliers.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default SuppliersList;
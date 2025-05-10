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
    <Paper 
      variant="outlined" 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <List 
        disablePadding 
        dense
        sx={{
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          }
        }}
      >
        {suppliers.map((supplier, index) => (
          <React.Fragment key={index}>
            <ListItem 
              alignItems="flex-start" 
              sx={{ 
                py: 1,
                px: 1.5,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {supplier.name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      ${supplier.price.toFixed(2)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalShippingIcon sx={{ color: 'text.secondary', fontSize: '0.875rem' }} />
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {supplier.address}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 0.5 }}>
                      {getConditionBadge(supplier.condition)}
                    </Box>
                  </Box>
                }
                sx={{ 
                  m: 0,
                  '& .MuiListItemText-primary': {
                    mb: 0.25
                  }
                }}
              />
            </ListItem>
            {index < suppliers.length - 1 && (
              <Divider 
                component="li" 
                sx={{ 
                  my: 0,
                  opacity: 0.5
                }} 
              />
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default SuppliersList;
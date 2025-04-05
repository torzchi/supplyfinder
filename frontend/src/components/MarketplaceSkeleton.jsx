// MarketplaceSkeleton.jsx
import React from 'react';
import { Grid, Skeleton, Box, Card, CardContent, CardActions } from '@mui/material';

const MarketplaceSkeleton = () => {
  // Create array for skeleton product items
  const skeletonProducts = Array.from(new Array(6));
  
  return (
    <>
      {/* Products count skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={200} height={40} />
      </Box>
      
      {/* Products Grid Skeleton */}
      <Grid container spacing={3}>
        {skeletonProducts.map((_, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Product image skeleton */}
              <Skeleton variant="rectangular" width="100%" height={200} />
              
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Product title skeleton */}
                <Skeleton variant="text" sx={{ height: 28 }} />
                
                {/* Product price skeleton */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 16 }} />
                </Box>
                
                {/* Product description skeleton */}
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="80%" />
                </Box>
              </CardContent>
              
              <CardActions>
                {/* Button skeletons */}
                <Skeleton variant="rectangular" width={160} height={36} sx={{ borderRadius: 1 }} />
                <Box sx={{ flexGrow: 1 }} />
                <Skeleton variant="circular" width={32} height={32} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default MarketplaceSkeleton;
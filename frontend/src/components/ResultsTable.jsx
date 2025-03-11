import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StorageIcon from '@mui/icons-material/Storage';

const ContentContainer = styled(Box)(({ theme }) => ({
  marginLeft: '250px', // Match sidebar width
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: 'calc(100% - 250px)',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 'calc(100vh - 150px)',
}));

const formatCellValue = (value) => {
  if (value === null || value === undefined) return '—';
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }
  
  return String(value);
};

const ResultsTable = ({ results }) => {
  if (!results) {
    return (
      <ContentContainer>
        <Typography variant="h5" sx={{ mb: 2 }}>Query Results</Typography>
        <Card variant="outlined" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <StorageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No results to display. Run a query to see data.
            </Typography>
          </CardContent>
        </Card>
      </ContentContainer>
    );
  }
  
  if (results.length === 0) {
    return (
      <ContentContainer>
        <Typography variant="h5" sx={{ mb: 2 }}>Query Results</Typography>
        <Alert severity="info">
          Query executed successfully, but returned no results.
        </Alert>
      </ContentContainer>
    );
  }
  
  // Check if results contain error message
  if (results.length === 1 && results[0].error) {
    return (
      <ContentContainer>
        <Typography variant="h5" sx={{ mb: 2 }}>Query Results</Typography>
        <Alert severity="error">
          {results[0].error}
        </Alert>
      </ContentContainer>
    );
  }
  
  // Get all unique keys from all results
  const allKeys = [...new Set(results.flatMap(result => Object.keys(result)))];

  return (
    <ContentContainer>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Query Results
        <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
          ({results.length} row{results.length !== 1 ? 's' : ''})
        </Typography>
      </Typography>
      
      <Paper elevation={2} sx={{ width: '100%' }}>
        <StyledTableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                {allKeys.map(key => (
                  <TableCell key={key}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>{rowIndex + 1}</TableCell>
                  {allKeys.map(key => (
                    <TableCell key={`${rowIndex}-${key}`}>
                      {formatCellValue(row[key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Paper>
    </ContentContainer>
  );
};

export default ResultsTable;
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Grid,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ProductCard from './ProductCard';
import { getCategoryFromName, parsePrice } from './utils';

const CypherChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const cleanCypherQuery = (query) => {
    // Remove surrounding quotes if present
    let cleaned = query.replace(/^["']|["']$/g, '');
    // Remove any backslashes
    cleaned = cleaned.replace(/\\/g, '');
    return cleaned;
  };

  const formatProducts = (data) => {
    const productsMap = new Map();
    
    data.forEach(record => {
      const productId = record.id;
      if (!productsMap.has(productId)) {
        productsMap.set(productId, {
          id: productId,
          name: record.productName,
          imageUrl: record.photo || '/api/placeholder/600/400',
          climateFriendly: record.climateFriendly === 'true',
          category: getCategoryFromName(record.productName),
          suppliers: []
        });
      }
      const product = productsMap.get(productId);
      product.suppliers.push({
        name: record.supplierName,
        price: parsePrice(record.supplierPrice),
        condition: record.supplierCondition,
        address: record.address || 'Unknown',
        country: record.country || 'Unknown',
        url: record.url || null
      });
    });

    return Array.from(productsMap.values());
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Step 1: Generate Cypher query using the new language endpoint
      const generateResponse = await fetch(`http://localhost:8080/language?prompt=${encodeURIComponent(input)}`);
      const cypherQuery = await generateResponse.text();
      
      // Clean the Cypher query
      const cleanedCypher = cleanCypherQuery(cypherQuery);
      
      // Add the generated Cypher to chat
      const cypherMessage = {
        type: 'assistant',
        content: 'Generated Cypher Query:',
        cypher: cleanedCypher
      };
      setMessages(prev => [...prev, cypherMessage]);

      // Step 2: Execute the Cypher query
      const executeResponse = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cypher: cleanedCypher })
      });
      const executeData = await executeResponse.json();

      // Format the products data
      const formattedProducts = formatProducts(executeData);

      // Add the results to chat
      const resultsMessage = {
        type: 'assistant',
        content: formattedProducts.length > 0 ? 'Found products:' : 'No products found',
        products: formattedProducts
      };
      setMessages(prev => [...prev, resultsMessage]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        products: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 100px)',
      maxWidth: '1200px',
      margin: '0 auto',
      p: 2
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          overflow: 'auto',
          p: 2,
          backgroundColor: '#f8f9fa'
        }}
      >
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              <ListItem 
                sx={{ 
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    backgroundColor: message.type === 'user' ? '#3182ce' : '#ffffff',
                    color: message.type === 'user' ? '#ffffff' : 'inherit',
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 1
                  }}
                >
                  <Typography>{message.content}</Typography>
                  {message.cypher && (
                    <Paper 
                      sx={{ 
                        mt: 1, 
                        p: 2, 
                        backgroundColor: '#f0f0f0',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}
                    >
                      {message.cypher}
                    </Paper>
                  )}
                  {message.products && message.products.length > 0 && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {message.products.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                          <ProductCard product={product} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {loading && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </ListItem>
          )}
        </List>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask about products..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{ minWidth: '100px' }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default CypherChat; 
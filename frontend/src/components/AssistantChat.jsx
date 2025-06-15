import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ProductCard from './ProductCard';

const AssistantChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    setLoading(true);

    try {
      // First, get the Cypher query from the language endpoint
      const languageResponse = await fetch(`http://localhost:8080/language?prompt=${encodeURIComponent(input)}`);
      if (!languageResponse.ok) throw new Error('Failed to get Cypher query');
      
      const cypherQuery = await languageResponse.text();
      
      // Add assistant's query to chat
      setMessages(prev => [...prev, { type: 'assistant', content: `Generated query: ${cypherQuery}` }]);

      // Execute the Cypher query
      const queryResponse = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: cypherQuery
      });

      if (!queryResponse.ok) throw new Error('Failed to execute query');
      const results = await queryResponse.json();

      // Transform the results into the format expected by ProductCard
      const transformedResults = results.map(result => ({
        id: Math.random(), // Generate a temporary ID
        name: result.Produs,
        imageUrl: result.Photo || '/placeholder.jpg',
        category: 'Unknown', // You might want to extract this from the product name
        climateFriendly: false,
        suppliers: [{
          name: result.Furnizor,
          price: parseFloat(result.Pret),
          condition: 'New',
          address: result.Adresa,
          country: 'Unknown',
          url: result.URL || null
        }]
      }));

      // Add results to chat
      setMessages(prev => [...prev, { type: 'results', content: transformedResults }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { type: 'error', content: error.message }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const renderMessage = (message, index) => {
    switch (message.type) {
      case 'user':
        return (
          <ListItem key={index} sx={{ justifyContent: 'flex-end' }}>
            <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white', maxWidth: '70%' }}>
              <Typography>{message.content}</Typography>
            </Paper>
          </ListItem>
        );
      case 'assistant':
        return (
          <ListItem key={index} sx={{ justifyContent: 'flex-start' }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.100', maxWidth: '70%' }}>
              <Typography>{message.content}</Typography>
            </Paper>
          </ListItem>
        );
      case 'results':
        return (
          <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'stretch', width: '100%' }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.100', width: '100%' }}>
              <Typography variant="h6" gutterBottom>Search Results:</Typography>
              <Grid container spacing={3}>
                {message.content.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </ListItem>
        );
      case 'error':
        return (
          <ListItem key={index} sx={{ justifyContent: 'flex-start' }}>
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText', maxWidth: '70%' }}>
              <Typography>Error: {message.content}</Typography>
            </Paper>
          </ListItem>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Product Search Assistant
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products..."
          disabled={loading}
          variant="outlined"
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default AssistantChat; 
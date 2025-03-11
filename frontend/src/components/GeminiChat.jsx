import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const ContentContainer = styled(Box)(({ theme }) => ({
  marginLeft: '250px', // Match sidebar width
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: 'calc(100% - 250px)',
  backgroundColor: theme.palette.background.default,
}));

const ChatWindow = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column-reverse',
}));

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  maxWidth: '70%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: isUser 
    ? '20px 5px 20px 20px' 
    : '5px 20px 20px 20px',
  backgroundColor: isUser 
    ? theme.palette.primary.main 
    : theme.palette.background.paper,
  color: isUser 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  boxShadow: theme.shadows[2],
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
}));

const GeminiChat = () => {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [responses]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send API request with the prompt
      const res = await axios.get('http://localhost:8080/generate', {
        params: { prompt },
      });

      setResponses((prevResponses) => [
        ...prevResponses,
        { type: 'user', text: prompt },
        { type: 'ai', text: res.data },
      ]);
    } catch (err) {
      setError('Failed to fetch response. Please try again.');
    } finally {
      setLoading(false);
    }

    setPrompt('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <ContentContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h5" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          Gemini Chat
        </Typography>
        
        <ChatWindow>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {responses.map((response, index) => (
              <MessageBubble 
                key={index} 
                isUser={response.type === 'user'}
              >
                <Typography variant="body1">
                  {response.text}
                </Typography>
              </MessageBubble>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        </ChatWindow>
        
        <InputContainer>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            size="medium"
            sx={{ mr: 1 }}
            disabled={loading}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </InputContainer>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
      </Box>
    </ContentContainer>
  );
};

export default GeminiChat;
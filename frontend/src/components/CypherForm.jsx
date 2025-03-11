import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Popper,
  List,
  ListItem,
  ListItemText,
  Chip,
  ButtonGroup,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';

// ... (all your styled components stay the same)

const ContentContainer = styled(Box)(({ theme }) => ({
  marginLeft: '250px', // Match sidebar width
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: 'calc(100% - 250px)',
  backgroundColor: theme.palette.background.default,
}));

const EditorWrapper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  flexGrow: 1,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledTextarea = styled(TextField)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '16px',
  '& .MuiInputBase-root': {
    fontFamily: 'monospace',
  },
}));

const SuggestionsList = styled(Paper)(({ theme }) => ({
  maxHeight: '200px',
  overflow: 'auto',
  zIndex: 1500,
}));

const KeywordChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  height: '24px',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: '400px',
  marginTop: theme.spacing(2),
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

const CypherForm = () => {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [results, setResults] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const textFieldRef = useRef(null);

  const keywords = {
    commands: ['MATCH', 'CREATE', 'RETURN', 'WHERE', 'DELETE', 'SET', 'MERGE', 'WITH', 'ORDER BY', 'SKIP', 'LIMIT'],
    nodes: ['Produs', 'Furnizor', 'Client', 'Incapere', 'Locatie', 'Stil'],
    relationships: ['PROVIDE', 'RELATED', 'PART_OF', 'HAS_STYLE', 'FOUND_IN', 'BOUGHT_INTERESTED', 'CONTACT'],
    operators: ['AND', 'OR', 'NOT', 'XOR', 'IN', 'CONTAINS', 'STARTS WITH', 'ENDS WITH'],
    properties: ['name', 'id', 'price', 'category', 'description'],
  };

  const predefinedQueries = {
    produs: 'MATCH (p:Produs) RETURN DISTINCT p.name, p.price',
    furnizor: 'MATCH (f:Furnizor) RETURN DISTINCT f.name, f.location',
  };

  const getAllKeywords = () => {
    return [
      ...keywords.commands,
      ...keywords.nodes,
      ...keywords.relationships,
      ...keywords.operators,
      ...keywords.properties,
    ];
  };

  const getCurrentWordBoundaries = (text, position) => {
    let start = position;
    let end = position;

    while (start > 0 && !/[\s(){}[\],;:."]/.test(text[start - 1])) {
      start--;
    }

    while (end < text.length && !/[\s(){}[\],;:."]/.test(text[end])) {
      end++;
    }

    return { start, end, word: text.slice(start, end) };
  };

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    const newPosition = e.target.selectionStart;
    setQuery(newQuery);
    setCursorPosition(newPosition);
    updateSuggestions(newQuery, newPosition);
  };

  const updateSuggestions = (text, position) => {
    const { word: currentWord } = getCurrentWordBoundaries(text, position);

    if (!currentWord || currentWord.length < 1) {
      setSuggestions([]);
      setAnchorEl(null);
      return;
    }

    let relevantKeywords = getAllKeywords();
    const beforeCursor = text.slice(0, position);

    if (beforeCursor.trim().endsWith(':')) {
      relevantKeywords = keywords.nodes;
    } else if (beforeCursor.trim().endsWith('.')) {
      relevantKeywords = keywords.properties;
    }

    const filtered = relevantKeywords
      .filter((keyword) => keyword.toLowerCase().startsWith(currentWord.toLowerCase()))
      .slice(0, 5);

    if (filtered.length > 0 && textFieldRef.current) {
      setAnchorEl(textFieldRef.current);
    } else {
      setAnchorEl(null);
    }

    setSuggestions(filtered);
    setFocusedIndex(-1);
  };

  const applySuggestion = (suggestion) => {
    const { start, end } = getCurrentWordBoundaries(query, cursorPosition);
    const beforeWord = query.slice(0, start);
    const afterWord = query.slice(end);
    const newQuery = beforeWord + suggestion + afterWord;
    setQuery(newQuery);
    setSuggestions([]);
    setAnchorEl(null);
    const newPosition = start + suggestion.length;
    setCursorPosition(newPosition);

    if (textFieldRef.current) {
      textFieldRef.current.focus();
      const input = textFieldRef.current.querySelector('textarea');
      if (input) {
        setTimeout(() => {
          input.setSelectionRange(newPosition, newPosition);
        }, 0);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' && focusedIndex !== -1) {
        e.preventDefault();
        applySuggestion(suggestions[focusedIndex]);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[focusedIndex !== -1 ? focusedIndex : 0]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
        setAnchorEl(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const response = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error executing query');
      }

      const data = await response.json();
      
      // Check if data is an array with at least one element
      if (Array.isArray(data) && data.length > 0) {
        setResults(data);
      } else if (Array.isArray(data) && data.length === 0) {
        // Handle empty array result
        setResults(null);
        setSuccessMessage('Query executed successfully. No results returned.');
      } else {
        // Handle other successful responses
        setResults(null);
        setSuccessMessage('Operation completed successfully.');
      }
    } catch (error) {
      console.error('Error executing query:', error);
      setErrorMessage(error.message);
      setResults(null);
    }
  };

  const executePredefinedQuery = async (queryType) => {
    const selectedQuery = predefinedQueries[queryType];
    if (!selectedQuery) return;

    setQuery(selectedQuery);

    try {
      const response = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: selectedQuery,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error executing ${queryType} query`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setResults(data);
        setSuccessMessage('');
      } else {
        setResults(null);
        setSuccessMessage(`${queryType} query executed successfully. No results to display.`);
      }
      
      setErrorMessage('');
    } catch (error) {
      console.error(`Error executing ${queryType} query:`, error);
      setErrorMessage(error.message);
      setResults(null);
    }
  };

  const addKeywordToQuery = (keyword) => {
    const newQuery = query + (query.length > 0 && !query.endsWith(' ') ? ' ' : '') + keyword + ' ';
    setQuery(newQuery);
    if (textFieldRef.current) {
      textFieldRef.current.focus();
    }
  };

  return (
    <ContentContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h5" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          Cypher Query Editor
        </Typography>

        <EditorWrapper elevation={1}>
          <form onSubmit={handleSubmit} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <StyledTextarea
              inputRef={textFieldRef}
              fullWidth
              multiline
              minRows={8}
              maxRows={12}
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter your Cypher query..."
              variant="outlined"
              sx={{ mb: 2, flexGrow: 1 }}
              InputProps={{
                style: { fontFamily: 'monospace' },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <ButtonGroup variant="contained">
                <Button color="primary" type="submit" startIcon={<PlayArrowIcon />}>
                  Execute Query
                </Button>
              </ButtonGroup>

              <ButtonGroup variant="outlined">
                <Tooltip title="Load all suppliers">
                  <Button onClick={() => executePredefinedQuery('furnizor')} startIcon={<StorageIcon />}>
                    Suppliers
                  </Button>
                </Tooltip>
                <Tooltip title="Load all products">
                  <Button onClick={() => executePredefinedQuery('produs')} startIcon={<CodeIcon />}>
                    Products
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Box>
          </form>

          <Popper open={Boolean(anchorEl) && suggestions.length > 0} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1500 }}>
            <SuggestionsList>
              <List dense>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={suggestion}
                    button
                    selected={focusedIndex === index}
                    onClick={() => applySuggestion(suggestion)}
                    dense
                  >
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </SuggestionsList>
          </Popper>
        </EditorWrapper>

        {errorMessage && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mx: 2, mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {results && results.length > 0 && (
          <Box sx={{ p: 2 }}>
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
                      {Object.keys(results[0]).map((key) => (
                        <TableCell key={key}>{key}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                        <TableCell>{rowIndex + 1}</TableCell>
                        {Object.keys(row).map((key) => (
                          <TableCell key={`${rowIndex}-${key}`}>{formatCellValue(row[key])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </Paper>
          </Box>
        )}
      </Box>
    </ContentContainer>
  );
};

export default CypherForm;
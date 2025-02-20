import React, { useState, useRef } from 'react';
import '../App.css';

const CypherEditor = ({ setResults }) => {
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1); // Tracks the focused suggestion
  const textAreaRef = useRef(null);

  const keywords = {
    commands: ['MATCH', 'CREATE', 'RETURN', 'WHERE', 'DELETE', 'SET', 'MERGE', 'WITH', 'ORDER BY', 'SKIP', 'LIMIT'],
    nodes: ['Produs', 'Furnizor', 'Client', "Incapere", "Locatie", "Stil"],
    relationships: ['PROVIDE', 'RELATED', 'PART_OF', "HAS_STYLE", "FOUND_IN", "BOUGHT_INTERESTED", "CONTACT"],
    operators: ['AND', 'OR', 'NOT', 'XOR', 'IN', 'CONTAINS', 'STARTS WITH', 'ENDS WITH'],
    properties: ['name', 'id', 'price', 'category', 'description']
  };

  const predefinedQueries = {
    produs: "MATCH (p:Produs) RETURN p.name, p.price",
    furnizor: "MATCH (f:Furnizor) RETURN f.name, f.location"
  };

  const getAllKeywords = () => {
    return [
      ...keywords.commands,
      ...keywords.nodes,
      ...keywords.relationships,
      ...keywords.operators,
      ...keywords.properties
    ];
  };

  const getCurrentWordBoundaries = (text, position) => {
    let start = position;
    let end = position;

    // Find start of current word
    while (start > 0 && !/[\s(){}[\],;:."]/.test(text[start - 1])) {
      start--;
    }

    // Find end of current word
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
      .filter(keyword => 
        keyword.toLowerCase().startsWith(currentWord.toLowerCase())
      )
      .slice(0, 5);

    setSuggestions(filtered);
    setFocusedIndex(-1); // Reset focused index when suggestions update
  };

  const applySuggestion = (suggestion) => {
    const { start, end } = getCurrentWordBoundaries(query, cursorPosition);

    // Preserve text before and after the current word
    const beforeWord = query.slice(0, start);
    const afterWord = query.slice(end);

    // Create new query with the suggestion
    const newQuery = beforeWord + suggestion + afterWord;
    setQuery(newQuery);
    setSuggestions([]);

    // Calculate new cursor position
    const newPosition = start + suggestion.length;
    setCursorPosition(newPosition);

    // Update textarea cursor position
    if (textAreaRef.current) {
      textAreaRef.current.focus();
      setTimeout(() => {
        textAreaRef.current.setSelectionRange(newPosition, newPosition);
      }, 0);
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
      }
    }

    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      applySuggestion(suggestions[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:8080/api/cypher/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: query
        });

        if (!response.ok) { // Check for HTTP errors (status not in the 200-299 range)
            const errorData = await response.json(); // Parse the JSON error response
            throw new Error(errorData.message || 'Error executing query'); // Throw an error with the message
        }

        const data = await response.json();
        setResults(data);
        setErrorMessage(''); // Clear any previous errors

    } catch (error) {
        console.error('Error executing query:', error);
        setErrorMessage(error.message); // Set the error message
        setResults([{ error: error.message }]); // Display the error message to the user
    }
  };

  const executePredefinedQuery = async (queryType) => {
    const selectedQuery = predefinedQueries[queryType];
    if (!selectedQuery) return;
    
    try {
      const response = await fetch('http://localhost:8080/api/cypher/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: selectedQuery
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error executing ${queryType} query`);
      }
      
      const data = await response.json();
      setResults(data);
      setErrorMessage(''); // Clear any previous errors
      
    } catch (error) {
      console.error(`Error executing ${queryType} query:`, error);
      setErrorMessage(error.message); // Set the error message
      setResults([{ error: error.message }]);
    }
  };

  return (
    <div className="cypher-form-container">
      <form onSubmit={handleSubmit}>
        <div className="editor-wrapper">
          <textarea
            ref={textAreaRef}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your Cypher query..."
            className="cypher-textarea"
            spellCheck="false"
          />
          {suggestions.length > 0 && (
            <div 
              className="suggestions-container"
              style={{
                position: 'absolute',
                left: '0',
                top: '100%',
                width: '200px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 1000,
                marginTop: '4px'
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  onClick={() => applySuggestion(suggestion)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: focusedIndex === index ? '#f0f0f0' : 'white'
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onMouseLeave={() => setFocusedIndex(-1)}
                >
                  {suggestion}
                  
                </div>
              ))}
            </div>

            
            
          )}
          {errorMessage && (
          <div 
            className="error-message"
            style={{
              color: '#ff3333',
              backgroundColor: '#ffeeee',
              padding: '8px 12px',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '14px',
              border: '1px solid #ffcccc'
            }}
          >
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
        </div>
        <div style={{ display: 'flex' }}>
        <button type="submit" className="execute-button">
          Execute Query
          
        </button>
        <button 
            type="button" 
            className="execute-button" 
            onClick={() => executePredefinedQuery('furnizor')}
          >
            Load Suppliers
          </button>

          <button 
            type="button" 
            className="execute-button" 
            onClick={() => executePredefinedQuery('produs')}
          >
            Load Products
          </button>
          </div>
      </form>
    </div>
  );
};

export default CypherEditor;

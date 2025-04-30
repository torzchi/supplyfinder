import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputBase, IconButton, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ initialTerm = '' }) => {
  const [inputValue, setInputValue] = useState(initialTerm);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (inputValue.trim()) {
      navigate(`/shop?category=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
      sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search products"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <IconButton type="button" onClick={handleSearch} sx={{ p: '10px' }}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;

import React from 'react';
import { alpha, styled } from '@mui/material/styles';
import { InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.common.white,
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  boxShadow: theme.shadows[1]
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search products…"
        inputProps={{ 'aria-label': 'search' }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </Search>
  );
};

export default SearchBar;
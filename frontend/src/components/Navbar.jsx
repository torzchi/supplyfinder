import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import CodeIcon from '@mui/icons-material/Code';
import HomeIcon from '@mui/icons-material/Home';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssistantIcon from '@mui/icons-material/Assistant';

const NavItem = styled(Link)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  textDecoration: 'none',
  padding: theme.spacing(0, 2),
  height: '100%',
  fontFamily: theme.typography.fontFamily,
  fontSize: '0.9rem',
  opacity: active ? 1 : 0.5,
  '&:hover': {
    opacity: 1,
  },
  gap: theme.spacing(0.5),
}));

const Navbar = () => {
  const location = useLocation();

  const menuItems = [
    { text: 'Home', icon: <HomeIcon fontSize="small" />, path: '/home' },
    { text: 'Assistant', icon: <AssistantIcon fontSize="small" />, path: '/assistant' },
    { text: 'Cypher Query', icon: <CodeIcon fontSize="small" />, path: '/cypher' },
    { text: 'Suppliers', icon: <CodeIcon fontSize="small" />, path: '/suppliers' },
    { text: 'Shop', icon: <ShoppingCartIcon fontSize="small" />, path: '/shop' },
    { text: 'Add Product', icon: <AddCircleIcon fontSize="small" />, path: '/add-product' },
    
    
  ];

  return (
    <AppBar position="static" sx={{ bgcolor: '#3182ce', boxShadow: 'none' }}>
      <Toolbar sx={{ justifyContent: 'center', minHeight: '56px' }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {menuItems.map((item) => (
            <NavItem
              key={item.text}
              to={item.path}
              active={location.pathname === item.path ? 1 : 0}
            >
              {item.icon}
              {item.text}
            </NavItem>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
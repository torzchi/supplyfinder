import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {  
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import CodeIcon from '@mui/icons-material/Code';
import HomeIcon from '@mui/icons-material/Home'
import { AddBusiness } from '@mui/icons-material';

const SidebarContainer = styled(Paper)(({ theme }) => ({
  width: '250px',
  height: '100vh',
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.contrastText,
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: theme.zIndex.drawer,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  borderRadius: 0,
}));

const SidebarItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
  marginBottom: theme.spacing(1),
}));

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home' },
    { text: 'Gemini Chat', icon: <ChatIcon />, path: '/chat' },
    { text: 'Cypher Query', icon: <CodeIcon />, path: '/cypher' },
    { text: 'Suppliers', icon: <CodeIcon />, path: '/suppliers' },
    { text: 'Shop', icon: <AddBusiness />, path: '/shop' },
  ];

  return (
    <SidebarContainer elevation={6}>
      <Typography variant="h5" component="div" sx={{ padding: 2, fontWeight: 'bold' }}>
        SupplyFinder
      </Typography>
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.12)', my: 2 }} />
      
      <List component="nav" sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <SidebarItem 
            button 
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </SidebarItem>
        ))}
      </List>
    </SidebarContainer>
  );
};

export default Sidebar;
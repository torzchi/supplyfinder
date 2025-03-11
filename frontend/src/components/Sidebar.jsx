import React from 'react';
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

const Sidebar = ({ onNavigate, currentPage }) => {
  const menuItems = [
    { text: 'Gemini Chat', icon: <ChatIcon />, page: 'chat' },
    { text: 'Cypher Query', icon: <CodeIcon />, page: 'cypher' },
    { text: 'Shop', icon: <AddBusiness />, page: 'Shop' },
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
            selected={currentPage === item.page}
            onClick={() => onNavigate(item.page)}
            sx={{
              backgroundColor: currentPage === item.page ? 'rgba(255,255,255,0.08)' : 'transparent',
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
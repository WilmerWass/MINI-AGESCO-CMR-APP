import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Chip } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LinkIcon from '@mui/icons-material/Link';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; // Icon for User Management
import { useAuth } from '../contexts/AuthContext';
import InformePage from '../pages/InformePage';
import ClientsPage from '../pages/ClientsPage';
import AgentsPage from '../pages/AgentsPage';
import NotificationsPage from '../pages/NotificationsPage';
import LinksPage from '../pages/LinksPage';
import ProfilePage from '../pages/ProfilePage';
import UsersPage from '../pages/UsersPage'; // Import the new UsersPage

const navItems = [
  { text: 'Informe', icon: <AssessmentIcon />, path: '/dashboard/informe', adminOnly: false },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/dashboard/clientes', adminOnly: false },
  { text: 'AG.ES.COM', icon: <BusinessIcon />, path: '/dashboard/agescom', adminOnly: false },
  { text: 'Avisos', icon: <NotificationsIcon />, path: '/dashboard/avisos', adminOnly: false },
  { text: 'Usuarios', icon: <SupervisorAccountIcon />, path: '/dashboard/users', adminOnly: true }, // User management page
  { text: 'Enlaces', icon: <LinkIcon />, path: '/dashboard/enlaces', adminOnly: false },
  { text: 'Perfil', icon: <AccountCircleIcon />, path: '/dashboard/perfil', adminOnly: false },
];

const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ backgroundColor: 'var(--sidebar-background)', color: 'var(--sidebar-foreground)', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AGESCO CRM - Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <Chip
            label={isAdmin() ? 'ADMIN' : 'ASESOR'}
            color={isAdmin() ? 'error' : 'primary'}
            size="small"
            sx={{ mr: 2, fontWeight: 'bold' }}
          />
          <Button color="inherit" onClick={logout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          backgroundColor: 'var(--sidebar-background)',
          color: 'var(--sidebar-foreground)',
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', backgroundColor: 'var(--sidebar-background)', color: 'var(--sidebar-foreground)' },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              (item.adminOnly && !isAdmin()) ? null : (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton component={Link} to={item.path}>
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              )
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'var(--background)', color: 'var(--foreground)', minHeight: '100vh' }}>
        <Toolbar /> {/* Spacer for AppBar */}
        <Routes>
          <Route index element={<InformePage />} />
          <Route path="informe" element={<InformePage />} />
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="agescom" element={<AgentsPage />} />
          <Route path="avisos" element={<NotificationsPage />} />
          <Route path="enlaces" element={<LinksPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="users" element={<UsersPage />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

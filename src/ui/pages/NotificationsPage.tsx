import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Badge,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import AvisoForm, { Aviso } from '../components/avisos/AvisoForm';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const { user, isAdmin } = useAuth();
  const currentAsesorId = user?.id; // Use numeric ID

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (!window.api || !window.api.getAvisos) {
        throw new Error('API para obtener avisos no disponible.');
      }
      const fetchedNotifications = await window.api.getAvisos(user);
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(`Error al cargar avisos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleUpdateAvisoStatus = async (id: number, newStatus: string) => {
    try {
      if (!window.api || !window.api.updateAviso) {
        throw new Error('API para actualizar avisos no disponible.');
      }
      const notificationToUpdate = notifications.find(n => n.id === id);
      if (notificationToUpdate) {
        await window.api.updateAviso(id, { ...notificationToUpdate, status: newStatus });
        setSnackbar({ open: true, message: '✅ Estado del aviso actualizado.', severity: 'success' });
        await fetchNotifications(); // Refresh list
      }
    } catch (err: any) {
      console.error(`Failed to update aviso status for ID ${id}:`, err);
      setSnackbar({ open: true, message: `❌ Error al actualizar aviso: ${err.message}`, severity: 'error' });
    }
  };

  const handleSaveAviso = async (aviso: Omit<Aviso, 'id'>) => {
    if (!currentAsesorId) return;
    try {
      if (!window.api || !window.api.addAviso) {
        throw new Error('API para añadir avisos no disponible.');
      }
      const newAviso = {
        ...aviso,
        asesorId: currentAsesorId, // Assign numeric ID
      };
      await window.api.addAviso(newAviso);
      setSnackbar({ open: true, message: '✅ Aviso creado exitosamente.', severity: 'success' });
      setIsFormOpen(false);
      await fetchNotifications(); // Refresh list
    } catch (err: any) {
      console.error('Failed to save aviso:', err);
      setSnackbar({ open: true, message: `❌ Error al crear el aviso: ${err.message}`, severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Avisos y Gestiones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
        >
          Añadir Aviso
        </Button>
      </Stack>
      <Grid container spacing={3}>
        {notifications.map((notification) => (
          <Grid item xs={12} sm={6} md={4} key={notification.id}>
            <Card sx={{ backgroundColor: 'var(--card)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{notification.note}</Typography>
                  <Badge
                    badgeContent={notification.status}
                    color={notification.status === 'Pendiente' ? 'error' : 'success'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Cliente: {notification.clientId ? `ID ${notification.clientId}` : 'N/A'}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Creador: {notification.creator}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Destinatario: {notification.recipient}
                </Typography>
              </CardContent>
              <CardActions>
                {notification.status === 'Pendiente' ? (
                  <Button size="small" onClick={() => handleUpdateAvisoStatus(notification.id, 'Visto')}>
                    Marcar Visto
                  </Button>
                ) : (
                  <Button size="small" onClick={() => handleUpdateAvisoStatus(notification.id, 'Pendiente')}>
                    Reabrir
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <AvisoForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveAviso}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationsPage;

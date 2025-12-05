import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import UsersTable, { User } from '../components/users/UsersTable';
import UserForm from '../components/users/UserForm';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { user: currentUser, isAdmin } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedUsers = await window.api.getUsuarios();
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(`Error al cargar usuarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [fetchUsers, isAdmin]);

  const handleAddClick = () => {
    setSelectedUser(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (userId: string) => {
    if (currentUser?.id === userId) {
      setSnackbar({ open: true, message: 'No puedes eliminar tu propia cuenta.', severity: 'error' });
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible.')) {
      try {
        await window.api.deleteUsuario(userId);
        setSnackbar({ open: true, message: '✅ Usuario eliminado exitosamente.', severity: 'success' });
        await fetchUsers();
      } catch (err: any) {
        setSnackbar({ open: true, message: `❌ Error al eliminar usuario: ${err.message}`, severity: 'error' });
      }
    }
  };

  const handleSaveUser = async (userData: Partial<User> & { password?: string }, userId?: string) => {
    try {
      if (formMode === 'create') {
        const result = await window.api.addUsuario(userData);
        if (!result) { // Assuming the backend now returns the created user or null on failure
          throw new Error("La creación del usuario falló.");
        }
      } else if (userId) {
        await window.api.updateUsuario(userId, userData);
      }
      setSnackbar({ open: true, message: `✅ Usuario ${formMode === 'create' ? 'creado' : 'actualizado'} exitosamente.`, severity: 'success' });
      setIsFormOpen(false);
      await fetchUsers();
    } catch (err: any) {
      setSnackbar({ open: true, message: `❌ Error al guardar usuario: ${err.message}`, severity: 'error' });
    }
  };

  if (!isAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No tienes permiso para acceder a esta sección.</Alert>
      </Box>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Añadir Usuario
        </Button>
      </Box>
      <UsersTable users={users} currentUser={currentUser as User | null} onEdit={handleEditClick} onDelete={handleDeleteClick} />
      <UserForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={selectedUser}
        mode={formMode}
        onSave={handleSaveUser}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;

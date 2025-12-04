import React, { useState, useRef } from 'react';
import {
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // States for UI control
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const filePath = (files[0] as any).path;
      if (filePath) {
        try {
          const newAvatarPath = await window.api.saveAvatar(filePath);
          if (newAvatarPath) {
            updateUser({ avatar: newAvatarPath });
            setSnackbar({ open: true, message: '✅ Foto de perfil actualizada.', severity: 'success' });
          }
        } catch (error) {
          console.error('Failed to save avatar:', error);
          setSnackbar({ open: true, message: '❌ Error al guardar la foto.', severity: 'error' });
        }
      }
    }
  };

  const handleSaveName = async () => {
    if (nameValue.trim() && user) {
      try {
        await window.api.updateUsuario(user.id, { ...user, name: nameValue.trim() });
        updateUser({ name: nameValue.trim() });
        setIsEditingName(false);
        setSnackbar({ open: true, message: '✅ Nombre actualizado.', severity: 'success' });
      } catch (error) {
        console.error('Failed to update name:', error);
        setSnackbar({ open: true, message: '❌ Error al actualizar el nombre.', severity: 'error' });
      }
    }
  };

  const handleCancelEditName = () => {
    setNameValue(user?.name || '');
    setIsEditingName(false);
  };
  
  const handlePasswordChange = async () => {
    if (password.length < 6) {
        setSnackbar({ open: true, message: '❌ La contraseña debe tener al menos 6 caracteres.', severity: 'error'});
        return;
    }
    if (password !== confirmPassword) {
      setSnackbar({ open: true, message: '❌ Las contraseñas no coinciden.', severity: 'error' });
      return;
    }
    if (user) {
      try {
        await window.api.updateUsuario(user.id, { password });
        setSnackbar({ open: true, message: '✅ Contraseña actualizada exitosamente.', severity: 'success' });
        setPassword('');
        setConfirmPassword('');
      } catch (error) {
        console.error('Failed to update password:', error);
        setSnackbar({ open: true, message: '❌ Error al actualizar la contraseña.', severity: 'error' });
      }
    }
  };

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Perfil de Usuario
      </Typography>

      {/* User Profile Card */}
      <Card sx={{ mb: 4, backgroundColor: 'var(--card)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center" direction={{ xs: 'column', sm: 'row' }}>
            <Grid item sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <IconButton onClick={() => avatarFileRef.current?.click()} sx={{p: 0}}>
                <Avatar src={user.avatar} sx={{ width: 80, height: 80, fontSize: '2.5rem', mb: { xs: 2, sm: 0 } }}>
                  {!user.avatar && user.name.charAt(0)}
                </Avatar>
                <input type="file" ref={avatarFileRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/png, image/jpeg" />
              </IconButton>
            </Grid>
            <Grid item xs sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              {isEditingName ? (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <TextField label="Nombre" value={nameValue} onChange={(e) => setNameValue(e.target.value)} variant="outlined" size="small" autoFocus />
                  <IconButton color="primary" onClick={handleSaveName}><SaveIcon /></IconButton>
                  <IconButton onClick={handleCancelEditName}><CancelIcon /></IconButton>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <Typography variant="h5">{user.name}</Typography>
                  <IconButton size="small" onClick={() => setIsEditingName(true)}><EditIcon fontSize="small" /></IconButton>
                </Stack>
              )}
              <Typography variant="body1" color="text.secondary">{user.email}</Typography>
              <Typography variant="body2" color="text.secondary">Rol: {user.role}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Admin-only section for password change */}
      {isAdmin() && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom>
            Cambiar Contraseña
          </Typography>
          <Card sx={{ backgroundColor: 'var(--card)' }}>
            <CardContent>
              <Stack spacing={2} sx={{ maxWidth: 400 }}>
                <TextField
                  label="Nueva Contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                />
                <TextField
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                />
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-start', p: 2 }}>
              <Button variant="contained" onClick={handlePasswordChange}>Guardar Contraseña</Button>
            </CardActions>
          </Card>
        </>
      )}

      {/* Snackbar for notifications */}
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

export default ProfilePage;

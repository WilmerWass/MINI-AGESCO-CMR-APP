import React, { useState, useRef, useEffect } from 'react';
import {
  Typography, Box, Button, Grid, Card, CardContent, CardActions, Avatar,
  Divider, TextField, CircularProgress, Alert, Stack, IconButton, Snackbar, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../components/users/UsersTable';

const ProfilePage: React.FC = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form state
  const [formData, setFormData] = useState<Partial<User>>({});

  // Password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        status: user.status,
        // email and role are not meant to be edited by the user
      });
    }
  }, [user, isEditing]);


  if (!user) {
    return <CircularProgress />;
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const filePath = (files[0] as any).path;
      if (filePath) {
        try {
          const newAvatarPath = await window.api.saveAvatar(filePath);
          if (newAvatarPath) {
            await window.api.updateUsuario(user.id, { avatar: newAvatarPath });
            updateUser({ avatar: newAvatarPath });
            setSnackbar({ open: true, message: '✅ Foto de perfil actualizada.', severity: 'success' });
          }
        } catch (error) {
          setSnackbar({ open: true, message: '❌ Error al guardar la foto.', severity: 'error' });
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };


  const handleSaveChanges = async () => {
    if (formData.name?.trim()) {
      try {
        await window.api.updateUsuario(user.id, { name: formData.name, status: formData.status });
        updateUser({ name: formData.name, status: formData.status });
        setIsEditing(false);
        setSnackbar({ open: true, message: '✅ Perfil actualizado.', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: '❌ Error al actualizar el perfil.', severity: 'error' });
      }
    }
  };

  const handlePasswordChange = async () => {
    if (password.length < 6) {
      setSnackbar({ open: true, message: '❌ La contraseña debe tener al menos 6 caracteres.', severity: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setSnackbar({ open: true, message: '❌ Las contraseñas no coinciden.', severity: 'error' });
      return;
    }
    try {
      await window.api.updateUsuario(user.id, { password });
      setSnackbar({ open: true, message: '✅ Contraseña actualizada.', severity: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Error al actualizar la contraseña.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, margin: 'auto' }}>
      <Card elevation={3} sx={{ backgroundColor: 'var(--card)' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', width: 120, height: 120, margin: 'auto' }}>
                <Avatar src={user.avatar} sx={{ width: '100%', height: '100%', fontSize: '3rem' }}>
                  {!user.avatar && user.name.charAt(0)}
                </Avatar>
                <IconButton
                  color="primary"
                  sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', '&:hover': { backgroundColor: '#f0f0f0' } }}
                  onClick={() => avatarFileRef.current?.click()}
                >
                  <PhotoCamera />
                  <input type="file" ref={avatarFileRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/png, image/jpeg" />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  variant="standard"
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography variant="h4" component="div">{user.name}</Typography>
              )}
              <Typography variant="body1" color="text.secondary" gutterBottom>{user.email}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="overline" color="text.secondary">Rol</Typography>
              <Typography variant="body1">{user.role}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="overline" color="text.secondary">Estado</Typography>
              {isEditing ? (
                <FormControl variant="standard" fullWidth>
                  <Select name="status" value={formData.status || 'Activo'} onChange={handleSelectChange}>
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Typography variant="body1">{user.status}</Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2, backgroundColor: 'action.hover' }}>
          {isEditing ? (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveChanges}>Guardar Cambios</Button>
            </Stack>
          ) : (
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>Editar Perfil</Button>
          )}
        </CardActions>
      </Card>

      {isAdmin() && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Panel de Administrador</Typography>
          <Card elevation={3} sx={{ backgroundColor: 'var(--card)' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Cambiar Contraseña</Typography>
              <Stack spacing={2} sx={{ maxWidth: 400 }}>
                <TextField label="Nueva Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} variant="outlined" size="small" />
                <TextField label="Confirmar Contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} variant="outlined" size="small" />
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-start', p: 2 }}>
              <Button variant="outlined" onClick={handlePasswordChange}>Guardar Contraseña</Button>
            </CardActions>
          </Card>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material';
import { User } from './UsersTable';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: Partial<User> & { password?: string }, userId?: number) => void;
  user: Partial<User> | null;
  mode: 'create' | 'edit';
}

const UserForm: React.FC<UserFormProps> = ({ open, onClose, onSave, user, mode }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'asesor',
        status: 'Activo'
      });
    }
    // Clear password field when form is reused
    setPassword('');
    setPasswordError('');
  }, [user, open]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (mode === 'create' && !password) {
      setPasswordError('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }
    if (password && password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    
    const dataToSave: Partial<User> & { password?: string } = { ...formData };
    if (password) {
      dataToSave.password = password;
    }
    onSave(dataToSave, formData.id);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            name="name"
            label="Nombre Completo"
            value={formData.name || ''}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="email"
            label="Correo Electrónico"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            fullWidth
            required
            disabled={mode === 'edit'} // Prevent email change on edit
          />
          <FormControl fullWidth required>
            <InputLabel>Rol</InputLabel>
            <Select
              name="role"
              value={formData.role || 'asesor'}
              label="Rol"
              onChange={handleChange}
            >
              <MenuItem value="asesor">Asesor</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
           <FormControl fullWidth required>
            <InputLabel>Estatus</InputLabel>
            <Select
              name="status"
              value={formData.status || 'Activo'}
              label="Estatus"
              onChange={handleChange}
            >
              <MenuItem value="Activo">Activo</MenuItem>
              <MenuItem value="Inactivo">Inactivo</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="password"
            label={mode === 'create' ? 'Contraseña' : 'Restablecer Contraseña (opcional)'}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            fullWidth
            required={mode === 'create'}
            helperText={mode === 'edit' ? 'Dejar en blanco para no cambiar la contraseña.' : ''}
          />
          {passwordError && <Alert severity="error">{passwordError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;

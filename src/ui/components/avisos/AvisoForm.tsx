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
  Autocomplete,
} from '@mui/material';
import { Client } from '../clients/ClientTable';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../users/UsersTable';

export interface Aviso {
  id?: string;
  clientId: string | null;
  note: string;
  status: 'Pendiente' | 'Visto';
  creator: string;
  recipient: string;
  asesorId: string;
}

interface AvisoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (aviso: Omit<Aviso, 'id'>) => void;
}

const AvisoForm: React.FC<AvisoFormProps> = ({ open, onClose, onSave }) => {
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (open && user) {
        try {
          const fetchedClients = await window.api.getClientes(isAdmin() ? undefined : user.id);
          const fetchedUsers = await window.api.getUsuarios();
          setClients(fetchedClients);
          setUsers(fetchedUsers);
        } catch (error) {
          console.error('Failed to fetch data for form:', error);
        }
      }
    };
    fetchData();
  }, [open, user, isAdmin]);

  const handleSave = () => {
    if (!note || !recipient || !user) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    const newAviso: Omit<Aviso, 'id'> = {
      clientId: selectedClient?.id || null,
      note,
      status: 'Pendiente',
      creator: user.email, // The creator is the current user's email
      recipient,
      asesorId: user.id, // The asesorId is the current user's numeric ID
    };

    onSave(newAviso);
    // Reset form
    setNote('');
    setRecipient('');
    setSelectedClient(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nuevo Aviso</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Client Selector */}
          <Autocomplete
            options={clients}
            getOptionLabel={(option) => `${option.nombreCompleto} (ID: ${option.id})`}
            value={selectedClient}
            onChange={(_event, newValue) => {
              setSelectedClient(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Asociar a Cliente (Opcional)" />
            )}
          />

          {/* Note */}
          <TextField
            label="Nota / Tarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
          />

          {/* Recipient */}
          <FormControl fullWidth required>
            <InputLabel>Destinatario</InputLabel>
            <Select
              value={recipient}
              label="Destinatario"
              onChange={(e) => setRecipient(e.target.value)}
            >
              <MenuItem value=""><em>Seleccione un destinatario</em></MenuItem>
              <MenuItem value="Todos">Todos</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.email}>{u.email}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvisoForm;

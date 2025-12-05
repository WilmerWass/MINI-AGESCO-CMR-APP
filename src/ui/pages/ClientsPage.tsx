import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useAuth } from '../contexts/AuthContext';
import ClientTable, { Client } from '../components/clients/ClientTable';
import ClientForm from '../components/clients/ClientForm';
import { User } from '../components/users/UsersTable';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]); // To map asesorId to name
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros avanzados
  const [filterText, setFilterText] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCompania, setFilterCompania] = useState('');
  const [filterAsesor, setFilterAsesor] = useState(''); // This will be an ID
  const [filterEstatus, setFilterEstatus] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'create'>('view');

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get user info from AuthContext
  const { user, isAdmin } = useAuth();
  const currentAsesorId = user?.id; // Use numeric ID

  const fetchClients = useCallback(async () => {
    console.log('fetchClients: user', user);
    console.log('fetchClients: isAdmin()', isAdmin());
    console.log('fetchClients: currentAsesorId', currentAsesorId);

    if (!currentAsesorId) return;

    setLoading(true);
    setError(null);
    try {
      if (window.api && window.api.getClientes) {
        const fetchedClients = await window.api.getClientes(isAdmin() ? undefined : currentAsesorId);
        setClients(fetchedClients);
      } else {
        throw new Error('La API de clientes no está disponible.');
      }
      if (isAdmin()) {
        const fetchedUsers = await window.api.getUsuarios();
        setUsers(fetchedUsers);
      }
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(`Error al cargar datos: ${err.message || 'Error desconocido'}`);
      setSnackbar({
        open: true,
        message: '❌ Error al cargar los datos.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [currentAsesorId, isAdmin]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddClick = () => {
    setSelectedClient(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleViewClick = (client: Client) => {
    setSelectedClient(client);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (clientId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await window.api.deleteCliente(clientId);
        setSnackbar({
          open: true,
          message: '✅ Cliente eliminado exitosamente',
          severity: 'success'
        });
        await fetchClients();
      } catch (err: any) {
        console.error('Failed to delete client:', err);
        setSnackbar({
          open: true,
          message: '❌ Error al eliminar cliente',
          severity: 'error'
        });
      }
    }
  };

  const handleSaveClient = async (clientData: Client) => {
    if (!currentAsesorId) return;
    try {
      if (formMode === 'create') {
        const newClient = {
          ...clientData,
          asesorId: currentAsesorId, // Assign numeric ID
        };
        await window.api.addCliente(newClient);
        setSnackbar({
          open: true,
          message: '✅ Cliente guardado exitosamente',
          severity: 'success'
        });
      } else if (clientData.id) {
        await window.api.updateCliente(clientData.id, clientData);
        setSnackbar({
          open: true,
          message: '✅ Cliente actualizado exitosamente',
          severity: 'success'
        });
      }
      setIsFormOpen(false);
      await fetchClients();
    } catch (err: any) {
      console.error('Failed to save client:', err);
      setSnackbar({
        open: true,
        message: '❌ Error al guardar cliente',
        severity: 'error'
      });
    }
  };

  const handleClearFilters = () => {
    setFilterText('');
    setFilterEstado('');
    setFilterCompania('');
    setFilterAsesor('');
    setFilterEstatus('');
  };

  const uniqueEstados = Array.from(new Set(clients.map(c => c.estado).filter(Boolean)));
  const uniqueCompanias = Array.from(new Set(clients.map(c => c.compania).filter(Boolean)));
  const uniqueEstatus = Array.from(new Set(clients.map(c => c.estatus).filter(Boolean)));
  
  const filteredClients = clients.filter(client => {
    const matchesText = client.nombreCompleto.toLowerCase().includes(filterText.toLowerCase()) ||
      (client.telefono && client.telefono.toLowerCase().includes(filterText.toLowerCase()));
    const matchesEstado = filterEstado === '' || client.estado === filterEstado;
    const matchesCompania = filterCompania === '' || client.compania === filterCompania;
    const matchesAsesor = filterAsesor === '' || client.asesorId === filterAsesor;
    const matchesEstatus = filterEstatus === '' || client.estatus === filterEstatus;

    return matchesText && matchesEstado && matchesCompania && matchesAsesor && matchesEstatus;
  });

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Clientes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Añadir Cliente
        </Button>
      </Box>

      <Card sx={{ mb: 3, backgroundColor: 'var(--card)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtros Avanzados</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Box sx={{ minWidth: 250, flexGrow: 1 }}>
              <TextField
                fullWidth variant="outlined" size="small" label="Buscar cliente"
                placeholder="Buscar por nombre o teléfono..."
                value={filterText} onChange={(e) => setFilterText(e.target.value)}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select value={filterEstado} label="Estado" onChange={(e) => setFilterEstado(e.target.value)}>
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {uniqueEstados.map(estado => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Compañía</InputLabel>
                <Select value={filterCompania} label="Compañía" onChange={(e) => setFilterCompania(e.target.value)}>
                  <MenuItem value=""><em>Todas</em></MenuItem>
                  {uniqueCompanias.map(compania => <MenuItem key={compania} value={compania}>{compania}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            {isAdmin() && (
              <Box sx={{ minWidth: 180 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Asesor</InputLabel>
                  <Select value={filterAsesor} label="Asesor" onChange={(e) => setFilterAsesor(e.target.value)}>
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            )}
            <Box sx={{ minWidth: 180 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estatus</InputLabel>
                <Select value={filterEstatus} label="Estatus" onChange={(e) => setFilterEstatus(e.target.value)}>
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {uniqueEstatus.map(estatus => <MenuItem key={estatus} value={estatus}>{estatus}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Button fullWidth variant="outlined" startIcon={<FilterAltOffIcon />} onClick={handleClearFilters}>
                Limpiar
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <ClientTable
          clients={filteredClients}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          users={users} // Pass users for mapping ID to name
        />
      </Box>

      <ClientForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        client={selectedClient}
        mode={formMode}
        onSave={handleSaveClient}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

export default ClientsPage;

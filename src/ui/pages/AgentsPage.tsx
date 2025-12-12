import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useAuth } from '../contexts/AuthContext';

interface Agent {
  id: string;
  name: string;
  state: string;
  company: string;
  asesorId: string;
}

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filterName, setFilterName] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  // Modal and Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedAgent, setSelectedAgent] = useState<Partial<Agent> | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { user, isAdmin } = useAuth();
  const currentAsesorId = user?.id;

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAgentes = await window.api.getAgentes(); // Fetch all agents, regardless of role
      setAgents(fetchedAgentes);
    } catch (err: any) {
      setError(`Error al cargar agentes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []); // Depend on nothing that changes the filter behavior

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleAddClick = () => {
    setFormMode('create');
    setSelectedAgent({ name: '', state: '', company: '' });
    setIsFormOpen(true);
  };

  const handleEditClick = (agent: Agent) => {
    setFormMode('edit');
    setSelectedAgent(agent);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este agente?')) {
      try {
        await window.api.deleteAgente(id);
        setSnackbar({ open: true, message: '✅ Agente eliminado exitosamente.', severity: 'success' });
        fetchAgents();
      } catch (err: any) {
        setSnackbar({ open: true, message: `❌ Error al eliminar agente: ${err.message}`, severity: 'error' });
      }
    }
  };

  const handleSave = async () => {
    if (!selectedAgent || !selectedAgent.name || !selectedAgent.state || !selectedAgent.company || !currentAsesorId) {
      setSnackbar({ open: true, message: '❌ Todos los campos son requeridos.', severity: 'error' });
      return;
    }

    try {
      if (formMode === 'create') {
        await window.api.addAgente({
          name: selectedAgent.name,
          state: selectedAgent.state,
          company: selectedAgent.company,
          asesorId: currentAsesorId,
        });
      } else if (selectedAgent.id) {
        await window.api.updateAgente(selectedAgent.id, selectedAgent);
      }
      setSnackbar({ open: true, message: `✅ Agente ${formMode === 'create' ? 'creado' : 'actualizado'}.`, severity: 'success' });
      setIsFormOpen(false);
      fetchAgents();
    } catch (err: any) {
      setSnackbar({ open: true, message: `❌ Error al guardar agente: ${err.message}`, severity: 'error' });
    }
  };

  const handleClearFilters = () => {
    setFilterName('');
    setFilterState('');
    setFilterCompany('');
  };

  const uniqueStates = Array.from(new Set(agents.map(a => a.state).filter(Boolean)));
  const uniqueCompanies = Array.from(new Set(agents.map(a => a.company).filter(Boolean)));

  const filteredAgents = agents.filter(agent => {
    const matchesName = agent.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesState = filterState === '' || agent.state === filterState;
    const matchesCompany = filterCompany === '' || agent.company === filterCompany;
    return matchesName && matchesState && matchesCompany;
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">AG.ES.COM</Typography>
        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Añadir Agente
          </Button>
        )}
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 3, backgroundColor: 'var(--card)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Box sx={{ minWidth: 250, flexGrow: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Buscar Agente"
                placeholder="Nombre..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterState}
                  label="Estado"
                  onChange={(e) => setFilterState(e.target.value)}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {uniqueStates.map(state => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Compañía</InputLabel>
                <Select
                  value={filterCompany}
                  label="Compañía"
                  onChange={(e) => setFilterCompany(e.target.value)}
                >
                  <MenuItem value=""><em>Todas</em></MenuItem>
                  {uniqueCompanies.map(company => (
                    <MenuItem key={company} value={company}>{company}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterAltOffIcon />}
                onClick={handleClearFilters}
              >
                Limpiar
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Agente</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Compañía</TableCell>
                  {isAdmin() && <TableCell align="right">Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.state}</TableCell>
                    <TableCell>{agent.company}</TableCell>
                    {isAdmin() && (
                      <TableCell align="right">
                        <IconButton onClick={() => handleEditClick(agent)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(agent.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredAgents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin() ? 4 : 3} align="center">
                      <Typography variant="body2" sx={{ my: 2, color: 'text.secondary' }}>
                        No se encontraron agentes con los filtros seleccionados.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <DialogTitle>{formMode === 'create' ? 'Añadir Nuevo Agente' : 'Editar Agente'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Agente"
            fullWidth
            variant="outlined"
            value={selectedAgent?.name || ''}
            onChange={(e) => setSelectedAgent(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Estado"
            fullWidth
            variant="outlined"
            value={selectedAgent?.state || ''}
            onChange={(e) => setSelectedAgent(prev => ({ ...prev, state: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Compañía"
            fullWidth
            variant="outlined"
            value={selectedAgent?.company || ''}
            onChange={(e) => setSelectedAgent(prev => ({ ...prev, company: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFormOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

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

export default AgentsPage;

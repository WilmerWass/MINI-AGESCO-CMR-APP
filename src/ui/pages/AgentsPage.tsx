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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';

interface Agent {
  id: number;
  name: string;
  state: string;
  company: string;
  asesorId: number;
}

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!currentAsesorId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedAgents = await window.api.getAgentes(isAdmin() ? undefined : currentAsesorId);
      setAgents(fetchedAgents);
    } catch (err: any) {
      setError(`Error al cargar agentes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentAsesorId, isAdmin]);

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

  const handleDelete = async (id: number) => {
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
                {agents.map((agent) => (
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

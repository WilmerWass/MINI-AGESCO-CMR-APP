import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Enlace {
  id: number;
  name: string;
  url: string;
  asesorId: string | null;
}

const userRole = 'admin'; // Simulate admin role

const LinksPage: React.FC = () => {
  const [links, setLinks] = useState<Enlace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<Enlace | null>(null);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const currentAsesorId = 'admin@agesco.com'; // Hardcode asesorId for now

  const fetchLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLinks = await window.api.getEnlaces(currentAsesorId);
      setLinks(fetchedLinks);
    } catch (err) {
      console.error('Failed to fetch links:', err);
      setError('Error al cargar enlaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleVisit = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCardClick = (link: Enlace) => {
    if (window.confirm(`¿Quiere visitar ${link.name}?`)) {
      handleVisit(link.url);
    }
  };

  const handleAddClick = () => {
    setEditingLink(null);
    setLinkName('');
    setLinkUrl('');
    setOpenDialog(true);
  };

  const handleEditLink = (link: Enlace) => {
    setEditingLink(link);
    setLinkName(link.name);
    setLinkUrl(link.url);
    setOpenDialog(true);
  };

  const handleSaveLink = async () => {
    if (linkName.trim() === '' || linkUrl.trim() === '') {
      alert('El nombre y la URL del enlace no pueden estar vacíos.');
      return;
    }

    try {
      if (editingLink) {
        // Update existing link
        const updatedLink = { ...editingLink, name: linkName, url: linkUrl };
        await window.api.updateEnlace(editingLink.id, updatedLink);
      } else {
        // Create new link
        const newEnlace = {
          name: linkName,
          url: linkUrl,
          asesorId: userRole === 'admin' ? null : currentAsesorId,
        };
        await window.api.addEnlace(newEnlace);
      }

      setOpenDialog(false);
      setLinkName('');
      setLinkUrl('');
      setEditingLink(null);
      fetchLinks();
    } catch (err) {
      console.error('Failed to save link:', err);
      setError('Error al guardar enlace.');
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este enlace?')) {
      try {
        await window.api.deleteEnlace(id);
        fetchLinks();
      } catch (err) {
        console.error('Failed to delete link:', err);
        setError('Error al eliminar enlace.');
      }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Enlaces Directos
        </Typography>
        {userRole === 'admin' && (
          <Button variant="contained" onClick={handleAddClick}>
            Añadir Enlace
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {links.map((link) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={link.id}>
            <Card
              sx={{
                backgroundColor: 'var(--card)',
                cursor: 'pointer',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
              onClick={() => handleCardClick(link)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div">
                  {link.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {link.url}
                </Typography>
              </CardContent>
              {userRole === 'admin' && (
                <CardActions sx={{ justifyContent: 'center' }}>
                  <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditLink(link);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLink(link.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Link Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingLink ? 'Editar Enlace' : 'Añadir Nuevo Enlace'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Enlace"
            fullWidth
            variant="outlined"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="URL del Enlace"
            fullWidth
            variant="outlined"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveLink} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LinksPage;

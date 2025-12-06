import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { User } from '../users/UsersTable';

export interface Client {
  id: string;
  nombreCompleto: string;
  telefono: string;
  compania: string;
  estatus: string;
  asesorId: string;
  ultimaActualizacion: string;
  lastGestionDate?: string; // Nuevo campo para la fecha de la última gestión
  gestionStatus?: string;   // Nuevo campo para el estado de la gestión

  // Campos de información personal
  aplica?: string;
  fechaNacimiento?: string;
  edad?: string;
  genero?: string;
  email?: string;
  pais?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  zipcode?: string;
  condado?: string;
  ingresos?: string;
  impuestos?: string;
  ssn?: string;
  estatusMigratorio?: string;
  palabraClave?: string;

  // Campos de grupo familiar
  dependientes?: any[];

  // Campos de seguro
  plan?: any;

  // Campos de pago
  pago?: any;

  // Campos de seguimiento
  fechaVenta?: string;
  ultimoSeguimiento?: string;
  fechaCreacion?: string;
  notas?: any[];
}

interface ClientTableProps {
  clients: Client[];
  users?: User[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, users = [], onView, onEdit, onDelete }) => {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuClientId, setMenuClientId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = clients.map((n) => n.id);
      setSelectedClients(newSelecteds);
      return;
    }
    setSelectedClients([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selectedClients.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedClients, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedClients.slice(1));
    } else if (selectedIndex === selectedClients.length - 1) {
      newSelected = newSelected.concat(selectedClients.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedClients.slice(0, selectedIndex),
        selectedClients.slice(selectedIndex + 1),
      );
    }

    setSelectedClients(newSelected);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, clientId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuClientId(clientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuClientId(null);
  };

  const handleCopySelected = () => {
    const selectedData = clients
      .filter(c => selectedClients.includes(c.id))
      .map(c => `${c.nombreCompleto} - ${c.telefono} - ${c.estatus}`)
      .join('\n');

    navigator.clipboard.writeText(selectedData)
      .then(() => alert(`${selectedClients.length} clientes copiados al portapapeles.`))
      .catch(err => console.error('Error al copiar:', err));
  };

  const isSelected = (id: string) => selectedClients.indexOf(id) !== -1;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginate clients
  const paginatedClients = clients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {selectedClients.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, p: 1, bgcolor: 'action.selected', borderRadius: 1 }}>
          <Typography variant="subtitle1">{selectedClients.length} seleccionados</Typography>
          <Button
            startIcon={<ContentCopyIcon />}
            variant="outlined"
            size="small"
            onClick={handleCopySelected}
          >
            Copiar Seleccionados
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="client table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedClients.length > 0 && selectedClients.length < clients.length}
                  checked={clients.length > 0 && selectedClients.length === clients.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Nombre Completo</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Compañía</TableCell>
              <TableCell>Estatus</TableCell>
              <TableCell>Asesor</TableCell>
              <TableCell>Última Actualización</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClients.map((client) => {
              const isItemSelected = isSelected(client.id);
              const labelId = `enhanced-table-checkbox-${client.id}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={client.id}
                  selected={isItemSelected}
                  sx={{
                    backgroundColor: client.estatus === 'GESTION NECESARIA' ? 'rgba(255, 0, 0, 0.08)' : 'inherit',
                    '&.Mui-selected': {
                      backgroundColor: client.estatus === 'GESTION NECESARIA' ? 'rgba(255, 0, 0, 0.15)' : undefined,
                    }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onClick={(event) => handleClick(event, client.id)}
                      inputProps={{
                        'aria-labelledby': labelId,
                      }}
                    />
                  </TableCell>
                  <TableCell component="th" id={labelId} scope="row">
                    <Typography
                      variant="body2"
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        color: 'primary.main'
                      }}
                      onClick={() => onView(client)}
                    >
                      {client.nombreCompleto}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {client.telefono}
                      {client.telefono && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            const cleanPhone = client.telefono.replace(/\D/g, '');
                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                          }}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{client.estado}</TableCell>
                  <TableCell>{client.compania}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: client.estatus === 'GESTION NECESARIA' ? 'error.light' : 'success.light',
                        color: client.estatus === 'GESTION NECESARIA' ? 'error.contrastText' : 'success.contrastText',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {client.estatus}
                    </Box>
                  </TableCell>
                  <TableCell>{userMap.get(client.asesorId) || client.asesorId}</TableCell>
                  <TableCell>{client.ultimaActualizacion}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => onView(client)}>Ver</Button>
                    <IconButton
                      aria-label="more"
                      aria-controls={`menu-${client.id}`}
                      aria-haspopup="true"
                      onClick={(e) => handleMenuClick(e, client.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={clients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (menuClientId) {
            const client = clients.find(c => c.id === menuClientId);
            if (client) onEdit(client);
          }
          handleMenuClose();
        }}>
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          if (menuClientId) onDelete(menuClientId);
          handleMenuClose();
        }}>
          Borrar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ClientTable;

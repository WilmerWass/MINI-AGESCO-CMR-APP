import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Typography,
    Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Agent {
    id: number;
    name: string;
    state: string;
    company: string;
    asesorId: string;
}

interface AgentsTableProps {
    agents: Agent[];
    onEdit: (agent: Agent) => void;
    onDelete: (id: number) => void;
}

const AgentsTable: React.FC<AgentsTableProps> = ({ agents, onEdit, onDelete }) => {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="agents table">
                <TableHead>
                    <TableRow>
                        <TableCell>Agente</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Compañía</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {agents.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                    No se encontraron agentes.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        agents.map((agent) => (
                            <TableRow
                                key={agent.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    <Typography variant="subtitle2">{agent.name}</Typography>
                                </TableCell>
                                <TableCell>{agent.state}</TableCell>
                                <TableCell>
                                    <Chip label={agent.company} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        aria-label="edit"
                                        size="small"
                                        onClick={() => onEdit(agent)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        aria-label="delete"
                                        size="small"
                                        onClick={() => onDelete(agent.id)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default AgentsTable;

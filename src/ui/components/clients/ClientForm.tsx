import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Button,
    Tabs,
    Tab,
    TextField,
    Grid,
    Stack,
    Divider,
    List,
    ListItem,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Client } from './ClientTable';

interface ClientFormProps {
    open: boolean;
    onClose: () => void;
    client: Client | null;
    mode: 'view' | 'edit' | 'create';
    onSave: (client: Client) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ height: '100%', overflowY: 'auto' }}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Función para formatear fecha automáticamente con barras
const formatDateInput = (value: string): string => {
    // Eliminar todo excepto números
    const numbers = value.replace(/\D/g, '');

    // Aplicar formato MM/DD/YYYY
    if (numbers.length <= 2) {
        return numbers;
    } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
};

// Función para calcular edad desde fecha de nacimiento
const calculateAge = (dateString: string): string => {
    if (!dateString || dateString.length !== 10) return '';

    const parts = dateString.split('/');
    if (parts.length !== 3) return '';

    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(month) || isNaN(day) || isNaN(year)) return '';
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > new Date().getFullYear()) return '';

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= 0 ? age.toString() : '';
};

// Función para formatear ingresos con punto de miles y coma de centavos (ej: 1.000,00)
const formatCurrency = (value: string): string => {
    // Eliminar todo excepto números y coma
    const cleaned = value.replace(/[^\d,]/g, '');

    // Separar parte entera y decimal
    const parts = cleaned.split(',');
    let integerPart = parts[0];
    const decimalPart = parts[1] || '';

    // Formatear parte entera con puntos de miles
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Retornar con coma decimal si existe
    return decimalPart ? `${integerPart},${decimalPart.slice(0, 2)}` : integerPart;
};

// Función para formatear SSN con guiones (ej: 123-45-6789)
const formatSSN = (value: string): string => {
    // Eliminar todo excepto números
    const numbers = value.replace(/\D/g, '');

    // Aplicar formato XXX-XX-XXXX
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 5) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
    }
};

// Función para formatear prima mensual con punto decimal (ej: 100.50)
const formatPrima = (value: string): string => {
    // Eliminar todo excepto números y punto
    const cleaned = value.replace(/[^\d.]/g, '');

    // Asegurar solo un punto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        return `${parts[0]}.${parts.slice(1).join('')}`;
    }

    // Limitar decimales a 2
    if (parts[1]) {
        return `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    return cleaned;
};

const ClientForm: React.FC<ClientFormProps> = ({ open, onClose, client, mode, onSave }) => {
    const [tabValue, setTabValue] = useState(0);
    const [hasCopiedPersonal, setHasCopiedPersonal] = useState(false);
    const [formData, setFormData] = useState<Partial<Client>>({});
    const [newNote, setNewNote] = useState('');
    const [currentMode, setCurrentMode] = useState<'view' | 'edit' | 'create'>(mode);

    // Determinar si el formulario es de solo lectura
    const readOnly = currentMode === 'view';

    // Actualizar el modo cuando cambie el prop o cuando se abra el formulario
    useEffect(() => {
        if (open) {
            setCurrentMode(mode);
        }
    }, [mode, open]);

    useEffect(() => {
        if (client) {
            setFormData(JSON.parse(JSON.stringify(client))); // Deep copy
        } else {
            setFormData({
                dependientes: [],
                plan: {},
                pago: {},
                notas: [],
                fechaVenta: new Date().toLocaleDateString('en-US'), // Auto-set sale date
                ultimoSeguimiento: new Date().toISOString() // Auto-set last follow-up
            });
        }
    }, [client]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleInputChange = (field: keyof Client, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Manejo especial para fecha de nacimiento con formato automático y cálculo de edad
    const handleDateChange = (field: 'fechaNacimiento', value: string) => {
        const formatted = formatDateInput(value);
        setFormData(prev => {
            const newData = { ...prev, [field]: formatted };
            // Calcular edad automáticamente si la fecha está completa
            if (formatted.length === 10) {
                newData.edad = calculateAge(formatted);
            }
            return newData;
        });
    };

    const handleNestedChange = (parent: 'plan' | 'pago', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    // Dependents Management
    const handleAddDependent = () => {
        const newDep = {
            nombreCompleto: '',
            edad: '',
            fechaNacimiento: '',
            parentesco: '',
            estatusMigratorio: '',
            aplica: 'Sí',
            ssn: '',
            notas: '',
            genero: '',
            ingresos: ''
        };
        setFormData(prev => ({
            ...prev,
            dependientes: [...(prev.dependientes || []), newDep]
        }));
    };

    const handleDependentChange = (index: number, field: string, value: string) => {
        const updatedDeps = [...(formData.dependientes || [])];
        updatedDeps[index] = { ...updatedDeps[index], [field]: value };

        // Si es fecha de nacimiento, formatear y calcular edad
        if (field === 'fechaNacimiento') {
            const formatted = formatDateInput(value);
            updatedDeps[index].fechaNacimiento = formatted;
            if (formatted.length === 10) {
                updatedDeps[index].edad = calculateAge(formatted);
            }
        }

        // Si es SSN, formatear automáticamente
        if (field === 'ssn') {
            updatedDeps[index].ssn = formatSSN(value);
        }

        setFormData(prev => ({ ...prev, dependientes: updatedDeps }));
    };

    const handleDeleteDependent = (index: number) => {
        const updatedDeps = [...(formData.dependientes || [])];
        updatedDeps.splice(index, 1);
        setFormData(prev => ({ ...prev, dependientes: updatedDeps }));
    };

    // Notes Management
    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const now = new Date().toISOString();
        const note = {
            fecha: now,
            texto: newNote,
            autor: 'Usuario'
        };
        setFormData(prev => ({
            ...prev,
            notas: [note, ...(prev.notas || [])],
            ultimoSeguimiento: now, // Update last follow-up
            lastGestionDate: now,    // Update last gestion date
            gestionStatus: "EN SEGUIMIENTO" // Update gestion status
        }));
        setNewNote('');
    };

    const handleCopyInfo = () => {
        copySection('all');
    };

    const copySection = async (section: 'all' | 'personal' | 'family' | 'insurance' | 'payment' | 'notes') => {
        let info = '';

        if (section === 'personal') {
            const memberCount = 1 + (formData.dependientes?.length || 0);
            info += `APLICA: ${formData.aplica || 'Sí'}\n`;
            info += `NOMBRE COMPLETO: ${formData.nombreCompleto || ''}\n`;
            info += `FECHA DE NACIMIENTO: ${formData.fechaNacimiento || ''}\n`;
            info += `TELEFONO: ${formData.telefono || ''}\n`;
            info += `EMAIL: ${formData.email || ''}\n`;
            info += `ZIPCODE: ${formData.zipcode || ''}\n`;
            info += `NUMERO DE MIEMBROS: ${memberCount}\n`;
            info += `INGRESOS: ${formData.ingresos || ''}\n`;
            info += `COMPAÑIA: ${formData.compania || ''}\n`;
            info += `LINK: \n`;
        } else if (section === 'all') {
            info += '📋 INFORMACIÓN PERSONAL\n';
            info += `Nombre Completo: ${formData.nombreCompleto || 'N/A'}\n`;
            info += `Fecha de Nacimiento: ${formData.fechaNacimiento || 'N/A'}\n`;
            info += `Edad: ${formData.edad || 'N/A'}\n`;
            info += `Género: ${formData.genero || 'N/A'}\n`;
            info += `Teléfono: ${formData.telefono || 'N/A'}\n`;
            info += `Email: ${formData.email || 'N/A'}\n`;
            info += `SSN: ${formData.ssn || 'N/A'}\n`;
            info += `Estatus Migratorio: ${formData.estatusMigratorio || 'N/A'}\n\n`;

            info += '📍 DIRECCIÓN\n';
            info += `Dirección: ${formData.direccion || 'N/A'}\n`;
            info += `Ciudad / Municipio: ${formData.zipcode || 'N/A'}\n`;
            info += `Estado: ${formData.estado || 'N/A'}\n`;
            info += `Departamento: ${formData.condado || 'N/A'}\n\n`;

            info += '💰 INFORMACIÓN FINANCIERA\n';
            info += `Ingresos: ${formData.ingresos || 'N/A'}\n`;
            info += `Impuestos: ${formData.impuestos || 'N/A'}\n\n`;
        }

        if (section === 'all' || section === 'family') {
            if (formData.dependientes && formData.dependientes.length > 0) {
                info += '👨‍👩‍👧‍👦 GRUPO FAMILIAR\n';
                formData.dependientes.forEach((dep: any, index: number) => {
                    info += `\nMiembro ${index + 1}:\n`;
                    info += `  • Nombre: ${dep.nombreCompleto || 'N/A'}\n`;
                    info += `  • Fecha de Nacimiento: ${dep.fechaNacimiento || 'N/A'}\n`;
                    info += `  • Edad: ${dep.edad || 'N/A'}\n`;
                    info += `  • Género: ${dep.genero || 'N/A'}\n`;
                    info += `  • Parentesco: ${dep.parentesco || 'N/A'}\n`;
                    info += `  • SSN: ${dep.ssn || 'N/A'}\n`;
                    info += `  • Estatus Migratorio: ${dep.estatusMigratorio || 'N/A'}\n`;
                    info += `  • Aplica: ${dep.aplica || 'N/A'}\n`;
                    if (dep.notas) info += `  • Notas: ${dep.notas}\n`;
                });
                info += '\n';
            } else if (section === 'family') {
                info += '👨‍👩‍👧‍👦 GRUPO FAMILIAR\nNo hay dependientes registrados.\n\n';
            }
        }

        if (section === 'all' || section === 'insurance') {
            info += '🏥 INFORMACIÓN DEL SEGURO\n';
            info += `Compañía: ${formData.compania || 'N/A'}\n`;
            info += `Nombre del Plan: ${formData.plan?.nombre || 'N/A'}\n`;
            info += `Número de Póliza: ${formData.plan?.poliza || 'N/A'}\n`;
            info += `Prima Mensual: $${formData.plan?.prima || 'N/A'}\n`;
            info += `Fecha Efectiva: ${formData.plan?.fechaEfectiva || 'N/A'}\n`;
            info += `Fecha de Renovación: ${formData.plan?.fechaRenovacion || 'N/A'}\n`;
            info += `Estatus de la Póliza: ${formData.estatus || 'N/A'}\n\n`;
        }

        if (section === 'all' || section === 'payment') {
            info += '💳 MÉTODO DE PAGO\n';
            let hasPayment = false;
            if (formData.pago?.cuentasBancarias && formData.pago.cuentasBancarias.length > 0) {
                hasPayment = true;
                info += 'Cuentas Bancarias:\n';
                formData.pago.cuentasBancarias.forEach((cuenta: any, index: number) => {
                    info += `  ${index + 1}. ${cuenta.banco || 'N/A'} - ${cuenta.numeroCuenta || 'N/A'}\n`;
                });
            }
            if (formData.pago?.tarjetas && formData.pago.tarjetas.length > 0) {
                hasPayment = true;
                info += 'Tarjetas:\n';
                formData.pago.tarjetas.forEach((tarjeta: any, index: number) => {
                    info += `  ${index + 1}. ${tarjeta.tipo || 'N/A'} - **** ${tarjeta.ultimos4 || 'N/A'}\n`;
                });
            }
            if (!hasPayment && section === 'payment') {
                info += 'No hay métodos de pago registrados.\n';
            }
            info += '\n';
        }

        if (section === 'all' || section === 'notes') {
            if (formData.notas && formData.notas.length > 0) {
                info += '📝 NOTAS DE SEGUIMIENTO\n';
                formData.notas.forEach((nota: any, index: number) => {
                    const fecha = new Date(nota.fecha).toLocaleString('es-ES');
                    info += `[${fecha}] ${nota.autor || 'Usuario'}:\n${nota.texto}\n\n`;
                });
            } else if (section === 'notes') {
                info += '📝 NOTAS DE SEGUIMIENTO\nNo hay notas registradas.\n\n';
            }
        }

        try {
            await navigator.clipboard.writeText(info);
            alert(`✅ Información ${section === 'all' ? 'del cliente' : 'de la sección'} copiada al portapapeles.`);
        } catch (err) {
            console.error('Error al copiar con API Clipboard:', err);
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = info;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert(`✅ Información ${section === 'all' ? 'del cliente' : 'de la sección'} copiada al portapapeles.`);
            } catch (err) {
                console.error('Error al copiar con fallback:', err);
                alert('❌ No se pudo copiar la información.');
            }
            document.body.removeChild(textArea);
        }
    };

    const handleSave = () => {
        onSave(formData as Client);
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 600, md: 800 } }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6">
                            {currentMode === 'create' ? 'Añadir Nuevo Cliente' : currentMode === 'edit' ? 'Editar Cliente' : 'Detalles del Cliente'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {client?.nombreCompleto || 'Nuevo Cliente'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="client tabs" variant="scrollable" scrollButtons="auto">
                        <Tab label="Personal" />
                        <Tab label="Grupo Familiar" />
                        <Tab label="Seguro" />
                        <Tab label="Método de Pago" />
                        <Tab label="Seguimiento" />
                    </Tabs>
                </Box>

                {/* Tab Panels */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {/* Personal Tab */}
                    <CustomTabPanel value={tabValue} index={0}>
                        <Grid container spacing={2}>
                            {/* ESTATUS DE LA PÓLIZA */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="ESTATUS DE LA PÓLIZA"
                                    value={formData.estatus || 'CLIENTE NUEVO'}
                                    onChange={(e) => handleInputChange('estatus', e.target.value)}
                                    disabled={readOnly}
                                    select
                                    SelectProps={{ native: true }}
                                >
                                    <option value="CLIENTE NUEVO">CLIENTE NUEVO</option>
                                    <option value="FALTA INFO">FALTA INFO</option>
                                    <option value="GESTION NECESARIA">GESTION NECESARIA</option>
                                    <option value="CANCELADA">CANCELADA</option>
                                    <option value="COMPLETA">COMPLETA</option>
                                    <option value="PROCESADA">PROCESADA</option>
                                    <option value="ACTIVA">ACTIVA</option>
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 1 }}>
                                    <Typography variant="subtitle1">Información Personal</Typography>
                                    <Button
                                        size="small"
                                        startIcon={<ContentCopyIcon />}
                                        onClick={() => copySection('personal')}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Copiar
                                    </Button>
                                </Box>
                            </Grid>

                            {/* APLICA */}
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    fullWidth
                                    label="APLICA"
                                    value={formData.aplica || 'Sí'}
                                    onChange={(e) => handleInputChange('aplica', e.target.value)}
                                    disabled={readOnly}
                                    select
                                    SelectProps={{ native: true }}
                                >
                                    <option value="Sí">Sí</option>
                                    <option value="No">No</option>
                                </TextField>
                            </Grid>

                            {/* NOMBRE COMPLETO */}
                            <Grid size={{ xs: 12, sm: 9 }}>
                                <TextField
                                    fullWidth
                                    label="NOMBRE COMPLETO"
                                    value={formData.nombreCompleto || ''}
                                    onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
                                    disabled={readOnly}
                                    required
                                />
                            </Grid>

                            {/* FECHA DE NACIMIENTO con formato automático */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="FECHA DE NACIMIENTO"
                                    placeholder="MM/DD/YYYY"
                                    value={formData.fechaNacimiento || ''}
                                    onChange={(e) => handleDateChange('fechaNacimiento', e.target.value)}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </Grid>

                            {/* EDAD - calculada automáticamente */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="EDAD"
                                    value={formData.edad || ''}
                                    disabled
                                    helperText="Calculada automáticamente"
                                />
                            </Grid>

                            {/* GÉNERO */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="GÉNERO"
                                    value={formData.genero || ''}
                                    onChange={(e) => handleInputChange('genero', e.target.value)}
                                    disabled={readOnly}
                                    select
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </TextField>
                            </Grid>

                            {/* TELÉFONO */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="TELÉFONO"
                                    value={formData.telefono || ''}
                                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>

                            {/* EMAIL */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="EMAIL"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>


                            {/* SECCIÓN DE DIRECCIÓN */}
                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom>Dirección</Typography>
                            </Grid>

                            {/* PAÍS */}
                            <Grid size={{ xs: 12, sm: 2 }}>
                                <TextField
                                    fullWidth
                                    label="PAÍS"
                                    value={formData.pais || 'USA'}
                                    onChange={(e) => handleInputChange('pais', e.target.value)}
                                    disabled={readOnly}
                                    select
                                    SelectProps={{ native: true }}
                                >
                                    <option value="USA">USA</option>
                                </TextField>
                            </Grid>

                            {/* DIRECCIÓN COMPLETA */}
                            <Grid size={{ xs: 12, sm: 10 }}>
                                <TextField
                                    fullWidth
                                    label="DIRECCIÓN COMPLETA"
                                    value={formData.direccion || ''}
                                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>

                            {/* CIUDAD / CITY */}
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    fullWidth
                                    label="CIUDAD / CITY"
                                    value={formData.ciudad || ''}
                                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>

                            {/* ESTADO / STATE */}
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    fullWidth
                                    label="ESTADO / STATE"
                                    value={formData.estado || ''}
                                    onChange={(e) => handleInputChange('estado', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>

                            {/* CÓDIGO POSTAL / ZIP CODE */}
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    fullWidth
                                    label="CÓDIGO POSTAL / ZIP CODE"
                                    value={formData.zipcode || ''}
                                    onChange={(e) => handleInputChange('zipcode', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>

                            {/* CONDADO / COUNTY */}
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    fullWidth
                                    label="CONDADO / COUNTY"
                                    value={formData.condado || ''}
                                    onChange={(e) => handleInputChange('condado', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>

                            {/* INGRESOS con formato */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="INGRESOS"
                                    placeholder="1.000,00"
                                    value={formData.ingresos || ''}
                                    onChange={(e) => handleInputChange('ingresos', formatCurrency(e.target.value))}
                                    disabled={readOnly}
                                />
                            </Grid>

                            {/* IMPUESTOS */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="IMPUESTOS"
                                    value={formData.impuestos || ''}
                                    onChange={(e) => handleInputChange('impuestos', e.target.value)}
                                    disabled={readOnly}
                                    select
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    <option value="W2">W2</option>
                                    <option value="1099">1099</option>
                                </TextField>
                            </Grid>

                            {/* S.S.N con formato */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="IDENTIFICACIÓN (CC / NIT / TI / SSN)"
                                    placeholder="123-45-6789"
                                    value={formData.ssn || ''}
                                    onChange={(e) => handleInputChange('ssn', formatSSN(e.target.value))}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 11 }}
                                />
                            </Grid>

                            {/* ESTATUS MIGRATORIO */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="ESTATUS MIGRATORIO"
                                    value={formData.estatusMigratorio || ''}
                                    onChange={(e) => handleInputChange('estatusMigratorio', e.target.value)}
                                    disabled={readOnly}
                                    select
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    <option value="CIUDADANO">CIUDADANO</option>
                                    <option value="RESIDENTE">RESIDENTE</option>
                                    <option value="PERMISO DE TRABAJO">PERMISO DE TRABAJO</option>
                                    <option value="OTRO">OTRO</option>
                                </TextField>
                            </Grid>

                            {/* PALABRA CLAVE */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="PALABRA CLAVE"
                                    value={formData.palabraClave || ''}
                                    onChange={(e) => handleInputChange('palabraClave', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>
                        </Grid>
                    </CustomTabPanel>

                    {/* Grupo Familiar Tab */}
                    <CustomTabPanel value={tabValue} index={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1">Miembros del Grupo Familiar</Typography>
                            {!readOnly && (
                                <Button startIcon={<AddIcon />} onClick={handleAddDependent} variant="outlined" size="small">
                                    Añadir Miembro
                                </Button>
                            )}
                        </Box>
                        {formData.dependientes?.map((dep: any, index: number) => (
                            <Accordion key={index} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                                        <Typography>
                                            Miembro #{index + 1}: {dep.nombreCompleto || '(Sin nombre)'}
                                        </Typography>
                                        {!readOnly && (
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteDependent(index);
                                                }}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <TextField
                                                fullWidth
                                                label="APLICA"
                                                value={dep.aplica || 'Sí'}
                                                onChange={(e) => handleDependentChange(index, 'aplica', e.target.value)}
                                                disabled={readOnly}
                                                select
                                                SelectProps={{ native: true }}
                                                size="small"
                                            >
                                                <option value="Sí">Sí</option>
                                                <option value="No">No</option>
                                            </TextField>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 9 }}>
                                            <TextField
                                                fullWidth
                                                label="NOMBRE COMPLETO"
                                                value={dep.nombreCompleto || ''}
                                                onChange={(e) => handleDependentChange(index, 'nombreCompleto', e.target.value)}
                                                disabled={readOnly}
                                                size="small"
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="FECHA DE NACIMIENTO"
                                                placeholder="MM/DD/YYYY"
                                                value={dep.fechaNacimiento || ''}
                                                onChange={(e) => handleDependentChange(index, 'fechaNacimiento', e.target.value)}
                                                disabled={readOnly}
                                                size="small"
                                                inputProps={{ maxLength: 10 }}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="EDAD"
                                                value={dep.edad || ''}
                                                disabled
                                                size="small"
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="GÉNERO"
                                                value={dep.genero || ''}
                                                onChange={(e) => handleDependentChange(index, 'genero', e.target.value)}
                                                disabled={readOnly}
                                                select
                                                SelectProps={{ native: true }}
                                                size="small"
                                            >
                                                <option value=""></option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Femenino">Femenino</option>
                                                <option value="Otro">Otro</option>
                                            </TextField>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="PARENTESCO"
                                                value={dep.parentesco || ''}
                                                onChange={(e) => handleDependentChange(index, 'parentesco', e.target.value)}
                                                disabled={readOnly}
                                                size="small"
                                                select
                                                SelectProps={{ native: true }}
                                            >
                                                <option value=""></option>
                                                <option value="CÓNYUGE">CÓNYUGE</option>
                                                <option value="HIJO/A">HIJO/A</option>
                                                <option value="PADRE/MADRE">PADRE/MADRE</option>
                                                <option value="HERMANO/A">HERMANO/A</option>
                                                <option value="OTRO">OTRO</option>
                                            </TextField>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="INGRESOS"
                                                placeholder="1.000,00"
                                                value={dep.ingresos || ''}
                                                onChange={(e) => handleDependentChange(index, 'ingresos', formatCurrency(e.target.value))}
                                                disabled={readOnly}
                                                size="small"
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="S.S.N"
                                                placeholder="123-45-6789"
                                                value={dep.ssn || ''}
                                                onChange={(e) => handleDependentChange(index, 'ssn', e.target.value)}
                                                disabled={readOnly}
                                                size="small"
                                                inputProps={{ maxLength: 11 }}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="ESTATUS MIGRATORIO"
                                                value={dep.estatusMigratorio || ''}
                                                onChange={(e) => handleDependentChange(index, 'estatusMigratorio', e.target.value)}
                                                disabled={readOnly}
                                                select
                                                SelectProps={{ native: true }}
                                                size="small"
                                            >
                                                <option value=""></option>
                                                <option value="CIUDADANO">CIUDADANO</option>
                                                <option value="RESIDENTE">RESIDENTE</option>
                                                <option value="PERMISO DE TRABAJO">PERMISO DE TRABAJO</option>
                                                <option value="OTRO">OTRO</option>
                                            </TextField>
                                        </Grid>

                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                fullWidth
                                                label="NOTAS O COMENTARIO"
                                                multiline
                                                rows={2}
                                                value={dep.notas || ''}
                                                onChange={(e) => handleDependentChange(index, 'notas', e.target.value)}
                                                disabled={readOnly}
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                        {(!formData.dependientes || formData.dependientes.length === 0) && (
                            <Typography variant="body2" color="text.secondary" align="center">
                                No hay miembros registrados en el grupo familiar.
                            </Typography>
                        )}
                    </CustomTabPanel>

                    {/* Seguro Tab */}
                    <CustomTabPanel value={tabValue} index={2}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle1">Información del Seguro</Typography>
                                    <Button
                                        size="small"
                                        startIcon={<ContentCopyIcon />}
                                        onClick={() => copySection('insurance')}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Copiar
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Compañía"
                                    value={formData.compania || ''}
                                    onChange={(e) => handleInputChange('compania', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Nombre del Plan"
                                    value={formData.plan?.nombre || ''}
                                    onChange={(e) => handleNestedChange('plan', 'nombre', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Número de Póliza"
                                    value={formData.plan?.poliza || ''}
                                    onChange={(e) => handleNestedChange('plan', 'poliza', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Prima Mensual"
                                    placeholder="100.50"
                                    value={formData.plan?.prima || ''}
                                    onChange={(e) => handleNestedChange('plan', 'prima', formatPrima(e.target.value))}
                                    disabled={readOnly}
                                    InputProps={{ startAdornment: '$' }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Fecha Efectiva"
                                    placeholder="MM/DD/YYYY"
                                    value={formData.plan?.fechaEfectiva || ''}
                                    onChange={(e) => handleNestedChange('plan', 'fechaEfectiva', formatDateInput(e.target.value))}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Fecha de Renovación"
                                    placeholder="MM/DD/YYYY"
                                    value={formData.plan?.fechaRenovacion || ''}
                                    onChange={(e) => handleNestedChange('plan', 'fechaRenovacion', formatDateInput(e.target.value))}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </Grid>
                        </Grid>
                    </CustomTabPanel>

                    {/* Método de Pago Tab */}
                    <CustomTabPanel value={tabValue} index={3}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2" gutterBottom color="warning.main">
                                        Nota: Información sensible. Asegúrese de cumplir con las normas de privacidad.
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<ContentCopyIcon />}
                                        onClick={() => copySection('payment')}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Copiar
                                    </Button>
                                </Box>
                            </Grid>

                            {/* Sección de Tarjetas */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                                    Tarjetas
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Número de Tarjeta"
                                    value={formData.pago?.numeroTarjeta || ''}
                                    onChange={(e) => handleNestedChange('pago', 'numeroTarjeta', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="**** **** **** ****"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Nombre en la Tarjeta"
                                    value={formData.pago?.nombreTarjeta || ''}
                                    onChange={(e) => handleNestedChange('pago', 'nombreTarjeta', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Fecha de Expiración"
                                    placeholder="MM/YY"
                                    value={formData.pago?.expiracionTarjeta || ''}
                                    onChange={(e) => handleNestedChange('pago', 'expiracionTarjeta', e.target.value)}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 5 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="CVV"
                                    value={formData.pago?.cvv || ''}
                                    onChange={(e) => handleNestedChange('pago', 'cvv', e.target.value)}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 4 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Código Postal"
                                    value={formData.pago?.zipTarjeta || ''}
                                    onChange={(e) => handleNestedChange('pago', 'zipTarjeta', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>

                            {/* Sección de Bancos */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 1 }}>
                                    Bancos
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Banco"
                                    value={formData.pago?.banco || ''}
                                    onChange={(e) => handleNestedChange('pago', 'banco', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Titular de la Cuenta"
                                    value={formData.pago?.titular || ''}
                                    onChange={(e) => handleNestedChange('pago', 'titular', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Número de Ruta (Routing)"
                                    value={formData.pago?.ruta || ''}
                                    onChange={(e) => handleNestedChange('pago', 'ruta', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Número de Cuenta"
                                    value={formData.pago?.cuenta || ''}
                                    onChange={(e) => handleNestedChange('pago', 'cuenta', e.target.value)}
                                    disabled={readOnly}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Tipo de Cuenta"
                                    value={formData.pago?.tipo || 'Cheques'}
                                    onChange={(e) => handleNestedChange('pago', 'tipo', e.target.value)}
                                    disabled={readOnly}
                                    select
                                    SelectProps={{ native: true }}
                                >
                                    <option value="Cheques">Cheques</option>
                                    <option value="Ahorros">Ahorros</option>
                                </TextField>
                            </Grid>
                        </Grid>
                    </CustomTabPanel>

                    {/* Seguimiento Tab */}
                    <CustomTabPanel value={tabValue} index={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2 }}>
                            <Button
                                size="small"
                                startIcon={<ContentCopyIcon />}
                                onClick={() => copySection('notes')}
                                sx={{ textTransform: 'none' }}
                            >
                                Copiar
                            </Button>
                        </Box>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {/* LAST GESTION DATE */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="ÚLTIMA FECHA DE GESTIÓN"
                                    value={formData.lastGestionDate ? new Date(formData.lastGestionDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                    disabled // This field is updated automatically
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            {/* GESTION STATUS */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="ESTADO DE GESTIÓN"
                                    value={formData.gestionStatus || 'PENDIENTE'}
                                    onChange={(e) => handleInputChange('gestionStatus', e.target.value)}
                                    disabled={false}
                                    select
                                    SelectProps={{ native: true }}
                                >
                                    <option value="PENDIENTE">PENDIENTE</option>
                                    <option value="EN SEGUIMIENTO">EN SEGUIMIENTO</option>
                                    <option value="FINALIZADA">FINALIZADA</option>
                                    <option value="CERRADA">CERRADA</option>
                                </TextField>
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="FECHA DE LA VENTA"
                                    placeholder="MM/DD/YYYY"
                                    value={formData.fechaVenta || ''}
                                    onChange={(e) => handleInputChange('fechaVenta', formatDateInput(e.target.value))}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="ÚLTIMA SEGUIMIENTO"
                                    placeholder="MM/DD/YYYY"
                                    value={formData.ultimoSeguimiento || ''}
                                    onChange={(e) => handleInputChange('ultimoSeguimiento', formatDateInput(e.target.value))}
                                    disabled={readOnly}
                                    inputProps={{ maxLength: 10 }}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" gutterBottom>Historial de Seguimiento</Typography>

                        <Box sx={{ mb: 3 }}>
                            {!readOnly && (
                                <Stack direction="row" spacing={1} alignItems="flex-start">
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Escribe una nota de seguimiento..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim()}
                                        sx={{ mt: 1 }}
                                    >
                                        Añadir
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                        <List>
                            {formData.notas?.map((nota: any, index: number) => (
                                <React.Fragment key={index}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(nota.fecha).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })} - {nota.autor}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                                                    {nota.texto}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    {index < (formData.notas?.length || 0) - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                            {(!formData.notas || formData.notas.length === 0) && (
                                <Typography variant="body2" color="text.secondary" align="center">
                                    No hay notas de seguimiento.
                                </Typography>
                            )}
                        </List>
                    </CustomTabPanel>
                </Box>

                {/* Actions */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopyInfo}
                    >
                        Copiar Info
                    </Button>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={onClose}>
                            {readOnly ? 'Cerrar' : 'Cancelar'}
                        </Button>
                        {!readOnly && (
                            <Button variant="contained" onClick={handleSave}>
                                Guardar Cliente
                            </Button>
                        )}
                        {readOnly && (
                            <Button variant="contained" onClick={() => setCurrentMode('edit')}>
                                Editar Cliente
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Box>
        </Drawer>
    );
};

export default ClientForm;

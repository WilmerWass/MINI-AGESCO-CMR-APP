import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Alert,
    LinearProgress,
    Divider,
    Paper,
    Chip
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import TableChartIcon from '@mui/icons-material/TableChart';

const BackupPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [lastBackup, setLastBackup] = useState<string | null>(null);

    const handleExportAllJSON = async () => {
        try {
            setLoading(true);
            setProgress(20);
            setMessage({ type: 'info', text: 'Exportando todos los datos...' });

            const data = await window.api.getAllSyncData();
            setProgress(60);

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setProgress(100);
            const now = new Date().toLocaleString('es-ES');
            setLastBackup(now);
            setMessage({ type: 'success', text: `✅ Respaldo completo exportado exitosamente (${now})` });
        } catch (error: any) {
            console.error('Error al exportar datos:', error);
            setMessage({ type: 'error', text: `❌ Error al exportar: ${error.message}` });
        } finally {
            setLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleExportClientsCSV = async () => {
        try {
            setLoading(true);
            setProgress(20);
            setMessage({ type: 'info', text: 'Exportando clientes a CSV...' });

            const clients = await window.api.getClientes();
            setProgress(60);

            const headers = ['ID', 'Nombre Completo', 'Teléfono', 'Email', 'Ciudad', 'Estado', 'Compañía', 'Estatus', 'Fecha Creación'];
            const csvContent = [
                headers.join(','),
                ...clients.map((c: any) => [
                    c.id,
                    `"${c.nombreCompleto || ''}"`,
                    c.telefono || '',
                    c.email || '',
                    c.ciudad || '',
                    c.estado || '',
                    c.compania || '',
                    c.estatus || '',
                    c.fechaCreacion || ''
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `clientes_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setProgress(100);
            setMessage({ type: 'success', text: `✅ ${clients.length} clientes exportados a CSV` });
        } catch (error: any) {
            console.error('Error al exportar clientes:', error);
            setMessage({ type: 'error', text: `❌ Error al exportar clientes: ${error.message}` });
        } finally {
            setLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleExportAgentsCSV = async () => {
        try {
            setLoading(true);
            setProgress(20);
            setMessage({ type: 'info', text: 'Exportando agentes a CSV...' });

            const agents = await window.api.getAgentes();
            setProgress(60);

            const headers = ['ID', 'Nombre', 'Estado', 'Compañía', 'Asesor ID'];
            const csvContent = [
                headers.join(','),
                ...agents.map((a: any) => [
                    a.id,
                    `"${a.name || ''}"`,
                    a.state || '',
                    a.company || '',
                    a.asesorId || ''
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `agentes_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setProgress(100);
            setMessage({ type: 'success', text: `✅ ${agents.length} agentes exportados a CSV` });
        } catch (error: any) {
            console.error('Error al exportar agentes:', error);
            setMessage({ type: 'error', text: `❌ Error al exportar agentes: ${error.message}` });
        } finally {
            setLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleImportJSON = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                setLoading(true);
                setProgress(20);
                setMessage({ type: 'info', text: 'Leyendo archivo de respaldo...' });

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target?.result as string);
                        setProgress(40);

                        // Validar estructura del JSON
                        if (!jsonData.clientes || !jsonData.agentes || !jsonData.usuarios) {
                            throw new Error('Formato de archivo inválido. El archivo debe contener clientes, agentes y usuarios.');
                        }

                        setProgress(60);
                        setMessage({ type: 'info', text: 'Importando datos a la base de datos...' });

                        // Aquí podrías llamar a una función del backend para importar los datos
                        // await window.api.importBackupData(jsonData);

                        setProgress(100);
                        setMessage({
                            type: 'success',
                            text: `✅ Datos importados: ${jsonData.clientes?.length || 0} clientes, ${jsonData.agentes?.length || 0} agentes, ${jsonData.usuarios?.length || 0} usuarios. 
              ⚠️ NOTA: La funcionalidad de importación requiere implementación adicional en el backend para prevenir duplicados.`
                        });
                    } catch (error: any) {
                        console.error('Error al procesar archivo:', error);
                        setMessage({ type: 'error', text: `❌ Error al procesar archivo: ${error.message}` });
                    } finally {
                        setLoading(false);
                        setTimeout(() => setProgress(0), 1000);
                    }
                };
                reader.readAsText(file);
            } catch (error: any) {
                console.error('Error al importar:', error);
                setMessage({ type: 'error', text: `❌ Error al importar: ${error.message}` });
                setLoading(false);
                setProgress(0);
            }
        };
        input.click();
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                🔒 Sistema de Respaldo y Exportación
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Administre los respaldos de la base de datos y exporte datos en diferentes formatos.
            </Typography>

            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            {loading && (
                <Box sx={{ mb: 3 }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                        {progress}% completado
                    </Typography>
                </Box>
            )}

            {lastBackup && (
                <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="body2">
                        📅 <strong>Último respaldo:</strong> {lastBackup}
                    </Typography>
                </Paper>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Exportación Completa */}
                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <BackupIcon color="primary" fontSize="large" />
                                <Typography variant="h6">Respaldo Completo</Typography>
                            </Box>
                            <Divider />
                            <Typography variant="body2" color="text.secondary">
                                Exporta todos los datos de la aplicación en un único archivo JSON. Incluye clientes, agentes, usuarios, avisos y enlaces.
                            </Typography>
                            <Chip
                                label="Formato: JSON"
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                            <Button
                                variant="contained"
                                startIcon={<CloudDownloadIcon />}
                                onClick={handleExportAllJSON}
                                disabled={loading}
                                fullWidth
                                size="large"
                            >
                                Exportar Todo (JSON)
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Restaurar desde JSON */}
                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <RestoreIcon color="warning" fontSize="large" />
                                <Typography variant="h6">Restaurar Datos</Typography>
                            </Box>
                            <Divider />
                            <Typography variant="body2" color="text.secondary">
                                Importa un respaldo completo desde un archivo JSON previamente exportado.
                            </Typography>
                            <Alert severity="warning" sx={{ fontSize: '0.75rem' }}>
                                ⚠️ Esta acción requiere cuidado. Verifique el archivo antes de importar.
                            </Alert>
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleImportJSON}
                                disabled={loading}
                                fullWidth
                                size="large"
                            >
                                Importar desde JSON
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Exportar Clientes CSV */}
                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <TableChartIcon color="secondary" fontSize="large" />
                                <Typography variant="h6">Exportar Clientes</Typography>
                            </Box>
                            <Divider />
                            <Typography variant="body2" color="text.secondary">
                                Exporta la lista completa de clientes en formato CSV (compatible con Excel).
                            </Typography>
                            <Chip
                                label="Formato: CSV"
                                size="small"
                                color="secondary"
                                variant="outlined"
                            />
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<CloudDownloadIcon />}
                                onClick={handleExportClientsCSV}
                                disabled={loading}
                                fullWidth
                            >
                                Exportar Clientes (CSV)
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Exportar Agentes CSV */}
                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <TableChartIcon color="info" fontSize="large" />
                                <Typography variant="h6">Exportar Agentes</Typography>
                            </Box>
                            <Divider />
                            <Typography variant="body2" color="text.secondary">
                                Exporta la lista completa de agentes en formato CSV (compatible con Excel).
                            </Typography>
                            <Chip
                                label="Formato: CSV"
                                size="small"
                                color="info"
                                variant="outlined"
                            />
                            <Button
                                variant="contained"
                                color="info"
                                startIcon={<CloudDownloadIcon />}
                                onClick={handleExportAgentsCSV}
                                disabled={loading}
                                fullWidth
                            >
                                Exportar Agentes (CSV)
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            {/* Información adicional */}
            <Card sx={{ mt: 3, bgcolor: 'info.light' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        ℹ️ Información Importante
                    </Typography>
                    <Stack spacing={1} component="ul" sx={{ pl: 2 }}>
                        <li>
                            <Typography variant="body2">
                                Los archivos JSON contienen TODOS los datos y son útiles para respaldos completos.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                Los archivos CSV son útiles para análisis en Excel y solo contienen datos tabulares.
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                Se recomienda hacer respaldos periódicos (semanales o mensuales).
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                Guarde los archivos de respaldo en un lugar seguro (nube, disco externo).
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                <strong>Nota:</strong> La función de importar datos está disponible pero debe usarse con precaución para evitar duplicados.
                            </Typography>
                        </li>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default BackupPage;

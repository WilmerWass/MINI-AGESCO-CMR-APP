import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Paper, Tab, Tabs, Typography, CircularProgress, Alert, TableContainer } from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import Warning from '@mui/icons-material/Warning';

// KPI Card with Icon
const KpiCard = ({ title, value, icon, isLoading }: { title: string; value: string | number; icon: React.ReactNode; isLoading: boolean }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--card)',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
      {icon}
    </Box>
    <Typography component="p" variant="h4" sx={{ flexGrow: 1, mt: 1 }}>
      {isLoading ? <CircularProgress size={24} /> : value}
    </Typography>
  </Paper>
);

const BreakdownTable = ({ title, data, dataKeys, col1, col2, isLoading }: { title: string; data: any[]; dataKeys: { key1: string; key2: string; }; col1: string; col2: string; isLoading: boolean }) => (
  <Box>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <TableContainer component={Paper} sx={{ p: 2, backgroundColor: 'var(--card-deep)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>{col1}</th>
            <th style={{ textAlign: 'right', padding: '8px' }}>{col2}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: '16px' }}><CircularProgress /></td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: '16px' }}>No hay datos</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <td style={{ padding: '8px' }}>{item[dataKeys.key1]}</td>
                <td style={{ textAlign: 'right', padding: '8px' }}>{item[dataKeys.key2]}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableContainer>
  </Box>
);

type Period = 'today' | 'week' | 'month' | 'total';

const InformePage = () => {
  const [period, setPeriod] = useState<Period>('today');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodMap: Period[] = ['today', 'week', 'month', 'total'];
  const tabIndex = periodMap.indexOf(period);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await window.api.getDashboardData(period);
        if (response.success) {
          setData(response.data);
        } else {
          throw new Error(response.message || 'Error desconocido al cargar datos.');
        }
      } catch (err) {
        const typedErr = err as Error;
        console.error(typedErr);
        setError(typedErr.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setPeriod(periodMap[newValue]);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Informe General
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Un resumen de alto nivel de la actividad de los clientes.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPIs Section */}
      <Box sx={{ mb: 4 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Selector de período de tiempo para KPIs">
          <Tab label="Hoy" />
          <Tab label="Esta Semana" />
          <Tab label="Este Mes" />
          <Tab label="Total" />
        </Tabs>
        <Box sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <KpiCard title="Nuevos Clientes" value={data?.kpis?.nuevosClientes ?? 0} icon={<PersonAdd color="primary" />} isLoading={loading} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <KpiCard title="Pólizas Activas" value={data?.kpis?.polizasActivas ?? 0} icon={<VerifiedUser color="success" />} isLoading={loading} />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <KpiCard title="Gestiones Pendientes" value={data?.kpis?.gestionesPendientes ?? 0} icon={<Warning color="warning" />} isLoading={loading} />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Client Breakdown Section */}
      <Card sx={{ backgroundColor: 'var(--card)' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Desglose de Clientes
          </Typography>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Selector de período de tiempo para desglose">
            <Tab label="Hoy" />
            <Tab label="Esta Semana" />
            <Tab label="Este Mes" />
            <Tab label="Total" />
          </Tabs>
          <Box sx={{ pt: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <BreakdownTable
                  title="Clientes por Asesor"
                  data={data?.clientesPorAsesor ?? []}
                  dataKeys={{ key1: 'asesorName', key2: 'clientCount' }}
                  col1="Asesor"
                  col2="Clientes"
                  isLoading={loading}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BreakdownTable
                  title="Clientes por Estado"
                  data={data?.clientesPorEstado ?? []}
                  dataKeys={{ key1: 'estado', key2: 'clientCount' }}
                  col1="Estado"
                  col2="Clientes"
                  isLoading={loading}
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InformePage;
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Paper, Tab, Tabs, Typography, CircularProgress, Alert, Container } from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import Warning from '@mui/icons-material/Warning';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// KPI Card with Icon
const KpiCard = ({ title, value, icon, isLoading }: { title: string; value: string | number; icon: React.ReactNode; isLoading: boolean }) => (
  <Paper
    elevation={4}
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--card)',
      borderRadius: 3,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)'
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Typography>
        <Typography component="p" variant="h3" fontWeight="bold" sx={{ mt: 2, color: 'text.primary' }}>
          {isLoading ? <CircularProgress size={24} /> : value}
        </Typography>
      </Box>
      <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

type Period = 'today' | 'week' | 'month' | 'total';

const InformePage = () => {
  const [period, setPeriod] = useState<Period>('month');
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="700">
          Informe General
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight="400">
          Resumen interactivo de actividad y rendimiento
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* KPIs Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              centered
              indicatorColor="primary"
              textColor="primary"
              sx={{ '& .MuiTab-root': { px: 4, fontSize: '1rem' } }}
            >
              <Tab label="Hoy" />
              <Tab label="Esta Semana" />
              <Tab label="Este Mes" />
              <Tab label="Total" />
            </Tabs>
          </Paper>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard title="Nuevos Clientes" value={data?.kpis?.nuevosClientes ?? 0} icon={<PersonAdd fontSize="large" color="primary" />} isLoading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard title="Pólizas Activas" value={data?.kpis?.polizasActivas ?? 0} icon={<VerifiedUser fontSize="large" color="success" />} isLoading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <KpiCard title="Gestiones Pendientes" value={data?.kpis?.gestionesPendientes ?? 0} icon={<Warning fontSize="large" color="warning" />} isLoading={loading} />
          </Grid>
        </Grid>
      </Box>

      {/* Client Breakdown Section */}
      <Grid container spacing={4}>
        {/* Clientes por Asesor - Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={4} sx={{ backgroundColor: 'var(--card)', height: '450px', borderRadius: 3 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600" align="center">
                Clientes por Asesor
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : data?.clientesPorAsesor && data.clientesPorAsesor.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.clientesPorAsesor}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="asesorName" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'rgba(30,30,30,0.9)', borderColor: '#333', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="clientCount" name="Clientes" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No hay datos disponibles</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Clientes por Estado - Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={4} sx={{ backgroundColor: 'var(--card)', height: '450px', borderRadius: 3 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600" align="center">
                Clientes por Estado (Ubicación)
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : data?.clientesPorEstado && data.clientesPorEstado.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.clientesPorEstado}
                      dataKey="clientCount"
                      nameKey="estado"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {data.clientesPorEstado.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'rgba(30,30,30,0.9)', borderColor: '#333', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No hay datos disponibles</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InformePage;
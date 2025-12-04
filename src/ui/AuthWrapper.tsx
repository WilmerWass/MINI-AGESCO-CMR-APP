import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import { aplicarDatosRecibidos } from '../lib/sync_handler';

const AuthWrapper = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && window.location.pathname === '/login') {
      navigate('/dashboard/informe');
    }
  }, [user, navigate]);

  // Set up P2P data listener
  useEffect(() => {
    const handleSyncData = (event: any, data: any) => {
      console.log('Received data for sync from main process');
      aplicarDatosRecibidos(data);
    };

    window.ipcRenderer.on('p2p-data-in', handleSyncData);

    // Cleanup listener on component unmount
    return () => {
      window.ipcRenderer.off('p2p-data-in', handleSyncData);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard/*"
        element={
          user ? (
            <DashboardLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      {/* Default route to redirect to login if no other route matches */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AuthWrapper;
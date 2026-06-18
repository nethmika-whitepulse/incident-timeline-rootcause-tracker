import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import ProtectedRoute      from './components/ProtectedRoute';

import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import IncidentList   from './pages/IncidentList';
import IncidentDetail from './pages/IncidentDetail';
import CreateIncident from './pages/CreateIncident';
import RCAPage        from './pages/RCAPage';
import ActionItems    from './pages/ActionItems';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes — accessible without a token */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — redirect to /login if no valid token */}
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          }/>
          <Route path="/incidents" element={
            <ProtectedRoute><IncidentList /></ProtectedRoute>
          }/>
          <Route path="/incidents/new" element={
            <ProtectedRoute><CreateIncident /></ProtectedRoute>
          }/>
          <Route path="/incidents/:id" element={
            <ProtectedRoute><IncidentDetail /></ProtectedRoute>
          }/>
          <Route path="/incidents/:id/rca" element={
            <ProtectedRoute><RCAPage /></ProtectedRoute>
          }/>
          <Route path="/incidents/:id/actions" element={
            <ProtectedRoute><ActionItems /></ProtectedRoute>
          }/>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

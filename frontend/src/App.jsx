import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Page imports — each is a stub component that will be implemented in future PRs
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
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — ProtectedRoute wrapper added once AuthContext is implemented */}
        <Route path="/"                    element={<Dashboard />} />
        <Route path="/incidents"           element={<IncidentList />} />
        <Route path="/incidents/new"       element={<CreateIncident />} />
        <Route path="/incidents/:id"       element={<IncidentDetail />} />
        <Route path="/incidents/:id/rca"   element={<RCAPage />} />
        <Route path="/incidents/:id/actions" element={<ActionItems />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

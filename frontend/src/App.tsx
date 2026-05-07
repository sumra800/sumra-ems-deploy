
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import VoterLayout from './layouts/VoterLayout';

// Voter Pages
import VoterDashboard from './pages/voter/Dashboard';
import MyVotes from './pages/voter/MyVotes';
import CastVote from './pages/voter/CastVote';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Constituencies from './pages/admin/Constituencies';
import Parties from './pages/admin/Parties';
import Candidates from './pages/admin/Candidates';
import Elections from './pages/admin/Elections';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/constituencies" element={<Constituencies />} />
              <Route path="/admin/parties" element={<Parties />} />
              <Route path="/admin/candidates" element={<Candidates />} />
              <Route path="/admin/elections" element={<Elections />} />
            </Route>
          </Route>

          {/* Voter Routes */}
          <Route element={<ProtectedRoute allowedRoles={['VOTER']} />}>
            <Route element={<VoterLayout />}>
              <Route path="/voter/dashboard" element={<VoterDashboard />} />
              <Route path="/voter/my-votes" element={<MyVotes />} />
              <Route path="/voter/vote/:electionId" element={<CastVote />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import AlumniPage from './pages/AlumniPage';
import ProjectsPage from './pages/ProjectsPage';
import AdvisorsPage from './pages/AdvisorsPage';
import ProfilePage from './pages/ProfilePage';
import ImportStudentsPage from './pages/ImportStudentsPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/students" element={<StudentsPage />} />
                      <Route path="/alumni" element={<AlumniPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/advisors" element={<AdvisorsPage />} />
                      <Route path="/import-students" element={<ImportStudentsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" richColors />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

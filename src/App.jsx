import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardStats from './pages/DashboardStats';
import UserManagementPage from './pages/UserManagementPage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import BatchAllocationsPage from './pages/BatchAllocationsPage';
import LeadsPage from './pages/LeadsPage';
import TeacherBatchesPage from './pages/TeacherBatchesPage';
import ExamsGradingPage from './pages/ExamsGradingPage';
import PaymentsFeesPage from './pages/PaymentsFeesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import StudentStatusPage from './pages/StudentStatusPage';
import StudentAdmitCardPage from './pages/StudentAdmitCardPage';
import StudentResultsPage from './pages/StudentResultsPage';
import StudentLedgerPage from './pages/StudentLedgerPage';

// New Reference Pages
import RegistrationsPage from './pages/RegistrationsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import CounsellorsPage from './pages/CounsellorsPage';
import NewslettersPage from './pages/NewslettersPage';
import DownloadSettingsPage from './pages/DownloadSettingsPage';

// Meta Lead Ads integration
import MetaIntegrationPage from './pages/MetaIntegrationPage';
import MetaLeadsPage from './pages/MetaLeadsPage';
import MetaLeadReportPage from './pages/MetaLeadReportPage';
import MyMetaLeadsPage from './pages/MyMetaLeadsPage';
import ApplyPage from './pages/ApplyPage';
import RegistrationWindowPage from './pages/RegistrationWindowPage';

// Route wrapper enforcing authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route wrapper restricting access to specific roles
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // If student, redirect to student status homepage, otherwise general stats
    const redirectPath = user?.role === 'student' ? '/dashboard/student/status' : '/dashboard/stats';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid #1e293b'
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/register/:token" element={<ApplyPage />} />
          
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    {/* Common Stats (redirects student) */}
                    <Route path="stats" element={
                      <RoleRoute allowedRoles={['admin', 'manager', 'counsellor', 'accountant', 'teacher']}>
                        <DashboardStats />
                      </RoleRoute>
                    } />

                    {/* Admin Dashboard views */}
                    <Route path="users" element={
                      <RoleRoute allowedRoles={['admin']}>
                        <UserManagementPage />
                      </RoleRoute>
                    } />

                    {/* Course/Batch setups */}
                    <Route path="courses" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <CourseCatalogPage />
                      </RoleRoute>
                    } />
                    <Route path="batches" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <BatchAllocationsPage />
                      </RoleRoute>
                    } />

                    {/* Leads / Queries view */}
                    <Route path="leads" element={
                      <RoleRoute allowedRoles={['admin', 'manager', 'counsellor']}>
                        <LeadsPage />
                      </RoleRoute>
                    } />

                    {/* Registrations menu dropdown paths */}
                    <Route path="registrations/paid" element={
                      <RoleRoute allowedRoles={['admin', 'manager', 'counsellor']}>
                        <RegistrationsPage />
                      </RoleRoute>
                    } />
                    <Route path="registrations/unpaid" element={
                      <RoleRoute allowedRoles={['admin', 'manager', 'counsellor']}>
                        <RegistrationsPage />
                      </RoleRoute>
                    } />
                    <Route path="registrations/form" element={
                      <RoleRoute allowedRoles={['admin']}>
                        <RegistrationWindowPage />
                      </RoleRoute>
                    } />

                    {/* Admissions menu dropdown paths */}
                    <Route path="admissions/list" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <AdmissionsPage />
                      </RoleRoute>
                    } />
                    <Route path="admissions/add" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <AdmissionsPage />
                      </RoleRoute>
                    } />

                    {/* Counsellors Performance list */}
                    <Route path="counsellors" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <CounsellorsPage />
                      </RoleRoute>
                    } />

                    {/* Newsletter campaigns */}
                    <Route path="newsletters" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <NewslettersPage />
                      </RoleRoute>
                    } />

                    {/* Global Download Settings (Admit Card, Results, Counselling letter toggles) */}
                    <Route path="settings/downloads" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <DownloadSettingsPage />
                      </RoleRoute>
                    } />

                    {/* Meta Lead Ads integration and collected leads */}
                    <Route path="integrations/meta" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <MetaIntegrationPage />
                      </RoleRoute>
                    } />
                    <Route path="meta-leads" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <MetaLeadsPage />
                      </RoleRoute>
                    } />
                    <Route path="meta-leads/report" element={
                      <RoleRoute allowedRoles={['admin', 'manager']}>
                        <MetaLeadReportPage />
                      </RoleRoute>
                    } />

                    {/* Telecaller's own Meta leads */}
                    <Route path="my-leads" element={
                      <RoleRoute allowedRoles={['counsellor']}>
                        <MyMetaLeadsPage />
                      </RoleRoute>
                    } />

                    {/* Teacher specific routes */}
                    <Route path="teacher/batches" element={
                      <RoleRoute allowedRoles={['teacher']}>
                        <TeacherBatchesPage />
                      </RoleRoute>
                    } />

                    {/* Exams / Grading & Results upload */}
                    <Route path="exams" element={
                      <RoleRoute allowedRoles={['admin', 'manager', 'teacher']}>
                        <ExamsGradingPage />
                      </RoleRoute>
                    } />

                    {/* Fees / Accountant routes */}
                    <Route path="payments" element={
                      <RoleRoute allowedRoles={['admin', 'accountant']}>
                        <PaymentsFeesPage />
                      </RoleRoute>
                    } />

                    {/* Announcements notices */}
                    <Route path="announcements" element={<AnnouncementsPage />} />

                    {/* Student exclusive views */}
                    <Route path="student/status" element={
                      <RoleRoute allowedRoles={['student']}>
                        <StudentStatusPage />
                      </RoleRoute>
                    } />
                    <Route path="student/admit-card" element={
                      <RoleRoute allowedRoles={['student']}>
                        <StudentAdmitCardPage />
                      </RoleRoute>
                    } />
                    <Route path="student/results" element={
                      <RoleRoute allowedRoles={['student']}>
                        <StudentResultsPage />
                      </RoleRoute>
                    } />
                    <Route path="student/ledger" element={
                      <RoleRoute allowedRoles={['student']}>
                        <StudentLedgerPage />
                      </RoleRoute>
                    } />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="stats" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

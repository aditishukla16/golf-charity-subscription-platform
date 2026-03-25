import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { CharitiesPage } from './pages/CharitiesPage';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'auth' && (
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      )}

      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'charities' && <CharitiesPage />}
      {currentPage === 'pricing' && <PricingPage onNavigate={setCurrentPage} />}
      {currentPage === 'auth' && <AuthPage />}
      {currentPage === 'dashboard' && (
        <ProtectedRoute requireSubscription={false}>
          <UserDashboard />
        </ProtectedRoute>
      )}
      {currentPage === 'admin' && (
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

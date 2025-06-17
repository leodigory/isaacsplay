import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import BrowsePage from './pages/BrowsePage';
import SearchPage from './pages/SearchPage';
import ContentDetailsPage from './pages/ContentDetailsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/common/PrivateRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/404" element={<NotFoundPage />} />

          {/* Rotas privadas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <BrowsePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <SearchPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/details/:id"
            element={
              <PrivateRoute>
                <ContentDetailsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />

          {/* Redirecionamentos */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;



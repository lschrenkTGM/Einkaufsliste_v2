import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { UpdateToast } from '@/components/layout/UpdateToast';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { queryClient } from '@/lib/queryClient';
import ListsPage from '@/pages/ListsPage';
import ListPage from '@/pages/ListPage';
import JoinPage from '@/pages/JoinPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <UpdateToast />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ListsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/list/:id"
                element={
                  <ProtectedRoute>
                    <ListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/join/:code"
                element={
                  <ProtectedRoute>
                    <JoinPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

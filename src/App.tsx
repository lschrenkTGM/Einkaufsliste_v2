import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { UpdateToast } from '@/components/layout/UpdateToast';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { queryClient } from '@/lib/queryClient';

const ListsPage = lazy(() => import('@/pages/ListsPage'));
const ListPage = lazy(() => import('@/pages/ListPage'));
const JoinPage = lazy(() => import('@/pages/JoinPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));

function RouteFallback() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-ink-faint">Lädt…</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <UpdateToast />
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

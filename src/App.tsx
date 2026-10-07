import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import ListsPage from '@/pages/ListsPage';
import ListPage from '@/pages/ListPage';
import JoinPage from '@/pages/JoinPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ListsPage />} />
          <Route path="/list/:id" element={<ListPage />} />
          <Route path="/join/:code" element={<JoinPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

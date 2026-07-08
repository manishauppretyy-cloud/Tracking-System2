import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Shipments from './pages/Shipments';
import Tracking from './pages/Tracking';
import Analytics from './pages/Analytics';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/fleet" element={<MainLayout><Fleet /></MainLayout>} />
          <Route path="/drivers" element={<MainLayout><Drivers /></MainLayout>} />
          <Route path="/shipments" element={<MainLayout><Shipments /></MainLayout>} />
          <Route path="/tracking" element={<MainLayout><Tracking /></MainLayout>} />
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/analytics" element={<MainLayout><Analytics /></MainLayout>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;

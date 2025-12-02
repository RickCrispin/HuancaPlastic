import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InactivityWarningModal } from './components/InactivityWarningModal';
import { Home } from './pages/Home';
import { Store } from './pages/Store';
import { Cart } from './pages/Cart';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AdminPanel } from './pages/AdminPanel';
import React from 'react';
import './App.css';

// Error Boundary para capturar errores de React
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>Algo salió mal</h1>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente interno para usar el contexto
function AppContent() {
  const { mostrarAdvertencia, tiempoRestante, continuarSesion, logout } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      <Footer />
      
      {/* Modal de advertencia por inactividad */}
      <InactivityWarningModal
        isOpen={mostrarAdvertencia}
        minutesRemaining={Math.floor(tiempoRestante / 60)}
        secondsRemaining={tiempoRestante}
        onContinue={continuarSesion}
        onLogout={logout}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

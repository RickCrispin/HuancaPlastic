import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recuerdame, setRecuerdame] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();
  const { login, cargando, estaAutenticado } = useAuth();

  // Validar email
  const esEmailValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (estaAutenticado) {
      navigate('/');
    }
  }, [estaAutenticado, navigate]);

  // Cargar email recordado del localStorage
  useEffect(() => {
    const emailGuardado = localStorage.getItem('emailRecordado');
    if (emailGuardado) {
      setEmail(emailGuardado);
      setRecuerdame(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validación del formulario
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!esEmailValido(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const resultado = await login(email, password);

      if (!resultado.success) {
        setError(resultado.error || 'Error al iniciar sesión');
        return;
      }

      // Guardar email si "Recuérdame" está marcado
      if (recuerdame) {
        localStorage.setItem('emailRecordado', email);
      } else {
        localStorage.removeItem('emailRecordado');
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.5em',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#2563eb'
          }}>
            HuancaPlastic
          </h1>
          <p style={{
            color: '#999',
            fontSize: '0.95em'
          }}>
            Bienvenido de vuelta
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '14px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #dc2626',
            fontSize: '0.95em'
          }}>
            Advertencia: {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#333',
              fontSize: '0.95em'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={cargando}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #ddd',
                borderRadius: '8px',
                fontSize: '1em',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                backgroundColor: cargando ? '#f5f5f5' : 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
              placeholder="tu@email.com"
            />
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{
                fontWeight: '600',
                color: '#333',
                fontSize: '0.95em'
              }}>
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  fontWeight: '500'
                }}
              >
                {mostrarPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={cargando}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #ddd',
                borderRadius: '8px',
                fontSize: '1em',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                backgroundColor: cargando ? '#f5f5f5' : 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
              placeholder="••••••••"
            />
          </div>

          {/* Recuérdame */}
          <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="recuerdame"
              checked={recuerdame}
              onChange={(e) => setRecuerdame(e.target.checked)}
              disabled={cargando}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            />
            <label htmlFor="recuerdame" style={{
              fontSize: '0.95em',
              color: '#666',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              Recuérdame en este dispositivo
            </label>
          </div>

          {/* Botón Login */}
          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: cargando ? '#999' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1em',
              cursor: cargando ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              opacity: cargando ? 0.7 : 1
            }}
            onMouseEnter={(e) => !cargando && (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => !cargando && (e.target.style.backgroundColor = '#2563eb')}
          >
            {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Separador */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '28px',
          marginBottom: '28px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
          <span style={{ padding: '0 12px', color: '#999', fontSize: '0.9em' }}>O</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
        </div>

        {/* Links */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.95em',
          color: '#666',
          lineHeight: '1.8'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Regístrate aquí
            </Link>
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.85em', color: '#999' }}>
            Los datos de tu cuenta están protegidos con encriptación
          </p>
        </div>
      </div>
    </div>
  );
};

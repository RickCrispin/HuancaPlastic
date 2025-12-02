import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombreCompleto: '',
    telefono: '',
    ciudad: '',
    pais: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    // Validaciones
    if (!formData.email || !formData.password || !formData.nombreCompleto) {
      setError('Por favor completa todos los campos requeridos (*)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setCargando(true);

    const resultado = await register(
      formData.email,
      formData.password,
      formData.nombreCompleto,
      formData.telefono,
      formData.ciudad,
      formData.pais,
      formData.bio
    );

    if (resultado.success) {
      setExito('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => navigate('/store'), 2000);
    } else {
      setError(resultado.error);
    }

    setCargando(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h1 style={{
          fontSize: '2em',
          fontWeight: 'bold',
          marginBottom: '30px',
          textAlign: 'center',
          color: '#2563eb'
        }}>
          HuancaPlastic
        </h1>

        <h2 style={{
          fontSize: '1.5em',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Crear Cuenta
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {exito && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            {exito}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#333'
            }}>
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              placeholder="Juan Pérez"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#333'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              placeholder="tu@email.com"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#333'
            }}>
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              placeholder="(064) 123-4567"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#333'
              }}>
                Ciudad
              </label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="Ej: Lima"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#333'
              }}>
                País
              </label>
              <input
                type="text"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="Ej: Perú"
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#333'
            }}>
              Biografía / Descripción
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1em',
                boxSizing: 'border-box',
                minHeight: '80px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Cuéntanos sobre ti..."
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#333'
            }}>
              Contraseña (mín. 6 caracteres) *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#333'
            }}>
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '1em',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              fontSize: '1em',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.7 : 1,
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => !cargando && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => !cargando && (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          color: '#666'
        }}>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

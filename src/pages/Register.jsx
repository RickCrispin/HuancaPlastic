import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ciudades del Perú
const CIUDADES_PERU = [
  'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco', 'Iquitos',
  'Huancayo', 'Tacna', 'Ica', 'Juliaca', 'Pucallpa', 'Cajamarca', 'Puno',
  'Ayacucho', 'Chimbote', 'Sullana', 'Tarapoto', 'Huánuco', 'Tumbes',
  'Talara', 'Chincha Alta', 'Huaraz', 'Jaén', 'Pisco', 'Huacho'
];

export const Register = () => {
  const [formData, setFormData] = useState({
    // Datos de cuenta
    email: '',
    password: '',
    confirmPassword: '',
    
    // Datos personales
    nombreCompleto: '',
    telefono: '',
    documento_identidad: '',
    genero: '',
    fecha_nacimiento: '',
    empresa: '',
    
    // Ubicación
    ciudad: '',
    pais: 'Perú',
    
    // Perfil
    foto_perfil: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
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
      // Pasar todos los datos del perfil
      {
        foto_perfil: formData.foto_perfil,
        genero: formData.genero,
        fecha_nacimiento: formData.fecha_nacimiento,
        empresa: formData.empresa,
        documento_identidad: formData.documento_identidad,
        ciudad: formData.ciudad,
        pais: formData.pais,
        bio: formData.bio
      }
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
      justifyContent: 'center',
      alignItems: 'flex-start',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        padding: '40px',
        width: '100%',
        maxWidth: '600px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '2.5em',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#2563eb'
          }}>
            HuancaPlastic
          </h1>
          <h2 style={{
            fontSize: '1.5em',
            fontWeight: '600',
            color: '#333'
          }}>
            Crear Cuenta
          </h2>
        </div>

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
          {/* Datos de Cuenta */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '1.1em', 
              fontWeight: 'bold',
              marginBottom: '15px', 
              color: '#333',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '8px'
            }}>
              Datos de Cuenta
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Email <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Contraseña <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '45px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1em',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Confirmar Contraseña <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="Repetir contraseña"
              />
            </div>
          </div>

          {/* Datos Personales */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '1.1em', 
              fontWeight: 'bold',
              marginBottom: '15px', 
              color: '#333',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '8px'
            }}>
              Datos Personales
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Nombre Completo <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="Juan Pérez García"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="+51 999 999 999"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Documento de Identidad
              </label>
              <input
                type="text"
                name="documento_identidad"
                value={formData.documento_identidad}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="DNI, RUC, Pasaporte"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Género
              </label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Seleccionar --</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decirlo</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Empresa
              </label>
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '1.1em', 
              fontWeight: 'bold',
              marginBottom: '15px', 
              color: '#333',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '8px'
            }}>
              Ubicación
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Ciudad
              </label>
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Seleccionar Ciudad --</option>
                {CIUDADES_PERU.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                País
              </label>
              <input
                type="text"
                name="pais"
                value={formData.pais}
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280'
                }}
              />
            </div>
          </div>

          {/* Perfil */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontSize: '1.1em', 
              fontWeight: 'bold',
              marginBottom: '15px', 
              color: '#333',
              borderBottom: '2px solid #2563eb',
              paddingBottom: '8px'
            }}>
              Información del Perfil
            </h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                URL de Foto de Perfil
              </label>
              <input
                type="url"
                name="foto_perfil"
                value={formData.foto_perfil}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                Biografía
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="Cuéntanos sobre ti..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1em',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.7 : 1,
              transition: 'all 0.3s',
              marginTop: '10px'
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

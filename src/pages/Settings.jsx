import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Settings = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [contrasenaConfirm, setContrasenaConfirm] = useState('');

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [usuario, navigate]);

  const handleEliminarCuenta = async () => {
    if (!contrasenaConfirm) {
      setMensaje('❌ Debes ingresar tu contraseña para confirmar');
      return;
    }

    try {
      // Verificar contraseña
      const bcrypt = require('bcryptjs');
      const passwordValida = await bcrypt.compare(contrasenaConfirm, usuario.password_hash);

      if (!passwordValida) {
        setMensaje('❌ Contraseña incorrecta');
        return;
      }

      // Eliminar perfil
      await supabase
        .from('perfiles_usuarios')
        .delete()
        .eq('usuario_id', usuario.id);

      // Eliminar usuario
      await supabase
        .from('usuarios')
        .delete()
        .eq('id', usuario.id);

      setMensaje('✅ Cuenta eliminada correctamente');
      logout();
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setMensaje('❌ Error al eliminar cuenta: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}>
        <div style={{ fontSize: '1.2em', color: '#666' }}>Cargando ajustes...</div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '700px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '30px', color: '#2563eb' }}>Ajustes</h1>

      {mensaje && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: mensaje.includes('❌') ? '#fee2e2' : '#dcfce7',
          color: mensaje.includes('❌') ? '#991b1b' : '#166534',
          borderRadius: '5px',
          borderLeft: '4px solid ' + (mensaje.includes('❌') ? '#dc2626' : '#16a34a')
        }}>
          {mensaje}
        </div>
      )}

      {/* Sección: Configuración General */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.1em', color: '#333', marginBottom: '16px' }}>
          🔧 Configuración General
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            Tema de la aplicación
          </label>
          <select style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.95em'
          }}>
            <option>Claro (predeterminado)</option>
            <option>Oscuro</option>
          </select>
          <small style={{ color: '#999', marginTop: '4px', display: 'block' }}>
            Selecciona tu preferencia de tema
          </small>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            Notificaciones por email
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Notificaciones de pedidos</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked />
              <span>Ofertas especiales</span>
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9em', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            Idioma
          </label>
          <select style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.95em'
          }}>
            <option>Español</option>
            <option>English</option>
            <option>Português</option>
          </select>
        </div>
      </div>

      {/* Sección: Seguridad */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.1em', color: '#333', marginBottom: '16px' }}>
          🔒 Seguridad
        </h2>

        <button style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '12px',
          transition: 'background-color 0.3s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          🔑 Cambiar Contraseña
        </button>

        <button style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
        >
          ✅ Verificar Email
        </button>
      </div>

      {/* Sección: Zona de Peligro */}
      <div style={{
        backgroundColor: '#fef2f2',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <h2 style={{ fontSize: '1.1em', color: '#991b1b', marginBottom: '16px' }}>
          Zona de Peligro
        </h2>

        {!confirmandoEliminar ? (
          <button
            onClick={() => setConfirmandoEliminar(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            🗑️ Eliminar Mi Cuenta
          </button>
        ) : (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #dc2626'
          }}>
            <h3 style={{ color: '#991b1b', marginBottom: '12px' }}>
              ¿Estás seguro?
            </h3>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Esta acción <strong>no se puede deshacer</strong>. Se eliminarán:
            </p>
            <ul style={{ color: '#666', marginBottom: '16px', marginLeft: '20px' }}>
              <li>Tu cuenta de usuario</li>
              <li>Tu perfil</li>
              <li>Todo tu historial de compras</li>
              <li>Tu información personal</li>
            </ul>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9em',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#333'
              }}>
                Ingresa tu contraseña para confirmar:
              </label>
              <input
                type="password"
                value={contrasenaConfirm}
                onChange={(e) => setContrasenaConfirm(e.target.value)}
                placeholder="Contraseña"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #dc2626',
                  borderRadius: '5px',
                  fontSize: '1em',
                  boxSizing: 'border-box',
                  marginBottom: '12px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleEliminarCuenta}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                Sí, eliminar mi cuenta
              </button>
              <button
                onClick={() => {
                  setConfirmandoEliminar(false);
                  setContrasenaConfirm('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

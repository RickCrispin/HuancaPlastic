import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PERMISOS, tienePermiso } from '../../constants/rolesPermisos';
import rolesService from '../../lib/rolesService';

const SVGIconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const SVGIconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SVGIconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const SVGIconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export const GestorUsuarios = ({ usuarioAdmin }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre_completo: '',
    rol_id: '',
    estado: 'activo'
  });
  const [mensaje, setMensaje] = useState('');

  // Verificar permisos
  const puedeVerUsuarios = tienePermiso(usuarioAdmin?.rol, PERMISOS.VER_USUARIOS);
  const puedeCrear = tienePermiso(usuarioAdmin?.rol, PERMISOS.CREAR_USUARIO);
  const puedeEditar = tienePermiso(usuarioAdmin?.rol, PERMISOS.EDITAR_USUARIO);
  const puedeEliminar = tienePermiso(usuarioAdmin?.rol, PERMISOS.ELIMINAR_USUARIO);
  const puedeCambiarRol = tienePermiso(usuarioAdmin?.rol, PERMISOS.CAMBIAR_ROL_USUARIO);

  useEffect(() => {
    if (puedeVerUsuarios) {
      cargarUsuarios();
      cargarRoles();
    }
  }, [puedeVerUsuarios]);

  const cargarRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, nombre, descripcion')
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const { data: usuariosData, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id, email, nombre_completo, rol_id, estado, created_at')
        .order('created_at', { ascending: false });

      if (errorUsuarios) throw errorUsuarios;

      // Obtener datos de roles por separado
      if (usuariosData && usuariosData.length > 0) {
        const rolesIds = [...new Set(usuariosData.map(u => u.rol_id).filter(Boolean))];
        
        if (rolesIds.length > 0) {
          const { data: rolesData, error: errorRoles } = await supabase
            .from('roles')
            .select('id, nombre')
            .in('id', rolesIds);

          if (errorRoles) throw errorRoles;

          // Mapear roles por ID para acceso rápido
          const rolesMap = {};
          rolesData.forEach(rol => {
            rolesMap[rol.id] = rol;
          });

          // Enriquecer usuarios con datos de roles
          const usuariosConRoles = usuariosData.map(usuario => ({
            ...usuario,
            roles: rolesMap[usuario.rol_id] || null
          }));

          setUsuarios(usuariosConRoles);
        } else {
          setUsuarios(usuariosData);
        }
      } else {
        setUsuarios([]);
      }
      console.log('✅ Usuarios cargados correctamente');
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      setMensaje('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    try {
      if (!formData.email || !formData.nombre_completo) {
        setMensaje('Email y nombre son requeridos');
        return;
      }

      if (!formData.rol_id) {
        setMensaje('Rol es requerido');
        return;
      }

      if (editando) {
        // Actualizar usuario
        const { error } = await supabase
          .from('usuarios')
          .update({
            nombre_completo: formData.nombre_completo,
            rol_id: puedeCambiarRol ? formData.rol_id : editando.rol_id,
            estado: formData.estado
          })
          .eq('id', editando.id);

        if (error) throw error;
        setMensaje('Usuario actualizado correctamente');
      } else {
        // Crear usuario (requeriría validación adicional y hash de contraseña)
        setMensaje('Crear usuarios requiere funcionalidad adicional en el backend');
      }

      setModalOpen(false);
      setEditando(null);
      setFormData({ email: '', nombre_completo: '', rol_id: '', estado: 'activo' });
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setMensaje('Error al guardar usuario: ' + error.message);
    }
  };

  const handleEliminar = async (usuarioId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', usuarioId);

      if (error) throw error;
      setMensaje('Usuario eliminado correctamente');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setMensaje('Error al eliminar usuario: ' + error.message);
    }
  };

  if (!puedeVerUsuarios) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        No tienes permisos para acceder al gestor de usuarios
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5em', fontWeight: 'bold' }}>
          <SVGIconUsers />
          Gestor de Usuarios
        </div>
        {puedeCrear && (
          <button
            onClick={() => {
              setEditando(null);
              setFormData({ email: '', nombre_completo: '', rol_id: '', estado: 'activo' });
              setModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <SVGIconPlus />
            Crear Usuario
          </button>
        )}
      </div>

      {mensaje && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: mensaje.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: mensaje.includes('Error') ? '#991b1b' : '#166534',
          borderRadius: '8px',
          borderLeft: `4px solid ${mensaje.includes('Error') ? '#dc2626' : '#16a34a'}`
        }}>
          {mensaje}
        </div>
      )}

      {loading ? (
        <div>Cargando usuarios...</div>
      ) : (
        <div style={{
          overflowX: 'auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Nombre</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Rol</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>{usuario.email}</td>
                  <td style={{ padding: '12px 16px' }}>{usuario.nombre_completo}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: usuario.roles?.nombre === 'admin' ? '#fecaca' : '#bfdbfe',
                      color: usuario.roles?.nombre === 'admin' ? '#7f1d1d' : '#1e3a8a',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      fontWeight: '600'
                    }}>
                      {usuario.roles?.nombre || 'Sin rol'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: usuario.estado === 'activo' ? '#dcfce7' : '#fee2e2',
                      color: usuario.estado === 'activo' ? '#166534' : '#991b1b',
                      borderRadius: '4px',
                      fontSize: '0.85em'
                    }}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {puedeEditar && (
                        <button
                          onClick={() => {
                            setEditando(usuario);
                            setFormData({
                              email: usuario.email,
                              nombre_completo: usuario.nombre_completo,
                              rol_id: usuario.rol_id || '',
                              estado: usuario.estado
                            });
                            setModalOpen(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <SVGIconEdit />
                          Editar
                        </button>
                      )}
                      {puedeEliminar && (
                        <button
                          onClick={() => handleEliminar(usuario.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <SVGIconTrash />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edición */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editando ? 'Editar Usuario' : 'Crear Usuario'}
            </h2>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editando}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Nombre Completo</label>
              <input
                type="text"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {puedeCambiarRol && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Rol</label>
                <select
                  value={formData.rol_id}
                  onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Seleccionar rol --</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleGuardar}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Guardar
              </button>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { PERMISOS, tienePermiso } from '../../constants/rolesPermisos';
import { rolesService } from '../../services';

// SVG Icons
const SVGIconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const SVGIconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const SVGIconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SVGIconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const SVGIconCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const SVGIconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
  </svg>
);

export const GestorRoles = ({ usuarioAdmin }) => {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [permisosRol, setPermisosRol] = useState({});
  const [cambiosPendientes, setCambiosPendientes] = useState({});
  const [guardando, setGuardando] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [modalNuevoRol, setModalNuevoRol] = useState(false);
  const [nuevoRolNombre, setNuevoRolNombre] = useState('');
  const [nuevoRolDesc, setNuevoRolDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);

  const puedeVerRoles = tienePermiso(usuarioAdmin?.rol, PERMISOS.VER_ROLES);
  const puedeEditarPermisos = tienePermiso(usuarioAdmin?.rol, PERMISOS.EDITAR_ROL);
  const puedeCrearRol = tienePermiso(usuarioAdmin?.rol, PERMISOS.CREAR_ROL);
  const puedeEliminarRol = tienePermiso(usuarioAdmin?.rol, PERMISOS.ELIMINAR_ROL);

  useEffect(() => {
    if (puedeVerRoles) {
      cargarDatos();
    }
  }, [puedeVerRoles]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [rolesData, permisosData] = await Promise.all([
        rolesService.obtenerRolesConPermisos(),
        rolesService.obtenerPermisos()
      ]);

      setRoles(rolesData);
      setPermisos(permisosData);

      // Inicializar permisosRol como objeto con arrays
      const permisosRolInit = {};
      rolesData.forEach(rol => {
        permisosRolInit[rol.id] = (rol.permisos || []).map(p => p.permiso_id);
      });
      setPermisosRol(permisosRolInit);
      setCambiosPendientes({});
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensaje('Error al cargar roles y permisos: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Detectar cambios en los permisos
  const togglePermiso = (rolId, permisoId) => {
    if (!puedeEditarPermisos) {
      setMensaje('Error: No tienes permisos para editar');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    setPermisosRol(prev => {
      const nuevos = { ...prev };
      if (nuevos[rolId]?.includes(permisoId)) {
        nuevos[rolId] = nuevos[rolId].filter(p => p !== permisoId);
      } else {
        nuevos[rolId] = [...(nuevos[rolId] || []), permisoId];
      }
      return nuevos;
    });

    // Marcar que hay cambios pendientes para este rol
    setCambiosPendientes(prev => ({
      ...prev,
      [rolId]: true
    }));
  };

  // Guardar permisos de un rol individual
  const handleGuardarPermisosRol = async (rolId) => {
    try {
      setGuardando(prev => ({ ...prev, [rolId]: true }));
      
      await rolesService.asignarPermisosARol(rolId, permisosRol[rolId] || []);
      
      setMensaje('Éxito: Permisos del rol actualizados correctamente');
      setCambiosPendientes(prev => {
        const newCambios = { ...prev };
        delete newCambios[rolId];
        return newCambios;
      });
      
      await cargarDatos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      setMensaje(`Error al guardar: ${error.message}`);
      setTimeout(() => setMensaje(''), 3000);
    } finally {
      setGuardando(prev => ({ ...prev, [rolId]: false }));
    }
  };

  const handleCrearNuevoRol = async () => {
    try {
      if (!nuevoRolNombre.trim()) {
        setMensaje('Error: El nombre del rol no puede estar vacío');
        setTimeout(() => setMensaje(''), 3000);
        return;
      }

      const nuevoRol = await rolesService.crearRol(nuevoRolNombre, nuevoRolDesc);
      setMensaje(`Éxito: Rol "${nuevoRol.nombre}" creado correctamente`);
      setNuevoRolNombre('');
      setNuevoRolDesc('');
      setModalNuevoRol(false);
      await cargarDatos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al crear rol:', error);
      setMensaje(`Error: ${error.message}`);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const handleEliminarRol = async (rolId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este rol? Esta acción no se puede deshacer.')) return;

    try {
      await rolesService.eliminarRol(rolId);
      setMensaje('Éxito: Rol eliminado correctamente');
      setRolSeleccionado(null);
      await cargarDatos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      setMensaje(`❌ ${error.message}`);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  if (!puedeVerRoles) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <SVGIconShield /> No tienes permisos para ver la gestión de roles
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block' }}>
          <SVGIconRefresh />
        </div>
        <p style={{ margin: '10px 0 0 0', color: '#6b7280' }}>Cargando roles y permisos...</p>
      </div>
    );
  }

  // Agrupar permisos por categoría
  const permisosPorCategoria = {};
  permisos.forEach(p => {
    if (!permisosPorCategoria[p.categoria]) {
      permisosPorCategoria[p.categoria] = [];
    }
    permisosPorCategoria[p.categoria].push(p);
  });

  // Colores por categoría
  const coloresPorCategoria = {
    'usuarios': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    'productos': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    'roles': { bg: '#e9d5ff', border: '#a855f7', text: '#581c87' },
    'finanzas': { bg: '#dcfce7', border: '#22c55e', text: '#15803d' },
    'general': { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SVGIconShield />
          <h2 style={{ margin: 0, fontSize: '1.8em', color: '#1f2937', fontWeight: '700' }}>Gestión de Roles y Permisos</h2>
        </div>
        {puedeCrearRol && (
          <button
            onClick={() => setModalNuevoRol(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#2563eb'; e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#3b82f6'; e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)'; }}
          >
            <SVGIconPlus /> Nuevo Rol
          </button>
        )}
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div style={{
          backgroundColor: mensaje.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: mensaje.includes('Error') ? '#991b1b' : '#166534',
          padding: '14px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: `4px solid ${mensaje.includes('Error') ? '#dc2626' : '#22c55e'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {mensaje}
        </div>
      )}

      {/* Modal Crear Rol */}
      {modalNuevoRol && (
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
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4em', color: '#1f2937', fontWeight: '700' }}>➕ Crear Nuevo Rol</h3>

            <input
              type="text"
              placeholder="Nombre del rol (ej: moderador)"
              value={nuevoRolNombre}
              onChange={(e) => setNuevoRolNombre(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCrearNuevoRol()}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1em',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />

            <textarea
              placeholder="Descripción del rol (opcional)"
              value={nuevoRolDesc}
              onChange={(e) => setNuevoRolDesc(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '20px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1em',
                boxSizing: 'border-box',
                minHeight: '80px',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setModalNuevoRol(false);
                  setNuevoRolNombre('');
                  setNuevoRolDesc('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#e5e7eb'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#f3f4f6'; }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearNuevoRol}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#059669'; e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#10b981'; e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'; }}
              >
                Crear Rol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Roles - Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {roles.map((rol) => (
          <div
            key={rol.id}
            onClick={() => setRolSeleccionado(rolSeleccionado === rol.id ? null : rol.id)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: rolSeleccionado === rol.id ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Header del Rol */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2em', color: '#1f2937', fontWeight: '700', textTransform: 'capitalize' }}>
                  {rol.nombre}
                </h3>
                {rol.descripcion && <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>{rol.descripcion}</p>}
                {rol.es_predeterminado && (
                  <span style={{ 
                    display: 'inline-block', 
                    fontSize: '0.7em', 
                    backgroundColor: '#e5e7eb', 
                    color: '#4b5563', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    marginTop: '6px',
                    fontWeight: '600'
                  }}>
                    Predeterminado
                  </span>
                )}
              </div>

              {!rol.es_predeterminado && puedeEliminarRol && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEliminarRol(rol.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85em',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fecaca'; e.currentTarget.style.color = '#7f1d1d'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                >
                  <SVGIconTrash /> Eliminar
                </button>
              )}
            </div>

            {/* Permisos del Rol - Collapsible */}
            {rolSeleccionado === rol.id && (
              <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.9em', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase' }}>
                  Permisos ({permisosRol[rol.id]?.length || 0})
                </p>

                {Object.entries(permisosPorCategoria).map(([categoria, permisosCategoria]) => {
                  const colorCategoria = coloresPorCategoria[categoria.toLowerCase()] || coloresPorCategoria['general'];
                  const permisosSeleccionados = permisosCategoria.filter(p => permisosRol[rol.id]?.includes(p.id)).length;

                  return (
                    <div key={categoria} style={{ marginBottom: '12px' }}>
                      <div style={{
                        backgroundColor: colorCategoria.bg,
                        border: `1px solid ${colorCategoria.border}`,
                        borderRadius: '8px',
                        padding: '10px',
                        marginBottom: '8px'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '0.8em',
                          fontWeight: '700',
                          color: colorCategoria.text,
                          textTransform: 'uppercase',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          {categoria}
                          <span style={{ fontSize: '0.9em', backgroundColor: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                            {permisosSeleccionados}/{permisosCategoria.length}
                          </span>
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {permisosCategoria.map((permiso) => {
                          const estaSeleccionado = permisosRol[rol.id]?.includes(permiso.id) || false;
                          return (
                            <label
                              key={permiso.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: puedeEditarPermisos ? 'pointer' : 'default',
                                padding: '8px 12px',
                                backgroundColor: estaSeleccionado ? colorCategoria.bg : '#f9fafb',
                                border: `1.5px solid ${estaSeleccionado ? colorCategoria.border : '#e5e7eb'}`,
                                borderRadius: '6px',
                                transition: 'all 0.2s ease',
                                opacity: puedeEditarPermisos ? 1 : 0.7,
                                fontWeight: estaSeleccionado ? '600' : '500'
                              }}
                              onMouseEnter={(e) => {
                                if (puedeEditarPermisos) {
                                  e.currentTarget.style.backgroundColor = colorCategoria.bg;
                                  e.currentTarget.style.transform = 'scale(1.02)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              title={permiso.descripcion}
                            >
                              <input
                                type="checkbox"
                                checked={estaSeleccionado}
                                onChange={() => togglePermiso(rol.id, permiso.id)}
                                disabled={!puedeEditarPermisos}
                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                              />
                              <span style={{ fontSize: '0.85em', color: '#374151', whiteSpace: 'nowrap' }}>
                                {permiso.nombre}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Botón Guardar Cambios */}
                {cambiosPendientes[rol.id] && puedeEditarPermisos && (
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => handleGuardarPermisosRol(rol.id)}
                      disabled={guardando[rol.id]}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        backgroundColor: guardando[rol.id] ? '#d1d5db' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: guardando[rol.id] ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!guardando[rol.id]) {
                          e.target.style.backgroundColor = '#059669';
                          e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!guardando[rol.id]) {
                          e.target.style.backgroundColor = '#10b981';
                          e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                        }
                      }}
                    >
                      {guardando[rol.id] ? <SVGIconRefresh style={{ animation: 'spin 1s linear infinite' }} /> : <SVGIconCheck />}
                      {guardando[rol.id] ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {rolSeleccionado !== rol.id && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '0.85em', color: '#6b7280' }}>
                  <strong>{permisosRol[rol.id]?.length || 0}</strong> permisos asignados
                </span>
                <span style={{ fontSize: '0.8em', color: '#9ca3af' }}>📂 Haz clic para expandir</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '12px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '1.1em', marginBottom: '10px' }}>No hay roles disponibles</p>
          {puedeCrearRol && <p style={{ fontSize: '0.9em' }}>Crea el primer rol haciendo clic en "Nuevo Rol"</p>}
        </div>
      )}

      {/* Info Box */}
      <div style={{ 
        backgroundColor: '#f0fdf4', 
        borderRadius: '12px', 
        padding: '16px', 
        marginTop: '24px', 
        borderLeft: '4px solid #16a34a',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <span style={{ fontSize: '1.2em' }}>ℹ️</span>
        <div>
          <p style={{ margin: 0, color: '#166534', fontSize: '0.9em', fontWeight: '600', marginBottom: '4px' }}>Información Importante</p>
          <p style={{ margin: 0, color: '#166534', fontSize: '0.85em', lineHeight: '1.5' }}>
            • Los roles predeterminados (admin, user) no pueden ser eliminados.<br/>
            • Los cambios en permisos se sincronizan automáticamente en la base de datos.<br/>
            • Haz clic en una tarjeta de rol para ver y editar sus permisos.<br/>
            • Los permisos se aplican en tiempo real a los usuarios asignados.
          </p>
        </div>
      </div>
    </div>
  );
};

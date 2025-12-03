import React, { useState, useEffect } from 'react';
import { supabase, usersService, profileService, authService } from '../../services';
import { PERMISOS, tienePermiso } from '../../constants/rolesPermisos';

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

const SVGIconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const SVGIconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const SVGIconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const GestorUsuarios = ({ usuarioAdmin }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Form data con TODOS los campos de usuarios y perfiles_usuarios
  const [formData, setFormData] = useState({
    // Campos de usuarios
    email: '',
    password: '',
    nombre_completo: '',
    telefono: '',
    rol: 'cliente',
    estado: 'activo',
    
    // Campos de perfiles_usuarios
    foto_perfil: '',
    genero: '',
    fecha_nacimiento: '',
    empresa: '',
    documento_identidad: '',
    ciudad: '',
    pais: 'Perú',
    bio: '',
    preferencias_notificaciones: {
      email: true,
      push: true,
      marketing: false,
      ordenes: true,
      promociones: true
    }
  });

  // Ciudades del Perú
  const CIUDADES_PERU = [
    'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco', 'Iquitos',
    'Huancayo', 'Tacna', 'Ica', 'Juliaca', 'Pucallpa', 'Cajamarca', 'Puno',
    'Ayacucho', 'Chimbote', 'Sullana', 'Tarapoto', 'Huánuco', 'Tumbes',
    'Talara', 'Chincha Alta', 'Huaraz', 'Jaén', 'Pisco', 'Huacho'
  ];

  // Roles disponibles
  const ROLES_DISPONIBLES = [
    { value: 'admin', label: 'Administrador' },
    { value: 'cliente', label: 'Cliente' },
    { value: 'moderador', label: 'Moderador' },
    { value: 'vendedor', label: 'Vendedor' }
  ];

  // Estados disponibles
  const ESTADOS_DISPONIBLES = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'suspendido', label: 'Suspendido' },
    { value: 'pendiente', label: 'Pendiente' }
  ];

  // Géneros disponibles
  const GENEROS_DISPONIBLES = [
    { value: '', label: '-- Seleccionar --' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' },
    { value: 'prefiero_no_decir', label: 'Prefiero no decir' }
  ];

  // Verificar permisos
  const puedeVerUsuarios = tienePermiso(usuarioAdmin?.rol, PERMISOS.VER_USUARIOS);
  const puedeCrear = tienePermiso(usuarioAdmin?.rol, PERMISOS.CREAR_USUARIO);
  const puedeEditar = tienePermiso(usuarioAdmin?.rol, PERMISOS.EDITAR_USUARIO);
  const puedeEliminar = tienePermiso(usuarioAdmin?.rol, PERMISOS.ELIMINAR_USUARIO);
  const puedeCambiarRol = tienePermiso(usuarioAdmin?.rol, PERMISOS.CAMBIAR_ROL_USUARIO);

  useEffect(() => {
    if (puedeVerUsuarios) {
      cargarUsuarios();
    }
  }, [puedeVerUsuarios]);

  // Log cuando formData cambia (para debugging)
  useEffect(() => {
    if (editando) {
      console.log('[GestorUsuarios] FormData updated:', JSON.stringify({
        foto_perfil: formData.foto_perfil,
        genero: formData.genero,
        fecha_nacimiento: formData.fecha_nacimiento,
        empresa: formData.empresa,
        documento_identidad: formData.documento_identidad,
        ciudad: formData.ciudad,
        pais: formData.pais,
        bio: formData.bio
      }, null, 2));
    }
  }, [formData, editando]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      console.log('[GestorUsuarios] Loading users...');
      
      const usuariosData = await usersService.obtenerTodosUsuarios();
      
      // Log para verificar estructura de perfiles
      if (usuariosData && usuariosData.length > 0) {
        console.log('[GestorUsuarios] Sample user structure:', {
          email: usuariosData[0].email,
          hasProfile: !!usuariosData[0].perfiles_usuarios,
          profileType: Array.isArray(usuariosData[0].perfiles_usuarios) ? 'array' : typeof usuariosData[0].perfiles_usuarios,
          profileLength: Array.isArray(usuariosData[0].perfiles_usuarios) ? usuariosData[0].perfiles_usuarios.length : 'N/A',
          profileData: usuariosData[0].perfiles_usuarios
        });
        console.log('[GestorUsuarios] Full first user:', JSON.stringify(usuariosData[0], null, 2));
      }
      
      setUsuarios(usuariosData);
      console.log('[GestorUsuarios] Loaded', usuariosData.length, 'users');
    } catch (error) {
      console.error('[GestorUsuarios] Error loading users:', error);
      setMensaje('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarPerfilCompleto = async (usuarioId) => {
    try {
      console.log('[GestorUsuarios] Loading complete profile for:', usuarioId);
      const usuarioCompleto = await usersService.obtenerUsuarioCompleto(usuarioId);
      
      if (usuarioCompleto) {
        console.log('[GestorUsuarios] Usuario completo recibido:', JSON.stringify(usuarioCompleto, null, 2));
        
        const perfilArray = usuarioCompleto.perfiles_usuarios;
        console.log('[GestorUsuarios] perfilArray type:', typeof perfilArray);
        console.log('[GestorUsuarios] perfilArray is Array?:', Array.isArray(perfilArray));
        console.log('[GestorUsuarios] perfilArray:', perfilArray);
        
        let perfil = {};
        
        // Intentar diferentes formas de extraer el perfil
        if (Array.isArray(perfilArray) && perfilArray.length > 0) {
          perfil = perfilArray[0];
          console.log('[GestorUsuarios] Perfil extraído de array:', perfil);
        } else if (perfilArray && typeof perfilArray === 'object') {
          perfil = perfilArray;
          console.log('[GestorUsuarios] Perfil es objeto directo:', perfil);
        } else {
          console.log('[GestorUsuarios] No se encontró perfil');
        }
        
        console.log('[GestorUsuarios] Profile loaded:', JSON.stringify(perfil, null, 2));
        
        return {
          usuario: usuarioCompleto,
          perfil: perfil
        };
      }
      return null;
    } catch (error) {
      console.error('[GestorUsuarios] Error loading complete profile:', error);
      return null;
    }
  };

  const handleGuardar = async () => {
    try {
      if (!formData.email || !formData.nombre_completo) {
        setMensaje('Email y nombre son requeridos');
        return;
      }

      if (!formData.rol) {
        setMensaje('Rol es requerido');
        return;
      }

      if (editando) {
        // ACTUALIZAR USUARIO EXISTENTE
        
        // 1. Actualizar datos de usuarios
        const datosUsuario = {
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono,
          estado: formData.estado
        };

        const resultadoUsuario = await usersService.actualizarUsuario(editando.id, datosUsuario);
        if (!resultadoUsuario.success) {
          throw new Error(resultadoUsuario.error);
        }

        // 2. Cambiar rol si tiene permisos
        if (puedeCambiarRol && formData.rol !== editando.rol) {
          const resultadoRol = await usersService.cambiarRolUsuario(editando.id, formData.rol);
          if (!resultadoRol.success) {
            throw new Error(resultadoRol.error);
          }
        }

        // 3. Actualizar contraseña si se proporcionó una nueva
        if (formData.password && formData.password.trim() !== '') {
          const bcrypt = await import('bcryptjs');
          const hashedPassword = await bcrypt.hash(formData.password, 10);
          
          const { error: passwordError } = await supabase
            .from('usuarios')
            .update({ password_hash: hashedPassword })
            .eq('id', editando.id);

          if (passwordError) throw passwordError;
        }

        // 4. Actualizar perfil
        const datosPerfil = {
          foto_perfil: formData.foto_perfil,
          genero: formData.genero,
          fecha_nacimiento: formData.fecha_nacimiento,
          empresa: formData.empresa,
          documento_identidad: formData.documento_identidad,
          ciudad: formData.ciudad,
          bio: formData.bio,
          preferencias_notificaciones: formData.preferencias_notificaciones
        };

        // Verificar si existe perfil
        const perfilExistente = await profileService.obtenerPerfil(editando.id);
        
        if (perfilExistente) {
          await profileService.actualizarPerfil(editando.id, datosPerfil);
        } else {
          await profileService.crearPerfil(editando.id, datosPerfil);
        }

        setMensaje('Usuario actualizado correctamente');
        
      } else {
        // CREAR NUEVO USUARIO
        
        if (!formData.password || formData.password.length < 6) {
          setMensaje('La contraseña debe tener al menos 6 caracteres');
          return;
        }

        // 1. Preparar datos del perfil para pasar a register
        const datosPerfil = {
          foto_perfil: formData.foto_perfil,
          genero: formData.genero,
          fecha_nacimiento: formData.fecha_nacimiento,
          empresa: formData.empresa,
          documento_identidad: formData.documento_identidad,
          ciudad: formData.ciudad,
          pais: formData.pais,
          bio: formData.bio,
          preferencias_notificaciones: formData.preferencias_notificaciones
        };

        // 2. Registrar usuario con perfil completo (SIN crear sesión)
        const resultado = await authService.register(
          formData.email,
          formData.password,
          formData.nombre_completo,
          formData.telefono,
          datosPerfil,
          false // NO crear sesión automáticamente
        );

        if (!resultado.success) {
          throw new Error(resultado.error);
        }

        const nuevoUsuarioId = resultado.usuario.id;

        // 3. Cambiar rol si no es cliente
        if (formData.rol !== 'cliente') {
          await usersService.cambiarRolUsuario(nuevoUsuarioId, formData.rol);
        }

        // 4. Cambiar estado si no es activo
        if (formData.estado !== 'activo') {
          await usersService.cambiarEstadoUsuario(nuevoUsuarioId, formData.estado);
        }

        setMensaje('Usuario creado correctamente');
      }

      setModalOpen(false);
      setEditando(null);
      resetForm();
      cargarUsuarios();
      
    } catch (error) {
      console.error('[GestorUsuarios] Save error:', error);
      setMensaje('Error al guardar usuario: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nombre_completo: '',
      telefono: '',
      rol: 'cliente',
      estado: 'activo',
      foto_perfil: '',
      genero: '',
      fecha_nacimiento: '',
      empresa: '',
      documento_identidad: '',
      ciudad: '',
      pais: 'Perú',
      bio: '',
      preferencias_notificaciones: {
        email: true,
        push: true,
        marketing: false,
        ordenes: true,
        promociones: true
      }
    });
    setMostrarPassword(false);
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
              resetForm();
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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Nombre / Teléfono</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Documento</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Ciudad / País</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Empresa</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Género</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Rol</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const perfil = Array.isArray(usuario.perfiles_usuarios) && usuario.perfiles_usuarios.length > 0
                  ? usuario.perfiles_usuarios[0]
                  : (usuario.perfiles_usuarios && typeof usuario.perfiles_usuarios === 'object' ? usuario.perfiles_usuarios : {});
                
                // Log temporal para debugging
                if (usuario.email === '74029241@continental.edu.pe') {
                  console.log('[GestorUsuarios] Usuario en tabla:', {
                    email: usuario.email,
                    perfiles_usuarios_raw: usuario.perfiles_usuarios,
                    perfiles_usuarios_type: typeof usuario.perfiles_usuarios,
                    perfiles_usuarios_isArray: Array.isArray(usuario.perfiles_usuarios),
                    perfil_extraido: perfil
                  });
                }
                
                return (
                <tr key={usuario.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.9em' }}>{usuario.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{usuario.nombre_completo}</div>
                      {usuario.telefono && (
                        <div style={{ fontSize: '0.85em', color: '#6b7280' }}>{usuario.telefono}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.9em' }}>
                      {perfil.documento_identidad || <span style={{ color: '#9ca3af' }}>-</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      {perfil.ciudad && <div style={{ fontSize: '0.9em' }}>{perfil.ciudad}</div>}
                      {perfil.pais && <div style={{ fontSize: '0.85em', color: '#6b7280' }}>{perfil.pais}</div>}
                      {!perfil.ciudad && !perfil.pais && <span style={{ color: '#9ca3af' }}>-</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.9em' }}>
                      {perfil.empresa || <span style={{ color: '#9ca3af' }}>-</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.9em', textTransform: 'capitalize' }}>
                      {perfil.genero ? perfil.genero.replace('_', ' ') : <span style={{ color: '#9ca3af' }}>-</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: usuario.rol === 'admin' ? '#fecaca' : '#bfdbfe',
                      color: usuario.rol === 'admin' ? '#7f1d1d' : '#1e3a8a',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      fontWeight: '600'
                    }}>
                      {usuario.rol || 'cliente'}
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
                          onClick={async () => {
                            console.log('[GestorUsuarios] Edit button clicked for:', usuario.email);
                            setEditando(usuario);
                            
                            // Cargar datos completos del usuario y su perfil
                            const datosCompletos = await cargarPerfilCompleto(usuario.id);
                            
                            if (datosCompletos) {
                              const { usuario: usr, perfil } = datosCompletos;
                              
                              console.log('[GestorUsuarios] Usuario email:', usr.email);
                              console.log('[GestorUsuarios] Perfil completo:', JSON.stringify(perfil, null, 2));
                              
                              const newFormData = {
                                // Datos de usuarios
                                email: usr.email || '',
                                password: '', // Vacío por defecto
                                nombre_completo: usr.nombre_completo || '',
                                telefono: usr.telefono || '',
                                rol: usr.rol || 'cliente',
                                estado: usr.estado || 'activo',
                                
                                // Datos de perfiles_usuarios - convertir null a string vacío
                                foto_perfil: perfil.foto_perfil ?? '',
                                genero: perfil.genero ?? '',
                                fecha_nacimiento: perfil.fecha_nacimiento ?? '',
                                empresa: perfil.empresa ?? '',
                                documento_identidad: perfil.documento_identidad ?? '',
                                ciudad: perfil.ciudad ?? '',
                                pais: perfil.pais ?? 'Perú',
                                bio: perfil.bio ?? '',
                                preferencias_notificaciones: perfil.preferencias_notificaciones ?? {
                                  email: true,
                                  push: true,
                                  marketing: false,
                                  ordenes: true,
                                  promociones: true
                                }
                              };
                              
                              console.log('[GestorUsuarios] FormData a establecer:', JSON.stringify({
                                email: newFormData.email,
                                nombre_completo: newFormData.nombre_completo,
                                telefono: newFormData.telefono,
                                foto_perfil: newFormData.foto_perfil,
                                genero: newFormData.genero,
                                fecha_nacimiento: newFormData.fecha_nacimiento,
                                empresa: newFormData.empresa,
                                documento_identidad: newFormData.documento_identidad,
                                ciudad: newFormData.ciudad,
                                pais: newFormData.pais,
                                bio: newFormData.bio
                              }, null, 2));
                              
                              setFormData(newFormData);
                              
                              // Esperar un tick para asegurar que el estado se actualice
                              setTimeout(() => {
                                setModalOpen(true);
                              }, 0);
                            } else {
                              // Si no hay datos, abrir modal con datos vacíos
                              setModalOpen(true);
                            }
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edición/Creación - TODOS LOS CAMPOS */}
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
          zIndex: 1000,
          overflow: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            margin: '20px',
            position: 'relative'
          }}>
            {/* Botón X para cerrar */}
            <button
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
              title="Cerrar"
            >
              <SVGIconX />
            </button>
            
            <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', paddingRight: '40px' }}>
              {editando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            
            {/* DEBUG: Mostrar valores actuales de formData */}
            {(() => {
              console.log('[GestorUsuarios] Modal renderizando con formData:', {
                ciudad: formData.ciudad,
                empresa: formData.empresa,
                documento_identidad: formData.documento_identidad,
                genero: formData.genero,
                fecha_nacimiento: formData.fecha_nacimiento
              });
              return null;
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              
              {/* SECCIÓN: DATOS DE CUENTA */}
              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <h3 style={{ color: '#3b82f6', fontSize: '1.1em', marginBottom: '15px' }}>Datos de Cuenta</h3>
              </div>

              {/* Email - FIJO al editar */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>
                  Email {!editando && <span style={{ color: 'red' }}>*</span>}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editando}
                  placeholder="usuario@ejemplo.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    backgroundColor: editando ? '#f3f4f6' : 'white'
                  }}
                />
              </div>

              {/* Contraseña - Con botón mostrar/ocultar */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>
                  Contraseña {!editando && <span style={{ color: 'red' }}>*</span>}
                  {editando && <span style={{ fontSize: '0.85em', color: '#6b7280' }}> (dejar vacío para no cambiar)</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editando ? 'Nueva contraseña' : 'Mínimo 6 caracteres'}
                    style={{
                      width: '100%',
                      padding: '10px',
                      paddingRight: '40px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {mostrarPassword ? <SVGIconEyeOff /> : <SVGIconEye />}
                  </button>
                </div>
              </div>

              {/* SECCIÓN: DATOS PERSONALES */}
              <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <h3 style={{ color: '#10b981', fontSize: '1.1em', marginBottom: '15px' }}>Datos Personales</h3>
              </div>

              {/* Nombre Completo */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>
                  Nombre Completo <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  placeholder="Juan Pérez García"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+51 999 999 999"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Documento de Identidad */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Documento de Identidad</label>
                <input
                  type="text"
                  value={formData.documento_identidad}
                  onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
                  placeholder="DNI, RUC, Pasaporte"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Género */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Género</label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  {GENEROS_DISPONIBLES.map(genero => (
                    <option key={genero.value} value={genero.value}>{genero.label}</option>
                  ))}
                </select>
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Empresa */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>
                  Empresa <span style={{ color: '#6b7280', fontWeight: '400', fontSize: '0.9em' }}>(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  placeholder="Nombre de la empresa (opcional)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* SECCIÓN: UBICACIÓN */}
              <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <h3 style={{ color: '#f59e0b', fontSize: '1.1em', marginBottom: '15px' }}>Ubicación</h3>
              </div>

              {/* Ciudad */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Ciudad</label>
                <select
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Seleccionar Ciudad --</option>
                  {CIUDADES_PERU.map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>

              {/* País - FIJO */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>País (Fijo)</label>
                <input
                  type="text"
                  value={formData.pais}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280'
                  }}
                />
              </div>

              {/* SECCIÓN: ROL Y ESTADO */}
              <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <h3 style={{ color: '#ef4444', fontSize: '1.1em', marginBottom: '15px' }}>Rol y Estado</h3>
              </div>

              {/* Rol */}
              {puedeCambiarRol && (
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>
                    Rol <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Seleccionar rol</option>
                    {ROLES_DISPONIBLES.map(rol => (
                      <option key={rol.value} value={rol.value}>{rol.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Estado */}
              <div>
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
                  {ESTADOS_DISPONIBLES.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>

              {/* SECCIÓN: PERFIL */}
              <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <h3 style={{ color: '#8b5cf6', fontSize: '1.1em', marginBottom: '15px' }}>Perfil</h3>
              </div>

              {/* Foto de Perfil */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>URL de Foto de Perfil</label>
                <input
                  type="url"
                  value={formData.foto_perfil}
                  onChange={(e) => setFormData({ ...formData, foto_perfil: e.target.value })}
                  placeholder="https://ejemplo.com/foto.jpg"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Biografía */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Biografía</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* SECCIÓN: PREFERENCIAS DE NOTIFICACIONES */}
              <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                <h3 style={{ color: '#06b6d4', fontSize: '1.1em', marginBottom: '15px' }}>Preferencias de Notificaciones</h3>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.preferencias_notificaciones.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferencias_notificaciones: {
                          ...formData.preferencias_notificaciones,
                          email: e.target.checked
                        }
                      })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Notificaciones por Email</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.preferencias_notificaciones.push}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferencias_notificaciones: {
                          ...formData.preferencias_notificaciones,
                          push: e.target.checked
                        }
                      })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Notificaciones Push</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.preferencias_notificaciones.ordenes}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferencias_notificaciones: {
                          ...formData.preferencias_notificaciones,
                          ordenes: e.target.checked
                        }
                      })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Actualizaciones de Órdenes</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.preferencias_notificaciones.promociones}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferencias_notificaciones: {
                          ...formData.preferencias_notificaciones,
                          promociones: e.target.checked
                        }
                      })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Promociones y Ofertas</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.preferencias_notificaciones.marketing}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferencias_notificaciones: {
                          ...formData.preferencias_notificaciones,
                          marketing: e.target.checked
                        }
                      })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Contenido de Marketing</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
              <button
                onClick={handleGuardar}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                {editando ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px'
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

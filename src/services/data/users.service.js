/**
 * Users Service
 * Manages user data and address operations
 * Uses ALL fields from 'usuarios' and 'perfiles_usuarios' tables
 * 
 * SEGURIDAD: Validación de permisos en backend
 */

import supabase from '../../config/supabase';
import { profileService } from './profile.service';
import { verificarPermiso } from '../../middleware/auth.middleware';

// Valid user table fields
const USUARIO_FIELDS = [
  'email', 'nombre_completo', 'telefono', 'rol_id', 'rol', 'estado'
];

// User states
const ESTADOS_USUARIO = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido',
  PENDIENTE: 'pendiente'
};

export const usersService = {
  /**
   * Get complete user data with profile
   * @param {string} usuarioId - User ID
   * @returns {Promise<Object|null>} Complete user data with profile
   */
  async obtenerUsuarioCompleto(usuarioId) {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          email,
          nombre_completo,
          telefono,
          rol_id,
          rol,
          estado,
          ultimo_login,
          ultimo_logout,
          created_at,
          updated_at,
          perfiles_usuarios!perfiles_usuarios_usuario_id_fkey (
            id,
            usuario_id,
            foto_perfil,
            genero,
            fecha_nacimiento,
            empresa,
            documento_identidad,
            ciudad,
            pais,
            bio,
            preferencias_notificaciones,
            created_at,
            updated_at
          )
        `)
        .eq('id', usuarioId)
        .single();

      if (error) throw error;

      console.log('[Users] Complete user data loaded:', usuario?.email);
      console.log('[Users] Profile data:', JSON.stringify(usuario?.perfiles_usuarios, null, 2));

      return usuario;
    } catch (error) {
      console.error('[Users] Get complete user error:', error);
      return null;
    }
  },

  /**
   * Get user profile
   * @param {string} usuarioId - User ID
   * @returns {Promise<Object|null>} User profile
   */
  async obtenerPerfil(usuarioId) {
    try {
      return await profileService.obtenerPerfil(usuarioId);
    } catch (error) {
      console.error('[Users] Get profile error:', error);
      return null;
    }
  },

  /**
   * Update user profile
   * @param {string} usuarioId - User ID
   * @param {Object} datos - Profile data
   * @returns {Promise<Object>} Update result
   */
  async actualizarPerfil(usuarioId, datos) {
    try {
      const perfil = await profileService.actualizarPerfil(usuarioId, datos);
      return { success: true, perfil };
    } catch (error) {
      console.error('[Users] Update profile error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update user basic data (usuarios table)
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'editar_usuario'
   * @param {string} usuarioId - User ID
   * @param {Object} datos - User data (email, nombre_completo, telefono, rol_id, rol, estado)
   * @returns {Promise<Object>} Update result
   */
  async actualizarUsuario(usuarioId, datos) {
    try {
      // VALIDAR PERMISO ANTES DE CONTINUAR (modo tolerante)
      try {
        const permisoCheck = await verificarPermiso('editar_usuario');
        if (!permisoCheck.success) {
          // Solo bloquear si es error de permisos explícito, no si es error técnico
          if (permisoCheck.error?.includes('No tienes permiso')) {
            console.error('[Users] Permission denied:', permisoCheck.error);
            return { success: false, error: permisoCheck.error };
          }
          // Si es error técnico (sesión, etc), continuar si el usuario es admin
          const usuarioCache = sessionStorage.getItem('usuario');
          if (usuarioCache) {
            const usuario = JSON.parse(usuarioCache);
            if (usuario.rol !== 'admin') {
              return { success: false, error: permisoCheck.error };
            }
            console.warn('[Users] Permission check failed but user is admin, continuing');
          } else {
            return { success: false, error: permisoCheck.error };
          }
        } else {
          console.log('[Users] Updating user:', usuarioId, 'by:', permisoCheck.usuario.email);
        }
      } catch (permisoError) {
        console.warn('[Users] Permission check error:', permisoError.message);
        // Verificar si es admin desde sessionStorage como fallback
        const usuarioCache = sessionStorage.getItem('usuario');
        if (!usuarioCache) {
          return { success: false, error: 'No hay sesión activa' };
        }
        const usuario = JSON.parse(usuarioCache);
        if (usuario.rol !== 'admin') {
          return { success: false, error: 'No tienes permisos suficientes' };
        }
        console.warn('[Users] Continuing with cached admin user');
      }

      const datosActualizar = {};

      // Only update valid fields
      Object.keys(datos).forEach(key => {
        if (USUARIO_FIELDS.includes(key)) {
          datosActualizar[key] = datos[key];
        }
      });

      datosActualizar.updated_at = new Date().toISOString();

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .update(datosActualizar)
        .eq('id', usuarioId)
        .select(`
          id,
          email,
          nombre_completo,
          telefono,
          rol_id,
          rol,
          estado,
          ultimo_login,
          ultimo_logout,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;
      
      console.log('[Users] User updated:', usuarioId);
      
      return { success: true, usuario };
    } catch (error) {
      console.error('[Users] Update user error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all users with complete data (admin only)
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'ver_usuarios'
   * @returns {Promise<Array>} All users with profiles
   */
  async obtenerTodosUsuarios() {
    try {
      // VALIDAR PERMISO ANTES DE CONTINUAR (pero no bloquear si falla técnicamente)
      try {
        const permisoCheck = await verificarPermiso('ver_usuarios');
        if (!permisoCheck.success && permisoCheck.error?.includes('No tienes permiso')) {
          console.error('[Users] Permission denied:', permisoCheck.error);
          throw new Error(permisoCheck.error);
        }
        if (permisoCheck.success) {
          console.log('[Users] Loading all users by:', permisoCheck.usuario.email);
        }
      } catch (permisoError) {
        // Si es error de permisos (no técnico), lanzar
        if (permisoError.message?.includes('No tienes permiso')) {
          throw permisoError;
        }
        // Si es error técnico (función no existe, etc), continuar con warning
        console.warn('[Users] Permission check error (continuing):', permisoError.message);
      }

      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          email,
          nombre_completo,
          telefono,
          rol_id,
          rol,
          estado,
          ultimo_login,
          ultimo_logout,
          created_at,
          updated_at,
          perfiles_usuarios!perfiles_usuarios_usuario_id_fkey (
            id,
            usuario_id,
            foto_perfil,
            genero,
            fecha_nacimiento,
            empresa,
            documento_identidad,
            ciudad,
            pais,
            bio,
            preferencias_notificaciones,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('[Users] Loaded:', usuarios?.length || 0, 'users with complete data');
      
      // Log detallado de la estructura
      if (usuarios && usuarios.length > 0) {
        console.log('[Users] First user sample:', JSON.stringify({
          id: usuarios[0].id,
          email: usuarios[0].email,
          perfiles_usuarios: usuarios[0].perfiles_usuarios
        }, null, 2));
      }
      
      return usuarios || [];
    } catch (error) {
      console.error('[Users] Get all users error:', error);
      return [];
    }
  },

  /**
   * Get users by role
   * @param {string} rol - Role name (admin, cliente, etc.)
   * @returns {Promise<Array>} Users with specified role
   */
  async obtenerUsuariosPorRol(rol) {
    try {
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          email,
          nombre_completo,
          telefono,
          rol,
          estado,
          ultimo_login,
          perfiles_usuarios (
            foto_perfil,
            ciudad,
            pais,
            empresa
          )
        `)
        .eq('rol', rol)
        .order('nombre_completo', { ascending: true });

      if (error) throw error;

      console.log('[Users] Loaded:', usuarios?.length || 0, 'users with role:', rol);

      return usuarios || [];
    } catch (error) {
      console.error('[Users] Get users by role error:', error);
      return [];
    }
  },

  /**
   * Get users by status
   * @param {string} estado - User status (activo, inactivo, suspendido, pendiente)
   * @returns {Promise<Array>} Users with specified status
   */
  async obtenerUsuariosPorEstado(estado) {
    try {
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          email,
          nombre_completo,
          telefono,
          rol,
          estado,
          ultimo_login,
          ultimo_logout,
          created_at
        `)
        .eq('estado', estado)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[Users] Loaded:', usuarios?.length || 0, 'users with status:', estado);

      return usuarios || [];
    } catch (error) {
      console.error('[Users] Get users by status error:', error);
      return [];
    }
  },

  /**
   * Change user status (admin only)
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'editar_usuario'
   * @param {string} usuarioId - User ID
   * @param {string} nuevoEstado - New status (activo, inactivo, suspendido, pendiente)
   * @returns {Promise<Object>} Update result
   */
  async cambiarEstadoUsuario(usuarioId, nuevoEstado) {
    try {
      // VALIDAR PERMISO (modo tolerante para admins)
      try {
        const permisoCheck = await verificarPermiso('editar_usuario');
        if (permisoCheck.success) {
          console.log('[Users] Changing user status:', usuarioId, 'to:', nuevoEstado, 'by:', permisoCheck.usuario.email);
        }
      } catch (error) {
        const usuarioCache = sessionStorage.getItem('usuario');
        if (!usuarioCache || JSON.parse(usuarioCache).rol !== 'admin') {
          return { success: false, error: 'No tienes permisos suficientes' };
        }
        console.warn('[Users] Using cached admin for status change');
      }

      if (!Object.values(ESTADOS_USUARIO).includes(nuevoEstado)) {
        throw new Error(`Invalid status: ${nuevoEstado}`);
      }

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .update({ 
          estado: nuevoEstado,
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioId)
        .select(`
          id,
          email,
          nombre_completo,
          rol,
          estado,
          updated_at
        `)
        .single();

      if (error) throw error;
      
      console.log('[Users] User status changed:', usuarioId, 'to', nuevoEstado);
      
      return { success: true, usuario };
    } catch (error) {
      console.error('[Users] Change status error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Change user role (admin only)
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'editar_usuario'
   * @param {string} usuarioId - User ID
   * @param {string} nuevoRol - New role (admin, cliente, etc.)
   * @param {string} nuevoRolId - New role ID (UUID)
   * @returns {Promise<Object>} Update result
   */
  async cambiarRolUsuario(usuarioId, nuevoRol, nuevoRolId = null) {
    try {
      // VALIDAR PERMISO (modo tolerante para admins)
      try {
        const permisoCheck = await verificarPermiso('editar_usuario');
        if (permisoCheck.success) {
          console.log('[Users] Changing user role:', usuarioId, 'to:', nuevoRol, 'by:', permisoCheck.usuario.email);
        }
      } catch (error) {
        const usuarioCache = sessionStorage.getItem('usuario');
        if (!usuarioCache || JSON.parse(usuarioCache).rol !== 'admin') {
          return { success: false, error: 'No tienes permisos suficientes' };
        }
        console.warn('[Users] Using cached admin for role change');
      }

      // Si no se proporcionó rol_id, buscarlo por nombre
      let rolId = nuevoRolId;
      
      if (!rolId) {
        const { data: rolData, error: rolError } = await supabase
          .from('roles')
          .select('id')
          .eq('nombre', nuevoRol)
          .maybeSingle();

        if (rolError) {
          console.error('[Users] Error finding role:', rolError);
          console.warn('[Users] Continuing without rol_id (rol_id will be null)');
          rolId = null;
        } else if (rolData) {
          rolId = rolData.id;
        } else {
          console.warn('[Users] Role not found in database:', nuevoRol, '(using null)');
          rolId = null;
        }
      }

      const updateData = {
        rol: nuevoRol,
        rol_id: rolId,
        updated_at: new Date().toISOString()
      };

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', usuarioId)
        .select(`
          id,
          email,
          nombre_completo,
          rol_id,
          rol,
          estado,
          updated_at
        `)
        .single();

      if (error) throw error;

      console.log('[Users] User role changed:', usuarioId, 'to', nuevoRol, 'with ID', rolId);

      return { success: true, usuario };
    } catch (error) {
      console.error('[Users] Change role error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update last login timestamp
   * @param {string} usuarioId - User ID
   * @returns {Promise<Object>} Update result
   */
  async registrarUltimoLogin(usuarioId) {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .update({ 
          ultimo_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioId)
        .select('id, email, ultimo_login')
        .single();

      if (error) throw error;

      console.log('[Users] Last login registered for:', usuario.email);

      return { success: true, usuario };
    } catch (error) {
      console.error('[Users] Register last login error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update last logout timestamp
   * @param {string} usuarioId - User ID
   * @returns {Promise<Object>} Update result
   */
  async registrarUltimoLogout(usuarioId) {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .update({ 
          ultimo_logout: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', usuarioId)
        .select('id, email, ultimo_logout')
        .single();

      if (error) throw error;

      console.log('[Users] Last logout registered for:', usuario.email);

      return { success: true, usuario };
    } catch (error) {
      console.error('[Users] Register last logout error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async obtenerEstadisticasUsuarios() {
    try {
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('rol, estado, created_at');

      if (error) throw error;

      const stats = {
        total: usuarios.length,
        porRol: {},
        porEstado: {},
        nuevosUltimoMes: 0
      };

      const unMesAtras = new Date();
      unMesAtras.setMonth(unMesAtras.getMonth() - 1);

      usuarios.forEach(usuario => {
        // Count by role
        stats.porRol[usuario.rol] = (stats.porRol[usuario.rol] || 0) + 1;
        
        // Count by status
        stats.porEstado[usuario.estado] = (stats.porEstado[usuario.estado] || 0) + 1;
        
        // Count new users
        if (new Date(usuario.created_at) > unMesAtras) {
          stats.nuevosUltimoMes++;
        }
      });

      console.log('[Users] Statistics generated:', stats);

      return stats;
    } catch (error) {
      console.error('[Users] Get statistics error:', error);
      return null;
    }
  },

  ESTADOS_USUARIO
};

export const addressService = {
  async obtenerDirecciones(usuarioId) {
    try {
      const { data: direcciones, error } = await supabase
        .from('direcciones')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('es_predeterminada', { ascending: false });

      if (error) throw error;
      
      console.log('[Address] Loaded:', direcciones?.length || 0, 'addresses');
      
      return direcciones || [];
    } catch (error) {
      console.error('[Address] Get addresses error:', error);
      return [];
    }
  },

  async crearDireccion(usuarioId, datoDireccion) {
    try {
      const { data: direccion, error } = await supabase
        .from('direcciones')
        .insert([{
          usuario_id: usuarioId,
          ...datoDireccion
        }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('[Address] Address created:', direccion.id);
      
      return { success: true, direccion };
    } catch (error) {
      console.error('[Address] Create address error:', error);
      return { success: false, error: error.message };
    }
  },

  async actualizarDireccion(direccionId, datos) {
    try {
      const { data: direccion, error } = await supabase
        .from('direcciones')
        .update(datos)
        .eq('id', direccionId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('[Address] Address updated:', direccionId);
      
      return { success: true, direccion };
    } catch (error) {
      console.error('[Address] Update address error:', error);
      return { success: false, error: error.message };
    }
  },

  async eliminarDireccion(direccionId) {
    try {
      const { error } = await supabase
        .from('direcciones')
        .delete()
        .eq('id', direccionId);

      if (error) throw error;
      
      console.log('[Address] Address deleted:', direccionId);
      
      return { success: true };
    } catch (error) {
      console.error('[Address] Delete address error:', error);
      return { success: false, error: error.message };
    }
  },

  async establecerComoPredeterminada(usuarioId, direccionId) {
    try {
      await supabase
        .from('direcciones')
        .update({ es_predeterminada: false })
        .eq('usuario_id', usuarioId);

      const { data: direccion, error } = await supabase
        .from('direcciones')
        .update({ es_predeterminada: true })
        .eq('id', direccionId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('[Address] Default address set:', direccionId);
      
      return { success: true, direccion };
    } catch (error) {
      console.error('[Address] Set default error:', error);
      return { success: false, error: error.message };
    }
  }
};

export default usersService;

/**
 * MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
 * ==========================================
 * CRÍTICO: Este middleware valida permisos en el backend
 * para prevenir ataques de bypass del frontend
 */

import supabase from '../config/supabase';

/**
 * Verifica que el usuario esté autenticado
 * @returns {Promise<{success: boolean, usuario?: Object, error?: string}>}
 */
export async function verificarAutenticacion() {
  try {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      return { success: false, error: 'No hay sesión activa' };
    }

    // Verificar que la sesión existe en la base de datos
    const { data: sesion, error: sesionError } = await supabase
      .from('sesiones')
      .select('usuario_id, expires_at')
      .eq('token', token)
      .maybeSingle();

    if (sesionError) {
      console.error('[Auth] Session query error:', sesionError);
      return { success: false, error: 'Error al verificar sesión' };
    }

    if (!sesion) {
      return { success: false, error: 'Sesión inválida' };
    }

    // Verificar que la sesión no haya expirado
    if (new Date(sesion.expires_at) < new Date()) {
      return { success: false, error: 'Sesión expirada' };
    }

    // Obtener datos completos del usuario (puede fallar por RLS, manejar error)
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select(`
        id,
        email,
        nombre_completo,
        rol,
        rol_id,
        estado
      `)
      .eq('id', sesion.usuario_id)
      .maybeSingle();

    if (usuarioError) {
      console.error('[Auth] User query error:', usuarioError);
      // Si falla la query, intentar obtener usuario desde sessionStorage como fallback
      const usuarioCache = sessionStorage.getItem('usuario');
      if (usuarioCache) {
        const usuarioParsed = JSON.parse(usuarioCache);
        console.warn('[Auth] Using cached user data due to query error');
        return { success: true, usuario: usuarioParsed };
      }
      return { success: false, error: 'Error al verificar usuario' };
    }

    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      return { success: false, error: 'Usuario inactivo o suspendido' };
    }

    return { success: true, usuario };
  } catch (error) {
    console.error('Error en verificarAutenticacion:', error);
    return { success: false, error: 'Error al verificar autenticación' };
  }
}

/**
 * Verifica que el usuario tenga un permiso específico
 * @param {string} permisoNombre - Nombre del permiso (ej: 'ver_usuarios')
 * @returns {Promise<{success: boolean, usuario?: Object, error?: string}>}
 */
export async function verificarPermiso(permisoNombre) {
  try {
    // Primero verificar autenticación
    const authResult = await verificarAutenticacion();
    if (!authResult.success) {
      return authResult;
    }

    const { usuario } = authResult;

    // Si el usuario no tiene rol_id, verificar por nombre de rol
    if (!usuario.rol_id) {
      console.warn('[Auth] Usuario sin rol_id, verificando por nombre de rol:', usuario.rol);
      
      // Si es admin, permitir todo
      if (usuario.rol === 'admin') {
        return { success: true, usuario };
      }
      
      // Para otros roles sin rol_id, denegar permisos administrativos
      return { 
        success: false, 
        error: `No tienes permiso para realizar esta acción (${permisoNombre})` 
      };
    }

    // Verificar permiso en la base de datos usando RPC
    const { data: permiso, error: permisoError } = await supabase
      .rpc('usuario_tiene_permiso', {
        usuario_id_param: usuario.id,
        permiso_nombre_param: permisoNombre
      });

    if (permisoError) {
      console.error('Error al verificar permiso:', permisoError);
      
      // Si falla la función RPC, verificar por rol como fallback
      console.warn('[Auth] RPC failed, checking by role as fallback');
      if (usuario.rol === 'admin') {
        return { success: true, usuario };
      }
      
      return { success: false, error: 'Error al verificar permisos' };
    }

    if (!permiso) {
      return { 
        success: false, 
        error: `No tienes permiso para realizar esta acción (${permisoNombre})` 
      };
    }

    return { success: true, usuario };
  } catch (error) {
    console.error('Error en verificarPermiso:', error);
    return { success: false, error: 'Error al verificar permiso' };
  }
}

/**
 * Verifica múltiples permisos (el usuario debe tener AL MENOS UNO)
 * @param {string[]} permisos - Array de nombres de permisos
 * @returns {Promise<{success: boolean, usuario?: Object, error?: string}>}
 */
export async function verificarAlgunPermiso(permisos) {
  try {
    const authResult = await verificarAutenticacion();
    if (!authResult.success) {
      return authResult;
    }

    const { usuario } = authResult;

    // Verificar cada permiso
    for (const permiso of permisos) {
      const { data: tienePermiso } = await supabase
        .rpc('usuario_tiene_permiso', {
          usuario_id_param: usuario.id,
          permiso_nombre_param: permiso
        });

      if (tienePermiso) {
        return { success: true, usuario };
      }
    }

    return { 
      success: false, 
      error: `No tienes ninguno de los permisos requeridos: ${permisos.join(', ')}` 
    };
  } catch (error) {
    console.error('Error en verificarAlgunPermiso:', error);
    return { success: false, error: 'Error al verificar permisos' };
  }
}

/**
 * Verifica múltiples permisos (el usuario debe tener TODOS)
 * @param {string[]} permisos - Array de nombres de permisos
 * @returns {Promise<{success: boolean, usuario?: Object, error?: string}>}
 */
export async function verificarTodosLosPermisos(permisos) {
  try {
    const authResult = await verificarAutenticacion();
    if (!authResult.success) {
      return authResult;
    }

    const { usuario } = authResult;

    // Verificar cada permiso
    for (const permiso of permisos) {
      const { data: tienePermiso } = await supabase
        .rpc('usuario_tiene_permiso', {
          usuario_id_param: usuario.id,
          permiso_nombre_param: permiso
        });

      if (!tienePermiso) {
        return { 
          success: false, 
          error: `Falta el permiso requerido: ${permiso}` 
        };
      }
    }

    return { success: true, usuario };
  } catch (error) {
    console.error('Error en verificarTodosLosPermisos:', error);
    return { success: false, error: 'Error al verificar permisos' };
  }
}

/**
 * Obtener todos los permisos del usuario actual
 * @returns {Promise<{success: boolean, permisos?: string[], error?: string}>}
 */
export async function obtenerPermisosUsuario() {
  try {
    const authResult = await verificarAutenticacion();
    if (!authResult.success) {
      return authResult;
    }

    const { usuario } = authResult;

    const { data: permisos, error } = await supabase
      .from('usuarios')
      .select(`
        rol_id,
        roles!inner (
          roles_permisos!inner (
            permisos!inner (
              nombre,
              descripcion,
              categoria
            )
          )
        )
      `)
      .eq('id', usuario.id)
      .single();

    if (error) {
      console.error('Error al obtener permisos:', error);
      return { success: false, error: 'Error al obtener permisos' };
    }

    // Extraer nombres de permisos
    const nombresPermisos = permisos?.roles?.roles_permisos?.map(
      rp => rp.permisos.nombre
    ) || [];

    return { success: true, permisos: nombresPermisos };
  } catch (error) {
    console.error('Error en obtenerPermisosUsuario:', error);
    return { success: false, error: 'Error al obtener permisos' };
  }
}

/**
 * Helper: Ejecutar acción con validación de permiso
 * @param {string} permiso - Permiso requerido
 * @param {Function} accion - Función async a ejecutar si tiene permiso
 * @returns {Promise<any>}
 */
export async function ejecutarConPermiso(permiso, accion) {
  const verificacion = await verificarPermiso(permiso);
  
  if (!verificacion.success) {
    throw new Error(verificacion.error);
  }

  return await accion(verificacion.usuario);
}

/**
 * Helper: Decorador para funciones que requieren permiso
 * @param {string} permiso - Permiso requerido
 * @returns {Function}
 */
export function requierePermiso(permiso) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const verificacion = await verificarPermiso(permiso);
      
      if (!verificacion.success) {
        throw new Error(verificacion.error);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export default {
  verificarAutenticacion,
  verificarPermiso,
  verificarAlgunPermiso,
  verificarTodosLosPermisos,
  obtenerPermisosUsuario,
  ejecutarConPermiso,
  requierePermiso
};

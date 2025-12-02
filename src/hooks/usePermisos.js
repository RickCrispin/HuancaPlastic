import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para verificar permisos del usuario actual
 * 
 * Uso:
 * const { tienePermiso, permisos, esAdmin } = usePermisos();
 * 
 * if (tienePermiso('editar_productos')) {
 *   // Mostrar botón de editar
 * }
 */
export const usePermisos = () => {
  const { usuario, esAdmin, tienePermiso: verificarPermiso, obtenerPermisos } = useAuth();

  return {
    // Verifica si el usuario tiene un permiso específico
    tienePermiso: (nombrePermiso) => verificarPermiso(nombrePermiso),
    
    // Obtiene todos los permisos del usuario
    permisos: obtenerPermisos(),
    
    // Verifica si es admin
    esAdmin,
    
    // Obtiene el rol del usuario
    rol: usuario?.rol,
    
    // Verifica múltiples permisos (requiere todos)
    tienePermisos: (nombrePermisos = []) => {
      return nombrePermisos.every(permiso => verificarPermiso(permiso));
    },
    
    // Verifica múltiples permisos (requiere al menos uno)
    tieneAlgunoPermiso: (nombrePermisos = []) => {
      return nombrePermisos.some(permiso => verificarPermiso(permiso));
    },

    // Obtiene los nombres de todos los permisos
    obtenerNombresPermisos: () => {
      const permisos = obtenerPermisos();
      return Array.isArray(permisos) 
        ? permisos.map(p => p?.nombre || p)
        : [];
    },

    // Verifica si el usuario está autenticado
    estaAutenticado: !!usuario,

    // Obtiene información del usuario
    usuarioInfo: {
      id: usuario?.id,
      email: usuario?.email,
      nombre: usuario?.nombre_completo,
      rol: usuario?.rol,
      telefono: usuario?.telefono,
      rol_id: usuario?.rol_id
    }
  };
};

import { supabase } from './supabase';

/**
 * Servicio para operaciones relacionadas con perfiles de usuarios
 * Conecta con la tabla 'perfiles_usuarios' de Supabase
 */
export const profileService = {
  /**
   * Obtiene el perfil de un usuario
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise<Object>} Datos del perfil o null
   */
  async obtenerPerfil(usuarioId) {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .select('id, usuario_id, ciudad, pais, bio, foto_perfil, created_at, updated_at')
        .eq('usuario_id', usuarioId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existe perfil aún
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo perfil para un usuario
   * @param {string} usuarioId - ID del usuario
   * @param {Object} datos - Datos del perfil (ciudad, pais, bio)
   * @returns {Promise<Object>} Perfil creado
   */
  async crearPerfil(usuarioId, datos = {}) {
    try {
      const perfilData = {
        usuario_id: usuarioId,
        ciudad: datos.ciudad || null,
        pais: datos.pais || 'Perú',
        bio: datos.bio || null,
        foto_perfil: datos.foto_perfil || null
      };

      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .insert([perfilData])
        .select()
        .single();

      if (error) throw error;

      console.log('Perfil creado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error creando perfil:', error);
      throw error;
    }
  },

  /**
   * Actualiza el perfil de un usuario
   * @param {string} usuarioId - ID del usuario
   * @param {Object} datos - Datos a actualizar (ciudad, pais, bio)
   * @returns {Promise<Object>} Perfil actualizado
   */
  async actualizarPerfil(usuarioId, datos) {
    try {
      // Validar que solo se actualicen campos válidos
      const camposValidos = ['ciudad', 'pais', 'bio', 'foto_perfil'];
      const datosActualizar = {};

      Object.keys(datos).forEach(key => {
        if (camposValidos.includes(key)) {
          datosActualizar[key] = datos[key];
        }
      });

      // Agregar timestamp de actualización
      datosActualizar.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .update(datosActualizar)
        .eq('usuario_id', usuarioId)
        .select()
        .single();

      if (error) throw error;

      console.log('Perfil actualizado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  /**
   * Elimina el perfil de un usuario
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise<void>}
   */
  async eliminarPerfil(usuarioId) {
    try {
      const { error } = await supabase
        .from('perfiles_usuarios')
        .delete()
        .eq('usuario_id', usuarioId);

      if (error) throw error;

      console.log('Perfil eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando perfil:', error);
      throw error;
    }
  },

  /**
   * Obtiene múltiples perfiles con información del usuario
   * @param {Array<string>} usuarioIds - Array de IDs de usuarios
   * @returns {Promise<Array>} Array de perfiles
   */
  async obtenerPerfiles(usuarioIds) {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .select('*')
        .in('usuario_id', usuarioIds);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error obteniendo múltiples perfiles:', error);
      return [];
    }
  }
};

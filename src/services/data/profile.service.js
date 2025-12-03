/**
 * Profile Service
 * Manages user profile operations
 * Uses ALL fields from 'perfiles_usuarios' table
 */

import supabase from '../../config/supabase';

// All valid profile fields
const VALID_FIELDS = [
  'foto_perfil',
  'genero',
  'fecha_nacimiento',
  'empresa',
  'documento_identidad',
  'ciudad',
  'pais',
  'bio',
  'preferencias_notificaciones'
];

// Gender options
const GENEROS = {
  MASCULINO: 'masculino',
  FEMENINO: 'femenino',
  OTRO: 'otro',
  PREFIERO_NO_DECIR: 'prefiero_no_decir'
};

// Default notification preferences
const DEFAULT_NOTIFICACIONES = {
  email: true,
  push: true,
  marketing: false,
  ordenes: true,
  promociones: true
};

export const profileService = {
  /**
   * Get complete user profile by user ID
   * @param {string} usuarioId - User ID
   * @returns {Promise<Object|null>} Complete profile data or null if not found
   */
  async obtenerPerfil(usuarioId) {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .select(`
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
        `)
        .eq('usuario_id', usuarioId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('[Profile] No profile found for user:', usuarioId);
          return null;
        }
        throw error;
      }

      console.log('[Profile] Profile loaded for user:', usuarioId);

      return data;
    } catch (error) {
      console.error('[Profile] Get profile error:', error);
      throw error;
    }
  },

  /**
   * Create new user profile with all fields
   * @param {string} usuarioId - User ID
   * @param {Object} datos - Profile data
   * @returns {Promise<Object>} Created profile
   */
  async crearPerfil(usuarioId, datos = {}) {
    try {
      const perfilData = {
        usuario_id: usuarioId,
        foto_perfil: datos.foto_perfil || null,
        genero: datos.genero || null,
        fecha_nacimiento: datos.fecha_nacimiento || null,
        empresa: datos.empresa || null,
        documento_identidad: datos.documento_identidad || null,
        ciudad: datos.ciudad || null,
        pais: datos.pais || 'Perú',
        bio: datos.bio || null,
        preferencias_notificaciones: datos.preferencias_notificaciones || DEFAULT_NOTIFICACIONES
      };

      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .insert([perfilData])
        .select(`
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
        `)
        .single();

      if (error) throw error;

      console.log('[Profile] Profile created for user:', usuarioId);
      
      return data;
    } catch (error) {
      console.error('[Profile] Create profile error:', error);
      throw error;
    }
  },

  /**
   * Update user profile with validation
   * @param {string} usuarioId - User ID
   * @param {Object} datos - Data to update
   * @returns {Promise<Object>} Updated profile
   */
  async actualizarPerfil(usuarioId, datos) {
    try {
      const datosActualizar = {};

      // Validate and add only valid fields
      Object.keys(datos).forEach(key => {
        if (VALID_FIELDS.includes(key)) {
          datosActualizar[key] = datos[key];
        }
      });

      datosActualizar.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .update(datosActualizar)
        .eq('usuario_id', usuarioId)
        .select(`
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
        `)
        .single();

      if (error) throw error;

      console.log('[Profile] Profile updated for user:', usuarioId);
      
      return data;
    } catch (error) {
      console.error('[Profile] Update profile error:', error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   * @param {string} usuarioId - User ID
   * @param {Object} preferencias - Notification preferences object
   * @returns {Promise<Object>} Updated profile
   */
  async actualizarPreferenciasNotificaciones(usuarioId, preferencias) {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .update({ 
          preferencias_notificaciones: preferencias,
          updated_at: new Date().toISOString()
        })
        .eq('usuario_id', usuarioId)
        .select('id, usuario_id, preferencias_notificaciones, updated_at')
        .single();

      if (error) throw error;

      console.log('[Profile] Notification preferences updated for user:', usuarioId);

      return data;
    } catch (error) {
      console.error('[Profile] Update notification preferences error:', error);
      throw error;
    }
  },

  /**
   * Update profile photo
   * @param {string} usuarioId - User ID
   * @param {string} fotoUrl - Photo URL
   * @returns {Promise<Object>} Updated profile
   */
  async actualizarFotoPerfil(usuarioId, fotoUrl) {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .update({ 
          foto_perfil: fotoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('usuario_id', usuarioId)
        .select('id, usuario_id, foto_perfil, updated_at')
        .single();

      if (error) throw error;

      console.log('[Profile] Profile photo updated for user:', usuarioId);

      return data;
    } catch (error) {
      console.error('[Profile] Update profile photo error:', error);
      throw error;
    }
  },

  /**
   * Delete user profile
   * @param {string} usuarioId - User ID
   * @returns {Promise<void>}
   */
  async eliminarPerfil(usuarioId) {
    try {
      const { error } = await supabase
        .from('perfiles_usuarios')
        .delete()
        .eq('usuario_id', usuarioId);

      if (error) throw error;

      console.log('[Profile] Profile deleted for user:', usuarioId);
    } catch (error) {
      console.error('[Profile] Delete profile error:', error);
      throw error;
    }
  },

  /**
   * Get multiple profiles by user IDs
   * @param {Array<string>} usuarioIds - Array of user IDs
   * @returns {Promise<Array>} Array of profiles
   */
  async obtenerPerfiles(usuarioIds) {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .select(`
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
        `)
        .in('usuario_id', usuarioIds);

      if (error) throw error;

      console.log('[Profile] Loaded:', data?.length || 0, 'profiles');

      return data || [];
    } catch (error) {
      console.error('[Profile] Get profiles error:', error);
      return [];
    }
  },

  /**
   * Get profiles by city
   * @param {string} ciudad - City name
   * @returns {Promise<Array>} Profiles in specified city
   */
  async obtenerPerfilesPorCiudad(ciudad) {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .select(`
          id,
          usuario_id,
          foto_perfil,
          ciudad,
          pais,
          empresa
        `)
        .eq('ciudad', ciudad);

      if (error) throw error;

      console.log('[Profile] Loaded:', data?.length || 0, 'profiles from', ciudad);

      return data || [];
    } catch (error) {
      console.error('[Profile] Get profiles by city error:', error);
      return [];
    }
  },

  /**
   * Get profiles by company
   * @param {string} empresa - Company name
   * @returns {Promise<Array>} Profiles from specified company
   */
  async obtenerPerfilesPorEmpresa(empresa) {
    try {
      const { data, error } = await supabase
        .from('perfiles_usuarios')
        .select(`
          id,
          usuario_id,
          foto_perfil,
          empresa,
          ciudad,
          pais
        `)
        .eq('empresa', empresa);

      if (error) throw error;

      console.log('[Profile] Loaded:', data?.length || 0, 'profiles from company:', empresa);

      return data || [];
    } catch (error) {
      console.error('[Profile] Get profiles by company error:', error);
      return [];
    }
  },

  /**
   * Calculate age from birth date
   * @param {string} fechaNacimiento - Birth date (YYYY-MM-DD)
   * @returns {number|null} Age in years
   */
  calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  },

  GENEROS,
  DEFAULT_NOTIFICACIONES,
  VALID_FIELDS
};

export default profileService;

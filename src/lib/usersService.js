import { supabase } from './supabase';
import { profileService } from './profileService';

export const usersService = {
  // Obtener perfil del usuario
  async obtenerPerfil(usuarioId) {
    try {
      return await profileService.obtenerPerfil(usuarioId);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  },

  // Actualizar perfil
  async actualizarPerfil(usuarioId, datos) {
    try {
      const perfil = await profileService.actualizarPerfil(usuarioId, datos);
      return { success: true, perfil };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar datos básicos del usuario
  async actualizarUsuario(usuarioId, datos) {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .update(datos)
        .eq('id', usuarioId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, usuario };
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener todos los usuarios (admin)
  async obtenerTodosUsuarios() {
    try {
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          rol:rol_id (nombre),
          perfiles_usuarios (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return usuarios || [];
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  },

  // Cambiar estado de usuario (admin)
  async cambiarEstadoUsuario(usuarioId, nuevoEstado) {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .update({ estado: nuevoEstado })
        .eq('id', usuarioId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, usuario };
    } catch (error) {
      console.error('Error cambiando estado:', error);
      return { success: false, error: error.message };
    }
  }
};

export const addressService = {
  // Obtener direcciones de un usuario
  async obtenerDirecciones(usuarioId) {
    try {
      const { data: direcciones, error } = await supabase
        .from('direcciones')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('es_predeterminada', { ascending: false });

      if (error) throw error;
      return direcciones || [];
    } catch (error) {
      console.error('Error obteniendo direcciones:', error);
      return [];
    }
  },

  // Crear dirección
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
      return { success: true, direccion };
    } catch (error) {
      console.error('Error creando dirección:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar dirección
  async actualizarDireccion(direccionId, datos) {
    try {
      const { data: direccion, error } = await supabase
        .from('direcciones')
        .update(datos)
        .eq('id', direccionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, direccion };
    } catch (error) {
      console.error('Error actualizando dirección:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar dirección
  async eliminarDireccion(direccionId) {
    try {
      const { error } = await supabase
        .from('direcciones')
        .delete()
        .eq('id', direccionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error eliminando dirección:', error);
      return { success: false, error: error.message };
    }
  },

  // Establecer dirección como predeterminada
  async establecerComoPredeterminada(usuarioId, direccionId) {
    try {
      // Quitar predeterminada anterior
      await supabase
        .from('direcciones')
        .update({ es_predeterminada: false })
        .eq('usuario_id', usuarioId);

      // Establecer como predeterminada
      const { data: direccion, error } = await supabase
        .from('direcciones')
        .update({ es_predeterminada: true })
        .eq('id', direccionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, direccion };
    } catch (error) {
      console.error('Error estableciendo predeterminada:', error);
      return { success: false, error: error.message };
    }
  }
};

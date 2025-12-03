import supabase from '../../config/supabase';
import { verificarPermiso } from '../../middleware/auth.middleware';

/**
 * Servicio para gestión de roles y permisos
 * Maneja operaciones CRUD de roles y asignación de permisos
 * 
 * SEGURIDAD: Validación de permisos en backend
 */

export const rolesService = {
  /**
   * Obtener todos los roles con sus permisos
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'ver_roles'
   */
  async obtenerRolesConPermisos() {
    try {
      // VALIDAR PERMISO ANTES DE CONTINUAR
      const permisoCheck = await verificarPermiso('ver_roles');
      if (!permisoCheck.success) {
        console.error('[RolesService] Permission denied:', permisoCheck.error);
        throw new Error(permisoCheck.error);
      }

      console.log('[RolesService] Loading roles by:', permisoCheck.usuario.email);

      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          roles_permisos (
            permiso_id,
            permisos (
              id,
              nombre,
              descripcion,
              categoria
            )
          )
        `)
        .order('nombre');

      if (error) throw error;

      // Transformar la respuesta para que sea más fácil de usar
      return data.map(rol => ({
        ...rol,
        permisos: (rol.roles_permisos || []).map(rp => ({
          permiso_id: rp.permiso_id,
          ...rp.permisos
        }))
      }));
    } catch (error) {
      console.error('[RolesService] Error al obtener roles:', error);
      throw new Error('Error al obtener roles: ' + error.message);
    }
  },

  /**
   * Obtener todos los permisos disponibles
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'ver_roles'
   */
  async obtenerPermisos() {
    try {
      // VALIDAR PERMISO ANTES DE CONTINUAR
      const permisoCheck = await verificarPermiso('ver_roles');
      if (!permisoCheck.success) {
        console.error('[RolesService] Permission denied:', permisoCheck.error);
        throw new Error(permisoCheck.error);
      }

      const { data, error } = await supabase
        .from('permisos')
        .select('*')
        .order('categoria, nombre');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[RolesService] Error al obtener permisos:', error);
      throw new Error('Error al obtener permisos: ' + error.message);
    }
  },

  /**
   * Obtener un rol por ID
   */
  async obtenerRolPorId(rolId) {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          roles_permisos (
            permiso_id,
            permisos (
              id,
              nombre,
              descripcion
            )
          )
        `)
        .eq('id', rolId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[RolesService] Error al obtener rol:', error);
      throw new Error('Error al obtener rol: ' + error.message);
    }
  },

  /**
   * Crear un nuevo rol
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'crear_rol'
   */
  async crearRol(nombre, descripcion = '') {
    try {
      // VALIDAR PERMISO ANTES DE CONTINUAR
      const permisoCheck = await verificarPermiso('crear_rol');
      if (!permisoCheck.success) {
        console.error('[RolesService] Permission denied:', permisoCheck.error);
        throw new Error(permisoCheck.error);
      }

      console.log('[RolesService] Creating role by:', permisoCheck.usuario.email);

      // Verificar que el nombre no esté vacío
      if (!nombre || !nombre.trim()) {
        throw new Error('El nombre del rol es requerido');
      }

      // Verificar que el rol no exista
      const { data: existente } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', nombre.trim())
        .single();

      if (existente) {
        throw new Error('Ya existe un rol con ese nombre');
      }

      const { data, error } = await supabase
        .from('roles')
        .insert([{
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || null
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('[RolesService] Rol creado:', data);
      return data;
    } catch (error) {
      console.error('[RolesService] Error al crear rol:', error);
      throw new Error(error.message || 'Error al crear rol');
    }
  },

  /**
   * Actualizar un rol
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'editar_rol'
   */
  async actualizarRol(rolId, datos) {
    try {
      // VALIDAR PERMISO ANTES DE CONTINUAR
      const permisoCheck = await verificarPermiso('editar_rol');
      if (!permisoCheck.success) {
        console.error('[RolesService] Permission denied:', permisoCheck.error);
        throw new Error(permisoCheck.error);
      }

      console.log('[RolesService] Updating role:', rolId, 'by:', permisoCheck.usuario.email);

      const { data, error } = await supabase
        .from('roles')
        .update(datos)
        .eq('id', rolId)
        .select()
        .single();

      if (error) throw error;

      console.log('[RolesService] Rol actualizado:', data);
      return data;
    } catch (error) {
      console.error('[RolesService] Error al actualizar rol:', error);
      throw new Error('Error al actualizar rol: ' + error.message);
    }
  },

  /**
   * Eliminar un rol
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'eliminar_rol'
   */
  async eliminarRol(rolId) {
    try {
      // VALIDAR PERMISO ANTES DE CONTINUAR
      const permisoCheck = await verificarPermiso('eliminar_rol');
      if (!permisoCheck.success) {
        console.error('[RolesService] Permission denied:', permisoCheck.error);
        throw new Error(permisoCheck.error);
      }

      console.log('[RolesService] Deleting role:', rolId, 'by:', permisoCheck.usuario.email);

      // Verificar que el rol no esté en uso
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id')
        .eq('rol_id', rolId)
        .limit(1);

      if (errorUsuarios) throw errorUsuarios;

      if (usuarios && usuarios.length > 0) {
        throw new Error('No se puede eliminar el rol porque está asignado a usuarios');
      }

      // Eliminar primero las relaciones de permisos
      const { error: errorPermisos } = await supabase
        .from('roles_permisos')
        .delete()
        .eq('rol_id', rolId);

      if (errorPermisos) throw errorPermisos;

      // Eliminar el rol
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', rolId);

      if (error) throw error;

      console.log('[RolesService] Rol eliminado:', rolId);
      return true;
    } catch (error) {
      console.error('[RolesService] Error al eliminar rol:', error);
      throw new Error(error.message || 'Error al eliminar rol');
    }
  },

  /**
   * Asignar permisos a un rol
   * VALIDACIÓN DE PERMISOS: Requiere permiso 'editar_rol'
   */
  async asignarPermisosARol(rolId, permisosIds) {
    try {
      // VALIDAR PERMISO ANTES DE CONTINUAR
      const permisoCheck = await verificarPermiso('editar_rol');
      if (!permisoCheck.success) {
        console.error('[RolesService] Permission denied:', permisoCheck.error);
        throw new Error(permisoCheck.error);
      }

      console.log('[RolesService] Assigning permissions to role:', rolId, 'by:', permisoCheck.usuario.email);

      // Eliminar permisos actuales del rol
      const { error: deleteError } = await supabase
        .from('roles_permisos')
        .delete()
        .eq('rol_id', rolId);

      if (deleteError) throw deleteError;

      // 2. Si hay permisos nuevos, insertarlos
      if (permisosIds && permisosIds.length > 0) {
        const insertData = permisosIds.map(permisoId => ({
          rol_id: rolId,
          permiso_id: permisoId
        }));

        const { error: insertError } = await supabase
          .from('roles_permisos')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      console.log('[RolesService] Permisos asignados al rol:', rolId, permisosIds);
      return true;
    } catch (error) {
      console.error('[RolesService] Error al asignar permisos:', error);
      throw new Error('Error al asignar permisos: ' + error.message);
    }
  },

  /**
   * Obtener permisos de un rol
   */
  async obtenerPermisosDeRol(rolId) {
    try {
      const { data, error } = await supabase
        .from('roles_permisos')
        .select(`
          permiso_id,
          permisos (
            id,
            nombre,
            descripcion,
            categoria
          )
        `)
        .eq('rol_id', rolId);

      if (error) throw error;
      return data.map(rp => rp.permisos);
    } catch (error) {
      console.error('[RolesService] Error al obtener permisos del rol:', error);
      throw new Error('Error al obtener permisos del rol: ' + error.message);
    }
  }
};

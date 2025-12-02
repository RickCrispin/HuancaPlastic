import { supabase } from './supabase';

/**
 * SERVICIO DE ROLES Y PERMISOS
 * Gestiona todas las operaciones relacionadas con roles, permisos y sus relaciones
 */

// ========================================
// ROLES - Operaciones CRUD
// ========================================

const rolesService = {
  /**
   * Obtener todos los roles con sus permisos asociados
   */
  async obtenerRolesConPermisos() {
    try {
      // Obtener todos los roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('id, nombre, descripcion, es_predeterminado, activo')
        .order('nombre');

      if (rolesError) throw rolesError;
      if (!rolesData || rolesData.length === 0) {
        console.warn('No se encontraron roles en la base de datos');
        return [];
      }

      // Para cada rol, obtener sus permisos
      const rolesConPermisos = await Promise.all(
        rolesData.map(async (rol) => {
          try {
            const { data: permisosData } = await supabase
              .from('roles_permisos')
              .select('permiso_id')
              .eq('rol_id', rol.id);

            // Mapear el nombre del rol
            return {
              id: rol.id,
              rol_nombre: rol.nombre, // nombre del rol
              nombre: rol.nombre,
              descripcion: rol.descripcion,
              es_predeterminado: rol.es_predeterminado,
              activo: rol.activo,
              permisos: permisosData || []
            };
          } catch (err) {
            console.error(`Error al obtener permisos para rol ${rol.nombre}:`, err);
            return {
              ...rol,
              rol_nombre: rol.nombre,
              permisos: []
            };
          }
        })
      );

      return rolesConPermisos;
    } catch (error) {
      console.error('Error al obtener roles con permisos:', error);
      throw error;
    }
  },

  /**
   * Obtener un rol específico con sus permisos
   */
  async obtenerRol(rolId) {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          id,
          nombre,
          descripcion,
          es_predeterminado,
          activo,
          roles_permisos(
            permiso_id,
            permisos:permiso_id(id, nombre, descripcion, categoria)
          )
        `)
        .eq('id', rolId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener rol:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo rol personalizado
   */
  async crearRol(nombre, descripcion = '') {
    try {
      // Validar que no sea un rol predeterminado
      if (nombre.toLowerCase() === 'admin' || nombre.toLowerCase() === 'user') {
        throw new Error('No se pueden crear roles con nombres reservados (admin, user)');
      }

      const { data, error } = await supabase
        .from('roles')
        .insert([
          {
            nombre: nombre.toLowerCase().trim(),
            descripcion,
            es_predeterminado: false,
            activo: true
          }
        ])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Rol creado:', data.nombre);
      return data;
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  },

  /**
   * Editar un rol existente
   */
  async editarRol(rolId, datos) {
    try {
      // No permitir editar roles predeterminados (solo descripción)
      const { data: rolActual, error: errorConsulta } = await supabase
        .from('roles')
        .select('es_predeterminado')
        .eq('id', rolId)
        .single();

      if (errorConsulta) throw errorConsulta;

      if (rolActual.es_predeterminado && datos.nombre) {
        throw new Error('No se puede cambiar el nombre de roles predeterminados');
      }

      const datosActualizados = {
        ...datos,
        ...(datos.nombre && { nombre: datos.nombre.toLowerCase().trim() })
      };

      const { data, error } = await supabase
        .from('roles')
        .update(datosActualizados)
        .eq('id', rolId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Rol actualizado:', data.nombre);
      return data;
    } catch (error) {
      console.error('Error al editar rol:', error);
      throw error;
    }
  },

  /**
   * Eliminar un rol personalizado (no permite eliminar predeterminados)
   */
  async eliminarRol(rolId) {
    try {
      const { data: rol, error: errorConsulta } = await supabase
        .from('roles')
        .select('es_predeterminado, nombre')
        .eq('id', rolId)
        .single();

      if (errorConsulta) throw errorConsulta;

      if (rol.es_predeterminado) {
        throw new Error('No se pueden eliminar roles predeterminados');
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', rolId);

      if (error) throw error;
      console.log('✅ Rol eliminado:', rol.nombre);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      throw error;
    }
  },

  // ========================================
  // PERMISOS - Operaciones
  // ========================================

  /**
   * Obtener todos los permisos disponibles
   */
  async obtenerPermisos(categoria = null) {
    try {
      let query = supabase.from('permisos').select('*').eq('activo', true);

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query.order('categoria').order('nombre');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener permisos:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías de permisos
   */
  async obtenerCategoriasPermisos() {
    try {
      const { data, error } = await supabase
        .from('permisos')
        .select('DISTINCT categoria')
        .eq('activo', true);

      if (error) throw error;
      return data
        .map(item => item.categoria)
        .filter(cat => cat !== null)
        .sort();
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  // ========================================
  // ROLES_PERMISOS - Gestión de relaciones
  // ========================================

  /**
   * Asignar un permiso a un rol
   */
  async asignarPermisoARol(rolId, permisoId) {
    try {
      const { data, error } = await supabase
        .from('roles_permisos')
        .insert([{ rol_id: rolId, permiso_id: permisoId }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - el permiso ya está asignado
          console.warn('El permiso ya está asignado a este rol');
          return { success: true, mensaje: 'El permiso ya estaba asignado' };
        }
        throw error;
      }

      console.log('✅ Permiso asignado al rol');
      return { success: true, data };
    } catch (error) {
      console.error('Error al asignar permiso:', error);
      throw error;
    }
  },

  /**
   * Remover un permiso de un rol
   */
  async removerPermisoDeRol(rolId, permisoId) {
    try {
      const { error } = await supabase
        .from('roles_permisos')
        .delete()
        .eq('rol_id', rolId)
        .eq('permiso_id', permisoId);

      if (error) throw error;
      console.log('✅ Permiso removido del rol');
      return { success: true };
    } catch (error) {
      console.error('Error al remover permiso:', error);
      throw error;
    }
  },

  /**
   * Asignar múltiples permisos a un rol (reemplaza los existentes)
   */
  async asignarPermisosARol(rolId, permisoIds) {
    try {
      // Primero, eliminar todos los permisos actuales del rol
      const { error: errorDelete } = await supabase
        .from('roles_permisos')
        .delete()
        .eq('rol_id', rolId);

      if (errorDelete) throw errorDelete;

      // Luego, insertar los nuevos permisos
      if (permisoIds.length > 0) {
        const registros = permisoIds.map(permisoId => ({
          rol_id: rolId,
          permiso_id: permisoId
        }));

        const { error: errorInsert } = await supabase
          .from('roles_permisos')
          .insert(registros);

        if (errorInsert) throw errorInsert;
      }

      console.log(`✅ ${permisoIds.length} permisos asignados al rol`);
      return { success: true, cantidad: permisoIds.length };
    } catch (error) {
      console.error('Error al asignar múltiples permisos:', error);
      throw error;
    }
  },

  /**
   * Obtener permisos de un rol específico
   */
  async obtenerPermisosDelRol(rolId) {
    try {
      const { data, error } = await supabase
        .from('roles_permisos')
        .select('permiso_id, permisos:permiso_id(id, nombre, descripcion, categoria)')
        .eq('rol_id', rolId);

      if (error) throw error;
      return data.map(rp => rp.permisos) || [];
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      throw error;
    }
  },

  // ========================================
  // USUARIOS - Asignación de Roles
  // ========================================

  /**
   * Asignar un rol a un usuario
   */
  async asignarRolAUsuario(usuarioId, rolId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ rol_id: rolId })
        .eq('id', usuarioId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Rol asignado al usuario');
      return data;
    } catch (error) {
      console.error('Error al asignar rol al usuario:', error);
      throw error;
    }
  },

  /**
   * Obtener usuarios con sus roles y permisos
   */
  async obtenerUsuariosConPermisos() {
    try {
      const { data, error } = await supabase
        .from('v_usuarios_con_permisos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener usuarios con permisos:', error);
      throw error;
    }
  },

  /**
   * Obtener permisos de un usuario específico
   */
  async obtenerPermisosDelUsuario(usuarioId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre_completo,
          email,
          rol_id,
          roles:rol_id(
            id,
            nombre,
            roles_permisos(
              permiso_id,
              permisos:permiso_id(id, nombre, descripcion, categoria)
            )
          )
        `)
        .eq('id', usuarioId)
        .single();

      if (error) throw error;

      // Extraer permisos de la relación
      const permisos = data.roles?.roles_permisos?.map(rp => rp.permisos) || [];
      
      return {
        ...data,
        permisos
      };
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      throw error;
    }
  },

  /**
   * Verificar si un usuario tiene un permiso específico (usa función SQL)
   */
  async usuarioTienePermiso(usuarioId, permisoNombre) {
    try {
      const { data, error } = await supabase
        .rpc('usuario_tiene_permiso', {
          p_usuario_id: usuarioId,
          p_permiso_nombre: permisoNombre
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al verificar permiso:', error);
      throw error;
    }
  }
};

export default rolesService;

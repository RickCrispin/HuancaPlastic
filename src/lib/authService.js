import { supabase } from './supabase';
import { profileService } from './profileService';
import bcrypt from 'bcryptjs';

// Función para hacer hash de contraseña
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error al hacer hash:', error);
    return password; // Fallback
  }
};

// Función para verificar contraseña
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error al comparar:', error);
    return password === hash; // Fallback
  }
};

export const authService = {
  // Registrar nuevo usuario
  async register(email, password, nombreCompleto, telefono, ciudad, pais, bio) {
    try {
      // Validaciones básicas
      if (!email || !password || !nombreCompleto) {
        throw new Error('Email, contraseña y nombre son requeridos');
      }

      // Hash de contraseña
      const passwordHash = await hashPassword(password);

      // Obtener el id del rol 'user' (crear si no existe)
      let rolId = null;
      try {
        const { data: rolRow, error: rolError } = await supabase
          .from('roles')
          .select('id, nombre')
          .eq('nombre', 'user')
          .single();

        if (rolError || !rolRow) {
          // Intentar crear el rol 'user' si no existe
          const { data: nuevoRol, error: nuevoRolError } = await supabase
            .from('roles')
            .insert([{ nombre: 'user', descripcion: 'Usuario cliente' }])
            .select()
            .single();

          if (nuevoRolError || !nuevoRol) {
            console.error('Error obteniendo/creando rol user:', rolError || nuevoRolError);
            rolId = null; // Permitir continuar sin rol
          } else {
            rolId = nuevoRol.id;
            console.log('✅ Rol user creado:', rolId);
          }
        } else {
          rolId = rolRow.id;
          console.log('✅ Rol user obtenido:', rolId);
        }
      } catch (err) {
        console.warn('Error consultando/creando rol:', err);
        rolId = null; // Permitir continuar sin rol
      }

      // Crear usuario en tabla usuarios con rol_id por defecto
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert([{
          email,
          password_hash: passwordHash,
          nombre_completo: nombreCompleto,
          telefono: telefono || null,
          rol_id: rolId,
          estado: 'activo'
        }])
        .select()
        .single();

      if (usuarioError) {
        console.error('Error al crear usuario:', usuarioError);
        throw new Error(usuarioError.message || 'Error al crear usuario');
      }

      if (!usuario) {
        throw new Error('No se pudo crear el usuario');
      }

      console.log('✅ Usuario creado:', usuario.id);

      // Crear perfil del usuario en perfiles_usuarios
      let perfil = null;
      try {
        perfil = await profileService.crearPerfil(usuario.id, {
          ciudad: ciudad || null,
          pais: pais || 'Perú',
          bio: bio || null
        });
        console.log('✅ Perfil creado');
      } catch (perfilCreateError) {
        console.error('Error al crear perfil:', perfilCreateError);

        // Intentar rollback: eliminar el usuario ya insertado
        try {
          await supabase
            .from('usuarios')
            .delete()
            .eq('id', usuario.id);
          console.log('✅ Rollback - Usuario eliminado');
        } catch (delError) {
          console.error('Error al eliminar usuario tras fallo de perfil:', delError);
        }

        throw new Error(perfilCreateError.message || 'Error al crear perfil; registro cancelado');
      }

      // Obtener rol nombre
      const rolNombre = 'user';

      console.log('✅ Usuario registrado exitosamente:', usuario.email);

      // Preparar objeto usuario para localStorage
      const usuarioConDatos = {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        telefono: usuario.telefono || null,
        estado: usuario.estado,
        rol_id: usuario.rol_id,
        rol: rolNombre,
        permisos: [],
        foto_perfil: perfil?.foto_perfil || null,
        created_at: usuario.created_at
      };

      // Guardar en localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioConDatos));
      if (perfil) localStorage.setItem('perfil', JSON.stringify(perfil));

      return { success: true, usuario: usuarioConDatos };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message || 'Error al registrar' };
    }
  },

  // Login
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Buscar usuario - intentar primero sin relación, luego agregar rol si existe
      let usuario = null;
      let usuarioError = null;

      // Intento 1: Consulta simple sin relación
      const { data: usuarioSimple, error: errorSimple } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (errorSimple) {
        console.error('Error al buscar usuario:', errorSimple);
        throw new Error('Usuario no encontrado');
      }

      usuario = usuarioSimple;
      console.log('✅ Usuario encontrado:', usuario.email);
      console.log('🔍 Campos del usuario:', Object.keys(usuario));

      // Verificar contraseña
      const passwordValida = await comparePassword(password, usuario.password_hash);

      if (!passwordValida) {
        throw new Error('Contraseña incorrecta');
      }

      console.log('✅ Contraseña válida');

      // Actualizar último login
      try {
        await supabase
          .from('usuarios')
          .update({ ultimo_login: new Date().toISOString() })
          .eq('id', usuario.id);
      } catch (updateError) {
        console.warn('Error al actualizar último login:', updateError);
      }

      // Obtener rol si existe rol_id
      let rolNombre = 'user';
      if (usuario.rol_id) {
        try {
          const { data: rol, error: rolError } = await supabase
            .from('roles')
            .select('nombre')
            .eq('id', usuario.rol_id)
            .single();

          if (!rolError && rol) {
            rolNombre = rol.nombre;
            console.log('✅ Rol obtenido:', rolNombre);
          }
        } catch (err) {
          console.warn('Error al obtener rol:', err);
        }
      }

      // Obtener perfil
      let perfil = null;
      try {
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfiles_usuarios')
          .select('*')
          .eq('usuario_id', usuario.id)
          .single();

        if (!perfilError && perfilData) {
          perfil = perfilData;
          console.log('✅ Perfil obtenido');
        }
      } catch (err) {
        console.warn('Error al cargar perfil:', err);
      }

      // Obtener permisos si existen
      let permisos = [];
      try {
        const { data: permisosData, error: permisosError } = await supabase
          .from('roles_permisos')
          .select('permisos:permiso_id(nombre)')
          .eq('rol_id', usuario.rol_id);

        if (!permisosError && permisosData) {
          permisos = permisosData.map(p => p.permisos?.nombre).filter(Boolean);
          console.log('✅ Permisos obtenidos:', permisos.length);
        }
      } catch (err) {
        console.warn('Error al cargar permisos:', err);
      }

      console.log('✅ Login exitoso. Usuario:', usuario.email, '| Rol:', rolNombre);

      // Preparar objeto usuario para localStorage
      const usuarioConDatos = {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        telefono: usuario.telefono || null,
        estado: usuario.estado,
        rol_id: usuario.rol_id,
        rol: rolNombre,
        permisos: permisos,
        foto_perfil: perfil?.foto_perfil || null,
        created_at: usuario.created_at
      };

      // Guardar en localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioConDatos));
      if (perfil) localStorage.setItem('perfil', JSON.stringify(perfil));

      return { success: true, usuario: usuarioConDatos, perfil, permisos };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message || 'Error al iniciar sesión' };
    }
  },

  // Logout
  logout() {
    try {
      // Limpiar todos los datos de sesión
      localStorage.removeItem('usuario');
      localStorage.removeItem('perfil');
      localStorage.removeItem('carrito');
      localStorage.removeItem('token');
      
      // Limpiar variables de sesión si existen
      sessionStorage.removeItem('usuario');
      sessionStorage.removeItem('perfil');
      
      console.log('✅ Sesión cerrada correctamente');
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener usuario actual
  getUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Verificar si está autenticado
  estaAutenticado() {
    return !!this.getUsuarioActual();
  },

  // Verificar si es admin
  esAdmin() {
    const usuario = this.getUsuarioActual();
    return usuario?.rol === 'admin';
  }
};

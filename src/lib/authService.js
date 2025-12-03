import { supabase } from './supabase';
import { profileService } from './profileService';
import { sessionService } from './sessionService';
import bcrypt from 'bcryptjs';

// Función para hacer hash de contraseña
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Error al hacer hash:', error);
    return password;
  }
};

// Función para verificar contraseña
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error al comparar:', error);
    return password === hash;
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

      // Crear sesión segura
      await sessionService.cerrarTodasLasSesiones(usuario.id);
      const sesionResultado = await sessionService.crearSesion(usuario.id);
      
      if (!sesionResultado.success) {
        throw new Error('Error al crear sesión inicial');
      }

      // Preparar objeto usuario (NO guardarlo en localStorage)
      const usuarioCompleto = {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        telefono: usuario.telefono || null,
        estado: usuario.estado,
        rol: 'user',
        foto_perfil: perfil?.foto_perfil || null,
        created_at: usuario.created_at
      };

      return { 
        success: true, 
        usuario: usuarioCompleto,
        token: sesionResultado.token
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message || 'Error al registrar' };
    }
  },

  // Login con sesión segura
  async login(email, password) {
    try {
      console.log('🔐 Iniciando login para:', email);

      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Buscar usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (usuarioError || !usuario) {
        console.error('❌ Usuario no encontrado');
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Verificar contraseña
      const passwordValida = await comparePassword(password, usuario.password_hash);
      if (!passwordValida) {
        console.error('❌ Contraseña incorrecta');
        throw new Error('Usuario o contraseña incorrectos');
      }

      console.log('✅ Credenciales válidas');

      // Cerrar sesiones antiguas del usuario
      await sessionService.cerrarTodasLasSesiones(usuario.id);

      // Crear nueva sesión
      const sesionResultado = await sessionService.crearSesion(usuario.id);
      if (!sesionResultado.success) {
        throw new Error('Error al crear sesión');
      }

      console.log('✅ Sesión creada');

      // Actualizar último login
      await supabase
        .from('usuarios')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', usuario.id);

      // Obtener perfil
      const { data: perfil } = await supabase
        .from('perfiles_usuarios')
        .select('*')
        .eq('usuario_id', usuario.id)
        .single();

      // Preparar objeto usuario (NO guardarlo en localStorage)
      const usuarioCompleto = {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        telefono: usuario.telefono,
        rol: usuario.rol || 'user',
        estado: usuario.estado,
        foto_perfil: perfil?.foto_perfil || null,
        created_at: usuario.created_at
      };

      console.log('✅ Login exitoso:', usuario.email);

      return { 
        success: true, 
        usuario: usuarioCompleto,
        token: sesionResultado.token
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout con cierre de sesión en BD
  async logout() {
    try {
      // Obtener token de sesión
      const token = sessionStorage.getItem('token_sesion');
      
      if (token) {
        // Cerrar sesión en base de datos
        await sessionService.cerrarSesion(token);
      }
      
      // Limpiar todos los datos de sesión (sessionService ya limpia sessionStorage)
      localStorage.removeItem('usuario');
      localStorage.removeItem('perfil');
      localStorage.removeItem('carrito');
      localStorage.removeItem('token');
      
      console.log('✅ Sesión cerrada correctamente');
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener usuario actual desde sesión segura
  async getUsuarioActual() {
    try {
      // Obtener token de sesión
      const token = sessionStorage.getItem('token_sesion');
      if (!token) {
        return null;
      }

      // Validar sesión en base de datos
      const sesionValida = await sessionService.validarSesion(token);
      if (!sesionValida) {
        // Sesión expirada o inválida
        sessionStorage.removeItem('token_sesion');
        sessionStorage.removeItem('usuario_id');
        return null;
      }

      // Obtener ID de usuario
      const usuarioId = sessionStorage.getItem('usuario_id');
      if (!usuarioId) {
        return null;
      }

      // Consultar datos actuales del usuario
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, email, nombre_completo, telefono, rol, estado, created_at')
        .eq('id', usuarioId)
        .single();

      if (error || !usuario) {
        return null;
      }

      // Obtener perfil
      const { data: perfil } = await supabase
        .from('perfiles_usuarios')
        .select('foto_perfil')
        .eq('usuario_id', usuario.id)
        .single();

      return {
        ...usuario,
        foto_perfil: perfil?.foto_perfil || null
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  },

  // Verificar si está autenticado
  async estaAutenticado() {
    return await sessionService.haySesionActiva();
  },

  // Verificar si es admin
  async esAdmin() {
    const usuario = await this.getUsuarioActual();
    return usuario?.rol === 'admin';
  }
};

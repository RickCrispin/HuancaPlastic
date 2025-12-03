/**
 * Authentication Service
 * Handles user registration, login, logout and session management
 */

import supabase from '../../config/supabase';
import { profileService } from '../data/profile.service';
import { sessionService } from './session.service';
import bcrypt from 'bcryptjs';

const HASH_ROUNDS = 10;

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(HASH_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('[Auth] Error hashing password:', error);
    throw new Error('Password encryption failed');
  }
};

const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('[Auth] Error comparing password:', error);
    return false;
  }
};

export const authService = {
  async register(email, password, nombreCompleto, telefono = null, perfilData = {}, crearSesion = true) {
    try {
      if (!email || !password || !nombreCompleto) {
        throw new Error('Email, password and full name are required');
      }

      const passwordHash = await hashPassword(password);

      // Obtener el rol_id de "cliente" (intentar obtener, si no existe, usar null)
      let rolClienteId = null;
      try {
        const { data: rolCliente, error: rolError } = await supabase
          .from('roles')
          .select('id')
          .eq('nombre', 'cliente')
          .maybeSingle();

        if (rolCliente) {
          rolClienteId = rolCliente.id;
          console.log('[Auth] Cliente role found:', rolClienteId);
        } else {
          console.warn('[Auth] Cliente role not found in roles table, using null');
        }
      } catch (rolError) {
        console.warn('[Auth] Error finding cliente role, continuing with null:', rolError);
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert([{
          email,
          password_hash: passwordHash,
          nombre_completo: nombreCompleto,
          telefono,
          rol: 'cliente',
          rol_id: rolClienteId,
          estado: 'activo'
        }])
        .select()
        .single();

      if (usuarioError) {
        console.error('[Auth] User creation error:', usuarioError);
        throw new Error(usuarioError.message || 'User creation failed');
      }

      if (!usuario) {
        throw new Error('User creation failed');
      }

      console.log('[Auth] User created:', usuario.id);

      // Crear perfil con TODOS los datos proporcionados
      let perfil = null;
      try {
        const perfilCompleto = {
          foto_perfil: perfilData.foto_perfil || null,
          genero: perfilData.genero || null,
          fecha_nacimiento: perfilData.fecha_nacimiento || null,
          empresa: perfilData.empresa || null,
          documento_identidad: perfilData.documento_identidad || null,
          ciudad: perfilData.ciudad || null,
          pais: perfilData.pais || 'Perú',
          bio: perfilData.bio || null,
          preferencias_notificaciones: perfilData.preferencias_notificaciones || {
            email: true,
            push: true,
            marketing: false,
            ordenes: true,
            promociones: true
          }
        };

        perfil = await profileService.crearPerfil(usuario.id, perfilCompleto);
        console.log('[Auth] Complete profile created with all fields');
      } catch (perfilError) {
        console.error('[Auth] Profile creation error:', perfilError);
        
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', usuario.id);
        
        console.log('[Auth] Rollback completed');
        throw new Error(perfilError.message || 'Profile creation failed');
      }

      // Solo crear sesión si se solicita (para registro público)
      let sesion = null;
      if (crearSesion) {
        await sessionService.cerrarTodasLasSesiones(usuario.id);
        const sesionResultado = await sessionService.crearSesion(usuario.id);
        
        if (!sesionResultado.success) {
          throw new Error('Session creation failed');
        }
        
        sesion = sesionResultado.sesion;
      }

      const usuarioCompleto = {
        id: usuario.id,
        email: usuario.email,
        nombre_completo: usuario.nombre_completo,
        telefono: usuario.telefono,
        estado: usuario.estado,
        rol: 'cliente',
        foto_perfil: perfil?.foto_perfil || null,
        created_at: usuario.created_at
      };

      console.log('[Auth] Registration successful:', usuario.email);

      return { 
        success: true, 
        usuario: usuarioCompleto,
        token: sesion?.token || null,
        sesionCreada: crearSesion
      };
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  async login(email, password) {
    try {
      console.log('[Auth] Login attempt for:', email);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (usuarioError || !usuario) {
        console.error('[Auth] User not found');
        throw new Error('Invalid email or password');
      }

      const passwordValida = await comparePassword(password, usuario.password_hash);
      if (!passwordValida) {
        console.error('[Auth] Invalid password');
        throw new Error('Invalid email or password');
      }

      console.log('[Auth] Valid credentials');

      await sessionService.cerrarTodasLasSesiones(usuario.id);

      const sesionResultado = await sessionService.crearSesion(usuario.id);
      if (!sesionResultado.success) {
        throw new Error('Session creation failed');
      }

      console.log('[Auth] Session created');

      await supabase
        .from('usuarios')
        .update({ ultimo_login: new Date().toISOString() })
        .eq('id', usuario.id);

      const { data: perfil } = await supabase
        .from('perfiles_usuarios')
        .select('*')
        .eq('usuario_id', usuario.id)
        .single();

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

      console.log('[Auth] Login successful:', usuario.email);

      return { 
        success: true, 
        usuario: usuarioCompleto,
        token: sesionResultado.token
      };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: error.message };
    }
  },

  async logout() {
    try {
      const token = sessionStorage.getItem('token_sesion');
      const usuarioId = sessionStorage.getItem('usuario_id');
      
      if (token) {
        await sessionService.cerrarSesion(token);
      }

      // Register last logout timestamp
      if (usuarioId) {
        await supabase
          .from('usuarios')
          .update({ ultimo_logout: new Date().toISOString() })
          .eq('id', usuarioId);
      }
      
      localStorage.removeItem('usuario');
      localStorage.removeItem('perfil');
      localStorage.removeItem('carrito');
      localStorage.removeItem('token');
      
      console.log('[Auth] Logout successful');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  async getUsuarioActual() {
    try {
      const token = sessionStorage.getItem('token_sesion');
      if (!token) {
        return null;
      }

      const sesionValida = await sessionService.validarSesion(token);
      if (!sesionValida) {
        sessionStorage.removeItem('token_sesion');
        sessionStorage.removeItem('usuario_id');
        return null;
      }

      const usuarioId = sessionStorage.getItem('usuario_id');
      if (!usuarioId) {
        return null;
      }

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, email, nombre_completo, telefono, rol, estado, created_at')
        .eq('id', usuarioId)
        .single();

      if (error || !usuario) {
        return null;
      }

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
      console.error('[Auth] Get current user error:', error);
      return null;
    }
  },

  async estaAutenticado() {
    return await sessionService.haySesionActiva();
  },

  async esAdmin() {
    const usuario = await this.getUsuarioActual();
    return usuario?.rol === 'admin';
  }
};

export default authService;

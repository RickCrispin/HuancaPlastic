import { supabase } from './supabase';
import crypto from 'crypto-js';

// Configuración de sesiones
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

export const sessionService = {
  /**
   * Genera un token seguro único
   */
  generarToken() {
    const timestamp = Date.now();
    const random = crypto.lib.WordArray.random(32).toString();
    return crypto.SHA256(`${timestamp}-${random}`).toString();
  },

  /**
   * Crea una nueva sesión en la BD
   */
  async crearSesion(usuarioId) {
    try {
      const token = this.generarToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION);
      
      // Obtener información del navegador
      const userAgent = navigator.userAgent;
      const ipAddress = await this.obtenerIP();

      const { data, error } = await supabase
        .from('sesiones')
        .insert([{
          usuario_id: usuarioId,
          token,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
          activa: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Guardar token en sessionStorage (se borra al cerrar pestaña)
      sessionStorage.setItem('token_sesion', token);
      sessionStorage.setItem('usuario_id', usuarioId);
      sessionStorage.setItem('session_expires', expiresAt.toISOString());
      
      return { success: true, token, data };
    } catch (error) {
      console.error('Error al crear sesión:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Valida si una sesión es válida
   */
  async validarSesion(token) {
    try {
      if (!token) return { valida: false, error: 'No hay token' };

      const { data, error } = await supabase
        .from('sesiones')
        .select('*, usuarios(*)')
        .eq('token', token)
        .eq('activa', true)
        .single();

      if (error || !data) {
        return { valida: false, error: 'Sesión no encontrada' };
      }

      // Verificar expiración
      const ahora = new Date();
      const expira = new Date(data.expires_at);

      if (ahora > expira) {
        await this.cerrarSesion(token);
        return { valida: false, error: 'Sesión expirada' };
      }

      // Actualizar última actividad
      await supabase
        .from('sesiones')
        .update({ last_activity: new Date().toISOString() })
        .eq('token', token);

      return { 
        valida: true, 
        usuario: data.usuarios,
        sesion: data
      };
    } catch (error) {
      console.error('Error al validar sesión:', error);
      return { valida: false, error: error.message };
    }
  },

  /**
   * Cierra una sesión específica
   */
  async cerrarSesion(token) {
    try {
      if (!token) return { success: true };

      const { error } = await supabase
        .from('sesiones')
        .update({ activa: false })
        .eq('token', token);

      if (error) throw error;

      // Limpiar storage
      sessionStorage.removeItem('token_sesion');
      sessionStorage.removeItem('usuario_id');
      sessionStorage.removeItem('session_expires');
      localStorage.removeItem('usuario');
      localStorage.removeItem('perfil');

      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cierra todas las sesiones de un usuario
   */
  async cerrarTodasLasSesiones(usuarioId) {
    try {
      const { error } = await supabase
        .from('sesiones')
        .update({ activa: false })
        .eq('usuario_id', usuarioId);

      if (error) throw error;

      // Actualizar último logout
      await supabase
        .from('usuarios')
        .update({ ultimo_logout: new Date().toISOString() })
        .eq('id', usuarioId);

      return { success: true };
    } catch (error) {
      console.error('Error al cerrar todas las sesiones:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtiene el token de la sesión actual
   */
  obtenerToken() {
    return sessionStorage.getItem('token_sesion');
  },

  /**
   * Verifica si hay una sesión activa
   */
  async haySesionActiva() {
    const token = this.obtenerToken();
    if (!token) return false;

    const resultado = await this.validarSesion(token);
    return resultado.valida;
  },

  /**
   * Limpia sesiones expiradas
   */
  async limpiarSesionesExpiradas() {
    try {
      const { error } = await supabase.rpc('limpiar_sesiones_expiradas');
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error al limpiar sesiones:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Obtiene la IP del cliente (aproximada)
   */
  async obtenerIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  },

  /**
   * Obtiene todas las sesiones activas de un usuario
   */
  async obtenerSesionesActivas(usuarioId) {
    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, sesiones: data || [] };
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      return { success: false, error: error.message, sesiones: [] };
    }
  }
};

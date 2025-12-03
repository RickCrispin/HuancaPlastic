/**
 * Session Service
 * Manages user sessions with database persistence
 */

import supabase from '../../config/supabase';
import crypto from 'crypto-js';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEYS = {
  TOKEN: 'token_sesion',
  USER_ID: 'usuario_id',
  EXPIRES: 'session_expires'
};

export const sessionService = {
  generarToken() {
    const timestamp = Date.now();
    const random = crypto.lib.WordArray.random(32).toString();
    return crypto.SHA256(`${timestamp}-${random}`).toString();
  },

  async crearSesion(usuarioId) {
    try {
      const token = this.generarToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      
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

      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
      sessionStorage.setItem(STORAGE_KEYS.USER_ID, usuarioId);
      sessionStorage.setItem(STORAGE_KEYS.EXPIRES, expiresAt.toISOString());
      
      console.log('[Session] Session created for user:', usuarioId);
      
      return { success: true, token, data };
    } catch (error) {
      console.error('[Session] Create session error:', error);
      return { success: false, error: error.message };
    }
  },

  async validarSesion(token) {
    try {
      if (!token) {
        return { valida: false, error: 'No token provided' };
      }

      const { data, error } = await supabase
        .from('sesiones')
        .select('*, usuarios(*)')
        .eq('token', token)
        .eq('activa', true)
        .single();

      if (error || !data) {
        return { valida: false, error: 'Session not found' };
      }

      const ahora = new Date();
      const expira = new Date(data.expires_at);

      if (ahora > expira) {
        await this.cerrarSesion(token);
        return { valida: false, error: 'Session expired' };
      }

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
      console.error('[Session] Validation error:', error);
      return { valida: false, error: error.message };
    }
  },

  async cerrarSesion(token) {
    try {
      if (!token) return { success: true };

      const { error } = await supabase
        .from('sesiones')
        .update({ activa: false })
        .eq('token', token);

      if (error) throw error;

      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
      sessionStorage.removeItem(STORAGE_KEYS.EXPIRES);
      localStorage.removeItem('usuario');
      localStorage.removeItem('perfil');

      console.log('[Session] Session closed');

      return { success: true };
    } catch (error) {
      console.error('[Session] Close session error:', error);
      return { success: false, error: error.message };
    }
  },

  async cerrarTodasLasSesiones(usuarioId) {
    try {
      const { error } = await supabase
        .from('sesiones')
        .update({ activa: false })
        .eq('usuario_id', usuarioId);

      if (error) throw error;

      await supabase
        .from('usuarios')
        .update({ ultimo_logout: new Date().toISOString() })
        .eq('id', usuarioId);

      console.log('[Session] All sessions closed for user:', usuarioId);

      return { success: true };
    } catch (error) {
      console.error('[Session] Close all sessions error:', error);
      return { success: false, error: error.message };
    }
  },

  obtenerToken() {
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  async haySesionActiva() {
    const token = this.obtenerToken();
    if (!token) return false;

    const resultado = await this.validarSesion(token);
    return resultado.valida;
  },

  async limpiarSesionesExpiradas() {
    try {
      const { error } = await supabase.rpc('limpiar_sesiones_expiradas');
      if (error) throw error;
      
      console.log('[Session] Expired sessions cleaned');
      
      return { success: true };
    } catch (error) {
      console.error('[Session] Clean expired sessions error:', error);
      return { success: false, error: error.message };
    }
  },

  async obtenerIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('[Session] IP fetch failed:', error);
      return null;
    }
  },

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
      console.error('[Session] Get active sessions error:', error);
      return { success: false, error: error.message, sesiones: [] };
    }
  }
};

export default sessionService;

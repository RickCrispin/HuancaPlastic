import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../lib/authService';

export const AuthContext = createContext();

// Configuración de timeouts (en milisegundos)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
const WARNING_BEFORE_LOGOUT = 2 * 60 * 1000; // Mostrar advertencia 2 minutos antes

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  
  const inactivityTimeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const countdownIntervalRef = useRef(null);

  // Cargar usuario al iniciar
  useEffect(() => {
    try {
      console.log('🔍 AuthProvider inicializando...');
      const usuarioActual = authService.getUsuarioActual();
      console.log('🔍 Cargando usuario en AuthContext:', usuarioActual?.email, 'Rol:', usuarioActual?.rol);
      if (usuarioActual) {
        setUsuario(usuarioActual);
        // Verificar si es admin comparando el campo 'rol' (ya normalizado en authService)
        const isAdmin = usuarioActual?.rol === 'admin';
        setEsAdmin(isAdmin);
        console.log('👤 Usuario establecido. ¿Es admin?', isAdmin, '| Rol:', usuarioActual?.rol);
      }
      setCargando(false);
      console.log('✅ AuthProvider listo');
    } catch (error) {
      console.error('❌ Error en AuthProvider:', error);
      setCargando(false);
    }
  }, []);

  // Inicializar detector de inactividad cuando usuario cambia
  useEffect(() => {
    if (!usuario) return;

    const resetearInactividad = () => {
      lastActivityRef.current = Date.now();

      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      warningTimeoutRef.current = setTimeout(() => {
        setMostrarAdvertencia(true);
        setTiempoRestante(WARNING_BEFORE_LOGOUT / 1000);

        countdownIntervalRef.current = setInterval(() => {
          setTiempoRestante(prev => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              logoutAutomatico();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

      inactivityTimeoutRef.current = setTimeout(() => {
        logoutAutomatico();
      }, INACTIVITY_TIMEOUT);
    };

    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const manejadorActividad = () => {
      if (!mostrarAdvertencia) {
        resetearInactividad();
      }
    };

    eventos.forEach(evento => {
      window.addEventListener(evento, manejadorActividad);
    });

    resetearInactividad();

    return () => {
      eventos.forEach(evento => {
        window.removeEventListener(evento, manejadorActividad);
      });

      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [usuario, mostrarAdvertencia]);

  // Logout automático
  const logoutAutomatico = () => {
    setMostrarAdvertencia(false);
    logout();
  };

  // Función para login
  const login = async (email, password) => {
    try {
      const resultado = await authService.login(email, password);
      if (resultado.success) {
        console.log('✅ Login exitoso:', resultado.usuario?.email, 'Rol:', resultado.usuario?.rol);
        setUsuario(resultado.usuario);
        setEsAdmin(resultado.usuario?.rol === 'admin');
        setMostrarAdvertencia(false);
        return { success: true, usuario: resultado.usuario };
      } else {
        throw new Error(resultado.error);
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para register
  const register = async (email, password, nombreCompleto, telefono, ciudad, pais, bio) => {
    const resultado = await authService.register(email, password, nombreCompleto, telefono, ciudad, pais, bio);
    if (resultado.success) {
      setUsuario(resultado.usuario);
      setEsAdmin(resultado.usuario?.rol === 'admin');
      setMostrarAdvertencia(false);
    }
    return resultado;
  };

  // Función para logout
  const logout = () => {
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    authService.logout();
    setUsuario(null);
    setEsAdmin(false);
    setMostrarAdvertencia(false);
  };

  // Función para continuar sesión
  const continuarSesion = () => {
    setMostrarAdvertencia(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    lastActivityRef.current = Date.now();
    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
  };

  // Función para verificar si el usuario tiene un permiso específico
  const tienePermiso = (nombrePermiso) => {
    if (!usuario) return false;
    if (usuario?.rol === 'admin') return true; // Admin tiene todos los permisos
    
    // Verificar en el array de permisos del usuario
    if (Array.isArray(usuario?.permisos)) {
      return usuario.permisos.some(p => 
        p?.nombre === nombrePermiso || 
        p === nombrePermiso // En caso de que sea solo string
      );
    }
    return false;
  };

  // Función para obtener permisos del usuario
  const obtenerPermisos = () => {
    if (!usuario) return [];
    return usuario?.permisos || [];
  };

  // Función para actualizar usuario
  const actualizarUsuario = (datosActualizados) => {
    setUsuario(prev => ({
      ...prev,
      ...datosActualizados
    }));
  };

  // Función para limpiar storage (DEBUG)
  const limpiarStorage = () => {
    console.log('🧹 Limpiando localStorage...');
    localStorage.clear();
    sessionStorage.clear();
    setUsuario(null);
    setEsAdmin(false);
    window.location.reload();
  };

  const value = {
    usuario,
    esAdmin,
    cargando,
    login,
    register,
    logout,
    continuarSesion,
    actualizarUsuario,
    limpiarStorage,
    estaAutenticado: !!usuario,
    mostrarAdvertencia,
    tiempoRestante,
    tienePermiso,
    obtenerPermisos
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

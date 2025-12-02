import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para detectar inactividad del usuario
 * @param {number} timeoutMs - Tiempo en milisegundos antes de ejecutar callback (por defecto 15 minutos)
 * @param {function} onTimeout - Función a ejecutar cuando se detecta inactividad
 * @param {boolean} enabled - Habilitar/deshabilitar el detector
 */
export const useInactivityTimeout = (timeoutMs = 15 * 60 * 1000, onTimeout = () => {}, enabled = true) => {
  const timeoutIdRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimeout = useCallback(() => {
    if (!enabled) return;

    // Limpiar timeout anterior
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Actualizar última actividad
    lastActivityRef.current = Date.now();

    // Establecer nuevo timeout
    timeoutIdRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  }, [timeoutMs, onTimeout, enabled]);

  // Detectar actividad del usuario
  useEffect(() => {
    if (!enabled) return;

    // Inicializar timeout
    resetTimeout();

    // Eventos a monitorear
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimeout();
    };

    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Limpiar listeners
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [enabled, resetTimeout]);

  return {
    getLastActivityTime: () => lastActivityRef.current,
    getInactiveSeconds: () => Math.round((Date.now() - lastActivityRef.current) / 1000),
    resetActivity: resetTimeout
  };
};

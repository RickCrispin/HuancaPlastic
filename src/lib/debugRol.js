/**
 * Script de diagnóstico para verificar el rol del usuario
 * Copia y pega esto en la consola del navegador para diagnosticar problemas de rol
 * 
 * window.debugRol = (() => { ... }); 
 * Luego ejecuta: window.debugRol()
 */

export const debugRol = () => {
  console.clear();
  console.log('%c🔍 DIAGNÓSTICO DE ROL', 'font-size: 16px; font-weight: bold; color: #2563eb');
  
  // 1. Verificar localStorage
  console.log('\n--- PASO 1: localStorage ---');
  const usuarioLocal = localStorage.getItem('usuario');
  if (usuarioLocal) {
    try {
      const u = JSON.parse(usuarioLocal);
      console.log('✓ Usuario en localStorage:', {
        email: u.email,
        rol: u.rol,
        rol_id: u.rol_id,
        tipo_rol: typeof u.rol
      });
    } catch (e) {
      console.error('✗ Error parseando usuario de localStorage:', e);
    }
  } else {
    console.warn('✗ No hay usuario en localStorage');
  }

  // 2. Verificar authService
  console.log('\n--- PASO 2: authService ---');
  try {
    const { authService } = require('./authService');
    const usuario = authService.getUsuarioActual();
    if (usuario) {
      console.log('✓ Usuario desde authService.getUsuarioActual():', {
        email: usuario.email,
        rol: usuario.rol,
        tipo_rol: typeof usuario.rol
      });
      console.log('✓ esAdmin():', authService.esAdmin());
      console.log('✓ estaAutenticado():', authService.estaAutenticado());
    } else {
      console.warn('✗ No hay usuario en authService');
    }
  } catch (e) {
    console.error('✗ Error accediendo authService:', e);
  }

  // 3. Verificar AuthContext
  console.log('\n--- PASO 3: AuthContext (desde React) ---');
  console.log('Abre React DevTools -> Components -> AuthProvider y verifica el estado "esAdmin"');
  console.log('Si esAdmin = false pero usuario.rol = "admin", hay un problema de sincronización');

  // 4. Recomendaciones
  console.log('\n--- RECOMENDACIONES ---');
  const usuarioObj = usuarioLocal ? JSON.parse(usuarioLocal) : null;
  if (usuarioObj) {
    if (usuarioObj.rol === 'admin') {
      console.log('✓ El rol es "admin" correctamente en localStorage');
      console.log('→ Si aún no se reconoce como admin en la UI, revisa AuthContext');
    } else if (usuarioObj.rol === 'user') {
      console.log('⚠️ El rol es "user" en localStorage');
      console.log('→ Verifica en Supabase que el usuario tenga rol_id = admin_id');
    } else if (typeof usuarioObj.rol === 'object') {
      console.log('✗ El rol es un OBJETO, no un string:', usuarioObj.rol);
      console.log('→ La normalización no se ejecutó correctamente');
    } else {
      console.log('❓ Rol desconocido:', usuarioObj.rol);
    }
  }

  console.log('\n--- FIN DIAGNÓSTICO ---\n');
};

// Exportar para usar en consola
if (typeof window !== 'undefined') {
  window.debugRol = debugRol;
}

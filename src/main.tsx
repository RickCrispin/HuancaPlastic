import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Función de debug expuesta en consola
if (typeof window !== 'undefined') {
  (window as any).debugRol = () => {
    console.clear();
    console.log('%c🔍 DIAGNÓSTICO DE ROL', 'font-size: 16px; font-weight: bold; color: #2563eb');
    
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
        if (typeof u.rol === 'object') {
          console.error('✗ PROBLEMA: rol es un OBJETO, no string:', u.rol);
        }
      } catch (e) {
        console.error('✗ Error parseando usuario:', e);
      }
    }
  };
  console.log('💡 Ejecuta window.debugRol() en consola para diagnosticar rol');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

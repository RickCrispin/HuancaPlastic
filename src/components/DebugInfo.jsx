import React from 'react';
import { useAuth } from '../context/AuthContext';

export const DebugInfo = () => {
  const { usuario, esAdmin, cargando, limpiarStorage } = useAuth();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#1f2937',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      fontFamily: 'monospace',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      border: '1px solid #d97706'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#d97706' }}>🔍 DEBUG INFO</div>
      <div>Cargando: {cargando ? '✓' : '✗'}</div>
      <div>Usuario: {usuario?.email || 'No'}</div>
      <div>Nombre: {usuario?.nombre_completo || 'N/A'}</div>
      <div style={{ color: usuario?.rol === 'admin' ? '#10b981' : '#ef4444' }}>
        Rol: {usuario?.rol || 'N/A'}
      </div>
      <div style={{ color: esAdmin ? '#10b981' : '#ef4444' }}>
        esAdmin: {esAdmin ? '✓ VERDADERO' : '✗ FALSO'}
      </div>
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#9ca3af' }}>
        localStorage.usuario: {localStorage.getItem('usuario') ? '✓' : '✗'}
      </div>
      
      {/* Botón para limpiar storage */}
      {usuario && (
        <button
          onClick={limpiarStorage}
          style={{
            marginTop: '12px',
            width: '100%',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '6px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
        >
          🧹 LIMPIAR & RECARGAR
        </button>
      )}
    </div>
  );
};

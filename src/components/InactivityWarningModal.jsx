import React, { useEffect, useState } from 'react';

export const InactivityWarningModal = ({ 
  isOpen, 
  minutesRemaining, 
  secondsRemaining, 
  onContinue, 
  onLogout 
}) => {
  const [contador, setContador] = useState(secondsRemaining);

  useEffect(() => {
    setContador(secondsRemaining);
  }, [secondsRemaining]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setContador(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const mins = Math.floor(contador / 60);
  const secs = contador % 60;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 25px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>

        <h2 style={{
          fontSize: '1.8em',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#1f2937'
        }}>
          Tu Sesión Está Por Vencer
        </h2>

        <p style={{
          fontSize: '1em',
          color: '#6b7280',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          Por tu seguridad, tu sesión se cerrará automáticamente en:
        </p>

        {/* Timer */}
        <div style={{
          backgroundColor: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '2px solid #fca5a5',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '30px',
          fontSize: '3em',
          fontWeight: 'bold',
          color: '#dc2626',
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
          animation: 'pulse 1s ease-in-out infinite'
        }}>
          {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
        </div>

        <p style={{
          fontSize: '0.95em',
          color: '#6b7280',
          marginBottom: '30px'
        }}>
          Haz clic en "Continuar" para seguir usando tu cuenta
        </p>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onContinue}
            style={{
              flex: 1,
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1em',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            Continuar Sesión
          </button>
          <button
            onClick={onLogout}
            style={{
              flex: 1,
              padding: '14px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1em',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ef4444';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        <p style={{
          fontSize: '0.85em',
          color: '#9ca3af',
          marginTop: '20px'
        }}>
          Esta ventana se cerrará automáticamente cuando el tiempo se agote
        </p>
      </div>
    </div>
  );
};

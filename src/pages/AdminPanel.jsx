import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GestorUsuarios } from '../components/admin/GestorUsuarios';
import { GestorProductos } from '../components/admin/GestorProductos';
import { GestorRoles } from '../components/admin/GestorRoles';
import { GestorFinanzas } from '../components/admin/GestorFinanzas';

const SVGIconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const SVGIconProducts = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const SVGIconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const SVGIconDollar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const SVGIconLogOut = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"></path>
    <polyline points="17 16 21 12 17 8"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export const AdminPanel = () => {
  const { usuario, esAdmin, logout, cargando } = useAuth();
  const [tabActiva, setTabActiva] = useState('usuarios');

  // Mostrar loading mientras se carga el usuario
  if (cargando) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.1em' }}>Cargando...</div>;
  }

  // Verificar si es admin
  if (!usuario || !esAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    {
      id: 'usuarios',
      nombre: 'Gestión de Usuarios',
      icono: <SVGIconUsers />,
      componente: <GestorUsuarios usuarioAdmin={usuario} />
    },
    {
      id: 'productos',
      nombre: 'Gestión de Productos',
      icono: <SVGIconProducts />,
      componente: <GestorProductos usuarioAdmin={usuario} />
    },
    {
      id: 'roles',
      nombre: 'Roles y Permisos',
      icono: <SVGIconShield />,
      componente: <GestorRoles usuarioAdmin={usuario} />
    },
    {
      id: 'finanzas',
      nombre: 'Gestión de Finanzas',
      icono: <SVGIconDollar />,
      componente: <GestorFinanzas usuarioAdmin={usuario} />
    }
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: 'white',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header del Sidebar */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.3em' }}>
            Panel Admin
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>
            {usuario?.nombre_completo || usuario?.email}
          </p>
        </div>

        {/* Navegación */}
        <nav style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '8px',
                backgroundColor: tabActiva === tab.id ? '#e0f2fe' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: tabActiva === tab.id ? '#0c4a6e' : '#6b7280',
                fontWeight: tabActiva === tab.id ? '600' : '500',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icono}
              {tab.nombre}
            </button>
          ))}
        </nav>

        {/* Botón de Logout */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#991b1b',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#fee2e2';
            }}
          >
            <SVGIconLogOut />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header con título */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '20px'
        }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>
            {tabs.find((t) => t.id === tabActiva)?.nombre}
          </h1>
        </div>

        {/* Contenido de la pestaña */}
        <div style={{
          flex: 1,
          overflowY: 'auto'
        }}>
          {tabs.find((t) => t.id === tabActiva)?.componente}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

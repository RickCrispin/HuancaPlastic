import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { esAdmin as checkIsAdmin } from '../constants/rolesPermisos';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { cart } = useCart();
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header style={{
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'white',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        backdropFilter: scrolled ? 'blur(10px)' : 'none'
      }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: scrolled ? '10px 20px' : '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        transition: 'padding 0.3s ease'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontSize: '1.8em',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textDecoration: 'none',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          HuancaPlastic
        </Link>

        {/* Navigation - Desktop */}
        <nav style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'center',
          flexWrap: 'wrap',
          margin: '0 auto'
        }}>
          <Link to="/" style={{
            textDecoration: 'none',
            color: '#1f2937',
            fontWeight: '600',
            fontSize: '0.95em',
            transition: 'all 0.3s ease',
            borderBottom: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#3b82f6';
            e.target.style.borderBottomColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#1f2937';
            e.target.style.borderBottomColor = 'transparent';
          }}
          >
            Inicio
          </Link>
          <Link to="/store" style={{
            textDecoration: 'none',
            color: '#1f2937',
            fontWeight: '600',
            fontSize: '0.95em',
            transition: 'all 0.3s ease',
            borderBottom: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#3b82f6';
            e.target.style.borderBottomColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#1f2937';
            e.target.style.borderBottomColor = 'transparent';
          }}
          >
            Tienda
          </Link>
          <Link to="/contact" style={{
            textDecoration: 'none',
            color: '#1f2937',
            fontWeight: '600',
            fontSize: '0.95em',
            transition: 'all 0.3s ease',
            borderBottom: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#3b82f6';
            e.target.style.borderBottomColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#1f2937';
            e.target.style.borderBottomColor = 'transparent';
          }}
          >
            Contacto
          </Link>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', position: 'relative' }}>
          {/* Cart Button */}
          <Link to="/cart" style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#f3f4f6',
            textDecoration: 'none',
            color: '#1f2937',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7em',
                fontWeight: 'bold'
              }}>
                {cart.length}
              </span>
            )}
          </Link>

          {/* Admin Button */}
          {esAdmin && (
            <Link
              to="/admin"
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9em',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(217, 119, 6, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.3)';
              }}
            >
              Panel Admin
            </Link>
          )}

          {/* User Menu or Auth Buttons */}
          {usuario ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9em',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                {/* Foto pequeña de perfil o ícono */}
                {usuario.foto_perfil ? (
                  <img 
                    src={usuario.foto_perfil} 
                    alt="Avatar"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid rgba(255,255,255,0.5)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                )}
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {usuario.nombre_completo || usuario.email?.split('@')[0]}
                </span>
                <span style={{ fontSize: '0.8em', marginLeft: '2px' }}>▼</span>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  minWidth: '220px',
                  zIndex: 1000,
                  animation: 'slideDown 0.2s ease'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '0.85em',
                    color: '#6b7280'
                  }}>
                    {usuario.email}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#1f2937',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s',
                      fontSize: '0.95em',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Mi Cuenta
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#1f2937',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s',
                      fontSize: '0.95em',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Ajustes
                  </Link>
                  {checkIsAdmin(usuario?.rol) && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: '#d97706',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s',
                        fontSize: '0.95em',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fef3c7'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#ef4444',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      fontSize: '0.95em',
                      fontWeight: '500',
                      borderRadius: '0 0 12px 12px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9em',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9em',
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
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
};
 
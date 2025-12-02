import React from 'react';
import { usePermisos } from '../hooks/usePermisos';

/**
 * Componente para mostrar/ocultar contenido basado en permisos
 * 
 * Uso:
 * <ProtectedElement requiredPermission="editar_productos">
 *   <button>Editar Producto</button>
 * </ProtectedElement>
 * 
 * O con múltiples permisos:
 * <ProtectedElement requiredPermissions={['editar_productos', 'ver_reportes']} requireAll>
 *   <div>Contenido protegido</div>
 * </ProtectedElement>
 */
export const ProtectedElement = ({ 
  children, 
  requiredPermission = null,
  requiredPermissions = [],
  requireAll = false, // Si true, requiere TODOS los permisos; si false, requiere AL MENOS UNO
  fallback = null,
  onlyAdmin = false,
  className = ''
}) => {
  const { tienePermiso, tienePermisos, tieneAlgunoPermiso, esAdmin } = usePermisos();

  // Si solo es para admin
  if (onlyAdmin) {
    return esAdmin ? <div className={className}>{children}</div> : fallback;
  }

  // Verificar permiso único
  if (requiredPermission) {
    return tienePermiso(requiredPermission) ? (
      <div className={className}>{children}</div>
    ) : (
      fallback
    );
  }

  // Verificar múltiples permisos
  if (requiredPermissions.length > 0) {
    const tieneAcceso = requireAll 
      ? tienePermisos(requiredPermissions)
      : tieneAlgunoPermiso(requiredPermissions);
    
    return tieneAcceso ? (
      <div className={className}>{children}</div>
    ) : (
      fallback
    );
  }

  // Si no hay restricciones de permisos, mostrar siempre
  return <div className={className}>{children}</div>;
};

/**
 * Componente para mostrar un botón protegido por permisos
 */
export const ProtectedButton = ({
  children,
  requiredPermission = null,
  requiredPermissions = [],
  requireAll = false,
  onlyAdmin = false,
  onClick = () => {},
  style = {},
  className = '',
  title = 'No tienes permisos para esta acción',
  ...props
}) => {
  const { tienePermiso, tienePermisos, tieneAlgunoPermiso, esAdmin } = usePermisos();

  let tieneAcceso = false;

  if (onlyAdmin) {
    tieneAcceso = esAdmin;
  } else if (requiredPermission) {
    tieneAcceso = tienePermiso(requiredPermission);
  } else if (requiredPermissions.length > 0) {
    tieneAcceso = requireAll 
      ? tienePermisos(requiredPermissions)
      : tieneAlgunoPermiso(requiredPermissions);
  } else {
    tieneAcceso = true;
  }

  return (
    <button
      onClick={onClick}
      disabled={!tieneAcceso}
      style={{
        ...style,
        opacity: tieneAcceso ? 1 : 0.5,
        cursor: tieneAcceso ? 'pointer' : 'not-allowed'
      }}
      className={className}
      title={tieneAcceso ? '' : title}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * HOC para proteger componentes completos
 */
export const withPermission = (Component, requiredPermission, onlyAdmin = false) => {
  return (props) => {
    const { tienePermiso, esAdmin } = usePermisos();

    let tieneAcceso = false;
    if (onlyAdmin) {
      tieneAcceso = esAdmin;
    } else if (requiredPermission) {
      tieneAcceso = tienePermiso(requiredPermission);
    } else {
      tieneAcceso = true;
    }

    if (!tieneAcceso) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          borderRadius: '8px'
        }}>
          🔒 No tienes permisos para acceder a este contenido
        </div>
      );
    }

    return <Component {...props} />;
  };
};

/**
 * Definición de Roles y Permisos del Sistema (VERSIÓN SIMPLIFICADA)
 * Roles: admin (administrador) y user (cliente)
 */

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const PERMISOS = {
  // Gestión de Usuarios
  CREAR_USUARIO: 'crear_usuario',
  EDITAR_USUARIO: 'editar_usuario',
  ELIMINAR_USUARIO: 'eliminar_usuario',
  VER_USUARIOS: 'ver_usuarios',
  CAMBIAR_ROL_USUARIO: 'cambiar_rol_usuario',

  // Gestión de Productos
  CREAR_PRODUCTO: 'crear_producto',
  EDITAR_PRODUCTO: 'editar_producto',
  ELIMINAR_PRODUCTO: 'eliminar_producto',
  VER_PRODUCTOS: 'ver_productos',
  VER_STOCK: 'ver_stock',
  MODIFICAR_PRECIO: 'modificar_precio',

  // Gestión de Roles y Permisos
  VER_ROLES: 'ver_roles',
  CREAR_ROL: 'crear_rol',
  EDITAR_ROL: 'editar_rol',
  ELIMINAR_ROL: 'eliminar_rol',
  ASIGNAR_PERMISOS: 'asignar_permisos',

  // Gestión de Finanzas
  VER_FINANZAS: 'ver_finanzas',
  VER_VENTAS: 'ver_ventas',
  VER_REPORTES: 'ver_reportes',
  EXPORTAR_REPORTES: 'exportar_reportes',
  GESTIONAR_PAGOS: 'gestionar_pagos',

  // Gestión General
  ACCESO_PANEL_ADMIN: 'acceso_panel_admin',
  VER_CONFIGURACION: 'ver_configuracion',
  MODIFICAR_CONFIGURACION: 'modificar_configuracion'
};

/**
 * Matriz de Permisos por Rol
 * Define qué permisos tiene cada rol
 */
export const PERMISOS_POR_ROL = {
  [ROLES.ADMIN]: [
    // Admin tiene todos los permisos
    PERMISOS.CREAR_USUARIO,
    PERMISOS.EDITAR_USUARIO,
    PERMISOS.ELIMINAR_USUARIO,
    PERMISOS.VER_USUARIOS,
    PERMISOS.CAMBIAR_ROL_USUARIO,
    PERMISOS.CREAR_PRODUCTO,
    PERMISOS.EDITAR_PRODUCTO,
    PERMISOS.ELIMINAR_PRODUCTO,
    PERMISOS.VER_PRODUCTOS,
    PERMISOS.VER_STOCK,
    PERMISOS.MODIFICAR_PRECIO,
    PERMISOS.VER_ROLES,
    PERMISOS.CREAR_ROL,
    PERMISOS.EDITAR_ROL,
    PERMISOS.ELIMINAR_ROL,
    PERMISOS.ASIGNAR_PERMISOS,
    PERMISOS.VER_FINANZAS,
    PERMISOS.VER_VENTAS,
    PERMISOS.VER_REPORTES,
    PERMISOS.EXPORTAR_REPORTES,
    PERMISOS.GESTIONAR_PAGOS,
    PERMISOS.ACCESO_PANEL_ADMIN,
    PERMISOS.VER_CONFIGURACION,
    PERMISOS.MODIFICAR_CONFIGURACION
  ],

  [ROLES.USER]: [
    // User (cliente) solo puede ver productos
    PERMISOS.VER_PRODUCTOS
  ]
};

/**
 * Verifica si un rol tiene un permiso específico
 * @param {string} rol - El rol del usuario ('admin' o 'user')
 * @param {string} permiso - El permiso a verificar
 * @returns {boolean} true si el rol tiene el permiso
 */
export const tienePermiso = (rol, permiso) => {
  if (!rol) return false;
  const permisosDelRol = PERMISOS_POR_ROL[rol] || [];
  return permisosDelRol.includes(permiso);
};

/**
 * Obtiene todos los permisos de un rol
 * @param {string} rol - El rol del usuario
 * @returns {Array<string>} Array de permisos del rol
 */
export const obtenerPermisosDelRol = (rol) => {
  return PERMISOS_POR_ROL[rol] || [];
};

/**
 * Verifica si un usuario es administrador
 * @param {string} rol - El rol del usuario
 * @returns {boolean} true si es admin
 */
export const esAdmin = (rol) => {
  return rol === ROLES.ADMIN;
};

/**
 * Verifica si un usuario tiene acceso al panel admin
 * @param {string} rol - El rol del usuario
 * @returns {boolean} true si tiene acceso al panel admin
 */
export const tieneAccesoPanelAdmin = (rol) => {
  return tienePermiso(rol, PERMISOS.ACCESO_PANEL_ADMIN);
};

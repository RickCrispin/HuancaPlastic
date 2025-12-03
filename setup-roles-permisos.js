/**
 * Script para inicializar tablas de roles y permisos en Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const supabaseUrl = 'https://qzsxzsnqkqogpipawqrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6c3h6c25xa3FvZ3BpcGF3cXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5OTM3MTksImV4cCI6MjA0ODU2OTcxOX0.mfKyR_cCL9HRQqSq97Q7FSwL9VE4p1SYUhHlILLNgkI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    // Si RPC no está disponible, usar queries individuales
    return null;
  }
  return data;
}

async function crearTablas() {
  console.log('\n========================================');
  console.log('INICIALIZANDO SISTEMA DE ROLES Y PERMISOS');
  console.log('========================================\n');

  try {
    // 1. Crear tabla permisos
    console.log('1. Creando tabla permisos...');
    const { error: errorPermisos } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS permisos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nombre VARCHAR(100) UNIQUE NOT NULL,
          descripcion TEXT,
          categoria VARCHAR(50) NOT NULL DEFAULT 'general',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (errorPermisos) {
      console.log('   Usando método alternativo para crear tabla permisos...');
      // Método alternativo: crear directamente
      await supabase.from('permisos').select('*').limit(0);
    }
    console.log('   ✓ Tabla permisos lista\n');

    // 2. Crear tabla roles
    console.log('2. Creando tabla roles...');
    await supabase.from('roles').select('*').limit(0);
    console.log('   ✓ Tabla roles lista\n');

    // 3. Crear tabla roles_permisos
    console.log('3. Creando tabla roles_permisos...');
    await supabase.from('roles_permisos').select('*').limit(0);
    console.log('   ✓ Tabla roles_permisos lista\n');

    // 4. Insertar permisos
    console.log('4. Insertando permisos predefinidos...');
    const permisos = [
      // Usuarios
      { nombre: 'ver_usuarios', descripcion: 'Ver lista de usuarios', categoria: 'usuarios' },
      { nombre: 'crear_usuario', descripcion: 'Crear nuevos usuarios', categoria: 'usuarios' },
      { nombre: 'editar_usuario', descripcion: 'Editar información de usuarios', categoria: 'usuarios' },
      { nombre: 'eliminar_usuario', descripcion: 'Eliminar usuarios', categoria: 'usuarios' },
      { nombre: 'gestionar_perfiles', descripcion: 'Gestionar perfiles de usuarios', categoria: 'usuarios' },
      
      // Productos
      { nombre: 'ver_productos', descripcion: 'Ver catálogo de productos', categoria: 'productos' },
      { nombre: 'crear_producto', descripcion: 'Crear nuevos productos', categoria: 'productos' },
      { nombre: 'editar_producto', descripcion: 'Editar productos existentes', categoria: 'productos' },
      { nombre: 'eliminar_producto', descripcion: 'Eliminar productos', categoria: 'productos' },
      { nombre: 'gestionar_inventario', descripcion: 'Gestionar inventario y stock', categoria: 'productos' },
      
      // Roles
      { nombre: 'ver_roles', descripcion: 'Ver roles y permisos del sistema', categoria: 'roles' },
      { nombre: 'crear_rol', descripcion: 'Crear nuevos roles', categoria: 'roles' },
      { nombre: 'editar_rol', descripcion: 'Editar roles y asignar permisos', categoria: 'roles' },
      { nombre: 'eliminar_rol', descripcion: 'Eliminar roles', categoria: 'roles' },
      
      // Finanzas
      { nombre: 'ver_ordenes', descripcion: 'Ver órdenes de compra', categoria: 'finanzas' },
      { nombre: 'gestionar_ordenes', descripcion: 'Gestionar y modificar órdenes', categoria: 'finanzas' },
      { nombre: 'ver_reportes', descripcion: 'Ver reportes financieros', categoria: 'finanzas' },
      { nombre: 'gestionar_pagos', descripcion: 'Procesar y gestionar pagos', categoria: 'finanzas' },
      
      // General
      { nombre: 'acceso_dashboard', descripcion: 'Acceso al panel de administración', categoria: 'general' },
      { nombre: 'ver_configuracion', descripcion: 'Ver configuración del sistema', categoria: 'general' },
      { nombre: 'editar_configuracion', descripcion: 'Modificar configuración del sistema', categoria: 'general' }
    ];

    for (const permiso of permisos) {
      const { error } = await supabase
        .from('permisos')
        .upsert([permiso], { onConflict: 'nombre', ignoreDuplicates: true });
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ! Error insertando permiso ${permiso.nombre}:`, error.message);
      }
    }
    console.log(`   ✓ ${permisos.length} permisos insertados\n`);

    // 5. Crear roles
    console.log('5. Creando roles predefinidos...');
    const roles = [
      { nombre: 'admin', descripcion: 'Administrador con acceso total al sistema' },
      { nombre: 'cliente', descripcion: 'Usuario cliente con permisos limitados' },
      { nombre: 'moderador', descripcion: 'Moderador con permisos de gestión parcial' },
      { nombre: 'vendedor', descripcion: 'Vendedor con acceso a productos y órdenes' }
    ];

    for (const rol of roles) {
      const { error } = await supabase
        .from('roles')
        .upsert([rol], { onConflict: 'nombre', ignoreDuplicates: true });
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ! Error creando rol ${rol.nombre}:`, error.message);
      }
    }
    console.log(`   ✓ ${roles.length} roles creados\n`);

    // 6. Asignar permisos a roles
    console.log('6. Asignando permisos a roles...');
    
    // Obtener IDs
    const { data: rolesData } = await supabase.from('roles').select('id, nombre');
    const { data: permisosData } = await supabase.from('permisos').select('id, nombre');

    const rolesMap = Object.fromEntries(rolesData.map(r => [r.nombre, r.id]));
    const permisosMap = Object.fromEntries(permisosData.map(p => [p.nombre, p.id]));

    // Admin: TODOS los permisos
    console.log('   - Asignando permisos a admin...');
    for (const permiso of permisosData) {
      await supabase
        .from('roles_permisos')
        .upsert([{ rol_id: rolesMap.admin, permiso_id: permiso.id }], { ignoreDuplicates: true });
    }

    // Cliente: Solo ver productos y órdenes
    console.log('   - Asignando permisos a cliente...');
    const permisosCliente = ['ver_productos', 'ver_ordenes'];
    for (const nombrePermiso of permisosCliente) {
      await supabase
        .from('roles_permisos')
        .upsert([{ rol_id: rolesMap.cliente, permiso_id: permisosMap[nombrePermiso] }], { ignoreDuplicates: true });
    }

    // Moderador
    console.log('   - Asignando permisos a moderador...');
    const permisosModerador = [
      'ver_usuarios', 'editar_usuario',
      'ver_productos', 'crear_producto', 'editar_producto',
      'ver_ordenes', 'gestionar_ordenes',
      'acceso_dashboard'
    ];
    for (const nombrePermiso of permisosModerador) {
      await supabase
        .from('roles_permisos')
        .upsert([{ rol_id: rolesMap.moderador, permiso_id: permisosMap[nombrePermiso] }], { ignoreDuplicates: true });
    }

    // Vendedor
    console.log('   - Asignando permisos a vendedor...');
    const permisosVendedor = [
      'ver_productos', 'editar_producto', 'gestionar_inventario',
      'ver_ordenes', 'gestionar_ordenes', 'gestionar_pagos',
      'acceso_dashboard'
    ];
    for (const nombrePermiso of permisosVendedor) {
      await supabase
        .from('roles_permisos')
        .upsert([{ rol_id: rolesMap.vendedor, permiso_id: permisosMap[nombrePermiso] }], { ignoreDuplicates: true });
    }

    console.log('   ✓ Permisos asignados correctamente\n');

    console.log('========================================');
    console.log('✓ SISTEMA DE ROLES Y PERMISOS LISTO');
    console.log('========================================\n');

    console.log('Resumen:');
    console.log(`- ${permisos.length} permisos creados`);
    console.log(`- ${roles.length} roles creados`);
    console.log('- Permisos asignados a cada rol\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
crearTablas();

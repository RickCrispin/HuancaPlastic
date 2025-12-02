import { supabase } from './src/lib/supabase.js';

async function testLogin() {
  console.log('🔍 Probando sistema de login mejorado...\n');

  try {
    // Test 1: Verificar usuarios existentes
    console.log('📋 Test 1: Obteniendo lista de usuarios');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, email, nombre_completo, rol_id, estado');

    if (usuariosError) {
      console.error('❌ Error al obtener usuarios:', usuariosError);
    } else {
      console.log('✅ Usuarios encontrados:', usuarios.length);
      usuarios.forEach(u => {
        console.log(`  - ${u.email} (rol_id: ${u.rol_id}, estado: ${u.estado})`);
      });
    }

    // Test 2: Verificar tabla roles
    console.log('\n📋 Test 2: Obteniendo roles');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('id, nombre');

    if (rolesError) {
      console.error('❌ Error al obtener roles:', rolesError);
    } else {
      console.log('✅ Roles encontrados:', roles.length);
      roles.forEach(r => {
        console.log(`  - ${r.nombre} (id: ${r.id})`);
      });
    }

    // Test 3: Verificar tabla perfiles_usuarios
    console.log('\n📋 Test 3: Obteniendo perfiles');
    const { data: perfiles, error: perfilesError } = await supabase
      .from('perfiles_usuarios')
      .select('id, usuario_id, ciudad, pais');

    if (perfilesError) {
      console.error('❌ Error al obtener perfiles:', perfilesError);
    } else {
      console.log('✅ Perfiles encontrados:', perfiles.length);
      perfiles.forEach(p => {
        console.log(`  - usuario_id: ${p.usuario_id}, ciudad: ${p.ciudad}, pais: ${p.pais}`);
      });
    }

    // Test 4: Verificar tabla roles_permisos
    console.log('\n📋 Test 4: Obteniendo roles_permisos');
    const { data: rolesPermisos, error: rolePermisosError } = await supabase
      .from('roles_permisos')
      .select('rol_id, permisos:permiso_id(nombre)');

    if (rolePermisosError) {
      console.error('❌ Error al obtener roles_permisos:', rolePermisosError);
    } else {
      console.log('✅ Roles_permisos encontrados:', rolesPermisos.length);
    }

    // Test 5: Simular login - obtener usuario por email
    if (usuarios.length > 0) {
      console.log('\n📋 Test 5: Simulando flujo de login');
      const usuarioEmail = usuarios[0].email;
      console.log(`  Intentando login con: ${usuarioEmail}`);

      const { data: usuarioSimple, error: errorSimple } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', usuarioEmail)
        .single();

      if (errorSimple) {
        console.error('❌ Error al obtener usuario:', errorSimple);
      } else {
        console.log('✅ Usuario encontrado:');
        console.log(`  - id: ${usuarioSimple.id}`);
        console.log(`  - email: ${usuarioSimple.email}`);
        console.log(`  - nombre_completo: ${usuarioSimple.nombre_completo}`);
        console.log(`  - rol_id: ${usuarioSimple.rol_id}`);
        console.log(`  - telefono: ${usuarioSimple.telefono}`);
        console.log(`  - estado: ${usuarioSimple.estado}`);

        // Obtener rol si existe
        if (usuarioSimple.rol_id) {
          const { data: rolData } = await supabase
            .from('roles')
            .select('nombre')
            .eq('id', usuarioSimple.rol_id)
            .single();

          console.log(`  - rol: ${rolData?.nombre || 'N/A'}`);
        }

        // Obtener perfil si existe
        const { data: perfilData } = await supabase
          .from('perfiles_usuarios')
          .select('*')
          .eq('usuario_id', usuarioSimple.id)
          .single();

        if (perfilData) {
          console.log('✅ Perfil encontrado:');
          console.log(`  - ciudad: ${perfilData.ciudad}`);
          console.log(`  - pais: ${perfilData.pais}`);
          console.log(`  - foto_perfil: ${perfilData.foto_perfil}`);
        }

        // Obtener permisos si tiene rol_id
        if (usuarioSimple.rol_id) {
          const { data: permisosData } = await supabase
            .from('roles_permisos')
            .select('permisos:permiso_id(nombre)')
            .eq('rol_id', usuarioSimple.rol_id);

          if (permisosData && permisosData.length > 0) {
            console.log('✅ Permisos del usuario:');
            permisosData.forEach(p => {
              console.log(`  - ${p.permisos?.nombre || 'N/A'}`);
            });
          } else {
            console.log('⚠️  No se encontraron permisos para este rol');
          }
        }
      }
    }

    console.log('\n✅ Prueba de login completada');
  } catch (error) {
    console.error('\n✗ Error en la prueba:', error.message);
  }
}

testLogin();

import { supabase } from './src/lib/supabase.js';

async function testSupabase() {
  console.log('🔍 Probando conexión con Supabase...\n');

  try {
    // Test 1: Verificar conexión
    console.log('✓ Cliente Supabase inicializado');
    console.log(`  URL: ${supabase.supabaseUrl}`);
    console.log(`  API Key: ${supabase.supabaseKey.substring(0, 20)}...`);

    // Test 2: Intentar acceder a tabla "products"
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('\n⚠️  Tabla "products" no existe aún');
        console.log('  Estado: Supabase conectado correctamente ✓');
        console.log('  Próximo paso: Crear tabla en Supabase');
      } else {
        console.log('\n✗ Error:', error.message);
      }
    } else {
      console.log('\n✓ Conexión exitosa con Supabase');
      console.log('✓ Tabla "products" existe y es accesible');
      console.log(`  Registros encontrados: ${data ? data.length : 0}`);
    }

    console.log('\n✅ Prueba completada');
  } catch (error) {
    console.error('\n✗ Error en la prueba:', error.message);
  }
}

testSupabase();

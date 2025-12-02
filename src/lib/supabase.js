import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno (Vite requiere el prefijo VITE_)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Falta configurar las variables de entorno de Supabase. ' +
    'Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

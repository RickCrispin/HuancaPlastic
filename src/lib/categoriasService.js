import { supabase } from './supabase';

export const categoriasService = {
  /**
   * Obtiene todas las categorías de la base de datos
   */
  async getAllCategorias() {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nombre, descripcion')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  },

  /**
   * Obtiene una categoría por ID
   */
  async getCategoriaById(id) {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      return null;
    }
  },

  /**
   * Crea una nueva categoría
   */
  async createCategoria(nombre, descripcion = '') {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{ nombre, descripcion }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al crear categoría:', error);
      return { success: false, error: error.message };
    }
  }
};

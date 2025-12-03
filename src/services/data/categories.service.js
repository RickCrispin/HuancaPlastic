/**
 * Categories Service
 * Manages product category operations
 */

import supabase from '../../config/supabase';

export const categoriesService = {
  async getAllCategorias() {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      console.log('[Categories] Loaded:', data?.length || 0, 'categories');

      return data || [];
    } catch (error) {
      console.error('[Categories] Get all categories error:', error);
      return [];
    }
  },

  async getCategoriaById(id) {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[Categories] Get category by ID error:', error);
      return { success: false, error: error.message };
    }
  },

  async createCategoria(categoriaData) {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoriaData])
        .select()
        .single();

      if (error) throw error;

      console.log('[Categories] Category created:', data.id);

      return { success: true, data };
    } catch (error) {
      console.error('[Categories] Create category error:', error);
      return { success: false, error: error.message };
    }
  },

  async updateCategoria(id, categoriaData) {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .update(categoriaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('[Categories] Category updated:', id);

      return { success: true, data };
    } catch (error) {
      console.error('[Categories] Update category error:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteCategoria(id) {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('[Categories] Category deleted:', id);

      return { success: true };
    } catch (error) {
      console.error('[Categories] Delete category error:', error);
      return { success: false, error: error.message };
    }
  }
};

export default categoriesService;

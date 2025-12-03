/**
 * Products Service
 * Manages product data operations
 */

import supabase from '../../config/supabase';

export const productsService = {
  async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      console.log('[Products] Loaded:', data?.length || 0, 'products');

      return data || [];
    } catch (error) {
      console.error('[Products] Get all products error:', error);
      return [];
    }
  },

  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('[Products] Get product by ID error:', error);
      return { success: false, error: error.message };
    }
  },

  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      console.log('[Products] Product created:', data.id);

      return { success: true, data };
    } catch (error) {
      console.error('[Products] Create product error:', error);
      return { success: false, error: error.message };
    }
  },

  async updateProduct(id, productData) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('[Products] Product updated:', id);

      return { success: true, data };
    } catch (error) {
      console.error('[Products] Update product error:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('[Products] Product deleted:', id);

      return { success: true };
    } catch (error) {
      console.error('[Products] Delete product error:', error);
      return { success: false, error: error.message };
    }
  },

  subscribeToProductChanges(callback) {
    const subscription = supabase
      .channel('productos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'productos'
        },
        (payload) => {
          console.log('[Products] Change detected:', payload.eventType);
          if (callback) callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }
};

export default productsService;

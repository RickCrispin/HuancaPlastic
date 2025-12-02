import { supabase } from './supabase';

export const productsService = {
  // Obtener TODOS los productos (sin límite)
  async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Suscribirse a cambios en tiempo real
  subscribeToProductChanges(callback) {
    try {
      const subscription = supabase
        .channel('productos-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'productos' },
          (payload) => {
            console.log('Cambio en productos:', payload);
            callback(payload);
          }
        )
        .subscribe();
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to products:', error);
      return null;
    }
  },

  // Obtener producto por ID
  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Obtener productos por categoría
  async getProductsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('categoria_id', categoryId)
        .eq('activo', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Buscar productos
  async searchProducts(query) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Crear producto (admin)
  async createProduct(product, usuarioId) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([{
          ...product,
          created_by: usuarioId,
          activo: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar producto (admin)
  async updateProduct(id, updates) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar producto (admin) - Soft delete
  async deleteProduct(id) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener TODOS los productos incluyendo inactivos (admin)
  async getAllProductsAdmin() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  }
};

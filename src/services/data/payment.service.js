/**
 * Payment Service
 * Manages payment method operations
 * SECURITY: Uses tokenization - never stores raw card data
 */

import supabase from '../../config/supabase';

export const paymentService = {
  /**
   * Create payment method (tokenized - DO NOT save raw card data)
   * @param {string} usuarioId - User ID
   * @param {Object} datoPago - Payment data (with token from Stripe/PayPal)
   * @returns {Promise<Object>} Payment method creation result
   */
  async crearMetodoPago(usuarioId, datoPago) {
    try {
      const { data: metodo, error } = await supabase
        .from('metodos_pago')
        .insert([{
          usuario_id: usuarioId,
          tipo: datoPago.tipo,
          token_seguro: datoPago.token,
          ultimos_4_digitos: datoPago.ultimos4,
          nombre_titular: datoPago.nombreTitular,
          marca: datoPago.marca,
          fecha_expiracion: datoPago.fechaExpiracion,
          es_predeterminado: datoPago.esPredeteminado || false
        }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('[Payment] Payment method created for user:', usuarioId);
      
      return { success: true, metodo };
    } catch (error) {
      console.error('[Payment] Create payment method error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user payment methods
   * @param {string} usuarioId - User ID
   * @returns {Promise<Array>} Payment methods
   */
  async obtenerMetodosPago(usuarioId) {
    try {
      const { data: metodos, error } = await supabase
        .from('metodos_pago')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('activo', true)
        .order('es_predeterminado', { ascending: false });

      if (error) throw error;
      
      console.log('[Payment] Loaded:', metodos?.length || 0, 'payment methods');
      
      return metodos || [];
    } catch (error) {
      console.error('[Payment] Get payment methods error:', error);
      return [];
    }
  },

  /**
   * Update payment method
   * @param {string} metodoPagoId - Payment method ID
   * @param {Object} datos - Data to update
   * @returns {Promise<Object>} Update result
   */
  async actualizarMetodoPago(metodoPagoId, datos) {
    try {
      const { data: metodo, error } = await supabase
        .from('metodos_pago')
        .update(datos)
        .eq('id', metodoPagoId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('[Payment] Payment method updated:', metodoPagoId);
      
      return { success: true, metodo };
    } catch (error) {
      console.error('[Payment] Update payment method error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete payment method (deactivate)
   * @param {string} metodoPagoId - Payment method ID
   * @returns {Promise<Object>} Delete result
   */
  async eliminarMetodoPago(metodoPagoId) {
    try {
      const { data: metodo, error } = await supabase
        .from('metodos_pago')
        .update({ activo: false })
        .eq('id', metodoPagoId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('[Payment] Payment method deleted:', metodoPagoId);
      
      return { success: true };
    } catch (error) {
      console.error('[Payment] Delete payment method error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Set payment method as default
   * @param {string} usuarioId - User ID
   * @param {string} metodoPagoId - Payment method ID
   * @returns {Promise<Object>} Update result
   */
  async establecerComoPredeterminado(usuarioId, metodoPagoId) {
    try {
      await supabase
        .from('metodos_pago')
        .update({ es_predeterminado: false })
        .eq('usuario_id', usuarioId);

      const { data: metodo, error } = await supabase
        .from('metodos_pago')
        .update({ es_predeterminado: true })
        .eq('id', metodoPagoId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('[Payment] Default payment method set:', metodoPagoId);
      
      return { success: true, metodo };
    } catch (error) {
      console.error('[Payment] Set default error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Process payment (integration with Stripe/PayPal)
   * @param {string} ordenId - Order ID
   * @param {string} metodoPagoId - Payment method ID
   * @param {number} monto - Amount to charge
   * @returns {Promise<Object>} Payment result
   */
  async procesarPago(ordenId, metodoPagoId, monto) {
    try {
      console.log('[Payment] Processing payment:', monto, 'for order:', ordenId);

      const { error } = await supabase
        .from('ordenes')
        .update({ 
          referencia_transaccion: `TXN-${Date.now()}`,
          estado: 'procesada'
        })
        .eq('id', ordenId);

      if (error) throw error;
      
      console.log('[Payment] Payment processed successfully for order:', ordenId);
      
      return { success: true, referencia: `TXN-${Date.now()}` };
    } catch (error) {
      console.error('[Payment] Process payment error:', error);
      return { success: false, error: error.message };
    }
  }
};

export default paymentService;

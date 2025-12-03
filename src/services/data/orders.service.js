/**
 * Orders Service
 * Manages order operations and status tracking
 */

import supabase from '../../config/supabase';

const TAX_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 15;

export const ordersService = {
  /**
   * Create new order
   * @param {string} usuarioId - User ID
   * @param {Array} carrito - Shopping cart items
   * @param {string} direccionId - Shipping address ID
   * @param {string} metodoPagoId - Payment method ID
   * @returns {Promise<Object>} Order result
   */
  async crearOrden(usuarioId, carrito, direccionId, metodoPagoId) {
    try {
      let subtotal = 0;
      carrito.forEach(item => {
        subtotal += item.precio * item.cantidad;
      });

      const impuesto = Math.round(subtotal * TAX_RATE * 100) / 100;
      const envio = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const descuento = 0;
      const total = subtotal + impuesto + envio - descuento;

      const numeroOrden = `ORD-${Date.now()}`;

      const { data: orden, error: ordenError } = await supabase
        .from('ordenes')
        .insert([{
          usuario_id: usuarioId,
          numero_orden: numeroOrden,
          subtotal,
          impuesto,
          envio,
          descuento,
          total,
          direccion_envio_id: direccionId,
          metodo_pago_id: metodoPagoId,
          estado: 'pendiente'
        }])
        .select()
        .single();

      if (ordenError) throw ordenError;

      const items = carrito.map(item => ({
        orden_id: orden.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad,
        descuento_item: 0
      }));

      const { error: itemsError } = await supabase
        .from('items_orden')
        .insert(items);

      if (itemsError) throw itemsError;

      await supabase
        .from('cambios_estado_orden')
        .insert([{
          orden_id: orden.id,
          estado_anterior: null,
          estado_nuevo: 'pendiente',
          cambio_por: usuarioId,
          razon: 'Orden creada'
        }]);

      console.log('[Orders] Order created:', numeroOrden);

      return { success: true, orden };
    } catch (error) {
      console.error('[Orders] Create order error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user orders
   * @param {string} usuarioId - User ID
   * @returns {Promise<Array>} User orders
   */
  async obtenerOrdenesUsuario(usuarioId) {
    try {
      const { data: ordenes, error } = await supabase
        .from('ordenes')
        .select(`
          *,
          items_orden (
            *,
            productos:producto_id (
              id,
              nombre,
              imagen_principal,
              precio
            )
          ),
          direcciones:direccion_envio_id (
            calle,
            numero,
            ciudad,
            pais
          )
        `)
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('[Orders] Loaded:', ordenes?.length || 0, 'orders for user:', usuarioId);
      
      return ordenes || [];
    } catch (error) {
      console.error('[Orders] Get user orders error:', error);
      return [];
    }
  },

  /**
   * Get all orders (admin)
   * @returns {Promise<Array>} All orders
   */
  async obtenerTodasOrdenes() {
    try {
      const { data: ordenes, error } = await supabase
        .from('ordenes')
        .select(`
          *,
          usuarios:usuario_id (
            email,
            nombre_completo
          ),
          items_orden (
            *,
            productos:producto_id (
              nombre,
              precio
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('[Orders] Loaded:', ordenes?.length || 0, 'total orders');
      
      return ordenes || [];
    } catch (error) {
      console.error('[Orders] Get all orders error:', error);
      return [];
    }
  },

  /**
   * Get order by ID
   * @param {string} ordenId - Order ID
   * @returns {Promise<Object|null>} Order data or null
   */
  async obtenerOrden(ordenId) {
    try {
      const { data: orden, error } = await supabase
        .from('ordenes')
        .select(`
          *,
          items_orden (
            *,
            productos:producto_id (*)
          ),
          usuarios:usuario_id (*),
          direcciones:direccion_envio_id (*),
          metodos_pago:metodo_pago_id (*)
        `)
        .eq('id', ordenId)
        .single();

      if (error) throw error;
      
      return orden;
    } catch (error) {
      console.error('[Orders] Get order error:', error);
      return null;
    }
  },

  /**
   * Update order status (admin)
   * @param {string} ordenId - Order ID
   * @param {string} estadoNuevo - New status
   * @param {string} usuarioId - User ID making the change
   * @param {string} razon - Reason for status change
   * @returns {Promise<Object>} Update result
   */
  async actualizarEstadoOrden(ordenId, estadoNuevo, usuarioId, razon) {
    try {
      const { data: ordenActual } = await supabase
        .from('ordenes')
        .select('estado')
        .eq('id', ordenId)
        .single();

      const { data: orden, error: ordenError } = await supabase
        .from('ordenes')
        .update({ estado: estadoNuevo })
        .eq('id', ordenId)
        .select()
        .single();

      if (ordenError) throw ordenError;

      await supabase
        .from('cambios_estado_orden')
        .insert([{
          orden_id: ordenId,
          estado_anterior: ordenActual.estado,
          estado_nuevo: estadoNuevo,
          cambio_por: usuarioId,
          razon
        }]);

      console.log('[Orders] Order status updated:', ordenId, 'from', ordenActual.estado, 'to', estadoNuevo);

      return { success: true, orden };
    } catch (error) {
      console.error('[Orders] Update status error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cancel order
   * @param {string} ordenId - Order ID
   * @param {string} usuarioId - User ID
   * @returns {Promise<Object>} Cancel result
   */
  async cancelarOrden(ordenId, usuarioId) {
    return this.actualizarEstadoOrden(ordenId, 'cancelada', usuarioId, 'Cancelada por usuario');
  }
};

export default ordersService;

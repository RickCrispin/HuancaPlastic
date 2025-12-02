import { supabase } from './supabase';

export const ordersService = {
  // Crear nueva orden
  async crearOrden(usuarioId, carrito, direccionId, metodoPagoId) {
    try {
      // Calcular totales
      let subtotal = 0;
      carrito.forEach(item => {
        subtotal += item.precio * item.cantidad;
      });

      const impuesto = Math.round(subtotal * 0.18 * 100) / 100; // 18% en Perú
      const envio = subtotal > 100 ? 0 : 15; // Envío gratis si suma > 100
      const descuento = 0;
      const total = subtotal + impuesto + envio - descuento;

      // Generar número de orden único
      const numeroOrden = `ORD-${Date.now()}`;

      // Crear orden
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

      // Crear items de la orden
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

      // Registrar cambio de estado
      await supabase
        .from('cambios_estado_orden')
        .insert([{
          orden_id: orden.id,
          estado_anterior: null,
          estado_nuevo: 'pendiente',
          cambio_por: usuarioId,
          razon: 'Orden creada'
        }]);

      return { success: true, orden };
    } catch (error) {
      console.error('Error creando orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener órdenes de un usuario
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
      return ordenes || [];
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      return [];
    }
  },

  // Obtener todas las órdenes (admin)
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
      return ordenes || [];
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      return [];
    }
  },

  // Obtener orden por ID
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
      console.error('Error obteniendo orden:', error);
      return null;
    }
  },

  // Actualizar estado de orden (admin)
  async actualizarEstadoOrden(ordenId, estadoNuevo, usuarioId, razon) {
    try {
      // Obtener estado anterior
      const { data: ordenActual } = await supabase
        .from('ordenes')
        .select('estado')
        .eq('id', ordenId)
        .single();

      // Actualizar estado
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes')
        .update({ estado: estadoNuevo })
        .eq('id', ordenId)
        .select()
        .single();

      if (ordenError) throw ordenError;

      // Registrar cambio
      await supabase
        .from('cambios_estado_orden')
        .insert([{
          orden_id: ordenId,
          estado_anterior: ordenActual.estado,
          estado_nuevo: estadoNuevo,
          cambio_por: usuarioId,
          razon
        }]);

      return { success: true, orden };
    } catch (error) {
      console.error('Error actualizando orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancelar orden
  async cancelarOrden(ordenId, usuarioId) {
    return this.actualizarEstadoOrden(ordenId, 'cancelada', usuarioId, 'Cancelada por usuario');
  }
};

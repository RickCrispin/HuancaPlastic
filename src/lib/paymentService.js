import { supabase } from './supabase';

export const paymentService = {
  // Crear método de pago (tokenizado - NO guardar datos crudos de tarjeta)
  async crearMetodoPago(usuarioId, datoPago) {
    try {
      // En un sistema real, aquí usarías Stripe/PayPal para tokenizar
      // Este es un ejemplo seguro que no guarda datos sensibles
      const { data: metodo, error } = await supabase
        .from('metodos_pago')
        .insert([{
          usuario_id: usuarioId,
          tipo: datoPago.tipo,
          token_seguro: datoPago.token, // Token de Stripe/PayPal, no el número completo
          ultimos_4_digitos: datoPago.ultimos4,
          nombre_titular: datoPago.nombreTitular,
          marca: datoPago.marca,
          fecha_expiracion: datoPago.fechaExpiracion,
          es_predeterminado: datoPago.esPredeteminado || false
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, metodo };
    } catch (error) {
      console.error('Error creando método de pago:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener métodos de pago del usuario
  async obtenerMetodosPago(usuarioId) {
    try {
      const { data: metodos, error } = await supabase
        .from('metodos_pago')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('activo', true)
        .order('es_predeterminado', { ascending: false });

      if (error) throw error;
      return metodos || [];
    } catch (error) {
      console.error('Error obteniendo métodos de pago:', error);
      return [];
    }
  },

  // Actualizar método de pago
  async actualizarMetodoPago(metodoPagoId, datos) {
    try {
      const { data: metodo, error } = await supabase
        .from('metodos_pago')
        .update(datos)
        .eq('id', metodoPagoId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, metodo };
    } catch (error) {
      console.error('Error actualizando método de pago:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar método de pago (desactivar)
  async eliminarMetodoPago(metodoPagoId) {
    try {
      const { data: metodo, error } = await supabase
        .from('metodos_pago')
        .update({ activo: false })
        .eq('id', metodoPagoId)
        .select()
        .single();

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error eliminando método de pago:', error);
      return { success: false, error: error.message };
    }
  },

  // Establecer como predeterminado
  async establecerComoPredeterminado(usuarioId, metodoPagoId) {
    try {
      // Quitar predeterminado anterior
      await supabase
        .from('metodos_pago')
        .update({ es_predeterminado: false })
        .eq('usuario_id', usuarioId);

      // Establecer nuevo predeterminado
      const { data: metodo, error } = await supabase
        .from('metodos_pago')
        .update({ es_predeterminado: true })
        .eq('id', metodoPagoId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, metodo };
    } catch (error) {
      console.error('Error estableciendo predeterminado:', error);
      return { success: false, error: error.message };
    }
  },

  // Procesar pago (integración con Stripe/PayPal)
  async procesarPago(ordenId, metodoPagoId, monto) {
    try {
      // Aquí iría la integración real con Stripe/PayPal
      // Por ahora es un ejemplo
      console.log(`Procesando pago de S/. ${monto} para orden ${ordenId}`);

      // Actualizar referencia de transacción
      const { error } = await supabase
        .from('ordenes')
        .update({ 
          referencia_transaccion: `TXN-${Date.now()}`,
          estado: 'procesada'
        })
        .eq('id', ordenId);

      if (error) throw error;
      return { success: true, referencia: `TXN-${Date.now()}` };
    } catch (error) {
      console.error('Error procesando pago:', error);
      return { success: false, error: error.message };
    }
  }
};

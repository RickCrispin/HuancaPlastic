import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Obtener usuario actual y cargar carrito
  useEffect(() => {
    try {
      console.log('🔍 CartProvider inicializando...');
      const usuario = localStorage.getItem('usuario');
      if (usuario) {
        const usuarioData = JSON.parse(usuario);
        setUsuarioId(usuarioData.id);
        cargarCarrito(usuarioData.id);
      } else {
        // Modo offline - cargar del localStorage
        const carritoLocal = localStorage.getItem('huanca-cart');
        setCart(carritoLocal ? JSON.parse(carritoLocal) : []);
        setCargando(false);
      }
      console.log('✅ CartProvider listo');
    } catch (error) {
      console.error('❌ Error en CartProvider:', error);
      setCargando(false);
    }
  }, []);

  // Cargar carrito desde BD
  const cargarCarrito = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('carrito')
        .select(`
          *,
          productos:producto_id (
            id,
            nombre,
            precio,
            imagen_principal,
            stock
          )
        `)
        .eq('usuario_id', userId);

      if (error) throw error;

      const cartItems = data.map(item => ({
        id: item.producto_id,
        ...item.productos,
        price: item.productos.precio,
        quantity: item.cantidad,
        carritoId: item.id
      }));

      setCart(cartItems);
    } catch (error) {
      console.error('Error cargando carrito:', error);
      const carritoLocal = localStorage.getItem('huanca-cart');
      setCart(carritoLocal ? JSON.parse(carritoLocal) : []);
    } finally {
      setCargando(false);
    }
  };

  // Guardar en localStorage como backup
  useEffect(() => {
    localStorage.setItem('huanca-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product) => {
    try {
      console.log('🛒 addToCart llamado con:', product);
      if (usuarioId) {
        // Guardar en BD
        const existente = cart.find(item => item.id === product.id);
        const cantidad = (product.quantity || 1) + (existente?.quantity || 0);

        if (existente) {
          // Actualizar cantidad
          const { error } = await supabase
            .from('carrito')
            .update({ cantidad })
            .eq('usuario_id', usuarioId)
            .eq('producto_id', product.id);

          if (error) throw error;
        } else {
          // Insertar nuevo
          console.log('📝 Insertando producto en carrito:', {
            usuario_id: usuarioId,
            producto_id: product.id,
            cantidad: product.quantity || 1,
            precio_unitario_guardado: product.price || product.precio
          });
          const { error } = await supabase
            .from('carrito')
            .insert([{
              usuario_id: usuarioId,
              producto_id: product.id,
              cantidad: product.quantity || 1,
              precio_unitario_guardado: product.price || product.precio
            }]);

          if (error) {
            console.error('❌ Error al insertar en carrito:', error);
            throw error;
          }
          console.log('✅ Producto insertado exitosamente');
        }

        // Recargar carrito
        cargarCarrito(usuarioId);
      } else {
        // Modo offline
        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.id === product.id);
          if (existingItem) {
            return prevCart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            );
          }
          return [...prevCart, { ...product, quantity: product.quantity || 1 }];
        });
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (usuarioId) {
        const { error } = await supabase
          .from('carrito')
          .delete()
          .eq('usuario_id', usuarioId)
          .eq('producto_id', productId);

        if (error) throw error;
        cargarCarrito(usuarioId);
      } else {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      }
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      if (usuarioId) {
        const { error } = await supabase
          .from('carrito')
          .update({ cantidad: quantity })
          .eq('usuario_id', usuarioId)
          .eq('producto_id', productId);

        if (error) throw error;
        cargarCarrito(usuarioId);
      } else {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  };

  const clearCart = async () => {
    try {
      if (usuarioId) {
        const { error } = await supabase
          .from('carrito')
          .delete()
          .eq('usuario_id', usuarioId);

        if (error) throw error;
      }
      setCart([]);
    } catch (error) {
      console.error('Error vaciando carrito:', error);
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, cargando }}>
      {children}
    </CartContext.Provider>
  );
};

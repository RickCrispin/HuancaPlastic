import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { ordersService, authService } from '../services';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal, cargando } = useCart();
  const [procesando, setProcesando] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const navigate = useNavigate();

  const usuario = authService.getUsuarioActual();

  const total = getTotal();
  const subtotal = total;
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const finalTotal = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    if (!usuario) {
      navigate('/login');
      return;
    }

    setProcesando(true);
    
    // Crear orden
    const resultado = await ordersService.crearOrden(
      usuario.id,
      cart.map(item => ({
        id: item.id,
        cantidad: item.quantity,
        precio: item.price
      })),
      null, // Sin dirección por ahora
      null  // Sin método de pago por ahora
    );

    if (resultado.success) {
      alert(`¡Orden creada exitosamente! Número: ${resultado.orden.numero_orden}`);
      clearCart();
      navigate('/');
    } else {
      alert(`Error: ${resultado.error}`);
    }

    setProcesando(false);
  };

  if (cargando) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando carrito...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <section style={{
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '30px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>Tu Carrito</h1>
        </div>
      </section>

      <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '30px 20px' }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <p style={{ fontSize: '1.5em', color: '#666', marginBottom: '25px' }}>Tu carrito está vacío</p>
            <Link
              to="/store"
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 30px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              Ir a la Tienda
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 100px 100px auto',
                    gap: '15px',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={item.imagen_principal}
                    alt={item.nombre}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '5px'
                    }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/100?text=${encodeURIComponent(item.nombre || 'Producto')}`;
                    }}
                  />
                  <div>
                    <h3 style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{item.nombre}</h3>
                    <p style={{ color: '#666', margin: 0 }}>S/. {item.price.toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      −
                    </button>
                    <span style={{ padding: '5px 10px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p style={{ fontWeight: 'bold', margin: 0, minWidth: '100px', textAlign: 'right' }}>
                    S/. {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '20px',
              height: 'fit-content',
              position: 'sticky',
              top: '20px'
            }}>
              <h2 style={{ fontSize: '1.3em', fontWeight: 'bold', marginBottom: '20px' }}>Resumen</h2>

              <div style={{ 
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 'bold' }}>S/. {subtotal.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span>Envío:</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {shipping === 0 ? 'Gratis' : `S/. ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Impuesto (18%):</span>
                  <span style={{ fontWeight: 'bold' }}>S/. {tax.toFixed(2)}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2em',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>
                <span>Total:</span>
                <span style={{ color: '#2563eb' }}>S/. {finalTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setMostrarConfirm(true)}
                disabled={procesando}
                style={{
                  width: '100%',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '5px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  marginBottom: '10px',
                  transition: 'background-color 0.3s',
                  opacity: procesando ? 0.7 : 1
                }}
                onMouseEnter={(e) => !procesando && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                onMouseLeave={(e) => !procesando && (e.currentTarget.style.backgroundColor = '#2563eb')}
              >
                {procesando ? 'Procesando...' : 'Proceder al Pago'}
              </button>

              {/* Modal de confirmación de pago */}
              {mostrarConfirm && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    width: '90%',
                    maxWidth: '520px',
                    background: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}>
                    <h3 style={{ marginTop: 0 }}>Confirmar Pago</h3>
                    <p>Estás por pagar <strong>S/. {finalTotal.toFixed(2)}</strong>.</p>
                    <p>¿Deseas confirmar y proceder con el pago?</p>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setMostrarConfirm(false)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          background: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          setMostrarConfirm(false);
                          await handleCheckout();
                        }}
                        disabled={procesando}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#2563eb',
                          color: 'white',
                          fontWeight: 'bold',
                          cursor: procesando ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {procesando ? 'Procesando...' : 'Confirmar y Pagar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <Link
                to="/store"
                style={{
                  display: 'block',
                  width: '100%',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  padding: '12px',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '10px',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
              >
                Continuar Comprando
              </Link>

              <button
                onClick={clearCart}
                style={{
                  width: '100%',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '5px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                Vaciar Carrito
              </button>

              {subtotal < 100 && (
                <p style={{
                  fontSize: '0.85em',
                  color: '#666',
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '5px'
                }}>
                  📦 Envío gratis en compras mayores a S/. 100
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

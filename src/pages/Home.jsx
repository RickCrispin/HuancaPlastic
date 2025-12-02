import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsService } from '../lib/productsService';

export const Home = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        const productos = await productsService.getAllProducts();
        // Tomar los primeros 6 productos
        setTopProducts(productos.slice(0, 6));
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarProductos();
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <section style={{
        minHeight: '500px',
        background: 'linear-gradient(-45deg, #3b82f6, #1d4ed8, #0ea5e9, #06b6d4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'white',
        padding: '60px 20px'
      }}>
        <h1 style={{ fontSize: '3.5em', fontWeight: '900', marginBottom: '20px' }}>
          Bienvenido a HuancaPlastic
        </h1>
        <p style={{ fontSize: '1.3em', marginBottom: '30px', opacity: 0.9 }}>
          Soluciones plásticas de calidad para tu hogar y negocio
        </p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/store" style={{
            backgroundColor: '#ffffff',
            color: '#3b82f6',
            padding: '14px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1em'
          }}>
            Explorar Catálogo
          </Link>
          <Link to="/contact" style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1em',
            border: '2px solid white'
          }}>
            Contactar
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '2.5em', fontWeight: '900', textAlign: 'center', marginBottom: '40px', color: '#1f2937' }}>
          Productos Destacados
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ color: '#6b7280' }}>Cargando productos...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : topProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <p style={{ fontSize: '1.2em', marginBottom: '20px' }}>No hay productos disponibles en este momento</p>
            <Link to="/store" style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Ver Tienda
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {topProducts.map((product) => (
              <div key={product.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
              }}>
                {product.imagen_principal ? (
                  <img 
                    src={product.imagen_principal} 
                    alt={product.nombre || product.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      backgroundColor: '#f3f4f6'
                    }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.nombre || product.name)}`;
                    }}
                  />
                ) : (
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4em',
                    color: '#3b82f6',
                    fontWeight: '900'
                  }}>
                    {(product.nombre || product.name || 'P').charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2em', fontWeight: '700', marginBottom: '8px', color: '#1f2937' }}>
                    {product.nombre || product.name}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '15px', lineHeight: '1.5', fontSize: '0.9em', minHeight: '45px' }}>
                    {(product.descripcion || product.description || 'Producto de alta calidad').substring(0, 80)}
                    {(product.descripcion || product.description || '').length > 80 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ fontSize: '1.4em', fontWeight: '900', color: '#3b82f6' }}>
                      S/. {(product.precio || product.price || 0).toFixed(2)}
                    </span>
                    {(product.categoria || product.category) && (
                      <span style={{
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75em',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {product.categoria || product.category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      width: '100%',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: '600',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>
                    Ver Producto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {topProducts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Link to="/store" style={{
              backgroundColor: 'transparent',
              color: '#3b82f6',
              padding: '14px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1em',
              border: '2px solid #3b82f6',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#3b82f6';
            }}>
              Ver Todos los Productos
            </Link>
          </div>
        )}
      </section>

      <section style={{
        maxWidth: '1200px',
        margin: '80px auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '60px',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '2.5em', fontWeight: '900', marginBottom: '20px', color: '#1f2937' }}>
            Sobre Nosotros
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px', lineHeight: '1.8', fontSize: '1.05em' }}>
            HuancaPlastic nació en el año 2008, impulsado por la visión de ofrecer soluciones de almacenamiento y mobiliario accesibles para las familias y negocios de Huancayo.
          </p>
          <p style={{ color: '#6b7280', marginBottom: '20px', lineHeight: '1.8', fontSize: '1.05em' }}>
            Hoy en día, somos líderes en el mercado de soluciones plásticas, comprometidos con la calidad y la satisfacción del cliente.
          </p>
          <Link to="/contact" style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-block',
            fontSize: '1em'
          }}>
            Más Información
          </Link>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          minHeight: '400px',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2em',
          fontWeight: '900',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          Calidad y Confianza desde 2008
        </div>
      </section>

      <section style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5em', fontWeight: '900', marginBottom: '20px' }}>
          Comienza tu experiencia hoy
        </h2>
        <p style={{ fontSize: '1.2em', marginBottom: '40px', opacity: '0.9' }}>
          Únete a miles de clientes satisfechos que confían en HuancaPlastic
        </p>
        <Link to="/store" style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '16px 40px',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '1.1em',
          display: 'inline-block'
        }}>
          Ir a la Tienda
        </Link>
      </section>

      {/* Modal de detalles del producto */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '2em',
                cursor: 'pointer',
                color: '#999',
                fontWeight: 'bold',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
            >
              ×
            </button>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', 
              gap: '25px',
              marginTop: '10px'
            }}>
              <div>
                <img
                  src={selectedProduct.imagen_principal}
                  alt={selectedProduct.nombre}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    maxHeight: '350px'
                  }}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400?text=${encodeURIComponent(selectedProduct.nombre)}`;
                  }}
                />
              </div>

              <div>
                <h2 style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '0 0 15px 0', color: '#1f2937' }}>
                  {selectedProduct.nombre}
                </h2>
                <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '1.05em', lineHeight: '1.6' }}>
                  {selectedProduct.descripcion}
                </p>
                <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#3b82f6', margin: '20px 0' }}>
                  S/. {selectedProduct.precio.toFixed(2)}
                </p>

                {selectedProduct.descripcion_larga && (
                  <>
                    <h4 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#1f2937', fontSize: '1.1em' }}>
                      Detalles del producto:
                    </h4>
                    <p style={{ color: '#4b5563', lineHeight: '1.7', fontSize: '0.95em' }}>
                      {selectedProduct.descripcion_larga}
                    </p>
                  </>
                )}

                <div style={{ marginTop: '30px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <Link 
                    to="/store"
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1em',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                  >
                    Ir a la Tienda
                  </Link>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#f3f4f6',
                      color: '#1f2937',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.95em',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

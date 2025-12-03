import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { productsService, categoriesService } from '../services';

export const Store = () => {
  const { addToCart } = useCart();
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar productos de Supabase con sincronización en tiempo real
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await productsService.getAllProducts();
        if (data && data.length > 0) {
          setProductos(data);
          console.log(`[Store] Loaded ${data.length} products from database`);
        }
      } catch (error) {
        console.error('[Store] Error loading products:', error);
      } finally {
        setCargando(false);
      }
    };

    const cargarCategorias = async () => {
      try {
        const data = await categoriesService.getAllCategorias();
        setCategorias(data);
        console.log(`[Store] Loaded ${data.length} categories from database`, data);
      } catch (error) {
        console.error('[Store] Error loading categories:', error);
      }
    };

    cargarProductos();
    cargarCategorias();

    // Suscribirse a cambios en tiempo real
    const handleProductChange = async (payload) => {
      console.log('[Store] Product change detected:', payload.eventType);
      const data = await productsService.getAllProducts();
      if (data) {
        setProductos(data);
      }
    };

    const subscription = productsService.subscribeToProductChanges(handleProductChange);

    // Cleanup: desuscribirse cuando el componente se desmonta
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return productos.filter(product => {
      const nombre = product.nombre || '';
      const descripcion = product.descripcion || '';
      
      // Filtro por categoría (UUID)
      const matchesCategory = selectedFilter === 'todos' || product.categoria_id === selectedFilter;
      
      // Filtro por búsqueda
      const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedFilter, searchTerm, productos]);

  const handleAddToCart = (product) => {
    const productoParaCarrito = {
      id: product.id,
      nombre: product.nombre,
      price: product.precio,
      precio: product.precio,
      imagen_principal: product.imagen_principal,
      description: product.descripcion,
      quantity: 1
    };
    addToCart(productoParaCarrito);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <div style={{ 
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5em', margin: '0 0 10px 0', fontWeight: 'bold' }}>Catálogo de Productos</h1>
        <p style={{ fontSize: '1.1em', margin: 0 }}>Calidad y resistencia para el hogar y la industria</p>
      </div>

      {cargando ? (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}/>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ fontSize: '1.1em', color: '#666' }}>Cargando productos...</p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '30px 20px' }}>
          {/* Búsqueda */}
          <div style={{ marginBottom: '30px' }}>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px',
                fontSize: '1em',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filtros de categoría */}
          <div style={{ 
            display: 'flex',
            gap: '10px',
            marginBottom: '30px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {/* Botón "Todos" */}
            <button
              onClick={() => {
                console.log('🔵 Filtro seleccionado: todos');
                setSelectedFilter('todos');
              }}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '0.95em',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                backgroundColor: selectedFilter === 'todos' ? '#2563eb' : '#fff',
                color: selectedFilter === 'todos' ? '#fff' : '#333',
                boxShadow: selectedFilter === 'todos' ? '0 4px 10px rgba(37, 99, 235, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)'
              }}
            >
              Todos
            </button>

            {/* Botones de categorías dinámicas */}
            {categorias.length > 0 ? (
              categorias.map(categoria => (
                <button
                  key={categoria.id}
                  onClick={() => {
                    console.log(`🔵 Filtro seleccionado: ${categoria.nombre} (ID: ${categoria.id})`);
                    setSelectedFilter(categoria.id);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '0.95em',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    backgroundColor: selectedFilter === categoria.id ? '#2563eb' : '#fff',
                    color: selectedFilter === categoria.id ? '#fff' : '#333',
                    boxShadow: selectedFilter === categoria.id ? '0 4px 10px rgba(37, 99, 235, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  {categoria.nombre}
                </button>
              ))
            ) : (
              <p style={{ color: '#999', fontSize: '0.9em' }}>
                Cargando categorías...
              </p>
            )}
          </div>

          {/* Mensaje si no hay productos */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: '1.2em', color: '#666' }}>No hay productos que coincidan con tu búsqueda</p>
            </div>
          ) : (
            /* Grid de productos */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '25px'
            }}>
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Imagen */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    backgroundColor: '#f0f0f0'
                  }}>
                    <img
                      src={product.imagen_principal}
                      alt={product.nombre}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.nombre)}`;
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  </div>

                  {/* Contenido */}
                  <div style={{ padding: '15px' }}>
                    <h3 style={{ 
                      fontSize: '1.1em',
                      fontWeight: 'bold',
                      margin: '0 0 8px 0',
                      color: '#333'
                    }}>
                      {product.nombre}
                    </h3>
                    <p style={{ 
                      fontSize: '0.9em',
                      color: '#666',
                      margin: '0 0 12px 0',
                      minHeight: '40px',
                      lineHeight: '1.4'
                    }}>
                      {product.descripcion}
                    </p>
                    <div style={{ 
                      fontSize: '1.3em',
                      fontWeight: 'bold',
                      color: '#2563eb',
                      marginBottom: '12px'
                    }}>
                      S/. {product.precio.toFixed(2)}
                    </div>

                    {/* Botones */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1d4ed8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }}
                    >
                      Añadir al Carrito
                    </button>

                    <button
                      onClick={() => setSelectedProduct(product)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#f0f0f0',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de detalles */}
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
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '2em',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <img
                  src={selectedProduct.imagen_principal}
                  alt={selectedProduct.nombre}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    height: '300px'
                  }}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/300?text=${encodeURIComponent(selectedProduct.nombre)}`;
                  }}
                />
              </div>

              <div>
                <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  {selectedProduct.nombre}
                </h2>
                <p style={{ color: '#666', margin: '0 0 15px 0', fontSize: '1em' }}>
                  {selectedProduct.descripcion}
                </p>
                <p style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#2563eb', margin: '15px 0' }}>
                  S/. {selectedProduct.precio.toFixed(2)}
                </p>

                {selectedProduct.descripcion_larga && (
                  <>
                    <h4 style={{ fontWeight: 'bold', marginTop: '15px', marginBottom: '10px' }}>
                      Detalles:
                    </h4>
                    <p style={{ color: '#555', lineHeight: '1.6' }}>
                      {selectedProduct.descripcion_larga}
                    </p>
                  </>
                )}

                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginTop: '20px',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                >
                  Añadir al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

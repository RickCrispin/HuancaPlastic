import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ROLES, PERMISOS, tienePermiso } from '../../constants/rolesPermisos';

const SVGIconProducts = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const SVGIconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SVGIconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const SVGIconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export const GestorProductos = ({ usuarioAdmin }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [categorias, setCategorias] = useState([]); // ← NUEVA línea
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    descripcion_larga: '',
    precio: '',
    stock: '',
    categoria_id: '', // ← CAMBIO: de 'categoria' a 'categoria_id'
    imagen_principal: '' // ← CAMBIO: imagen_url → imagen_principal
  });
  const [mensaje, setMensaje] = useState('');

  // Verificar permisos
  const puedeVerProductos = tienePermiso(usuarioAdmin?.rol, PERMISOS.VER_PRODUCTOS);
  const puedeCrear = tienePermiso(usuarioAdmin?.rol, PERMISOS.CREAR_PRODUCTO);
  const puedeEditar = tienePermiso(usuarioAdmin?.rol, PERMISOS.EDITAR_PRODUCTO);
  const puedeEliminar = tienePermiso(usuarioAdmin?.rol, PERMISOS.ELIMINAR_PRODUCTO);
  const puedeEditarStock = tienePermiso(usuarioAdmin?.rol, PERMISOS.VER_STOCK);
  const puedeEditarPrecio = tienePermiso(usuarioAdmin?.rol, PERMISOS.MODIFICAR_PRECIO);

  useEffect(() => {
    if (puedeVerProductos) {
      cargarProductos();
      cargarCategorias(); // ← NUEVA línea
    }
  }, [puedeVerProductos]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setMensaje('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // ← NUEVA función para cargar categorías
  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nombre')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      // No mostrar error al usuario, solo en consola
    }
  };

  const handleGuardar = async () => {
    try {
      if (!formData.nombre || !formData.precio || !formData.stock) {
        setMensaje('Nombre, precio y stock son requeridos');
        return;
      }

      if (!formData.categoria_id) {
        setMensaje('Categoría es requerida');
        return;
      }

      const datosGuardar = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        descripcion_larga: formData.descripcion_larga,
        categoria_id: formData.categoria_id, // Ya es el ID correcto de la categoría
        imagen_principal: formData.imagen_principal,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock)
      };

      if (editando) {
        const { error } = await supabase
          .from('productos')
          .update(datosGuardar)
          .eq('id', editando.id);

        if (error) throw error;
        setMensaje('Producto actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([datosGuardar]);

        if (error) throw error;
        setMensaje('Producto creado correctamente');
      }

      setModalOpen(false);
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        descripcion_larga: '',
        precio: '',
        stock: '',
        categoria_id: '', // ← CAMBIO
        imagen_principal: '' // ← CAMBIO: imagen_url → imagen_principal
      });
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setMensaje('Error al guardar producto: ' + error.message);
    }
  };

  const handleEliminar = async (productoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productoId);

      if (error) throw error;
      setMensaje('Producto eliminado correctamente');
      cargarProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setMensaje('Error al eliminar producto: ' + error.message);
    }
  };

  if (!puedeVerProductos) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        No tienes permisos para acceder al gestor de productos
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5em', fontWeight: 'bold' }}>
          <SVGIconProducts />
          Gestor de Productos
        </div>
        {puedeCrear && (
          <button
            onClick={() => {
              setEditando(null);
              setFormData({
                nombre: '',
                descripcion: '',
                descripcion_larga: '',
                precio: '',
                stock: '',
                categoria_id: '',
                imagen_principal: ''
              });
              setModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <SVGIconPlus />
            Crear Producto
          </button>
        )}
      </div>

      {mensaje && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: mensaje.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: mensaje.includes('Error') ? '#991b1b' : '#166534',
          borderRadius: '8px',
          borderLeft: `4px solid ${mensaje.includes('Error') ? '#dc2626' : '#16a34a'}`
        }}>
          {mensaje}
        </div>
      )}

      {loading ? (
        <div>Cargando productos...</div>
      ) : (
        <div style={{
          overflowX: 'auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Nombre</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Categoría</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>Precio</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                // Mapear categoria_id a nombre
                const categoriaNombre = categorias.find(c => c.id === producto.categoria_id)?.nombre || '-';
                return (
                <tr key={producto.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>{producto.nombre}</td>
                  <td style={{ padding: '12px 16px' }}>{categoriaNombre}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    ${parseFloat(producto.precio).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: producto.stock > 5 ? '#dcfce7' : '#fef3c7',
                      color: producto.stock > 5 ? '#166534' : '#92400e',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      fontWeight: '600'
                    }}>
                      {producto.stock}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {puedeEditar && (
                        <button
                          onClick={() => {
                            setEditando(producto);
                            setFormData({
                              nombre: producto.nombre,
                              descripcion: producto.descripcion || '',
                              descripcion_larga: producto.descripcion_larga || '',
                              precio: producto.precio.toString(),
                              stock: producto.stock.toString(),
                              categoria_id: producto.categoria_id?.toString() || '', // ← CAMBIO
                              imagen_principal: producto.imagen_principal || '' // ← CAMBIO: imagen_url → imagen_principal
                            });
                            setModalOpen(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <SVGIconEdit />
                          Editar
                        </button>
                      )}
                      {puedeEliminar && (
                        <button
                          onClick={() => handleEliminar(producto.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <SVGIconTrash />
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edición */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            margin: '20px auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editando ? 'Editar Producto' : 'Crear Producto'}
            </h2>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  minHeight: '100px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Descripción Larga</label>
              <textarea
                value={formData.descripcion_larga}
                onChange={(e) => setFormData({ ...formData, descripcion_larga: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  minHeight: '150px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Categoría *</label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Seleccionar categoría --</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '5px' }}>URL de Imagen</label>
              <input
                type="url"
                value={formData.imagen_principal}
                onChange={(e) => setFormData({ ...formData, imagen_principal: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleGuardar}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Guardar
              </button>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

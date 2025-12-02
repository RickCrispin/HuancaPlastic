import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { profileService } from '../lib/profileService';

// Ciudades del Perú
const CIUDADES_PERU = [
  'Seleccionar ciudad',
  'Abancay',
  'Ica',
  'Arequipa',
  'Ayacucho',
  'Cajamarca',
  'Cusco',
  'Huancayo',
  'Huaraz',
  'Junín',
  'La Paz',
  'Lima',
  'Moquegua',
  'Nazca',
  'Piura',
  'Pucallpa',
  'Puerto Maldonado',
  'Puno',
  'Tarapoto',
  'Tacna',
  'Trujillo',
  'Tumbes'
];

// SVG Icons sin emojis
const SVGIconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const SVGIconCity = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const SVGIconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const SVGIconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const SVGIconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const SVGIconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const SVGIconImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

export const Profile = () => {
  const navigate = useNavigate();
  const { usuario, actualizarUsuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mostrarFoto, setMostrarFoto] = useState(false);
  
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    ciudad: '',
    pais: 'Perú',
    bio: '',
    fotoPerfilUrl: ''
  });

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    cargarPerfil();
  }, [usuario, navigate]);

  const cargarPerfil = async () => {
    try {
      const perfilData = await profileService.obtenerPerfil(usuario.id);

      setPerfil(perfilData || {});
      setFormData({
        nombreCompleto: usuario.nombre_completo,
        email: usuario.email,
        telefono: usuario.telefono || '',
        ciudad: perfilData?.ciudad || 'Seleccionar ciudad',
        pais: 'Perú',
        bio: perfilData?.bio || '',
        fotoPerfilUrl: perfilData?.foto_perfil || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setFormData({
        nombreCompleto: usuario.nombre_completo,
        email: usuario.email,
        telefono: usuario.telefono || '',
        ciudad: 'Seleccionar ciudad',
        pais: 'Perú',
        bio: '',
        fotoPerfilUrl: ''
      });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardar = async () => {
    try {
      setMensaje('');
      
      if (formData.ciudad === 'Seleccionar ciudad') {
        setMensaje('Debes seleccionar una ciudad válida');
        return;
      }
      
      // Actualizar usuario (nombre_completo y telefono)
      const { data: usuarioActualizado, error: errorUsuario } = await supabase
        .from('usuarios')
        .update({
          nombre_completo: formData.nombreCompleto,
          telefono: formData.telefono
        })
        .eq('id', usuario.id)
        .select()
        .single();

      if (errorUsuario) throw errorUsuario;

      // Actualizar perfil con ciudad, pais, bio y foto_perfil
      const datosPerfilUpdate = {
        ciudad: formData.ciudad,
        pais: 'Perú',
        bio: formData.bio || null,
        foto_perfil: formData.fotoPerfilUrl || null
      };

      try {
        if (perfil?.id) {
          // Actualizar perfil existente
          await profileService.actualizarPerfil(usuario.id, datosPerfilUpdate);
        } else {
          // Crear nuevo perfil
          const nuevoPerfil = await profileService.crearPerfil(usuario.id, datosPerfilUpdate);
          setPerfil(nuevoPerfil);
        }
      } catch (perfilError) {
        console.error('Error en operación de perfil:', perfilError);
        throw new Error('Error al guardar el perfil: ' + perfilError.message);
      }

      // Actualizar usuario en contexto con la foto_perfil
      const usuarioConFoto = {
        ...usuarioActualizado,
        foto_perfil: formData.fotoPerfilUrl || null
      };
      actualizarUsuario(usuarioConFoto);
      setEditMode(false);
      setMensaje('Perfil actualizado correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      setMensaje('Error al actualizar perfil: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}>
        <div style={{ fontSize: '1.2em', color: '#666' }}>Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.5s ease-in'
      }}>
        {/* Header con título y foto de perfil */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '2px solid #f0f0f0', paddingBottom: '20px', gap: '30px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '2.5em', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
              Mi Perfil
            </h1>
          </div>
          
          {/* Foto de Perfil Circular Grande */}
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            overflow: 'hidden',
            border: '4px solid #667eea',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            flexShrink: 0
          }}>
            {formData.fotoPerfilUrl ? (
              <img 
                src={formData.fotoPerfilUrl} 
                alt="Foto de perfil"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                onLoad={(e) => {
                  e.target.style.display = 'block';
                }}
              />
            ) : (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </div>
          <button
            onClick={() => {
              if (editMode) {
                setFormData({
                  nombreCompleto: usuario.nombre_completo,
                  email: usuario.email,
                  telefono: usuario.telefono || '',
                  ciudad: perfil?.ciudad || 'Seleccionar ciudad',
                  pais: 'Perú',
                  bio: perfil?.bio || '',
                  fotoPerfilUrl: perfil?.foto_perfil || ''
                });
                setMostrarFoto(false);
                setEditMode(false);
              } else {
                setEditMode(true);
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: editMode ? '#999' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = editMode ? '#888' : '#764ba2';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = editMode ? '#999' : '#667eea';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <SVGIconEdit />
            {editMode ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div style={{
            padding: '15px 20px',
            marginBottom: '25px',
            backgroundColor: mensaje.includes('Error') || mensaje.includes('Debes') ? '#fee2e2' : '#dcfce7',
            color: mensaje.includes('Error') || mensaje.includes('Debes') ? '#991b1b' : '#166534',
            borderRadius: '8px',
            borderLeft: '4px solid ' + (mensaje.includes('Error') || mensaje.includes('Debes') ? '#dc2626' : '#16a34a'),
            fontWeight: '500'
          }}>
            {mensaje}
          </div>
        )}

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          {/* Nombre Completo */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95em',
              fontWeight: '700',
              marginBottom: '10px',
              color: '#1f2937',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Nombre Completo
            </label>
            {editMode ? (
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#764ba2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(118, 75, 162, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = 'none';
                }}
              />
            ) : (
              <div style={{
                padding: '12px 15px',
                backgroundColor: '#fff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                color: '#1f2937',
                fontSize: '1em',
                fontWeight: '500'
              }}>
                {formData.nombreCompleto}
              </div>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95em',
              fontWeight: '700',
              marginBottom: '10px',
              color: '#1f2937',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Email
            </label>
            <div style={{
              padding: '12px 15px',
              backgroundColor: '#fff',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '1em'
            }}>
              {formData.email}
            </div>
            <small style={{ color: '#9ca3af', marginTop: '6px', display: 'block', fontSize: '0.85em' }}>
              El email no se puede modificar
            </small>
          </div>

          {/* Teléfono */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95em',
              fontWeight: '700',
              marginBottom: '10px',
              color: '#1f2937',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <SVGIconPhone />
              Teléfono
            </label>
            {editMode ? (
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+51 999 999 999"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#764ba2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(118, 75, 162, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = 'none';
                }}
              />
            ) : (
              <div style={{
                padding: '12px 15px',
                backgroundColor: '#fff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                color: '#1f2937',
                fontSize: '1em',
                fontWeight: '500'
              }}>
                {formData.telefono || 'No especificado'}
              </div>
            )}
          </div>

          {/* Ciudad y País */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            {/* Ciudad (Select) */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95em',
                fontWeight: '700',
                marginBottom: '10px',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <SVGIconCity />
                Ciudad
              </label>
              {editMode ? (
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    fontSize: '1em',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#764ba2';
                    e.target.style.boxShadow = '0 0 0 3px rgba(118, 75, 162, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {CIUDADES_PERU.map((ciudad) => (
                    <option key={ciudad} value={ciudad}>
                      {ciudad}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{
                  padding: '12px 15px',
                  backgroundColor: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '1em',
                  fontWeight: '500'
                }}>
                  {formData.ciudad && formData.ciudad !== 'Seleccionar ciudad' ? formData.ciudad : 'No especificado'}
                </div>
              )}
            </div>

            {/* País (Fijo) */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.95em',
                fontWeight: '700',
                marginBottom: '10px',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                País
              </label>
              <div style={{
                padding: '12px 15px',
                backgroundColor: '#f3f4f6',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                color: '#1f2937',
                fontSize: '1em',
                fontWeight: '500',
                cursor: 'not-allowed'
              }}>
                {formData.pais}
              </div>
              <small style={{ color: '#9ca3af', marginTop: '6px', display: 'block', fontSize: '0.85em' }}>
                Campo fijo para Perú
              </small>
            </div>
          </div>

          {/* Foto de Perfil - Colapsable */}
          <div style={{ marginBottom: '25px' }}>
            <button
              onClick={() => setMostrarFoto(!mostrarFoto)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95em',
                fontWeight: '700',
                marginBottom: '10px',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1f2937';
              }}
            >
              <SVGIconImage />
              Foto de Perfil
              <span style={{ fontSize: '0.8em', marginLeft: 'auto' }}>
                {mostrarFoto ? '▼' : '▶'}
              </span>
            </button>

            {mostrarFoto && editMode ? (
              <div>
                <input
                  type="text"
                  name="fotoPerfilUrl"
                  value={formData.fotoPerfilUrl}
                  onChange={handleChange}
                  placeholder="Ingresa la URL de tu foto de perfil"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    fontSize: '1em',
                    boxSizing: 'border-box',
                    marginBottom: '12px',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    marginTop: '10px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#764ba2';
                    e.target.style.boxShadow = '0 0 0 3px rgba(118, 75, 162, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {formData.fotoPerfilUrl && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <img 
                      src={formData.fotoPerfilUrl} 
                      alt="Vista previa"
                      style={{
                        maxWidth: '150px',
                        maxHeight: '150px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <small style={{ color: '#9ca3af', marginTop: '6px', display: 'block', fontSize: '0.85em' }}>
                  Ingresa una URL válida de una imagen (JPG, PNG, etc.)
                </small>
              </div>
            ) : null}
          </div>

          {/* Biografía */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95em',
              fontWeight: '700',
              marginBottom: '10px',
              color: '#1f2937',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Biografía
            </label>
            {editMode ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Cuéntanos sobre ti..."
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '1em',
                  boxSizing: 'border-box',
                  minHeight: '120px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#764ba2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(118, 75, 162, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = 'none';
                }}
              />
            ) : (
              <div style={{
                padding: '12px 15px',
                backgroundColor: '#fff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                color: '#1f2937',
                minHeight: '80px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.6'
              }}>
                {formData.bio || 'No hay biografía'}
              </div>
            )}
          </div>

          {/* Información de Fechas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px', paddingTop: '25px', borderTop: '2px solid #e5e7eb' }}>
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85em',
                color: '#6b7280',
                marginBottom: '8px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <SVGIconCalendar />
                Miembro desde
              </label>
              <div style={{
                padding: '12px 15px',
                backgroundColor: '#fff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                color: '#1f2937',
                fontSize: '0.95em',
                fontWeight: '500'
              }}>
                {new Date(usuario?.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85em',
                color: '#6b7280',
                marginBottom: '8px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <SVGIconClock />
                Último acceso
              </label>
              <div style={{
                padding: '12px 15px',
                backgroundColor: '#fff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                color: '#1f2937',
                fontSize: '0.95em',
                fontWeight: '500'
              }}>
                {usuario?.ultimo_login
                  ? new Date(usuario.ultimo_login).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Primera vez'}
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          {editMode && (
            <button
              onClick={handleGuardar}
              style={{
                width: '100%',
                marginTop: '30px',
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1em',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <SVGIconSave />
              Guardar Cambios
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus('Mensaje enviado correctamente. Nos contactaremos pronto!');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitStatus(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <section style={{
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2em', fontWeight: 'bold', margin: '0 0 10px 0' }}>Contacto</h1>
        <p style={{ margin: 0 }}>Estamos aquí para ayudarte</p>
      </section>

      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '40px 20px'
      }}>
        <h2 style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '30px' }}>Sobre Nosotros</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '15px' }}>Nuestra Historia</h3>
            <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '15px' }}>
              HuancaPlastic nació en el año 2008, impulsado por la visión de ofrecer soluciones de almacenamiento y mobiliario accesibles para las familias y negocios de Huancayo. Lo que inició como un pequeño puesto de distribución local, pronto comenzó a destacar por la durabilidad de sus productos y la seriedad en su atención.
            </p>
            <p style={{ color: '#666', lineHeight: '1.8' }}>
              Con el tiempo, el esfuerzo constante y el compromiso con la calidad permitieron que HuancaPlastic evolucionara hasta convertirse en un referente en la distribución de plásticos, abasteciendo tanto a hogares como a la industria.
            </p>
          </div>
          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            fontSize: '8em'
          }}>
            🏢
          </div>
        </div>
      </section>

      <section style={{
        backgroundColor: '#f5f5f5',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '2em', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
            Contáctanos
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px'
          }}>
            {/* Contact Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '30px'
            }}>
              <h3 style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '20px' }}>Envíanos un Mensaje</h3>
              {submitStatus && (
                <div style={{
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '12px',
                  borderRadius: '5px',
                  marginBottom: '20px'
                }}>
                  {submitStatus}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Asunto
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Mensaje
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '5px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '30px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '25px' }}>
                  Información de Contacto
                </h3>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: '10px' }}>
                    📍 Dirección
                  </h4>
                  <p style={{ color: '#666', margin: 0 }}>Calle Los Tulipanes, Huancayo</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: '10px' }}>
                    📞 Teléfono
                  </h4>
                  <p style={{ color: '#666', margin: 0 }}>(064) 456-7890</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: '10px' }}>
                    ✉️ Email
                  </h4>
                  <p style={{ color: '#666', margin: 0 }}>HuancaPlastic@gmail.com</p>
                </div>
                <div>
                  <h4 style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: '10px' }}>
                    🕐 Horario de Atención
                  </h4>
                  <p style={{ color: '#666', margin: '0 0 5px 0' }}>
                    Lunes a Viernes: 8:00 AM - 6:00 PM
                  </p>
                  <p style={{ color: '#666', margin: 0 }}>Sábado: 9:00 AM - 1:00 PM</p>
                </div>
              </div>

              {/* Map */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                height: '350px'
              }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243.86439369692545!2d-75.21652852823941!3d-12.055194505217859!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e963bd7fd3903%3A0xf63c9f2b75b3c21f!2sManuel%20Fuentes%20315%2C%2012004!5e0!3m2!1ses!2spe!4v1764511928245!5m2!1ses!2spe"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

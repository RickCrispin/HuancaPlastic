import React from 'react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        marginBottom: '30px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '15px' }}>Sobre Nosotros</h3>
          <p style={{ color: '#d1d5db', lineHeight: '1.6', marginBottom: '15px' }}>
            HuancaPlastic te ofrece los mejores productos calidad precio.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >FB</a>
            <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >TW</a>
            <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >IG</a>
            <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
            >PT</a>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '15px' }}>Explorar</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <a href="/" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              >Inicio</a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="/store" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              >Tienda</a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="/contact" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              >Contacto</a>
            </li>
            <li>
              <a href="/cart" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              >Carrito</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '15px' }}>Contacto</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '10px', color: '#d1d5db' }}>Calle Los Tulipanes, Huancayo</li>
            <li style={{ marginBottom: '10px', color: '#d1d5db' }}>Teléfono: (064) 456-7890</li>
            <li style={{ color: '#d1d5db' }}>Email: HuancaPlastic@gmail.com</li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '15px' }}>Noticias Recientes</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              >Nuevos productos</a>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              >Horario de atención</a>
            </li>
            <li>
              <a href="#" style={{ color: '#d1d5db', textDecoration: 'none', transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
              >Pedidos anticipados</a>
            </li>
          </ul>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #4b5563',
        paddingTop: '20px',
        textAlign: 'center',
        color: '#d1d5db'
      }}>
        <p>&copy; 2025 HuancaPlastic. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

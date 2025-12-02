import React, { useState } from 'react';
import { PERMISOS, tienePermiso } from '../../constants/rolesPermisos';

const SVGIconDollar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const SVGIconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

export const GestorFinanzas = ({ usuarioAdmin }) => {
  const [mensaje, setMensaje] = useState('');

  const puedeVerFinanzas = tienePermiso(usuarioAdmin?.rol, PERMISOS.VER_FINANZAS);
  const puedeExportarReportes = tienePermiso(usuarioAdmin?.rol, PERMISOS.EXPORTAR_REPORTES);

  const estadisticasDemo = {
    totalVentas: 2150.00,
    ventasHoy: 320.50,
    ventasEstasMes: 1850.75,
    productosVendidos: 47,
    clientesActivos: 12,
    ticketPromedio: 45.74
  };

  const ventasRecientes = [
    { id: 1, cliente: 'Juan Pérez', total: 150.00, fecha: '2025-12-02', estado: 'Completada' },
    { id: 2, cliente: 'María López', total: 95.50, fecha: '2025-12-02', estado: 'Completada' },
    { id: 3, cliente: 'Carlos García', total: 74.99, fecha: '2025-12-01', estado: 'Completada' },
    { id: 4, cliente: 'Ana Martínez', total: 210.00, fecha: '2025-12-01', estado: 'Completada' },
    { id: 5, cliente: 'Roberto Sánchez', total: 130.00, fecha: '2025-11-30', estado: 'Completada' }
  ];

  const handleExportarCSV = () => {
    const headers = ['ID', 'Cliente', 'Total', 'Fecha', 'Estado'];
    const rows = ventasRecientes.map(v => [v.id, v.cliente, `$${v.total.toFixed(2)}`, v.fecha, v.estado]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-finanzas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setMensaje('✅ Reporte exportado correctamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  if (!puedeVerFinanzas) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>No tienes permisos para acceder</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        <SVGIconDollar />
        <h2 style={{ margin: 0, fontSize: '1.5em', color: '#1f2937' }}>Gestión de Finanzas</h2>
      </div>

      {mensaje && <div style={{ backgroundColor: '#dbeafe', color: '#0c4a6e', padding: '12px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #3b82f6' }}>{mensaje}</div>}

      {/* Tarjetas de Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        {[
          { label: 'Total Ventas', valor: `$${estadisticasDemo.totalVentas.toFixed(2)}`, color: '#3b82f6' },
          { label: 'Ventas Hoy', valor: `$${estadisticasDemo.ventasHoy.toFixed(2)}`, color: '#10b981' },
          { label: 'Ventas Este Mes', valor: `$${estadisticasDemo.ventasEstasMes.toFixed(2)}`, color: '#f59e0b' },
          { label: 'Productos Vendidos', valor: estadisticasDemo.productosVendidos, color: '#8b5cf6' }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${stat.color}` }}>
            <div style={{ fontSize: '0.9em', color: '#6b7280', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: stat.color }}>{stat.valor}</div>
          </div>
        ))}
      </div>

      {/* Tabla de Ventas Recientes */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1em', color: '#1f2937' }}>Ventas Recientes</h3>
          {puedeExportarReportes && (
            <button onClick={handleExportarCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'} onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}>
              <SVGIconDownload /> Exportar CSV
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4b5563' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4b5563' }}>Cliente</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#4b5563' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4b5563' }}>Fecha</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#4b5563' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventasRecientes.map((venta) => (
                <tr key={venta.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{venta.id}</td>
                  <td style={{ padding: '12px', color: '#1f2937', fontWeight: '500' }}>{venta.cliente}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: '600' }}>${venta.total.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{venta.fecha}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em', fontWeight: '500' }}>{venta.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #16a34a' }}>
        <p style={{ margin: 0, color: '#166534', fontSize: '0.9em' }}>
          <strong>📊 Nota:</strong> Los datos financieros se sincronizan automáticamente desde la tabla de órdenes. Los datos mostrados aquí son de demostración.
        </p>
      </div>
    </div>
  );
};

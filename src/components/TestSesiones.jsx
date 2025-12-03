import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessionService, supabase } from '../services';
import '../styles/TestSesiones.css';

/**
 * Componente de prueba para verificar el sistema de sesiones seguras
 */
export default function TestSesiones() {
  const { usuario } = useAuth();
  const [sesionInfo, setSesionInfo] = useState(null);
  const [sesionesActivas, setSesionesActivas] = useState([]);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    if (usuario) {
      cargarInfoSesion();
      cargarSesionesActivas();
    }
  }, [usuario]);

  const cargarInfoSesion = async () => {
    const token = sessionStorage.getItem('token_sesion');
    const usuarioId = sessionStorage.getItem('usuario_id');
    const expires = sessionStorage.getItem('session_expires');

    setSesionInfo({
      token: token ? `${token.substring(0, 20)}...` : 'No hay token',
      usuarioId: usuarioId || 'No encontrado',
      expires: expires ? new Date(expires).toLocaleString() : 'No definido',
      hasLocalStorage: !!localStorage.getItem('usuario'),
      hasSessionStorage: !!sessionStorage.getItem('token_sesion')
    });
  };

  const cargarSesionesActivas = async () => {
    if (!usuario?.id) return;

    try {
      const { data, error } = await supabase
        .from('sesiones')
        .select('*')
        .eq('usuario_id', usuario.id)
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSesionesActivas(data);
      }
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    }
  };

  const agregarResultado = (test, exitoso, mensaje) => {
    setTestResults(prev => [...prev, {
      test,
      exitoso,
      mensaje,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testValidarSesion = async () => {
    const token = sessionStorage.getItem('token_sesion');
    const resultado = await sessionService.validarSesion(token);
    
    agregarResultado(
      'Validar Sesión',
      resultado.valida,
      resultado.valida ? 'Sesión válida ✅' : `Error: ${resultado.error}`
    );
  };

  const testHaySesionActiva = async () => {
    const hay = await sessionService.haySesionActiva();
    
    agregarResultado(
      'Hay Sesión Activa',
      hay,
      hay ? 'Sesión activa detectada ✅' : 'No hay sesión activa ❌'
    );
  };

  const testConsultarBD = async () => {
    try {
      const token = sessionStorage.getItem('token_sesion');
      const { data, error } = await supabase
        .from('sesiones')
        .select('*')
        .eq('token', token)
        .single();

      agregarResultado(
        'Consultar BD',
        !error && data,
        !error ? `Sesión encontrada en BD: ID ${data.id.substring(0, 8)}... ✅` : `Error: ${error.message}`
      );
    } catch (error) {
      agregarResultado('Consultar BD', false, `Error: ${error.message}`);
    }
  };

  const testCrearNuevaSesion = async () => {
    if (!usuario?.id) {
      agregarResultado('Crear Nueva Sesión', false, 'No hay usuario logueado');
      return;
    }

    const resultado = await sessionService.crearSesion(usuario.id);
    
    agregarResultado(
      'Crear Nueva Sesión',
      resultado.success,
      resultado.success ? `Nueva sesión creada: ${resultado.token.substring(0, 20)}... ✅` : `Error: ${resultado.error}`
    );

    if (resultado.success) {
      cargarInfoSesion();
      cargarSesionesActivas();
    }
  };

  const testLimpiarExpiradas = async () => {
    const resultado = await sessionService.limpiarSesionesExpiradas();
    
    agregarResultado(
      'Limpiar Expiradas',
      resultado.success,
      resultado.success ? 'Sesiones expiradas limpiadas ✅' : `Error: ${resultado.error}`
    );

    cargarSesionesActivas();
  };

  const limpiarResultados = () => {
    setTestResults([]);
  };

  if (!usuario) {
    return (
      <div className="test-sesiones">
        <div className="test-card">
          <h2>⚠️ Debes iniciar sesión</h2>
          <p>Este panel de pruebas requiere que estés autenticado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-sesiones">
      <h1>🔐 Panel de Pruebas - Sistema de Sesiones</h1>

      {/* Información de Sesión Actual */}
      <div className="test-card">
        <h2>📊 Información de Sesión Actual</h2>
        {sesionInfo && (
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Token:</span>
              <span className="value">{sesionInfo.token}</span>
            </div>
            <div className="info-item">
              <span className="label">Usuario ID:</span>
              <span className="value">{sesionInfo.usuarioId}</span>
            </div>
            <div className="info-item">
              <span className="label">Expira:</span>
              <span className="value">{sesionInfo.expires}</span>
            </div>
            <div className="info-item">
              <span className="label">localStorage tiene 'usuario':</span>
              <span className={`badge ${sesionInfo.hasLocalStorage ? 'error' : 'success'}`}>
                {sesionInfo.hasLocalStorage ? '❌ SÍ (INSEGURO)' : '✅ NO'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">sessionStorage tiene token:</span>
              <span className={`badge ${sesionInfo.hasSessionStorage ? 'success' : 'error'}`}>
                {sesionInfo.hasSessionStorage ? '✅ SÍ' : '❌ NO'}
              </span>
            </div>
          </div>
        )}
        <button onClick={cargarInfoSesion} className="btn-secondary">
          🔄 Recargar Info
        </button>
      </div>

      {/* Sesiones Activas en BD */}
      <div className="test-card">
        <h2>💾 Sesiones Activas en Base de Datos</h2>
        <p className="subtitle">Total: {sesionesActivas.length}</p>
        
        {sesionesActivas.length === 0 ? (
          <p className="no-data">No hay sesiones activas</p>
        ) : (
          <div className="sesiones-list">
            {sesionesActivas.map((sesion) => (
              <div key={sesion.id} className="sesion-item">
                <div className="sesion-info">
                  <span className="sesion-id">ID: {sesion.id.substring(0, 8)}...</span>
                  <span className="sesion-fecha">Creada: {new Date(sesion.created_at).toLocaleString()}</span>
                  <span className="sesion-expira">Expira: {new Date(sesion.expires_at).toLocaleString()}</span>
                  <span className="sesion-ip">IP: {sesion.ip_address || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button onClick={cargarSesionesActivas} className="btn-secondary">
          🔄 Recargar Sesiones
        </button>
      </div>

      {/* Panel de Pruebas */}
      <div className="test-card">
        <h2>🧪 Ejecutar Pruebas</h2>
        <div className="test-buttons">
          <button onClick={testValidarSesion} className="btn-test">
            1️⃣ Validar Sesión
          </button>
          <button onClick={testHaySesionActiva} className="btn-test">
            2️⃣ Hay Sesión Activa
          </button>
          <button onClick={testConsultarBD} className="btn-test">
            3️⃣ Consultar BD
          </button>
          <button onClick={testCrearNuevaSesion} className="btn-test">
            4️⃣ Crear Nueva Sesión
          </button>
          <button onClick={testLimpiarExpiradas} className="btn-test">
            5️⃣ Limpiar Expiradas
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="test-card">
        <div className="results-header">
          <h2>📋 Resultados de Pruebas</h2>
          {testResults.length > 0 && (
            <button onClick={limpiarResultados} className="btn-clear">
              🗑️ Limpiar
            </button>
          )}
        </div>
        
        {testResults.length === 0 ? (
          <p className="no-data">No hay resultados aún. Ejecuta una prueba.</p>
        ) : (
          <div className="results-list">
            {testResults.map((result, index) => (
              <div key={index} className={`result-item ${result.exitoso ? 'success' : 'error'}`}>
                <div className="result-header">
                  <span className="result-icon">{result.exitoso ? '✅' : '❌'}</span>
                  <span className="result-test">{result.test}</span>
                  <span className="result-time">{result.timestamp}</span>
                </div>
                <div className="result-mensaje">{result.mensaje}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instrucciones */}
      <div className="test-card instrucciones">
        <h2>📖 Instrucciones de Prueba</h2>
        <ol>
          <li><strong>Validar Sesión:</strong> Verifica que el token actual sea válido en la BD</li>
          <li><strong>Hay Sesión Activa:</strong> Comprueba si existe una sesión activa</li>
          <li><strong>Consultar BD:</strong> Lee directamente la tabla sesiones</li>
          <li><strong>Crear Nueva Sesión:</strong> Genera un nuevo token (cierra el anterior)</li>
          <li><strong>Limpiar Expiradas:</strong> Ejecuta la función de limpieza de BD</li>
        </ol>

        <h3>✅ Comportamiento Esperado:</h3>
        <ul>
          <li>localStorage NO debe contener datos de usuario (solo roles personalizados)</li>
          <li>sessionStorage SÍ debe contener el token de sesión</li>
          <li>Al cerrar la pestaña, sessionStorage se borra automáticamente</li>
          <li>Al abrir en nuevo dispositivo/navegador, NO debe haber sesión</li>
          <li>Las sesiones expiran después de 24 horas</li>
        </ul>
      </div>
    </div>
  );
}

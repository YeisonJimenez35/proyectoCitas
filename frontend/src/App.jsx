import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Registro from './pages/Registro';
import AgendaPersonal from './pages/AgendaPersonal';
import AgendaPaciente from './pages/AgendaPaciente';

const TIEMPO_INACTIVIDAD_MS = 3 * 60 * 1000;

function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [vistaActual, setVistaActual] = useState('login');
  const [sesionExpirada, setSesionExpirada] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuarioLogueado(JSON.parse(usuarioGuardado));
    }
  }, []);

  const limpiarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuarioLogueado(null);
    setVistaActual('login');
  };

  const cerrarSesion = () => {
    limpiarSesion();
    setSesionExpirada(false);
  };

  const expirarSesion = () => {
    limpiarSesion();
    setSesionExpirada(true);
  };

  useEffect(() => {
    if (!usuarioLogueado || usuarioLogueado.rol === 'PERSONAL_CONSULTORIO') {
      return;
    }

    let timeoutId;

    const reiniciarTemporizador = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        expirarSesion();
      }, TIEMPO_INACTIVIDAD_MS);
    };

    const eventos = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    eventos.forEach((evento) => {
      window.addEventListener(evento, reiniciarTemporizador);
    });

    reiniciarTemporizador();

    return () => {
      clearTimeout(timeoutId);
      eventos.forEach((evento) => {
        window.removeEventListener(evento, reiniciarTemporizador);
      });
    };
  }, [usuarioLogueado]);

  if (usuarioLogueado) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <h3>🩺 Sistema de Citas - Hola, {usuarioLogueado.nombre} ({usuarioLogueado.rol})</h3>
          <button onClick={cerrarSesion} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </header>

        <main style={{ marginTop: '20px' }}>
          {usuarioLogueado.rol === 'PERSONAL_CONSULTORIO' ? (
            <AgendaPersonal />
          ) : (
            <AgendaPaciente />
          )}
        </main>
      </div>
    );
  }

  if (sesionExpirada) {
    return (
      <div style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)'
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          padding: '32px 28px',
          borderRadius: '16px',
          backgroundColor: 'white',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
          border: '1px solid #dbe7ff'
        }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>⏰</div>
          <h2 style={{ margin: '0 0 12px 0', color: '#1f2a44' }}>Sesión expirada</h2>
          <p style={{ marginBottom: '24px', color: '#555', lineHeight: 1.6 }}>
            Tu sesión ha caducado por inactividad. Puedes volver a la página de inicio para ingresar nuevamente.
          </p>
          <button
            onClick={() => {
              setSesionExpirada(false);
              setVistaActual('login');
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Volver a página de inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      {vistaActual === 'login' ? (
        <div>
          <Login onLoginSuccess={(usuario) => setUsuarioLogueado(usuario)} />
          <p>¿No tienes cuenta? <span style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setVistaActual('registro')}>Regístrate aquí</span></p>
        </div>
      ) : (
        <div>
          <Registro />
          <p>¿Ya tienes cuenta? <span style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setVistaActual('login')}>Inicia sesión aquí</span></p>
        </div>
      )}
    </div>
  );
}

export default App;
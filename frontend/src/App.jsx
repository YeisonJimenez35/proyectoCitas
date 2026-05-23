import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Registro from './pages/Registro';
import AgendaPersonal from './pages/AgendaPersonal';
import AgendaPaciente from './pages/AgendaPaciente'; // 🚀 Paso 1: Importamos el nuevo componente

function App() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [vistaActual, setVistaActual] = useState('login'); // 'login' o 'registro'

  // Verificamos si ya hay un usuario guardado en la sesión al cargar la página
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuarioLogueado(JSON.parse(usuarioGuardado));
    }
  }, []);

  // Función para cerrar sesión y limpiar el almacenamiento
  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuarioLogueado(null);
    setVistaActual('login');
  };

  // 1. SI EL USUARIO YA INICIÓ SESIÓN
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
            /* 🚀 Paso 2: Reemplazamos el letrero provisional por el componente real */
            <AgendaPaciente />
          )}
        </main>
      </div>
    );
  }

  // 2. SI NO HA INICIADO SESIÓN (Muestra Login o Registro alternable)
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      {vistaActual === 'login' ? (
        <div>
          {/* 🚀 Pasamos la función que actualiza el estado inmediato */}
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
import React, { useState } from 'react';
import axios from 'axios';


const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post('http://localhost:8080/api/usuarios/login', credentials);
      
      setError(false);
      setMensaje(`¡Bienvenido de nuevo, ${respuesta.data.nombre}!`);
      
      // 1. Guardamos el usuario en la sesión del navegador
      localStorage.setItem('usuario', JSON.stringify(respuesta.data));
      
      // 🚀 2. LE AVISAMOS INMEDIATAMENTE A APP.JSX PARA QUE CAMBIE LA PANTALLA:
      if (onLoginSuccess) {
        onLoginSuccess(respuesta.data);
      }
      
    } catch (error) {
      console.error(error);
      setError(true);
      setMensaje('Correo o contraseña incorrectos. Inténtalo de nuevo.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Correo Electrónico:</label>
          <input type="email" name="email" value={credentials.email} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Contraseña:</label>
          <input type="password" name="password" value={credentials.password} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Ingresar
        </button>
      </form>
      {mensaje && (
        <p style={{ marginTop: '15px', color: error ? 'red' : 'green', fontWeight: 'bold' }}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default Login;
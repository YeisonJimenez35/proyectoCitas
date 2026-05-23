import React, { useState } from 'react';
import axios from 'axios';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'PACIENTE'
  });
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post('http://localhost:8080/api/usuarios', formData);
      setMensaje(`¡Usuario creado con éxito! ID: ${respuesta.data.id}`);
    } catch (error) {
      console.error(error);
      setMensaje('Hubo un error al conectar con el backend.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}><label>Nombre:</label><input type="text" name="nombre" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>
        <div style={{ marginBottom: '10px' }}><label>Email:</label><input type="email" name="email" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>
        <div style={{ marginBottom: '10px' }}><label>Contraseña:</label><input type="password" name="password" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>
        <div style={{ marginBottom: '10px' }}><label>Teléfono:</label><input type="text" name="telefono" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} /></div>
        <div style={{ marginBottom: '15px' }}>
          <label>Rol:</label>
          <select name="rol" onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="PACIENTE">Paciente</option>
            <option value="PERSONAL_CONSULTORIO">Personal Consultorio</option>
          </select>
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Registrarse</button>
      </form>
      {mensaje && <p style={{ marginTop: '15px', color: 'green', fontWeight: 'bold' }}>{mensaje}</p>}
    </div>
  );
};

export default Registro;
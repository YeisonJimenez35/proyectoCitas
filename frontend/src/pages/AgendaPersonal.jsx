import React, { useEffect, useState } from 'react';
import axios from 'axios';

const formatearFechaHora = (fechaHora) => {
  if (!fechaHora) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(fechaHora));
};

const AgendaPersonal = () => {
  const [agenda, setAgenda] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: ''
  });
  const [citas, setCitas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [cargandoCitas, setCargandoCitas] = useState(false);

  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || 'null');

  const handleChange = (e) => {
    setAgenda({ ...agenda, [e.target.name]: e.target.value });
  };

  const cargarCitasAsignadas = async () => {
    if (!usuarioLogueado?.id) {
      return;
    }

    try {
      setCargandoCitas(true);
      const respuesta = await axios.get(`http://localhost:8080/api/citas/medico/${usuarioLogueado.id}`);
      setCitas(respuesta.data);
    } catch (error) {
      console.error('Error al cargar citas asignadas:', error);
      setMensaje('No pudimos cargar las citas asignadas en este momento.');
    } finally {
      setCargandoCitas(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post('http://localhost:8080/api/disponibilidad', agenda);
      setMensaje(respuesta.data);
      setAgenda({ fecha: '', horaInicio: '', horaFin: '' });
    } catch (error) {
      console.error(error);
      setMensaje('Error al configurar la agenda.');
    }
  };

  useEffect(() => {
    cargarCitasAsignadas();
  }, []);

  return (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ padding: '24px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Configurar Disponibilidad de Atención</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>Las citas se fragmentarán automáticamente en bloques de 1 hora.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>Seleccionar Día:</label>
            <input type="date" name="fecha" value={agenda.fecha} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Hora de Inicio:</label>
            <input type="time" name="horaInicio" value={agenda.horaInicio} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Hora de Fin:</label>
            <input type="time" name="horaFin" value={agenda.horaFin} onChange={handleChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Habilitar Horarios
          </button>
        </form>

        {mensaje && <p style={{ marginTop: '15px', color: 'green', fontWeight: 'bold' }}>{mensaje}</p>}
      </div>

      <div style={{ padding: '24px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Citas asignadas</h2>
        <p style={{ color: '#666' }}>Consulta aquí las citas que ya están ligadas a tu perfil de consultorio.</p>

        {cargandoCitas ? (
          <p>Cargando citas asignadas...</p>
        ) : citas.length === 0 ? (
          <p style={{ color: '#666' }}>No tienes citas asignadas aún.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {citas.map((cita) => (
              <article
                key={cita.id}
                style={{ border: '1px solid #d9e2f2', borderRadius: '8px', padding: '16px', backgroundColor: '#f9fbff' }}
              >
                <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>{formatearFechaHora(cita.fechaHora)}</p>
                <p style={{ margin: '0 0 6px 0' }}>Paciente: {cita.paciente?.nombre || 'Sin datos'}</p>
                <p style={{ margin: 0 }}>Estado: <strong>{cita.estado}</strong></p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaPersonal;
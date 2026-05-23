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

const AgendaPaciente = () => {
  const [horarios, setHorarios] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [medicoSeleccionado, setMedicoSeleccionado] = useState('');
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [cargandoMedicos, setCargandoMedicos] = useState(false);
  const [cargandoCitas, setCargandoCitas] = useState(false);

  const usuarioLogueado = JSON.parse(localStorage.getItem('usuario') || 'null');

  const cargarHorariosDisponibles = async () => {
    try {
      setCargandoHorarios(true);
      const respuesta = await axios.get('http://localhost:8080/api/disponibilidad');
      setHorarios(respuesta.data);
    } catch (err) {
      console.error('Error al cargar horarios:', err);
    } finally {
      setCargandoHorarios(false);
    }
  };

  const cargarMedicosDisponibles = async () => {
    try {
      setCargandoMedicos(true);
      const respuesta = await axios.get('http://localhost:8080/api/usuarios/personal');
      setMedicos(respuesta.data);

      if (respuesta.data.length === 1) {
        setMedicoSeleccionado(String(respuesta.data[0].id));
      }
    } catch (err) {
      console.error('Error al cargar el personal disponible:', err);
      setError(true);
      setMensaje('No pudimos cargar el personal del consultorio.');
    } finally {
      setCargandoMedicos(false);
    }
  };

  const cargarCitasPaciente = async () => {
    if (!usuarioLogueado?.id) {
      return;
    }

    try {
      setCargandoCitas(true);
      const respuesta = await axios.get(`http://localhost:8080/api/citas/paciente/${usuarioLogueado.id}`);
      setCitas(respuesta.data);
    } catch (err) {
      console.error('Error al cargar las citas del paciente:', err);
      setError(true);
      setMensaje('No pudimos cargar tus citas en este momento.');
    } finally {
      setCargandoCitas(false);
    }
  };

  useEffect(() => {
    cargarHorariosDisponibles();
    cargarMedicosDisponibles();
    cargarCitasPaciente();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!horarioSeleccionado) {
      setError(true);
      setMensaje('Por favor, selecciona un horario de la lista.');
      return;
    }

    if (!medicoSeleccionado) {
      setError(true);
      setMensaje('Por favor, selecciona un médico para tu cita.');
      return;
    }

    const payloadCita = {
      pacienteId: usuarioLogueado?.id,
      disponibilidadId: parseInt(horarioSeleccionado),
      medicoId: parseInt(medicoSeleccionado)
    };

    try {
      const respuesta = await axios.post('http://localhost:8080/api/citas', payloadCita);
      setError(false);
      setMensaje(respuesta.data);
      setMotivo('');
      setHorarioSeleccionado('');
      await Promise.all([cargarHorariosDisponibles(), cargarMedicosDisponibles(), cargarCitasPaciente()]);
    } catch (err) {
      setError(true);
      setMensaje(err.response?.data || 'Error al procesar la reserva.');
    }
  };

  const cancelarCita = async (citaId) => {
    try {
      const respuesta = await axios.post('http://localhost:8080/api/citas/cancelar', {
        citaId,
        pacienteId: usuarioLogueado?.id
      });

      setError(false);
      setMensaje(respuesta.data);
      await Promise.all([cargarHorariosDisponibles(), cargarCitasPaciente()]);
    } catch (err) {
      setError(true);
      setMensaje(err.response?.data || 'Error al cancelar la cita.');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ padding: '24px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Agendar una Cita Médica</h2>
        <p style={{ color: '#666' }}>Selecciona uno de los espacios de atención configurados por nuestro personal.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Médico:</label>
            <select
              value={medicoSeleccionado}
              onChange={(e) => setMedicoSeleccionado(e.target.value)}
              disabled={cargandoMedicos || medicos.length === 0}
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px' }}
            >
              <option value="">
                {cargandoMedicos ? '-- Cargando médicos --' : medicos.length === 0 ? '-- No hay personal disponible --' : '-- Selecciona un médico --'}
              </option>
              {medicos.map((medico) => (
                <option key={medico.id} value={medico.id}>
                  👩‍⚕️ {medico.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Horarios Disponibles:</label>
            <select
              value={horarioSeleccionado}
              onChange={(e) => setHorarioSeleccionado(e.target.value)}
              disabled={cargandoHorarios}
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px' }}
            >
              <option value="">{cargandoHorarios ? '-- Cargando horarios --' : '-- Selecciona un día y hora --'}</option>
              {horarios.map((h) => (
                <option key={h.id} value={h.id}>
                  📅 {h.fecha} | ⏰ {h.horaInicio.substring(0, 5)} a {h.horaFin.substring(0, 5)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Motivo de la Consulta:</label>
            <textarea
              rows="3"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Control general, dolor de cabeza intenso..."
              required
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            Confirmar Mi Cita
          </button>
        </form>

        {mensaje && (
          <p style={{ marginTop: '15px', color: error ? 'red' : 'green', fontWeight: 'bold', textAlign: 'center' }}>
            {mensaje}
          </p>
        )}
      </div>

      <div style={{ padding: '24px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Mis citas</h2>
        <p style={{ color: '#666' }}>Consulta aquí tus próximas citas y su estado.</p>

        {cargandoCitas ? (
          <p>Cargando citas...</p>
        ) : citas.length === 0 ? (
          <p style={{ color: '#666' }}>Aún no tienes citas registradas.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {citas.map((cita) => (
              <article
                key={cita.id}
                style={{ border: '1px solid #d9e2f2', borderRadius: '8px', padding: '16px', backgroundColor: '#f9fbff' }}
              >
                <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>{formatearFechaHora(cita.fechaHora)}</p>
                <p style={{ margin: '0 0 6px 0' }}>Médico: {cita.medico?.nombre || 'Por asignar'}</p>
                <p style={{ margin: '0 0 12px 0' }}>Estado: <strong>{cita.estado}</strong></p>
                {cita.estado === 'ASIGNADA' && (
                  <button
                    type="button"
                    onClick={() => cancelarCita(cita.id)}
                    style={{ padding: '10px 14px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancelar cita
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaPaciente;
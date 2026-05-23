import React, { useEffect, useMemo, useState } from 'react';
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

const obtenerFechaClave = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const obtenerFechaDesdeClave = (clave) => {
  const [anio, mes, dia] = clave.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
};

const formatearClave = (clave) => {
  const fecha = obtenerFechaDesdeClave(clave);
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(fecha);
};

const AgendaPaciente = () => {
  const [horarios, setHorarios] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [medicoSeleccionado, setMedicoSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [cargandoMedicos, setCargandoMedicos] = useState(false);
  const [cargandoCitas, setCargandoCitas] = useState(false);
  const [mesActual, setMesActual] = useState(() => new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState('');

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

  const diasHabilitados = useMemo(() => {
    const mapa = new Map();

    horarios.forEach((horario) => {
      const clave = horario.fecha;
      mapa.set(clave, (mapa.get(clave) || 0) + 1);
    });

    return mapa;
  }, [horarios]);

  const horariosPorDia = useMemo(() => {
    const mapa = new Map();

    horarios.forEach((horario) => {
      const lista = mapa.get(horario.fecha) || [];
      lista.push(horario);
      mapa.set(horario.fecha, lista);
    });

    return mapa;
  }, [horarios]);

  const diasDelMes = useMemo(() => {
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDia = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    const dias = [];

    for (let d = 1; d <= ultimoDia.getDate(); d += 1) {
      dias.push(new Date(mesActual.getFullYear(), mesActual.getMonth(), d));
    }

    const inicioCalendario = new Date(primerDia);
    inicioCalendario.setDate(primerDia.getDate() - primerDia.getDay());

    const finCalendario = new Date(ultimoDia);
    finCalendario.setDate(ultimoDia.getDate() + (6 - ultimoDia.getDay()));

    const celdas = [];

    for (let fecha = new Date(inicioCalendario); fecha <= finCalendario; fecha.setDate(fecha.getDate() + 1)) {
      celdas.push(new Date(fecha));
    }

    return celdas;
  }, [mesActual]);

  const horariosSeleccionados = useMemo(() => {
    if (!diaSeleccionado) {
      return [];
    }

    return horariosPorDia.get(diaSeleccionado) || [];
  }, [diaSeleccionado, horariosPorDia]);

  useEffect(() => {
    if (horarios.length === 0) {
      return;
    }

    const primeraFechaDisponible = [...diasHabilitados.keys()].sort()[0];

    if (!diaSeleccionado && primeraFechaDisponible) {
      setDiaSeleccionado(primeraFechaDisponible);
      return;
    }

    if (diaSeleccionado && !diasHabilitados.has(diaSeleccionado)) {
      setDiaSeleccionado(primeraFechaDisponible || '');
    }
  }, [horarios, diasHabilitados, diaSeleccionado]);

  useEffect(() => {
    if (horariosSeleccionados.length > 0) {
      setHorarioSeleccionado(String(horariosSeleccionados[0].id));
    } else {
      setHorarioSeleccionado('');
    }
  }, [diaSeleccionado, horariosSeleccionados]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!horarioSeleccionado) {
      setError(true);
      setMensaje('Por favor, selecciona un día y una hora disponible.');
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
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ padding: '24px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Agendar una Cita Médica</h2>
        <p style={{ color: '#666' }}>Selecciona el día en el calendario para ver las horas disponibles y reserva tu cita.</p>

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

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 0.5fr)', gap: '20px', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold' }}>Calendario mensual</label>
                    <p style={{ color: '#666', margin: '4px 0 0 0' }}>Los días con horarios habilitados se muestran en azul.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', color: '#111827', fontSize: '1rem', fontWeight: 'bold' }}
                    >
                      ←
                    </button>
                    <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                      {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(mesActual)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer', color: '#111827', fontSize: '1rem', fontWeight: 'bold' }}
                    >
                      →
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}>
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
                    <div key={dia} style={{ textAlign: 'center', color: '#475569', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {dia}
                    </div>
                  ))}
                  {diasDelMes.map((fecha) => {
                    const clave = obtenerFechaClave(fecha);
                    const habilitado = diasHabilitados.has(clave);
                    const esMesActual = fecha.getMonth() === mesActual.getMonth();
                    const seleccionado = diaSeleccionado === clave;

                    return (
                      <button
                        key={clave}
                        type="button"
                        onClick={() => setDiaSeleccionado(clave)}
                        disabled={!habilitado}
                        style={{
                          padding: '6px 0',
                          minHeight: '34px',
                          borderRadius: '8px',
                          border: seleccionado ? '2px solid #0f172a' : '1px solid #cbd5e1',
                          backgroundColor: habilitado ? '#2563eb' : esMesActual ? '#f8fafc' : '#eef2f7',
                          color: habilitado ? 'white' : '#94a3b8',
                          cursor: habilitado ? 'pointer' : 'not-allowed',
                          fontWeight: seleccionado ? 'bold' : 'normal',
                          fontSize: '0.88rem'
                        }}
                      >
                        {fecha.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #dbe7ff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '12px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Horas disponibles</label>
                  {diaSeleccionado && (
                    <span style={{ color: '#475569', fontSize: '0.78rem' }}>{formatearClave(diaSeleccionado)}</span>
                  )}
                </div>

                {cargandoHorarios ? (
                  <p style={{ fontSize: '0.8rem' }}>Cargando horarios...</p>
                ) : !diaSeleccionado ? (
                  <p style={{ color: '#666', fontSize: '0.8rem' }}>Selecciona un día habilitado para ver las horas disponibles.</p>
                ) : horariosSeleccionados.length === 0 ? (
                  <p style={{ color: '#666', fontSize: '0.8rem' }}>No hay horarios disponibles para este día.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {horariosSeleccionados.map((horario) => (
                      <button
                        key={horario.id}
                        type="button"
                        onClick={() => setHorarioSeleccionado(String(horario.id))}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: horarioSeleccionado === String(horario.id) ? '2px solid #0f172a' : '1px solid #cbd5e1',
                          backgroundColor: horarioSeleccionado === String(horario.id) ? '#dbeafe' : 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: '#111827'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{horario.horaInicio.substring(0, 5)} - {horario.horaFin.substring(0, 5)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
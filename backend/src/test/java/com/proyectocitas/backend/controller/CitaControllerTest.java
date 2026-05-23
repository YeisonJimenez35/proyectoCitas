package com.proyectocitas.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.proyectocitas.backend.model.Cita;
import com.proyectocitas.backend.model.Disponibilidad;
import com.proyectocitas.backend.model.Usuario;
import com.proyectocitas.backend.repository.CitaRepository;
import com.proyectocitas.backend.repository.DisponibilidadRepository;
import com.proyectocitas.backend.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class CitaControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private DisponibilidadRepository disponibilidadRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CitaController citaController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(citaController).build();
    }

    @Test
    void debeConsultarCitasDelPacienteEnOrdenCronologico() throws Exception {
        Usuario paciente = crearUsuario(1L, "Paciente Uno");
        Usuario medico = crearUsuario(2L, "Medico Uno");

        Cita cita1 = crearCita(10L, LocalDateTime.of(2026, 5, 26, 9, 0), paciente, medico);
        Cita cita2 = crearCita(11L, LocalDateTime.of(2026, 5, 26, 11, 0), paciente, medico);

        when(citaRepository.findByPacienteIdOrderByFechaHoraAsc(1L)).thenReturn(List.of(cita1, cita2));

        mockMvc.perform(get("/api/citas/paciente/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L))
                .andExpect(jsonPath("$[1].id").value(11L));

        verify(citaRepository).findByPacienteIdOrderByFechaHoraAsc(1L);
    }

    @Test
    void debeConsultarCitasAsignadasAlPersonal() throws Exception {
        Usuario medico = crearUsuario(5L, "Medico Uno");
        Usuario paciente = crearUsuario(6L, "Paciente Dos");

        Cita cita = crearCita(20L, LocalDateTime.of(2026, 5, 27, 14, 0), paciente, medico);

        when(citaRepository.findByMedicoIdOrderByFechaHoraAsc(5L)).thenReturn(List.of(cita));

        mockMvc.perform(get("/api/citas/medico/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(20L))
                .andExpect(jsonPath("$[0].medico.id").value(5L));

        verify(citaRepository).findByMedicoIdOrderByFechaHoraAsc(5L);
    }

    @Test
    void debeAsignarLaCitaAlMedicoSeleccionadoPorElPaciente() throws Exception {
        Usuario paciente = crearUsuario(1L, "Paciente Uno");
        Usuario medico = crearUsuario(2L, "Medico Dos");
        medico.setRol("PERSONAL_CONSULTORIO");

        Disponibilidad disponibilidad = new Disponibilidad();
        disponibilidad.setId(10L);
        disponibilidad.setFecha(LocalDate.of(2026, 5, 30));
        disponibilidad.setHoraInicio(LocalTime.of(10, 0));
        disponibilidad.setHoraFin(LocalTime.of(11, 0));
        disponibilidad.setActivo(true);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(medico));
        when(disponibilidadRepository.findById(10L)).thenReturn(Optional.of(disponibilidad));

        mockMvc.perform(post("/api/citas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"pacienteId\":1,\"disponibilidadId\":10,\"medicoId\":2}"))
                .andExpect(status().isOk());

        verify(citaRepository).save(org.mockito.ArgumentMatchers.any(Cita.class));
    }

    @Test
    void debeCancelarUnaCitaDelPacienteYReactivarElHorario() throws Exception {
        Usuario paciente = crearUsuario(1L, "Paciente Uno");
        Usuario medico = crearUsuario(2L, "Medico Dos");
        medico.setRol("PERSONAL_CONSULTORIO");

        Cita cita = crearCita(30L, LocalDateTime.of(2026, 6, 1, 9, 0), paciente, medico);

        Disponibilidad disponibilidad = new Disponibilidad();
        disponibilidad.setId(15L);
        disponibilidad.setFecha(LocalDate.of(2026, 6, 1));
        disponibilidad.setHoraInicio(LocalTime.of(9, 0));
        disponibilidad.setHoraFin(LocalTime.of(10, 0));
        disponibilidad.setActivo(false);

        when(citaRepository.findById(30L)).thenReturn(Optional.of(cita));
        when(disponibilidadRepository.findAll()).thenReturn(List.of(disponibilidad));

        mockMvc.perform(post("/api/citas/cancelar")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"citaId\":30,\"pacienteId\":1}"))
                .andExpect(status().isOk());

        assertTrue(disponibilidad.isActivo());
        verify(citaRepository).delete(cita);
    }

    private Usuario crearUsuario(Long id, String nombre) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNombre(nombre);
        usuario.setEmail(nombre.toLowerCase().replace(" ", "") + "@mail.com");
        usuario.setPassword("123456");
        usuario.setTelefono("3000000000");
        usuario.setRol("PACIENTE");
        return usuario;
    }

    private Cita crearCita(Long id, LocalDateTime fechaHora, Usuario paciente, Usuario medico) {
        Cita cita = new Cita();
        cita.setId(id);
        cita.setFechaHora(fechaHora);
        cita.setPaciente(paciente);
        cita.setMedico(medico);
        cita.setEstado("ASIGNADA");
        return cita;
    }
}

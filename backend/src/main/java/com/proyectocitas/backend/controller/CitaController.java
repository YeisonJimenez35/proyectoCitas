package com.proyectocitas.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectocitas.backend.model.Cita;
import com.proyectocitas.backend.model.Disponibilidad;
import com.proyectocitas.backend.model.Usuario;
import com.proyectocitas.backend.repository.CitaRepository;
import com.proyectocitas.backend.repository.DisponibilidadRepository;
import com.proyectocitas.backend.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private DisponibilidadRepository disponibilidadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Endpoint adaptado para recibir la petición del frontend,
     * cambiar el estado de la disponibilidad y construir la Cita real.
     */
    @PostMapping
    public ResponseEntity<?> agendarCita(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Extraer los IDs del JSON que envía React
            Long pacienteId = Long.valueOf(payload.get("pacienteId").toString());
            Long disponibilidadId = Long.valueOf(payload.get("disponibilidadId").toString());

            if (payload.get("medicoId") == null || payload.get("medicoId").toString().isBlank()) {
                return ResponseEntity.badRequest().body("Debes seleccionar un médico antes de agendar la cita.");
            }

            Long medicoId = Long.valueOf(payload.get("medicoId").toString());

            // 2. Buscar la disponibilidad seleccionada
            Disponibilidad disp = disponibilidadRepository.findById(disponibilidadId)
                    .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

            if (!disp.isActivo()) {
                return ResponseEntity.badRequest().body("Lo sentimos, este horario ya fue reservado.");
            }

            // 3. Buscar al Paciente en la BD
            Usuario paciente = usuarioRepository.findById(pacienteId)
                    .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

            // 4. Buscar al médico seleccionado por el paciente
            Usuario medico = usuarioRepository.findById(medicoId)
                    .orElseThrow(() -> new RuntimeException("Médico no encontrado"));

            if (!"PERSONAL_CONSULTORIO".equals(medico.getRol())) {
                return ResponseEntity.badRequest().body("El usuario seleccionado no pertenece al personal del consultorio.");
            }

            // 5. Desactivar el horario para que nadie más lo tome
            disp.setActivo(false);
            disponibilidadRepository.save(disp);

            // 6. Construir el objeto Cita según tu modelo original
            Cita nuevaCita = new Cita();
            nuevaCita.setPaciente(paciente);
            nuevaCita.setMedico(medico);
            
            // Combinamos la Fecha (LocalDate) y HoraInicio (LocalTime) en un LocalDateTime
            LocalDateTime fechaHoraCita = LocalDateTime.of(disp.getFecha(), disp.getHoraInicio());
            nuevaCita.setFechaHora(fechaHoraCita);
            
            nuevaCita.setEstado("ASIGNADA"); // Tu estado inicial obligatorio

            // 7. Guardar la cita
            citaRepository.save(nuevaCita);

            return ResponseEntity.ok("¡Cita agendada con éxito!");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al agendar la cita: " + e.getMessage());
        }
    }
    /**
     * Endpoint para el Personal: Retorna TODAS las citas registradas en el sistema.
     */
    @GetMapping
    public ResponseEntity<List<Cita>> obtenerTodasLasCitas() {
        return ResponseEntity.ok(citaRepository.findAll());
    }

    /**
     * Endpoint para el Paciente: Retorna solo las citas asociadas a su ID.
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Cita>> obtenerCitasPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(citaRepository.findByPacienteIdOrderByFechaHoraAsc(pacienteId));
    }

    /**
     * Endpoint para el Personal: Retorna solo las citas asignadas al médico.
     */
    @GetMapping("/medico/{medicoId}")
    public ResponseEntity<List<Cita>> obtenerCitasPorMedico(@PathVariable Long medicoId) {
        return ResponseEntity.ok(citaRepository.findByMedicoIdOrderByFechaHoraAsc(medicoId));
    }

    @PostMapping("/cancelar")
    public ResponseEntity<?> cancelarCita(@RequestBody Map<String, Object> payload) {
        try {
            Long citaId = Long.valueOf(payload.get("citaId").toString());
            Long pacienteId = Long.valueOf(payload.get("pacienteId").toString());

            Cita cita = citaRepository.findById(citaId)
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            if (!cita.getPaciente().getId().equals(pacienteId)) {
                return ResponseEntity.badRequest().body("No puedes cancelar una cita que no te pertenece.");
            }

            if (!"ASIGNADA".equals(cita.getEstado())) {
                return ResponseEntity.badRequest().body("Solo puedes cancelar citas en estado ASIGNADA.");
            }

            var disponibilidadAReactivar = disponibilidadRepository.findAll().stream()
                    .filter(disp -> disp.getFecha().equals(cita.getFechaHora().toLocalDate())
                            && disp.getHoraInicio().equals(cita.getFechaHora().toLocalTime()))
                    .toList();

            if (disponibilidadAReactivar.isEmpty()) {
                throw new RuntimeException("No se encontró el horario asociado a esta cita");
            }

            disponibilidadAReactivar.forEach(disp -> disp.setActivo(true));
            disponibilidadRepository.saveAll(disponibilidadAReactivar);
            citaRepository.delete(cita);

            return ResponseEntity.ok("Cita cancelada con éxito.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al cancelar la cita: " + e.getMessage());
        }
    }
}
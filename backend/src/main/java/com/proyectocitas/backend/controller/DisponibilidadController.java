package com.proyectocitas.backend.controller;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectocitas.backend.model.Disponibilidad;
import com.proyectocitas.backend.repository.DisponibilidadRepository;

@RestController
@RequestMapping("/api/disponibilidad")
@CrossOrigin(origins = "http://localhost:5173")
public class DisponibilidadController {

    @Autowired
    private DisponibilidadRepository disponibilidadRepository;

    /**
     * Endpoint para que el Personal guarde una franja. 
     */
    @PostMapping
    public ResponseEntity<?> guardarDisponibilidad(@RequestBody Disponibilidad agenda) {
        try {
            List<Disponibilidad> bloquesDeUnaHora = new ArrayList<>();
            LocalTime horaActual = agenda.getHoraInicio();

            // Bucle para romper el rango en bloques de 1 hora exacta
            while (horaActual.isBefore(agenda.getHoraFin())) {
                LocalTime siguienteHora = horaActual.plusHours(1);
                
                Disponibilidad bloque = new Disponibilidad();
                bloque.setFecha(agenda.getFecha());
                bloque.setHoraInicio(horaActual);
                bloque.setHoraFin(siguienteHora);
                bloque.setActivo(true); // 🚀 CORRECCIÓN: Los creamos marcados como libres/activos
                
                bloquesDeUnaHora.add(bloque);
                
                horaActual = siguienteHora;
            }

            disponibilidadRepository.saveAll(bloquesDeUnaHora);
            return ResponseEntity.ok("Franjas horarias creadas con éxito.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar los horarios: " + e.getMessage());
        }
    }

    /**
     * Endpoint corregido para que el Paciente consulte qué horas están libres.
     */
    @GetMapping // 🚀 CORRECCIÓN: Ahora con "G" mayúscula para que Spring Boot lo reconozca
    public List<Disponibilidad> obtenerDisponibles() {
        return disponibilidadRepository.findByActivoTrue();
    }
}
package com.proyectocitas.backend.controller;

import com.proyectocitas.backend.model.Cita;
import com.proyectocitas.backend.service.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controlador REST que expone los endpoints HTTP para la gestión de citas.
 */
@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:3000")
public class CitaController {

    @Autowired
    private CitaService citaService;

    /**
     * Endpoint HTTP GET para recuperar las citas asignadas globales.
     * URL: http://localhost:8080/api/citas/asignadas?usuarioId=X
     * @param usuarioId ID del usuario enviado como parámetro de consulta (?usuarioId=1)
     * @return ResponseEntity con la lista de citas o error HTTP 403 de acceso denegado.
     */
    @GetMapping("/asignadas")
    public ResponseEntity<?> verCitasAsignadas(@RequestParam Long usuarioId) {
        try {
            List<Cita> citas = citaService.obtenerCitasAsignadas(usuarioId);
            return ResponseEntity.ok(citas);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}
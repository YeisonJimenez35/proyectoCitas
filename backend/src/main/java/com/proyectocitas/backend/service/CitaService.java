package com.proyectocitas.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.proyectocitas.backend.model.Cita;
import com.proyectocitas.backend.model.Usuario;
import com.proyectocitas.backend.repository.CitaRepository;
import com.proyectocitas.backend.repository.UsuarioRepository;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Guarda una cita directamente sin validaciones complejas de roles por ahora
    public Cita agendarCita(Cita cita) {
        return citaRepository.save(cita);
    }

    // Permite obtener las citas pasando el ID del usuario
    public List<Cita> obtenerCitasAsignadas(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validación básica: si el rol no es del consultorio, rebota
        if (usuario.getRol() == null || !usuario.getRol().contains("CONSULTORIO")) {
            throw new RuntimeException("Acceso denegado: No tienes permisos");
        }

        return citaRepository.findAll();
    }
}
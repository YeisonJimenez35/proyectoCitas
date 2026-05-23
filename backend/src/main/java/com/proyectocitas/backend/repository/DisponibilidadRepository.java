package com.proyectocitas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.proyectocitas.backend.model.Disponibilidad;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Long> {
    // Método para que el paciente busque solo los horarios que están disponibles
    List<Disponibilidad> findByActivoTrue();
}
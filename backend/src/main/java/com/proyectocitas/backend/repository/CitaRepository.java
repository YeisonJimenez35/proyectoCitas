package com.proyectocitas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.proyectocitas.backend.model.Cita;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    
    List<Cita> findByEstado(String estado);

    List<Cita> findByPacienteIdOrderByFechaHoraAsc(Long pacienteId);

    List<Cita> findByMedicoIdOrderByFechaHoraAsc(Long medicoId);
}
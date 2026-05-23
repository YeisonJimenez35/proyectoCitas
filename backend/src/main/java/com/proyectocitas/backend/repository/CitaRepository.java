package com.proyectocitas.backend.repository;
import com.proyectocitas.backend.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Interfaz que gestiona el acceso a datos para la entidad Cita.
 */
@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    
    /**
     * Busca y devuelve una lista de citas filtradas por su estado actual.
     * @param estado El estado a buscar (ej. "ASIGNADA").
     * @return Lista de objetos Cita que coinciden con el estado.
     */
    List<Cita> findByEstado(String estado);
}
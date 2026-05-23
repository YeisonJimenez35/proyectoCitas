package com.proyectocitas.backend.repository;

import com.proyectocitas.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Interfaz que gestiona el acceso a datos para la entidad Usuario.
 * Proporciona métodos CRUD automáticos heredados de JpaRepository.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    /**
     * Verifica si un correo electrónico ya está registrado en la base de datos.
     * @param email El correo a comprobar.
     * @return true si ya existe, false si está disponible.
     */
    boolean existsByEmail(String email);
}
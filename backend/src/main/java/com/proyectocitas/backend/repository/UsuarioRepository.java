package com.proyectocitas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.proyectocitas.backend.model.Usuario;

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

    /**
     * 🔍 Busca y retorna un usuario completo basado en su correo electrónico.
     * @param email El correo del usuario a buscar.
     * @return El objeto Usuario si lo encuentra, o null si no existe.
     */
    Usuario findByEmail(String email);

    List<Usuario> findByRol(String rol);
}
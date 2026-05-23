package com.proyectocitas.backend.service;
import com.proyectocitas.backend.model.Usuario;
import com.proyectocitas.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Servicio encargado de la lógica de negocio para la gestión de usuarios.
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Registra un nuevo usuario en la base de datos.
     * Valida que el email no esté duplicado antes de realizar la inserción.
     * @param usuario Objeto con los datos del nuevo usuario.
     * @return El usuario guardado con su ID generado por la base de datos.
     * @throws RuntimeException Si el correo electrónico ya está en uso.
     */
    public Usuario guardarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El correo ya se encuentra registrado.");
        }
        return usuarioRepository.save(usuario);
    }

    /**
     * Modifica los datos de un usuario existente en el sistema.
     * Busca al usuario por su ID y actualiza selectivamente sus campos.
     * @param id Identificador único del usuario a modificar.
     * @param usuarioActualizado Objeto que contiene las nuevas propiedades.
     * @return El objeto Usuario con los cambios persistidos.
     * @throws RuntimeException Si no se encuentra un usuario con el ID otorgado.
     */
    public Usuario modificarUsuario(Long id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setNombre(usuarioActualizado.getNombre());
            usuario.setTelefono(usuarioActualizado.getTelefono());
            usuario.setEmail(usuarioActualizado.getEmail());
            
            if (usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().isEmpty()) {
                usuario.setPassword(usuarioActualizado.getPassword());
            }
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con el id: " + id));
    }
}
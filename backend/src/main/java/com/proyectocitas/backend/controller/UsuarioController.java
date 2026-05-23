package com.proyectocitas.backend.controller;

import java.util.List;
import java.util.Map; // <-- Nueva importación para manejar las credenciales
import org.springframework.http.HttpStatus; // <-- Nueva importación para las respuestas de error
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectocitas.backend.model.Usuario;
import com.proyectocitas.backend.repository.UsuarioRepository;
import com.proyectocitas.backend.service.UsuarioService;

/**
 * Controlador REST que expone los endpoints HTTP para la gestión de usuarios.
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Endpoint HTTP POST para registrar nuevos usuarios.
     * URL: http://localhost:8080/api/usuarios
     */
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.guardarUsuario(usuario);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Endpoint HTTP POST para el inicio de sesión.
     * URL: http://localhost:8080/api/usuarios/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        try {
            String email = credenciales.get("email");
            String password = credenciales.get("password");
            
            // Le pedimos al servicio que busque y valide al usuario
            Usuario usuarioAutenticado = usuarioService.validarLogin(email, password);
            
            if (usuarioAutenticado != null) {
                return ResponseEntity.ok(usuarioAutenticado);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Correo o contraseña incorrectos");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Endpoint HTTP PUT para modificar la información de un usuario.
     * URL: http://localhost:8080/api/usuarios/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        try {
            Usuario usuarioModificado = usuarioService.modificarUsuario(id, usuario);
            return ResponseEntity.ok(usuarioModificado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/personal")
    public ResponseEntity<List<Usuario>> listarPersonal() {
        return ResponseEntity.ok(usuarioRepository.findByRol("PERSONAL_CONSULTORIO"));
    }
}
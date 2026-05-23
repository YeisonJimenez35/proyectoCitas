package com.proyectocitas.backend.controller;

import com.proyectocitas.backend.model.Usuario;
import com.proyectocitas.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST que expone los endpoints HTTP para la gestión de usuarios.
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Endpoint HTTP POST para registrar nuevos usuarios.
     * URL: http://localhost:8080/api/usuarios
     * @param usuario Cuerpo JSON mapeado al objeto Usuario.
     * @return ResponseEntity con el usuario creado o un mensaje de error HTTP 400.
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
     * Endpoint HTTP PUT para modificar la información de un usuario.
     * URL: http://localhost:8080/api/usuarios/{id}
     * @param id Pasado en la ruta de la URL.
     * @param usuario Cuerpo JSON con los datos modificados.
     * @return ResponseEntity con el usuario actualizado o error HTTP 400.
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
}
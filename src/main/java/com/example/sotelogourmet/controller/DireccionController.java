package com.example.sotelogourmet.controller;

import com.example.sotelogourmet.model.Direccion;
import com.example.sotelogourmet.model.Usuario;
import com.example.sotelogourmet.repository.DireccionRepository;
import com.example.sotelogourmet.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/direcciones")
public class DireccionController {

    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;

    public DireccionController(DireccionRepository direccionRepository, UsuarioRepository usuarioRepository) {
        this.direccionRepository = direccionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<?> obtenerDirecciones(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        Usuario usuario = usuarioRepository.findByEmail(principal.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        }

        List<Direccion> direcciones = direccionRepository.findByUsuarioId(usuario.getId());
        return ResponseEntity.ok(direcciones);
    }

    @PostMapping
    public ResponseEntity<?> agregarDireccion(@RequestBody Map<String, Object> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        Usuario usuario = usuarioRepository.findByEmail(principal.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        }

        String calle = (String) body.get("calle");
        String distrito = (String) body.get("distrito");
        String ciudad = (String) body.get("ciudad");
        String codigoPostal = (String) body.get("codigoPostal");
        String referencia = (String) body.get("referencia");
        Boolean esPrincipal = (Boolean) body.get("esPrincipal");

        if (calle == null || calle.trim().isEmpty() || ciudad == null || ciudad.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Calle y ciudad son obligatorias"));
        }

        if (esPrincipal == null) {
            esPrincipal = false;
        }

        if (esPrincipal) {
            desmarcarDireccionesPrincipales(usuario.getId());
        }

        Direccion direccion = Direccion.builder()
                .usuario(usuario)
                .calle(calle)
                .distrito(distrito)
                .ciudad(ciudad)
                .codigoPostal(codigoPostal)
                .referencia(referencia)
                .esPrincipal(esPrincipal)
                .build();

        Direccion guardada = direccionRepository.save(direccion);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarDireccion(@PathVariable Long id, @RequestBody Map<String, Object> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        Usuario usuario = usuarioRepository.findByEmail(principal.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        }

        Direccion direccion = direccionRepository.findById(id).orElse(null);
        if (direccion == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Dirección no encontrada"));
        }

        if (!direccion.getUsuario().getId().equals(usuario.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No tienes permiso para modificar esta dirección"));
        }

        String calle = (String) body.get("calle");
        String distrito = (String) body.get("distrito");
        String ciudad = (String) body.get("ciudad");
        String codigoPostal = (String) body.get("codigoPostal");
        String referencia = (String) body.get("referencia");
        Boolean esPrincipal = (Boolean) body.get("esPrincipal");

        if (calle == null || calle.trim().isEmpty() || ciudad == null || ciudad.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Calle y ciudad son obligatorias"));
        }

        if (esPrincipal == null) {
            esPrincipal = false;
        }

        if (esPrincipal && !direccion.getEsPrincipal()) {
            desmarcarDireccionesPrincipales(usuario.getId());
        }

        direccion.setCalle(calle);
        direccion.setDistrito(distrito);
        direccion.setCiudad(ciudad);
        direccion.setCodigoPostal(codigoPostal);
        direccion.setReferencia(referencia);
        direccion.setEsPrincipal(esPrincipal);

        Direccion actualizada = direccionRepository.save(direccion);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarDireccion(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        Usuario usuario = usuarioRepository.findByEmail(principal.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        }

        Direccion direccion = direccionRepository.findById(id).orElse(null);
        if (direccion == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Dirección no encontrada"));
        }

        if (!direccion.getUsuario().getId().equals(usuario.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No tienes permiso para eliminar esta dirección"));
        }

        direccionRepository.delete(direccion);
        return ResponseEntity.ok(Map.of("message", "Dirección eliminada exitosamente"));
    }

    private void desmarcarDireccionesPrincipales(Long usuarioId) {
        List<Direccion> direcciones = direccionRepository.findByUsuarioId(usuarioId);
        for (Direccion dir : direcciones) {
            if (dir.getEsPrincipal()) {
                dir.setEsPrincipal(false);
                direccionRepository.save(dir);
            }
        }
    }
}

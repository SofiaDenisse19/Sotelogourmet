package com.example.sotelogourmet.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controlador de vistas híbrido. Redirige todas las rutas de la SPA
 * a la plantilla única index.html gestionada por Thymeleaf,
 * delegando el enrutamiento interno a React Router.
 */
@Controller
public class ViewController {

    @GetMapping({"/", "/catalogo", "/producto/**", "/favoritos"})
    public String index() {
        return "index";
    }
}

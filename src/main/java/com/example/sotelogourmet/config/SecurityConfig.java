package com.example.sotelogourmet.config;

import com.example.sotelogourmet.model.Usuario;
import com.example.sotelogourmet.repository.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UsuarioRepository usuarioRepository;

    public SecurityConfig(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));
            return new User(
                    usuario.getEmail(),
                    usuario.getPasswordHash(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre()))
            );
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new PasswordEncoder() {
            private final BCryptPasswordEncoder bcryptEncoder = new BCryptPasswordEncoder();

            @Override
            public String encode(CharSequence rawPassword) {
                return bcryptEncoder.encode(rawPassword);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                if (encodedPassword == null) return false;
                // Si la contraseña almacenada parece un hash BCrypt, verificar con BCrypt
                if (encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$") || encodedPassword.startsWith("$2y$")) {
                    try {
                        return bcryptEncoder.matches(rawPassword, encodedPassword);
                    } catch (Exception e) {
                        return rawPassword.toString().equals(encodedPassword);
                    }
                }
                // Si no, comparar texto plano directamente (para las semillas de basebase.txt)
                return rawPassword.toString().equals(encodedPassword);
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/**").hasRole("admin")
                .requestMatchers(
                    "/", "/catalogo", "/producto/**", "/favoritos", "/login", "/register",
                    "/admin/**",
                    "/api/auth/**", "/api/productos", "/api/categorias",
                    "/dist/**", "/assets/**", "/*.svg", "/*.ico", "/index.html", "/favicon.svg"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // Desactivamos el login de formulario por defecto de Spring Security para manejarlo via API JSON
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(200))
                .permitAll()
            );

        return http.build();
    }
}

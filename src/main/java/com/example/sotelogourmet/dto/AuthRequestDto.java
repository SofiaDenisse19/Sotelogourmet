package com.example.sotelogourmet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthRequestDto {

    @NotBlank(message = "El email es requerido")
    @Email(message = "El formato de email no es válido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;
}

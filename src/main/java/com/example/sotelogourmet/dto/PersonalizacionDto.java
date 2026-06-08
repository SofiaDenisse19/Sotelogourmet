package com.example.sotelogourmet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalizacionDto {

    private Long id;
    private String nombre;
    private String tipo;
    private Boolean requerido;
    private String placeholder;
    private List<OpcionDto> opciones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OpcionDto {
        private Long id;
        private String valor;

        @JsonProperty("precio_extra")
        private BigDecimal precioExtra;

        private String descripcion;
    }
}

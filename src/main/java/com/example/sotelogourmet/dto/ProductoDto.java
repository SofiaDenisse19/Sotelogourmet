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
public class ProductoDto {

    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;

    @JsonProperty("precio_oferta")
    private BigDecimal precioOferta;

    private Integer stock;
    private String categoria;

    @JsonProperty("imagen_url")
    private String imagenUrl;

    private Boolean activo;
    private Boolean destacado;
    private String tag;
    private BigDecimal rating;

    @JsonProperty("reseñas_count")
    private Integer resenasCount;

    private List<PersonalizacionDto> personalizaciones;
}

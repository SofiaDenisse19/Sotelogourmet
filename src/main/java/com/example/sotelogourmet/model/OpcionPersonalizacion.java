package com.example.sotelogourmet.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "opciones_personalizacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "personalizacion")
public class OpcionPersonalizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "personalizacion_id", nullable = false)
    @JsonIgnore
    private Personalizacion personalizacion;

    @Column(nullable = false)
    private String valor;

    @Column(name = "precio_extra", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal precioExtra = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String descripcion;
}

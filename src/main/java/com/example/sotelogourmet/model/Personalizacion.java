package com.example.sotelogourmet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "personalizaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "opciones")
public class Personalizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String tipo; // "texto", "seleccion", "numero"

    @Column(nullable = false)
    @Builder.Default
    private Boolean requerido = false;

    @Column(columnDefinition = "TEXT")
    private String placeholder;

    @OneToMany(mappedBy = "personalizacion", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OpcionPersonalizacion> opciones;
}

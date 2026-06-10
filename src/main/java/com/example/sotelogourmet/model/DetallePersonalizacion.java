package com.example.sotelogourmet.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "detalle_personalizacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetallePersonalizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detalle_pedido_id", nullable = false)
    private DetallePedido detallePedido;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "personalizacion_id", nullable = false)
    private Personalizacion personalizacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "opcion_id")
    private OpcionPersonalizacion opcion;

    @Column(name = "valor_texto", columnDefinition = "TEXT")
    private String valorTexto;
}

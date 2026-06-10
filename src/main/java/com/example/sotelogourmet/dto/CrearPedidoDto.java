package com.example.sotelogourmet.dto;

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
public class CrearPedidoDto {

    private String calle;
    private String distrito;
    private String ciudad;
    private String referencia;
    private String tipoEntrega; // "domicilio" | "recojo"
    private String sedeRecojo;   // "Sede Vallejo" | "Sede El Sol" etc.
    private String fechaEntrega;
    private String horaEntrega;
    private String metodoPago;   // "tarjeta" | "yape" | "plin" | "efectivo"
    private String notas;
    private BigDecimal montoTotal;
    private List<ItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemDto {
        private Long productoId;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private java.util.Map<String, String> selections;
    }
}

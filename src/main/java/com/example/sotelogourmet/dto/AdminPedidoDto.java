package com.example.sotelogourmet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPedidoDto {
    private Long id;
    private String clienteNombre;
    private String clienteEmail;
    private String direccionCompleta;
    private LocalDateTime fecha;
    private String estado;
    private BigDecimal total;
    private String metodoPago;
    private List<ItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemDto {
        private String productoNombre;
        private Integer cantidad;
        private BigDecimal precioUnitario;
    }
}

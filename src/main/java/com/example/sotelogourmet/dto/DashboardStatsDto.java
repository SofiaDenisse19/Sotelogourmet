package com.example.sotelogourmet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private BigDecimal ventasTotales;
    private long totalPedidos;
    private long totalClientes;
    private long totalProductos;
}

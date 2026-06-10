package com.example.sotelogourmet.controller;

import com.example.sotelogourmet.dto.AdminPedidoDto;
import com.example.sotelogourmet.dto.DashboardStatsDto;
import com.example.sotelogourmet.model.*;
import com.example.sotelogourmet.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final PagoRepository pagoRepository;
    private final HistorialPedidosRepository historialPedidosRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    public AdminController(PedidoRepository pedidoRepository,
                           DetallePedidoRepository detallePedidoRepository,
                           PagoRepository pagoRepository,
                           HistorialPedidosRepository historialPedidosRepository,
                           UsuarioRepository usuarioRepository,
                           ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.pagoRepository = pagoRepository;
        this.historialPedidosRepository = historialPedidosRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        BigDecimal totalSales = pedidoRepository.sumTotalSales();
        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        DashboardStatsDto stats = DashboardStatsDto.builder()
                .ventasTotales(totalSales)
                .totalPedidos(pedidoRepository.count())
                .totalClientes(usuarioRepository.countByRolNombre("cliente"))
                .totalProductos(productoRepository.count())
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/pedidos")
    public ResponseEntity<List<AdminPedidoDto>> getPedidos() {
        List<Pedido> pedidos = pedidoRepository.findAllByOrderByFechaDesc();
        List<AdminPedidoDto> dtos = pedidos.stream().map(this::mapToAdminPedidoDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/pedidos/{id}/estado")
    @Transactional
    public ResponseEntity<?> updateEstado(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "El campo 'estado' es requerido"));
        }

        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Pedido no encontrado"));
        }

        String estadoAnterior = pedido.getEstado();
        
        // Actualizar el estado del pedido
        pedido.setEstado(nuevoEstado);
        pedidoRepository.save(pedido);

        // Obtener usuario administrador que realiza el cambio
        Usuario adminUser = null;
        if (principal != null) {
            adminUser = usuarioRepository.findByEmail(principal.getName()).orElse(null);
        }

        // Guardar el registro de historial para disparar adecuadamente el trigger de validación
        HistorialPedidos historial = HistorialPedidos.builder()
                .pedido(pedido)
                .estadoAnterior(estadoAnterior)
                .estadoNuevo(nuevoEstado)
                .usuario(adminUser)
                .nota("Cambio de estado por el administrador")
                .build();

        historialPedidosRepository.save(historial);

        // Si el estado nuevo es "entregado", actualizar también el estado del pago si aplica
        if ("entregado".equalsIgnoreCase(nuevoEstado)) {
            pagoRepository.findByPedidoId(id).ifPresent(pago -> {
                pago.setEstado("completado");
                pagoRepository.save(pago);
            });
        }

        return ResponseEntity.ok(mapToAdminPedidoDto(pedido));
    }

    @GetMapping("/pedidos/exportar")
    public ResponseEntity<byte[]> exportarPedidosExcel() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Pedidos Sotelogourmet");

            // Configurar fuentes y estilos
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.GREY_80_PERCENT.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);
            headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            
            // Bordes para cabeceras
            headerCellStyle.setBorderTop(BorderStyle.THIN);
            headerCellStyle.setBorderBottom(BorderStyle.MEDIUM);
            headerCellStyle.setBorderLeft(BorderStyle.THIN);
            headerCellStyle.setBorderRight(BorderStyle.THIN);

            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setAlignment(HorizontalAlignment.CENTER);
            centerStyle.setBorderBottom(BorderStyle.THIN);
            centerStyle.setBorderTop(BorderStyle.THIN);
            centerStyle.setBorderLeft(BorderStyle.THIN);
            centerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle leftStyle = workbook.createCellStyle();
            leftStyle.setAlignment(HorizontalAlignment.LEFT);
            leftStyle.setBorderBottom(BorderStyle.THIN);
            leftStyle.setBorderTop(BorderStyle.THIN);
            leftStyle.setBorderLeft(BorderStyle.THIN);
            leftStyle.setBorderRight(BorderStyle.THIN);

            CellStyle currencyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            currencyStyle.setDataFormat(format.getFormat("S/ #,##0.00"));
            currencyStyle.setAlignment(HorizontalAlignment.RIGHT);
            currencyStyle.setBorderBottom(BorderStyle.THIN);
            currencyStyle.setBorderTop(BorderStyle.THIN);
            currencyStyle.setBorderLeft(BorderStyle.THIN);
            currencyStyle.setBorderRight(BorderStyle.THIN);

            // Nombres de las columnas
            String[] columns = {"ID Pedido", "Fecha", "Cliente", "Email", "Dirección", "Método Pago", "Total", "Estado"};
            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(26);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            List<Pedido> pedidos = pedidoRepository.findAllByOrderByFechaDesc();
            int rowIdx = 1;

            for (Pedido p : pedidos) {
                Row row = sheet.createRow(rowIdx++);
                row.setHeightInPoints(20);

                // ID Pedido
                Cell cellId = row.createCell(0);
                cellId.setCellValue(p.getId());
                cellId.setCellStyle(centerStyle);

                // Fecha
                Cell cellFecha = row.createCell(1);
                cellFecha.setCellValue(p.getFecha() != null ? p.getFecha().toString().replace("T", " ") : "");
                cellFecha.setCellStyle(centerStyle);

                // Cliente
                Cell cellCliente = row.createCell(2);
                cellCliente.setCellValue(p.getUsuario().getNombre());
                cellCliente.setCellStyle(leftStyle);

                // Email
                Cell cellEmail = row.createCell(3);
                cellEmail.setCellValue(p.getUsuario().getEmail());
                cellEmail.setCellStyle(leftStyle);

                // Dirección
                String direccionCompleta = p.getDireccion().getCalle();
                if (p.getDireccion().getDistrito() != null && !p.getDireccion().getDistrito().isEmpty()) {
                    direccionCompleta += ", " + p.getDireccion().getDistrito();
                }
                direccionCompleta += ", " + p.getDireccion().getCiudad();

                Cell cellDir = row.createCell(4);
                cellDir.setCellValue(direccionCompleta);
                cellDir.setCellStyle(leftStyle);

                // Método Pago
                String metodoPago = pagoRepository.findByPedidoId(p.getId())
                        .map(Pago::getMetodoPago)
                        .orElse("No especificado");
                Cell cellMetodo = row.createCell(5);
                cellMetodo.setCellValue(metodoPago);
                cellMetodo.setCellStyle(centerStyle);

                // Total
                Cell cellTotal = row.createCell(6);
                cellTotal.setCellValue(p.getTotal() != null ? p.getTotal().doubleValue() : 0.0);
                cellTotal.setCellStyle(currencyStyle);

                // Estado
                String estadoStr = p.getEstado();
                if ("en_preparacion".equalsIgnoreCase(estadoStr)) {
                    estadoStr = "Preparando";
                } else if ("pendiente".equalsIgnoreCase(estadoStr)) {
                    estadoStr = "Pendiente";
                } else if ("confirmado".equalsIgnoreCase(estadoStr)) {
                    estadoStr = "Confirmado";
                } else if ("en_camino".equalsIgnoreCase(estadoStr)) {
                    estadoStr = "En camino";
                } else if ("entregado".equalsIgnoreCase(estadoStr)) {
                    estadoStr = "Entregado";
                }
                Cell cellEstado = row.createCell(7);
                cellEstado.setCellValue(estadoStr);
                cellEstado.setCellStyle(centerStyle);
            }

            // Autoajustar anchos de columnas
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
                // Darle un margen adicional de ancho
                int currentWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, currentWidth + 1200);
            }

            workbook.write(out);
            byte[] bytes = out.toByteArray();

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=pedidos_sotelogourmet.xlsx");
            headers.add("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Error al exportar pedidos a Excel: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    private AdminPedidoDto mapToAdminPedidoDto(Pedido p) {
        String metodoPago = pagoRepository.findByPedidoId(p.getId())
                .map(Pago::getMetodoPago)
                .orElse("No especificado");

        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(p.getId());
        List<AdminPedidoDto.ItemDto> items = detalles.stream().map(d -> AdminPedidoDto.ItemDto.builder()
                .productoNombre(d.getProducto().getNombre())
                .cantidad(d.getCantidad())
                .precioUnitario(d.getPrecioUnitario())
                .build()).collect(Collectors.toList());

        String direccionCompleta = p.getDireccion().getCalle();
        if (p.getDireccion().getDistrito() != null && !p.getDireccion().getDistrito().isEmpty()) {
            direccionCompleta += ", " + p.getDireccion().getDistrito();
        }
        direccionCompleta += ", " + p.getDireccion().getCiudad();

        return AdminPedidoDto.builder()
                .id(p.getId())
                .clienteNombre(p.getUsuario().getNombre())
                .clienteEmail(p.getUsuario().getEmail())
                .direccionCompleta(direccionCompleta)
                .fecha(p.getFecha())
                .estado(p.getEstado())
                .total(p.getTotal())
                .metodoPago(metodoPago)
                .items(items)
                .build();
    }
}

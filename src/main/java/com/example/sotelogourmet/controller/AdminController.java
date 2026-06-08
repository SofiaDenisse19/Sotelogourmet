package com.example.sotelogourmet.controller;

import com.example.sotelogourmet.dto.AdminPedidoDto;
import com.example.sotelogourmet.dto.DashboardStatsDto;
import com.example.sotelogourmet.model.*;
import com.example.sotelogourmet.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

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

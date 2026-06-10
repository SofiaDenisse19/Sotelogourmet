package com.example.sotelogourmet.controller;

import com.example.sotelogourmet.dto.CrearPedidoDto;
import com.example.sotelogourmet.model.*;
import com.example.sotelogourmet.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final PagoRepository pagoRepository;
    private final HistorialPedidosRepository historialPedidosRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final DireccionRepository direccionRepository;
    private final PersonalizacionRepository personalizacionRepository;
    private final OpcionPersonalizacionRepository opcionPersonalizacionRepository;
    private final DetallePersonalizacionRepository detallePersonalizacionRepository;

    public PedidoController(PedidoRepository pedidoRepository,
                            DetallePedidoRepository detallePedidoRepository,
                            PagoRepository pagoRepository,
                            HistorialPedidosRepository historialPedidosRepository,
                            UsuarioRepository usuarioRepository,
                            ProductoRepository productoRepository,
                            DireccionRepository direccionRepository,
                            PersonalizacionRepository personalizacionRepository,
                            OpcionPersonalizacionRepository opcionPersonalizacionRepository,
                            DetallePersonalizacionRepository detallePersonalizacionRepository) {
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.pagoRepository = pagoRepository;
        this.historialPedidosRepository = historialPedidosRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.direccionRepository = direccionRepository;
        this.personalizacionRepository = personalizacionRepository;
        this.opcionPersonalizacionRepository = opcionPersonalizacionRepository;
        this.detallePersonalizacionRepository = detallePersonalizacionRepository;
    }

    @PostMapping("/crear")
    @Transactional
    public ResponseEntity<?> crearPedido(@RequestBody CrearPedidoDto dto, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Debe iniciar sesión para realizar un pedido."));
        }

        Usuario usuario = usuarioRepository.findByEmail(principal.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado."));
        }

        try {
            // 1. Guardar la dirección del pedido (Domicilio o Sede de Recojo)
            Direccion direccion;
            if ("recojo".equalsIgnoreCase(dto.getTipoEntrega())) {
                direccion = Direccion.builder()
                        .usuario(usuario)
                        .calle(dto.getSedeRecojo() != null ? dto.getSedeRecojo() : "Sede Principal")
                        .distrito("Recojo en Tienda")
                        .ciudad("Lima")
                        .codigoPostal("")
                        .referencia("Fecha programada: " + dto.getFechaEntrega() + " " + dto.getHoraEntrega())
                        .esPrincipal(false)
                        .build();
            } else {
                direccion = Direccion.builder()
                        .usuario(usuario)
                        .calle(dto.getCalle() != null ? dto.getCalle() : "Sin Calle")
                        .distrito(dto.getDistrito() != null ? dto.getDistrito() : "Sin Distrito")
                        .ciudad(dto.getCiudad() != null ? dto.getCiudad() : "Lima")
                        .codigoPostal("")
                        .referencia(dto.getReferencia() != null ? dto.getReferencia() : "")
                        .esPrincipal(false)
                        .build();
            }
            direccion = direccionRepository.save(direccion);

            // 2. Crear y guardar la cabecera del Pedido
            Pedido pedido = Pedido.builder()
                    .usuario(usuario)
                    .direccion(direccion)
                    .estado("pendiente") // Siempre inicializar en pendiente
                    .total(dto.getMontoTotal())
                    .build();
            pedido = pedidoRepository.save(pedido);

            // 3. Crear y guardar los detalles del Pedido
            if (dto.getItems() == null || dto.getItems().isEmpty()) {
                throw new RuntimeException("El pedido debe tener al menos un artículo.");
            }

            for (CrearPedidoDto.ItemDto itemDto : dto.getItems()) {
                Producto producto = productoRepository.findById(itemDto.getProductoId())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + itemDto.getProductoId()));

                DetallePedido detalle = DetallePedido.builder()
                        .pedido(pedido)
                        .producto(producto)
                        .cantidad(itemDto.getCantidad())
                        .precioUnitario(itemDto.getPrecioUnitario())
                        .build();
                DetallePedido savedDetalle = detallePedidoRepository.save(detalle);

                // Guardar personalizaciones si existen
                if (itemDto.getSelections() != null && !itemDto.getSelections().isEmpty()) {
                    for (Map.Entry<String, String> entry : itemDto.getSelections().entrySet()) {
                        String nombrePersonalizacion = entry.getKey();
                        String valorSeleccionado = entry.getValue();
                        if (valorSeleccionado == null || valorSeleccionado.trim().isEmpty()) {
                            continue;
                        }

                        Optional<Personalizacion> personalizacionOpt = personalizacionRepository.findByNombreIgnoreCase(nombrePersonalizacion);
                        if (personalizacionOpt.isPresent()) {
                            Personalizacion pers = personalizacionOpt.get();
                            DetallePersonalizacion.DetallePersonalizacionBuilder dpBuilder = DetallePersonalizacion.builder()
                                    .detallePedido(savedDetalle)
                                    .personalizacion(pers);

                            if ("seleccion".equalsIgnoreCase(pers.getTipo())) {
                                Optional<OpcionPersonalizacion> opcionOpt = opcionPersonalizacionRepository
                                        .findByPersonalizacionIdAndValorIgnoreCase(pers.getId(), valorSeleccionado);
                                opcionOpt.ifPresent(dpBuilder::opcion);
                                dpBuilder.valorTexto(valorSeleccionado);
                            } else {
                                dpBuilder.valorTexto(valorSeleccionado);
                            }

                            detallePersonalizacionRepository.save(dpBuilder.build());
                        }
                    }
                }
            }

            // 4. Crear y guardar la información del Pago
            String metodoPagoDb = dto.getMetodoPago() != null ? dto.getMetodoPago().toLowerCase() : "efectivo";
            String estadoPago = "pendiente";
            if ("tarjeta".equals(metodoPagoDb) || "yape".equals(metodoPagoDb) || "plin".equals(metodoPagoDb)) {
                estadoPago = "completado"; // Pagos online se consideran completados al finalizar exitosamente
            }

            Pago pago = Pago.builder()
                    .pedido(pedido)
                    .monto(dto.getMontoTotal())
                    .metodoPago(metodoPagoDb)
                    .estado(estadoPago)
                    .build();
            pagoRepository.save(pago);

            // 5. Crear e insertar el registro inicial del Historial de Pedidos (null -> pendiente)
            String notaHistorial = "Pedido creado por el cliente. Tipo de entrega: " 
                    + ("recojo".equalsIgnoreCase(dto.getTipoEntrega()) ? "Recojo en Tienda" : "Envío a Domicilio");
            if (dto.getNotas() != null && !dto.getNotas().isEmpty()) {
                notaHistorial += ". Notas: " + dto.getNotas();
            }

            HistorialPedidos historial = HistorialPedidos.builder()
                    .pedido(pedido)
                    .estadoAnterior(null)
                    .estadoNuevo("pendiente")
                    .nota(notaHistorial)
                    .build();
            historialPedidosRepository.save(historial);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "pedidoId", pedido.getId(),
                    "codigo", "#SG-" + pedido.getId() + (int)(Math.random() * 900 + 100),
                    "total", pedido.getTotal()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mis-pedidos")
    public ResponseEntity<?> obtenerMisPedidos(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autenticado"));
        }
        Usuario usuario = usuarioRepository.findByEmail(principal.getName()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        }

        List<Pedido> pedidos = pedidoRepository.findByUsuarioIdOrderByFechaDesc(usuario.getId());
        List<Map<String, Object>> responseList = new java.util.ArrayList<>();

        for (Pedido p : pedidos) {
            Map<String, Object> pMap = new java.util.HashMap<>();
            pMap.put("id", p.getId());
            pMap.put("codigo", "#SG-" + p.getId() + (p.getId() * 17 % 900 + 100));
            pMap.put("fecha", p.getFecha());
            pMap.put("estado", p.getEstado());
            pMap.put("total", p.getTotal());

            // Dirección
            Map<String, Object> dirMap = new java.util.HashMap<>();
            dirMap.put("calle", p.getDireccion().getCalle());
            dirMap.put("distrito", p.getDireccion().getDistrito());
            dirMap.put("ciudad", p.getDireccion().getCiudad());
            dirMap.put("referencia", p.getDireccion().getReferencia());
            pMap.put("direccion", dirMap);

            // Pago
            Pago pago = pagoRepository.findByPedidoId(p.getId()).orElse(null);
            pMap.put("metodoPago", pago != null ? pago.getMetodoPago() : "efectivo");

            // Items
            List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(p.getId());
            List<Map<String, Object>> itemsList = new java.util.ArrayList<>();
            for (DetallePedido d : detalles) {
                Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("id", d.getId());
                itemMap.put("productoId", d.getProducto().getId());
                itemMap.put("nombre", d.getProducto().getNombre());
                itemMap.put("imagenUrl", d.getProducto().getImagenUrl());
                itemMap.put("cantidad", d.getCantidad());
                itemMap.put("precioUnitario", d.getPrecioUnitario());

                // Personalizaciones
                List<DetallePersonalizacion> dps = detallePersonalizacionRepository.findByDetallePedidoId(d.getId());
                Map<String, String> selectionsMap = new java.util.HashMap<>();
                for (DetallePersonalizacion dp : dps) {
                    String val = dp.getOpcion() != null ? dp.getOpcion().getValor() : dp.getValorTexto();
                    selectionsMap.put(dp.getPersonalizacion().getNombre(), val);
                }
                itemMap.put("selections", selectionsMap);
                itemsList.add(itemMap);
            }
            pMap.put("items", itemsList);

            responseList.add(pMap);
        }

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}/factura")
    public void descargarFactura(@PathVariable Long id, HttpServletResponse response, Principal principal) throws Exception {
        if (principal == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "No autenticado");
            return;
        }
        Usuario usuario = usuarioRepository.findByEmail(principal.getName()).orElse(null);
        if (usuario == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Usuario no encontrado");
            return;
        }

        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Pedido no encontrado");
            return;
        }

        if (!pedido.getUsuario().getId().equals(usuario.getId()) && !"admin".equalsIgnoreCase(usuario.getRol().getNombre())) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "No tienes permiso para acceder a esta factura");
            return;
        }

        response.setContentType("application/pdf");
        String codigoPedido = "#SG-" + pedido.getId() + (pedido.getId() * 17 % 900 + 100);
        response.setHeader("Content-Disposition", "attachment; filename=\"boleta-" + codigoPedido + ".pdf\"");

        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        // Fuentes
        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new java.awt.Color(119, 90, 25)); // #775a19
        Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA, 10, new java.awt.Color(117, 94, 77)); // #755e4d
        Font fontSection = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new java.awt.Color(28, 28, 25)); // #1c1c19
        Font fontBodyBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new java.awt.Color(78, 70, 57));
        Font fontBody = FontFactory.getFont(FontFactory.HELVETICA, 9, new java.awt.Color(78, 70, 57)); // #4e4639
        Font fontSmall = FontFactory.getFont(FontFactory.HELVETICA, 8, new java.awt.Color(127, 118, 103)); // #7f7667
        Font fontTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new java.awt.Color(119, 90, 25));

        // 1. Encabezado - Nombre de la Tienda
        Paragraph title = new Paragraph("Sotelo Gourmet", fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph desc = new Paragraph("Arte en Pastelería Tradicional & Catering Fino\nVilla El Salvador, Lima, Perú\nTeléfono: +51 999 999 999 | ventas@sotelogourmet.com", fontSubtitle);
        desc.setAlignment(Element.ALIGN_CENTER);
        desc.setSpacingAfter(20);
        document.add(desc);

        // Línea divisoria
        Paragraph line = new Paragraph("----------------------------------------------------------------------------------------------------------------------------------", fontSmall);
        line.setSpacingAfter(15);
        document.add(line);

        // 2. Información del Pedido y Cliente
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingAfter(20);

        // Celda Izquierda: Cliente
        PdfPCell clientCell = new PdfPCell();
        clientCell.setBorder(Rectangle.NO_BORDER);
        clientCell.addElement(new Paragraph("DATOS DEL CLIENTE:", fontBodyBold));
        clientCell.addElement(new Paragraph("Nombre: " + pedido.getUsuario().getNombre(), fontBody));
        clientCell.addElement(new Paragraph("Email: " + pedido.getUsuario().getEmail(), fontBody));
        clientCell.addElement(new Paragraph("Teléfono: " + (pedido.getUsuario().getTelefono() != null ? pedido.getUsuario().getTelefono() : "Sin registrar"), fontBody));
        
        String refText = pedido.getDireccion().getReferencia() != null ? " (Ref: " + pedido.getDireccion().getReferencia() + ")" : "";
        clientCell.addElement(new Paragraph("Dirección: " + pedido.getDireccion().getCalle() + ", " + pedido.getDireccion().getDistrito() + refText, fontBody));
        infoTable.addCell(clientCell);

        // Celda Derecha: Pedido
        PdfPCell orderCell = new PdfPCell();
        orderCell.setBorder(Rectangle.NO_BORDER);
        Paragraph p1 = new Paragraph("COMPROBANTE DE COMPRA", fontBodyBold);
        p1.setAlignment(Element.ALIGN_RIGHT);
        orderCell.addElement(p1);
        
        Paragraph p2 = new Paragraph("Código: " + codigoPedido, fontSection);
        p2.setAlignment(Element.ALIGN_RIGHT);
        orderCell.addElement(p2);

        Paragraph p3 = new Paragraph("Fecha de Compra: " + (pedido.getFecha() != null ? pedido.getFecha().toString().substring(0, 16).replace("T", " ") : "Recién creado"), fontBody);
        p3.setAlignment(Element.ALIGN_RIGHT);
        orderCell.addElement(p3);

        Pago pago = pagoRepository.findByPedidoId(pedido.getId()).orElse(null);
        String metodoPago = (pago != null) ? pago.getMetodoPago().toUpperCase() : "EFECTIVO";
        Paragraph p4 = new Paragraph("Método de Pago: " + metodoPago, fontBody);
        p4.setAlignment(Element.ALIGN_RIGHT);
        orderCell.addElement(p4);
        
        infoTable.addCell(orderCell);

        document.add(infoTable);

        // 3. Detalle de Compra (Tabla de Productos)
        PdfPTable itemsTable = new PdfPTable(new float[]{10f, 50f, 15f, 25f});
        itemsTable.setWidthPercentage(100);
        itemsTable.setSpacingAfter(20);

        // Cabeceras de tabla
        java.awt.Color headerBg = new java.awt.Color(235, 232, 227); // #ebe8e3
        
        PdfPCell h1 = new PdfPCell(new Phrase("Cant.", fontBodyBold));
        h1.setBackgroundColor(headerBg);
        h1.setPadding(6);
        itemsTable.addCell(h1);

        PdfPCell h2 = new PdfPCell(new Phrase("Producto / Detalles", fontBodyBold));
        h2.setBackgroundColor(headerBg);
        h2.setPadding(6);
        itemsTable.addCell(h2);

        PdfPCell h3 = new PdfPCell(new Phrase("P. Unit.", fontBodyBold));
        h3.setBackgroundColor(headerBg);
        h3.setPadding(6);
        itemsTable.addCell(h3);

        PdfPCell h4 = new PdfPCell(new Phrase("Total Línea", fontBodyBold));
        h4.setBackgroundColor(headerBg);
        h4.setPadding(6);
        itemsTable.addCell(h4);

        // Agregar ítems
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(pedido.getId());
        for (DetallePedido d : detalles) {
            // Cantidad
            PdfPCell c1 = new PdfPCell(new Phrase(String.valueOf(d.getCantidad()), fontBody));
            c1.setPadding(6);
            c1.setVerticalAlignment(Element.ALIGN_MIDDLE);
            itemsTable.addCell(c1);

            // Producto y personalizaciones
            PdfPCell c2 = new PdfPCell();
            c2.setPadding(6);
            c2.addElement(new Paragraph(d.getProducto().getNombre(), fontBodyBold));

            List<DetallePersonalizacion> dps = detallePersonalizacionRepository.findByDetallePedidoId(d.getId());
            if (!dps.isEmpty()) {
                StringBuilder pText = new StringBuilder();
                for (DetallePersonalizacion dp : dps) {
                    String val = dp.getOpcion() != null ? dp.getOpcion().getValor() : dp.getValorTexto();
                    pText.append(dp.getPersonalizacion().getNombre().toUpperCase())
                         .append(": ")
                         .append(val.toUpperCase())
                         .append("  |  ");
                }
                if (pText.length() > 5) {
                    pText.setLength(pText.length() - 5);
                }
                c2.addElement(new Paragraph(pText.toString(), fontSmall));
            }
            itemsTable.addCell(c2);

            // Precio Unitario
            PdfPCell c3 = new PdfPCell(new Phrase("S/ " + String.format("%.2f", d.getPrecioUnitario()), fontBody));
            c3.setPadding(6);
            c3.setVerticalAlignment(Element.ALIGN_MIDDLE);
            itemsTable.addCell(c3);

            // Total línea
            java.math.BigDecimal subTotalLinea = d.getPrecioUnitario().multiply(new java.math.BigDecimal(d.getCantidad()));
            PdfPCell c4 = new PdfPCell(new Phrase("S/ " + String.format("%.2f", subTotalLinea), fontBody));
            c4.setPadding(6);
            c4.setVerticalAlignment(Element.ALIGN_MIDDLE);
            itemsTable.addCell(c4);
        }

        document.add(itemsTable);

        // 4. Resumen Financiero
        PdfPTable totalsTable = new PdfPTable(new float[]{70f, 30f});
        totalsTable.setWidthPercentage(100);

        PdfPCell labelCell = new PdfPCell();
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.addElement(new Paragraph("Gracias por apoyar la pastelería artesanal tradicional.", fontSubtitle));
        labelCell.addElement(new Paragraph("Sotelo Gourmet - Villa El Salvador - Lima", fontSmall));
        totalsTable.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell();
        valueCell.setBorder(Rectangle.NO_BORDER);

        // Calculamos subtotal
        java.math.BigDecimal subtotal = java.math.BigDecimal.ZERO;
        for (DetallePedido d : detalles) {
            subtotal = subtotal.add(d.getPrecioUnitario().multiply(new java.math.BigDecimal(d.getCantidad())));
        }
        
        java.math.BigDecimal total = pedido.getTotal();
        java.math.BigDecimal envio = total.subtract(subtotal);
        if (envio.compareTo(java.math.BigDecimal.ZERO) < 0) {
            envio = java.math.BigDecimal.ZERO;
        }

        Paragraph subText = new Paragraph("Subtotal: S/ " + String.format("%.2f", subtotal), fontBody);
        subText.setAlignment(Element.ALIGN_RIGHT);
        valueCell.addElement(subText);

        String envioTextStr = (envio.compareTo(java.math.BigDecimal.ZERO) == 0) ? "Gratis" : "S/ " + String.format("%.2f", envio);
        Paragraph envText = new Paragraph("Costo de Envío: " + envioTextStr, fontBody);
        envText.setAlignment(Element.ALIGN_RIGHT);
        valueCell.addElement(envText);

        Paragraph totText = new Paragraph("Total a Pagar: S/ " + String.format("%.2f", total), fontTotal);
        totText.setAlignment(Element.ALIGN_RIGHT);
        valueCell.addElement(totText);

        totalsTable.addCell(valueCell);

        document.add(totalsTable);

        document.close();
    }
}

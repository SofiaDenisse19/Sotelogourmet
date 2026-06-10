package com.example.sotelogourmet.config;

import com.example.sotelogourmet.model.*;
import com.example.sotelogourmet.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final DireccionRepository direccionRepository;
    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final PagoRepository pagoRepository;
    private final HistorialPedidosRepository historialPedidosRepository;
    private final ProductoRepository productoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           RolRepository rolRepository,
                           DireccionRepository direccionRepository,
                           PedidoRepository pedidoRepository,
                           DetallePedidoRepository detallePedidoRepository,
                           PagoRepository pagoRepository,
                           HistorialPedidosRepository historialPedidosRepository,
                           ProductoRepository productoRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.direccionRepository = direccionRepository;
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.pagoRepository = pagoRepository;
        this.historialPedidosRepository = historialPedidosRepository;
        this.productoRepository = productoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Ejecutar la inyección solo si no hay pedidos registrados
        if (pedidoRepository.count() == 0) {
            
            // 1. Obtener o crear Roles (cliente y admin)
            Rol rolCliente = rolRepository.findByNombre("cliente")
                    .orElseGet(() -> rolRepository.save(Rol.builder().nombre("cliente").build()));
            Rol rolAdmin = rolRepository.findByNombre("admin")
                    .orElseGet(() -> rolRepository.save(Rol.builder().nombre("admin").build()));

            // 2. Crear Usuarios Clientes Semilla
            Usuario alessandro = obtenerOCrearUsuario("Alessandro Rossi", "alessandro.rossi@example.com", "987654321", rolCliente);
            Usuario lucia = obtenerOCrearUsuario("Lucía Méndez", "lucia.mendez@gmail.com", "912345678", rolCliente);
            Usuario carlos = obtenerOCrearUsuario("Carlos Huamán", "carlos.huaman@outlook.com", "934567890", rolCliente);

            // 3. Crear Direcciones en Lima
            Direccion dirAlessandro = obtenerOCrearDireccion(alessandro, "Av. Larco 456", "Miraflores", "Lima", "15074", "Frente al Parque Kennedy");
            Direccion dirLucia = obtenerOCrearDireccion(lucia, "Calle Las Flores 123", "San Isidro", "Lima", "15073", "Cerca a la Vía Expresa");
            Direccion dirCarlos = obtenerOCrearDireccion(carlos, "Av. Primavera 789", "Santiago de Surco", "Lima", "15038", "A dos cuadras del CC Caminos del Inca");

            // 4. Obtener Productos requeridos por nombre
            Producto pDesayuno = obtenerOCrearProducto("Desayuno gourmet", BigDecimal.valueOf(45.00));
            Producto pVainillaFrutas = obtenerOCrearProducto("Torta de vainilla con frutas", BigDecimal.valueOf(90.00));
            Producto pMacarons = obtenerOCrearProducto("Macarons de Autor (x12)", BigDecimal.valueOf(45.00));
            Producto pBrownie = obtenerOCrearProducto("Brownies artesanales", BigDecimal.valueOf(5.00));
            Producto pCookies = obtenerOCrearProducto("Cookies Artesanales", BigDecimal.valueOf(38.00));
            Producto pTortaGanache = obtenerOCrearProducto("Torta Ganache Royale", BigDecimal.valueOf(120.00));

            // 5. Inyectar Pedido 1: Alessandro Rossi, Total: S/ 185.00, Pago: Yape, Estado: "pendiente"
            // Items: Desayuno gourmet (45), Torta vainilla (90), Macarons (45), Brownie (5)
            Pedido ped1 = Pedido.builder()
                    .usuario(alessandro)
                    .direccion(dirAlessandro)
                    .estado("pendiente")
                    .total(BigDecimal.valueOf(185.00))
                    .build();
            ped1 = pedidoRepository.save(ped1);

            detallePedidoRepository.save(DetallePedido.builder().pedido(ped1).producto(pDesayuno).cantidad(1).precioUnitario(BigDecimal.valueOf(45.00)).build());
            detallePedidoRepository.save(DetallePedido.builder().pedido(ped1).producto(pVainillaFrutas).cantidad(1).precioUnitario(BigDecimal.valueOf(90.00)).build());
            detallePedidoRepository.save(DetallePedido.builder().pedido(ped1).producto(pMacarons).cantidad(1).precioUnitario(BigDecimal.valueOf(45.00)).build());
            detallePedidoRepository.save(DetallePedido.builder().pedido(ped1).producto(pBrownie).cantidad(1).precioUnitario(BigDecimal.valueOf(5.00)).build());

            pagoRepository.save(Pago.builder()
                    .pedido(ped1)
                    .monto(BigDecimal.valueOf(185.00))
                    .metodoPago("yape")
                    .estado("completado")
                    .build());

            historialPedidosRepository.save(HistorialPedidos.builder()
                    .pedido(ped1)
                    .estadoAnterior(null)
                    .estadoNuevo("pendiente")
                    .nota("Pedido registrado exitosamente")
                    .build());

            // 6. Inyectar Pedido 2: Lucía Méndez, Total: S/ 42.50, Pago: Tarjeta, Estado: "confirmado"
            // Para respetar el trigger de transiciones, lo creamos como 'pendiente', guardamos historial (null->pendiente),
            // luego lo pasamos a 'confirmado' e insertamos historial (pendiente->confirmado).
            Pedido ped2 = Pedido.builder()
                    .usuario(lucia)
                    .direccion(dirLucia)
                    .estado("pendiente")
                    .total(BigDecimal.valueOf(42.50))
                    .build();
            ped2 = pedidoRepository.save(ped2);

            detallePedidoRepository.save(DetallePedido.builder().pedido(ped2).producto(pCookies).cantidad(1).precioUnitario(BigDecimal.valueOf(37.50)).build());
            detallePedidoRepository.save(DetallePedido.builder().pedido(ped2).producto(pBrownie).cantidad(1).precioUnitario(BigDecimal.valueOf(5.00)).build());

            pagoRepository.save(Pago.builder()
                    .pedido(ped2)
                    .monto(BigDecimal.valueOf(42.50))
                    .metodoPago("tarjeta")
                    .estado("completado")
                    .build());

            historialPedidosRepository.save(HistorialPedidos.builder()
                    .pedido(ped2)
                    .estadoAnterior(null)
                    .estadoNuevo("pendiente")
                    .nota("Pedido registrado exitosamente")
                    .build());

            // Transición a "confirmado"
            ped2.setEstado("confirmado");
            pedidoRepository.save(ped2);

            historialPedidosRepository.save(HistorialPedidos.builder()
                    .pedido(ped2)
                    .estadoAnterior("pendiente")
                    .estadoNuevo("confirmado")
                    .nota("Pago validado y pedido confirmado")
                    .build());

            // 7. Inyectar Pedido 3: Carlos Huamán, Total: S/ 250.00, Pago: Efectivo, Estado: "en_preparacion"
            // Secuencia de estados: pendiente -> confirmado -> en_preparacion
            Pedido ped3 = Pedido.builder()
                    .usuario(carlos)
                    .direccion(dirCarlos)
                    .estado("pendiente")
                    .total(BigDecimal.valueOf(250.00))
                    .build();
            ped3 = pedidoRepository.save(ped3);

            detallePedidoRepository.save(DetallePedido.builder().pedido(ped3).producto(pTortaGanache).cantidad(2).precioUnitario(BigDecimal.valueOf(120.00)).build());
            detallePedidoRepository.save(DetallePedido.builder().pedido(ped3).producto(pBrownie).cantidad(2).precioUnitario(BigDecimal.valueOf(5.00)).build());

            pagoRepository.save(Pago.builder()
                    .pedido(ped3)
                    .monto(BigDecimal.valueOf(250.00))
                    .metodoPago("efectivo")
                    .estado("pendiente")
                    .build());

            historialPedidosRepository.save(HistorialPedidos.builder()
                    .pedido(ped3)
                    .estadoAnterior(null)
                    .estadoNuevo("pendiente")
                    .nota("Pedido registrado con pago contra entrega")
                    .build());

            // Transición a "confirmado"
            ped3.setEstado("confirmado");
            pedidoRepository.save(ped3);

            historialPedidosRepository.save(HistorialPedidos.builder()
                    .pedido(ped3)
                    .estadoAnterior("pendiente")
                    .estadoNuevo("confirmado")
                    .nota("Pedido verificado y confirmado")
                    .build());

            // Transición a "en_preparacion"
            ped3.setEstado("en_preparacion");
            pedidoRepository.save(ped3);

            historialPedidosRepository.save(HistorialPedidos.builder()
                    .pedido(ped3)
                    .estadoAnterior("confirmado")
                    .estadoNuevo("en_preparacion")
                    .nota("El chef ha comenzado a preparar el pedido")
                    .build());

            // 8. Ajustar fechas de los pedidos creados para dar realismo a la data en base de datos.
            // Usamos JdbcTemplate porque la columna 'fecha' es no-insertable en el mapeo JPA.
            LocalDateTime ahora = LocalDateTime.now();
            jdbcTemplate.update("UPDATE pedidos SET fecha = ? WHERE id = ?", ahora.minusHours(4), ped1.getId());
            jdbcTemplate.update("UPDATE pedidos SET fecha = ? WHERE id = ?", ahora.minusHours(2), ped2.getId());
            jdbcTemplate.update("UPDATE pedidos SET fecha = ? WHERE id = ?", ahora.minusMinutes(45), ped3.getId());
            
            // También actualizamos la fecha de pago e historial para mantener la integridad
            jdbcTemplate.update("UPDATE pagos SET fecha_pago = ? WHERE pedido_id = ?", ahora.minusHours(4), ped1.getId());
            jdbcTemplate.update("UPDATE pagos SET fecha_pago = ? WHERE pedido_id = ?", ahora.minusHours(2), ped2.getId());
            
            jdbcTemplate.update("UPDATE historial_pedidos SET fecha_cambio = ? WHERE pedido_id = ?", ahora.minusHours(4), ped1.getId());
            jdbcTemplate.update("UPDATE historial_pedidos SET fecha_cambio = ? WHERE pedido_id = ?", ahora.minusHours(2), ped2.getId());
            jdbcTemplate.update("UPDATE historial_pedidos SET fecha_cambio = ? WHERE pedido_id = ?", ahora.minusMinutes(45), ped3.getId());

            log.info(">>> Datos semilla de 3 pedidos inyectados correctamente con sus pagos e historiales.");
        }
    }

    private Usuario obtenerOCrearUsuario(String nombre, String email, String telefono, Rol rol) {
        return usuarioRepository.findByEmail(email)
                .orElseGet(() -> usuarioRepository.save(Usuario.builder()
                        .nombre(nombre)
                        .email(email)
                        .passwordHash(passwordEncoder.encode("123456"))
                        .telefono(telefono)
                        .rol(rol)
                        .build()));
    }

    private Direccion obtenerOCrearDireccion(Usuario usuario, String calle, String distrito, String ciudad, String codigoPostal, String referencia) {
        return direccionRepository.findByUsuarioId(usuario.getId()).stream().findFirst()
                .orElseGet(() -> direccionRepository.save(Direccion.builder()
                        .usuario(usuario)
                        .calle(calle)
                        .distrito(distrito)
                        .ciudad(ciudad)
                        .codigoPostal(codigoPostal)
                        .referencia(referencia)
                        .esPrincipal(true)
                        .build()));
    }

    private Producto obtenerOCrearProducto(String nombre, BigDecimal precio) {
        return productoRepository.findByActivoTrue().stream()
                .filter(p -> p.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElseGet(() -> {
                    Producto p = Producto.builder()
                            .nombre(nombre)
                            .descripcion("Descripción de " + nombre)
                            .precio(precio)
                            .stock(50)
                            .activo(true)
                            .destacado(false)
                            .build();
                    return productoRepository.save(p);
                });
    }
}

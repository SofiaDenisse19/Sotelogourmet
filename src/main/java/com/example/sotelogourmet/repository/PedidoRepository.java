package com.example.sotelogourmet.repository;

import com.example.sotelogourmet.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    List<Pedido> findAllByOrderByFechaDesc();

    List<Pedido> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    @Query("SELECT SUM(p.total) FROM Pedido p")
    BigDecimal sumTotalSales();

    long countByEstado(String estado);
}

package com.example.sotelogourmet.repository;

import com.example.sotelogourmet.model.HistorialPedidos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialPedidosRepository extends JpaRepository<HistorialPedidos, Long> {
    List<HistorialPedidos> findByPedidoIdOrderByFechaCambioDesc(Long pedidoId);
}

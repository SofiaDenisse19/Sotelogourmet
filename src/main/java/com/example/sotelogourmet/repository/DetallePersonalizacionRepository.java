package com.example.sotelogourmet.repository;

import com.example.sotelogourmet.model.DetallePersonalizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePersonalizacionRepository extends JpaRepository<DetallePersonalizacion, Long> {
    List<DetallePersonalizacion> findByDetallePedidoId(Long detallePedidoId);
}

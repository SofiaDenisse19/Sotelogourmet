package com.example.sotelogourmet.repository;

import com.example.sotelogourmet.model.OpcionPersonalizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OpcionPersonalizacionRepository extends JpaRepository<OpcionPersonalizacion, Long> {
    Optional<OpcionPersonalizacion> findByPersonalizacionIdAndValorIgnoreCase(Long personalizacionId, String valor);
}

package com.example.sotelogourmet.repository;

import com.example.sotelogourmet.model.Personalizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonalizacionRepository extends JpaRepository<Personalizacion, Long> {
    Optional<Personalizacion> findByNombreIgnoreCase(String nombre);
}

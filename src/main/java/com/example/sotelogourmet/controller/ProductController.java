package com.example.sotelogourmet.controller;

import com.example.sotelogourmet.dto.PersonalizacionDto;
import com.example.sotelogourmet.dto.ProductoDto;
import com.example.sotelogourmet.model.Categoria;
import com.example.sotelogourmet.model.Producto;
import com.example.sotelogourmet.repository.CategoriaRepository;
import com.example.sotelogourmet.repository.ProductoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductController(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping("/productos")
    public List<ProductoDto> getProductos() {
        List<Producto> productos = productoRepository.findByActivoTrue();
        return productos.stream().map(this::mapToProductoDto).collect(Collectors.toList());
    }

    @GetMapping("/categorias")
    public List<Categoria> getCategorias() {
        return categoriaRepository.findAll();
    }

    private ProductoDto mapToProductoDto(Producto p) {
        return ProductoDto.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .precio(p.getPrecio())
                .precioOferta(p.getPrecioOferta())
                .stock(p.getStock())
                .categoria(p.getCategoria() != null ? p.getCategoria().getNombre() : null)
                .imagenUrl(p.getImagenUrl())
                .activo(p.getActivo())
                .destacado(p.getDestacado())
                .tag(p.getTag())
                .rating(p.getRating())
                .resenasCount(p.getResenasCount())
                .personalizaciones(p.getPersonalizaciones() == null ? Collections.emptyList() :
                        p.getPersonalizaciones().stream().map(this::mapToPersonalizacionDto).collect(Collectors.toList()))
                .build();
    }

    private PersonalizacionDto mapToPersonalizacionDto(com.example.sotelogourmet.model.Personalizacion pers) {
        return PersonalizacionDto.builder()
                .id(pers.getId())
                .nombre(pers.getNombre())
                .tipo(pers.getTipo())
                .requerido(pers.getRequerido())
                .placeholder(pers.getPlaceholder())
                .opciones(pers.getOpciones() == null ? Collections.emptyList() :
                        pers.getOpciones().stream().map(opt -> PersonalizacionDto.OpcionDto.builder()
                                .id(opt.getId())
                                .valor(opt.getValor())
                                .precioExtra(opt.getPrecioExtra())
                                .descripcion(opt.getDescripcion())
                                .build()).collect(Collectors.toList()))
                .build();
    }
}

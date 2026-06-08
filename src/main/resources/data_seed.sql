-- Limpiar catálogo existente para evitar duplicados
DELETE FROM producto_personalizacion;
DELETE FROM opciones_personalizacion;
DELETE FROM productos;
DELETE FROM personalizaciones;
DELETE FROM categorias;

-- 1. Insertar Categorías
INSERT INTO categorias (nombre) VALUES
('almuerzos'),
('desayunos'),
('bebidas'),
('tortas'),
('postres'),
('bocaditos');

-- 2. Insertar Personalizaciones con placeholder
INSERT INTO personalizaciones (nombre, tipo, requerido, placeholder) VALUES
('Mensaje', 'texto', false, 'Escribe aquí tu mensaje especial...'),
('Sabor del cake', 'seleccion', true, NULL),
('Relleno', 'seleccion', true, NULL),
('Tamaño', 'seleccion', true, NULL);

-- 3. Insertar Opciones de Personalización
-- Sabores
INSERT INTO opciones_personalizacion (personalizacion_id, valor, precio_extra, descripcion) VALUES
((SELECT id FROM personalizaciones WHERE nombre='Sabor del cake'), 'Chocolate', 0.00, NULL),
((SELECT id FROM personalizaciones WHERE nombre='Sabor del cake'), 'Vainilla', 0.00, NULL);

-- Rellenos
INSERT INTO opciones_personalizacion (personalizacion_id, valor, precio_extra, descripcion) VALUES
((SELECT id FROM personalizaciones WHERE nombre='Relleno'), 'Manjar', 0.00, NULL),
((SELECT id FROM personalizaciones WHERE nombre='Relleno'), 'Fresa', 0.00, NULL),
((SELECT id FROM personalizaciones WHERE nombre='Relleno'), 'Oreo', 0.00, NULL);

-- Tamaños
INSERT INTO opciones_personalizacion (personalizacion_id, valor, precio_extra, descripcion) VALUES
((SELECT id FROM personalizaciones WHERE nombre='Tamaño'), '15 porciones', 0.00, 'Pequeña (8 porciones en mockup)'),
((SELECT id FROM personalizaciones WHERE nombre='Tamaño'), '20 porciones', 15.00, 'Mediana (10-12 porciones en mockup)'),
((SELECT id FROM personalizaciones WHERE nombre='Tamaño'), '30 porciones', 25.00, 'Grande (15-20 porciones en mockup)');

-- 4. Insertar los 17 Productos
INSERT INTO productos (id, nombre, descripcion, precio, precio_oferta, stock, categoria_id, imagen_url, activo, destacado, tag, rating, resenas_count)
OVERRIDING SYSTEM VALUE
VALUES
(1, 'Torta Tralalero Tralala', 'Bizcocho de cacao intenso con mousse de avellanas y baño de chocolate belga. Torta para ocasiones especiales.', 80.00, NULL, 10, (SELECT id FROM categorias WHERE nombre = 'tortas'), 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80', true, true, 'TOP VENTAS', 4.9, 42),

(2, 'Torta de vainilla con frutas', 'Bizcocho de vainilla decorado con frutas frescas de estación y crema chantilly premium.', 90.00, NULL, 8, (SELECT id FROM categorias WHERE nombre = 'tortas'), 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.7, 12),

(3, 'Cheesecake de maracuyá', 'Postre frío con base de galleta y crema de maracuyá. Equilibrio perfecto entre la cremosidad del queso y la acidez vibrante del maracuyá fresco.', 25.00, NULL, 15, (SELECT id FROM categorias WHERE nombre = 'postres'), 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=600&auto=format&fit=crop&q=80', true, true, NULL, 4.8, 28),

(4, 'Brownies artesanales', 'Brownies de chocolate con nueces. Húmedos, densos y cargados de nueces seleccionadas. El acompañante ideal para un café.', 5.00, NULL, 50, (SELECT id FROM categorias WHERE nombre = 'postres'), 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', true, true, NULL, 4.6, 35),

(5, 'Desayuno gourmet', 'Caja premium de desayuno con jugo de fresa, sándwich de jamón serrano, ensalada de frutas y un mini postre.', 45.00, NULL, 12, (SELECT id FROM categorias WHERE nombre = 'desayunos'), 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.9, 19),

(6, 'Almuerzo ejecutivo', 'Menú balanceado gourmet: Plato principal premium + jugo natural + mini postre de la casa.', 30.00, NULL, 20, (SELECT id FROM categorias WHERE nombre = 'almuerzos'), 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.5, 14),

(7, 'Jugo natural de fresa', 'Bebida refrescante elaborada con fresas frescas seleccionadas. Prensado en frío al instante.', 8.00, NULL, 30, (SELECT id FROM categorias WHERE nombre = 'bebidas'), 'https://images.unsplash.com/photo-1589733901241-5e514f26b54a?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.7, 9),

(8, 'Bocaditos salados surtidos', 'Bandeja variada de mini empanaditas, tequeños rellenos y croquetas artesanales crujientes.', 60.00, NULL, 5, (SELECT id FROM categorias WHERE nombre = 'bocaditos'), 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.8, 22),

(9, 'Torta Ganache Royale', 'Bizcocho de chocolate 70% cacao con capas de ganache suave, mousse de chocolate y perlas crujientes belgas.', 120.00, NULL, 7, (SELECT id FROM categorias WHERE nombre = 'tortas'), 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.9, 31),

(10, 'Macarons de Autor (x12)', 'Colección de sabores estacionales hechos a mano: Lavanda, Pistacho y Frutos Rojos con harina de almendras fina.', 45.00, NULL, 25, (SELECT id FROM categorias WHERE nombre = 'postres'), 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.8, 53),

(11, 'Cupcakes Red Velvet', 'Pack de 6 unidades con bizcocho Red Velvet húmedo, frosting de queso crema premium y decoraciones de chocolate.', 55.00, NULL, 15, (SELECT id FROM categorias WHERE nombre = 'postres'), 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.9, 24),

(12, 'Cheesecake New York', 'Clásico horneado al estilo neoyorquino con base de galleta de mantequilla, coulis de frutos rojos estacionales y fresas frescas.', 90.00, 72.00, 10, (SELECT id FROM categorias WHERE nombre = 'postres'), 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.8, 17),

(13, 'Cookies Artesanales', 'Selección de 8 galletas gigantes horneadas diariamente: Choco-chips con sal marina y cookies con doble chocolate.', 38.00, NULL, 40, (SELECT id FROM categorias WHERE nombre = 'postres'), 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.7, 11),

(14, 'Mini Quiches Salados', 'Bandeja de 24 bocaditos salados: jamón serrano con gruyere, champiñones con espinaca y cebolla caramelizada.', 65.00, NULL, 12, (SELECT id FROM categorias WHERE nombre = 'bocaditos'), 'https://images.unsplash.com/photo-1628113310479-90be225965f2?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.8, 15),

(15, 'Jugo Natural Detox', 'Prensado en frío con naranjas de estación, zanahoria, manzana verde y un toque de jengibre fresco.', 12.00, NULL, 35, (SELECT id FROM categorias WHERE nombre = 'bebidas'), 'https://images.unsplash.com/photo-1610970881699-44a5587caa9a?w=600&auto=format&fit=crop&q=80', true, true, NULL, 4.6, 8),

(16, 'Pastel de Zanahoria', 'Bizcocho especiado de zanahoria con nueces tostadas y capas suaves de frosting de queso crema.', 95.00, NULL, 6, (SELECT id FROM categorias WHERE nombre = 'tortas'), 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.8, 21),

(17, 'Red Velvet Clásico', 'Bizcocho esponjoso con sutil sabor a cacao, relleno y cubierto con frosting de queso dulce artesanal.', 110.00, NULL, 8, (SELECT id FROM categorias WHERE nombre = 'tortas'), 'https://images.unsplash.com/photo-1586985289688-ca9cf499150a?w=600&auto=format&fit=crop&q=80', true, false, NULL, 4.9, 33);

-- 5. Asignar Personalizaciones a los Productos
-- Torta Tralalero Tralala (1)
INSERT INTO producto_personalizacion (producto_id, personalizacion_id) VALUES
(1, (SELECT id FROM personalizaciones WHERE nombre='Mensaje')),
(1, (SELECT id FROM personalizaciones WHERE nombre='Sabor del cake')),
(1, (SELECT id FROM personalizaciones WHERE nombre='Relleno')),
(1, (SELECT id FROM personalizaciones WHERE nombre='Tamaño'));

-- Torta de vainilla con frutas (2)
INSERT INTO producto_personalizacion (producto_id, personalizacion_id) VALUES
(2, (SELECT id FROM personalizaciones WHERE nombre='Mensaje')),
(2, (SELECT id FROM personalizaciones WHERE nombre='Sabor del cake')),
(2, (SELECT id FROM personalizaciones WHERE nombre='Relleno')),
(2, (SELECT id FROM personalizaciones WHERE nombre='Tamaño'));

-- Cheesecake de maracuyá (3)
INSERT INTO producto_personalizacion (producto_id, personalizacion_id) VALUES
(3, (SELECT id FROM personalizaciones WHERE nombre='Mensaje'));

-- Desayuno gourmet (5)
INSERT INTO producto_personalizacion (producto_id, personalizacion_id) VALUES
(5, (SELECT id FROM personalizaciones WHERE nombre='Mensaje'));

-- Torta Ganache Royale (9)
INSERT INTO producto_personalizacion (producto_id, personalizacion_id) VALUES
(9, (SELECT id FROM personalizaciones WHERE nombre='Mensaje')),
(9, (SELECT id FROM personalizaciones WHERE nombre='Sabor del cake')),
(9, (SELECT id FROM personalizaciones WHERE nombre='Relleno')),
(9, (SELECT id FROM personalizaciones WHERE nombre='Tamaño'));

-- Cheesecake New York (12)
INSERT INTO producto_personalizacion (producto_id, personalizacion_id) VALUES
(12, (SELECT id FROM personalizaciones WHERE nombre='Mensaje'));

-- Pastel de Zanahoria (16)
INSERT INTO producto_personalizacion (producto_id, personalizacion_id) VALUES
(16, (SELECT id FROM personalizaciones WHERE nombre='Mensaje')),
(16, (SELECT id FROM personalizaciones WHERE nombre='Tamaño'));

-- Red Velvet Clásico (17)
INSERT INTO producto_personalizacion (producto_id, personalizacion_id) VALUES
(17, (SELECT id FROM personalizaciones WHERE nombre='Mensaje')),
(17, (SELECT id FROM personalizaciones WHERE nombre='Sabor del cake')),
(17, (SELECT id FROM personalizaciones WHERE nombre='Tamaño'));

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Heart, ShoppingBag, Award, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LandingPage({ products = [], toggleFavorite, favorites, addToCart }) {
  const navigate = useNavigate();
  
  // Get featured products
  const featuredProducts = products.filter(p => p.destacado);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const nextFeatured = () => {
    setCarouselIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevFeatured = () => {
    setCarouselIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const handleCategoryClick = (catName) => {
    navigate(`/catalogo?category=${catName}`);
  };

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] bg-[#fdf9f4] flex items-center py-16 px-4 md:px-8 overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#f8dac5]/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#e1d4fd]/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <span className="text-sm font-semibold tracking-widest text-[#775a19] uppercase bg-[#775a19]/10 px-3 py-1 rounded-full">
              Alta Pastelería Artesanal
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#1c1c19] leading-tight font-extrabold">
              Una obra de arte <br />
              <span className="text-[#775a19] italic">para tu paladar</span>
            </h1>
            <p className="text-lg text-[#4e4639] max-w-xl leading-relaxed">
              Cada creación en Sotelo Gourmet es elaborada con ingredientes nobles, técnicas refinadas y la paciencia que la excelencia requiere. Deleita tus sentidos hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                to="/catalogo"
                className="px-8 py-4 bg-[#775a19] text-white font-semibold rounded-xl shadow-lg shadow-[#775a19]/25 hover:bg-[#5e4713] transition-all hover:scale-105 flex items-center justify-center gap-2 group"
              >
                Explorar Catálogo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => {
                  const el = document.getElementById('benefits');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-transparent border-2 border-[#775a19] text-[#775a19] font-semibold rounded-xl hover:bg-[#775a19]/5 transition-all"
              >
                Nuestra Historia
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center relative">
            <div className="relative w-full max-w-lg aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80" 
                alt="Alta Pastelería SoteloGourmet" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white p-4 glass-nav rounded-xl border border-white/20">
                <p className="text-xs tracking-widest text-[#775a19] uppercase font-bold">Creación Estrella</p>
                <Link to="/producto/1" className="text-lg font-serif font-bold text-[#1c1c19] hover:underline">
                  Torta Tralalero Tralala
                </Link>
                <p className="text-sm text-[#4e4639] line-clamp-1">Bizcocho de cacao con mousse de avellanas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bento Grid Categories Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif text-[#1c1c19] font-bold">Explora por Categoría</h2>
            <div className="h-1 w-20 bg-[#775a19] mx-auto my-4 rounded" />
            <p className="text-[#4e4639]">Delicias pensadas para cada momento del día. Dulces, salados y bebidas gourmet.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[480px]">
            {/* Celebraciones (Tortas) - Big Tall Column */}
            <div 
              onClick={() => handleCategoryClick('tortas')}
              className="md:col-span-2 md:row-span-2 group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <img 
                src="https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=800&auto=format&fit=crop&q=80" 
                alt="Tortas de Autor" 
                className="w-full h-full min-h-[300px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <span className="text-xs font-semibold tracking-widest text-[#f8dac5] uppercase">CELEBRACIONES</span>
                <h3 className="text-2xl font-serif font-bold mt-1">Tortas de Autor</h3>
                <p className="text-sm text-white/80 mt-2 flex items-center gap-1 group-hover:text-white transition-colors">
                  Ver productos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>

            {/* Mañanas Premium (Desayunos) */}
            <div 
              onClick={() => handleCategoryClick('desayunos')}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <img 
                src="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80" 
                alt="Desayunos Premium" 
                className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="text-xs font-semibold tracking-widest text-[#f8dac5] uppercase">MAÑANAS PREMIUM</span>
                <h3 className="text-xl font-serif font-bold mt-1">Desayunos</h3>
                <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
                  Ver productos <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>

            {/* Salado Gourmet (Almuerzos) */}
            <div 
              onClick={() => handleCategoryClick('almuerzos')}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80" 
                alt="Almuerzos" 
                className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="text-xs font-semibold tracking-widest text-[#f8dac5] uppercase">SALADO GOURMET</span>
                <h3 className="text-xl font-serif font-bold mt-1">Almuerzos</h3>
                <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
                  Ver productos <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>

            {/* Mesa Dulce (Postres) */}
            <div 
              onClick={() => handleCategoryClick('postres')}
              className="md:col-span-2 group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
            >
              <img 
                src="https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=800&auto=format&fit=crop&q=80" 
                alt="Postres & Petit Fours" 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-8 text-white">
                <span className="text-xs font-semibold tracking-widest text-[#f8dac5] uppercase">MESA DULCE</span>
                <h3 className="text-xl font-serif font-bold mt-1">Postres & Petit Fours</h3>
                <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
                  Ver productos <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Products Carousel */}
      <section className="py-20 px-4 md:px-8 bg-[#f1ede8] overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold tracking-wider text-[#775a19] uppercase">Nuestra Selección Especial</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#1c1c19] font-bold mt-2">Nuestros Destacados</h2>
            </div>
            {/* Navigation Buttons */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button 
                onClick={prevFeatured}
                className="p-3 bg-white rounded-full text-[#1c1c19] shadow hover:bg-[#775a19] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextFeatured}
                className="p-3 bg-white rounded-full text-[#1c1c19] shadow hover:bg-[#775a19] hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cards Carousel View */}
          <div className="relative w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
              {/* Show 4 products at a time */}
              {[0, 1, 2, 3].map((offset) => {
                const idx = (carouselIndex + offset) % featuredProducts.length;
                const product = featuredProducts[idx];
                if (!product) return null;
                const isFav = favorites.includes(product.id);

                return (
                  <div 
                    key={`${product.id}-${offset}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#e1d4fd]/20 hover-gold-grow flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100 group">
                      <Link to={`/producto/${product.id}`}>
                        <img 
                          src={product.imagen_url} 
                          alt={product.nombre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 cursor-pointer"
                        />
                      </Link>
                      {product.tag && (
                        <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase bg-[#775a19] text-white px-2 py-1 rounded">
                          {product.tag}
                        </span>
                      )}
                      <button 
                        onClick={() => toggleFavorite(product.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors ${
                          isFav ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
                          <span className="text-xs font-semibold text-[#4e4639]">{product.rating}</span>
                          <span className="text-[10px] text-gray-400">({product.reseñas_count})</span>
                        </div>
                        <Link 
                          to={`/producto/${product.id}`}
                          className="font-serif font-bold text-lg text-[#1c1c19] hover:text-[#775a19] transition-colors cursor-pointer line-clamp-1 block"
                        >
                          {product.nombre}
                        </Link>
                        <p className="text-xs text-[#4e4639] line-clamp-2 mt-1.5 leading-relaxed">
                          {product.descripcion}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <span className="text-lg font-bold text-[#775a19]">
                          S/ {product.precio.toFixed(2)}
                        </span>
                        
                        {product.personalizaciones.length > 0 ? (
                          <Link 
                            to={`/producto/${product.id}`}
                            className="p-2.5 bg-[#f8dac5] text-[#775a19] rounded-xl hover:bg-[#775a19] hover:text-white transition-colors"
                            title="Personalizar pastel"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </Link>
                        ) : (
                          <button 
                            onClick={() => addToCart(product, 1, {})}
                            className="p-2.5 bg-[#f8dac5] text-[#775a19] rounded-xl hover:bg-[#775a19] hover:text-white transition-colors cursor-pointer"
                            title="Añadir al carrito"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Benefits Section */}
      <section id="benefits" className="py-20 px-4 md:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Benefit 1 */}
          <div className="flex flex-col items-center text-center space-y-4 p-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f8dac5]/30 text-[#775a19] flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1c1c19]">Ingredientes Naturales</h3>
            <p className="text-[#4e4639] text-sm leading-relaxed max-w-sm">
              Sin conservantes ni colorantes artificiales. Utilizamos únicamente mantequilla real, chocolate de alta pureza y frutas de estación seleccionadas.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="flex flex-col items-center text-center space-y-4 p-4">
            <div className="w-16 h-16 rounded-2xl bg-[#e1d4fd]/30 text-[#4f378a] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1c1c19]">Hecho a Mano</h3>
            <p className="text-[#4e4639] text-sm leading-relaxed max-w-sm">
              Cada pieza es única. Respetamos rigurosamente los tiempos de amasado, leudado y horneado para conseguir texturas y sabores inigualables.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="flex flex-col items-center text-center space-y-4 p-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-50 text-[#c5a059] flex items-center justify-center">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1c1c19]">Entrega Segura</h3>
            <p className="text-[#4e4639] text-sm leading-relaxed max-w-sm">
              Logística propia y especializada. Tu pedido viaja en cajas térmicas seguras para asegurar que llegue fresco y en perfecta forma a tu mesa.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-24 px-4 md:px-8 bg-[#fdf9f4] relative">
        <div className="absolute top-10 left-10 text-9xl font-serif text-[#775a19]/5 pointer-events-none select-none">“</div>
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <span className="text-xs font-semibold tracking-widest text-[#775a19] uppercase">TESTIMONIOS DE CLIENTES</span>
          
          <blockquote className="text-2xl md:text-3xl font-serif italic text-[#1c1c19] leading-relaxed">
            "La calidad de los ingredientes se nota en cada bocado. Sotelo Gourmet no solo vende postres, vende experiencias celestiales que alegran el alma y elevan cualquier celebración."
          </blockquote>
          
          <div className="space-y-1">
            <p className="font-bold text-[#775a19] tracking-wider">VALENTINA RIVAROLA</p>
            <p className="text-sm text-[#4e4639] uppercase tracking-widest">Crítica Gastronómica & Cliente Fiel</p>
          </div>

          {/* Little Stars */}
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#c5a059] text-[#c5a059]" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

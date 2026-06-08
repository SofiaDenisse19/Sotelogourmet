import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ArrowLeft, ArchiveX } from 'lucide-react';
export default function FavoritesPage({ products = [], toggleFavorite, favorites, addToCart }) {
  // Get all favorited products
  const favoriteProducts = products.filter(product => favorites.includes(product.id));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-[60vh]">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 select-none">
        <Link to="/" className="hover:text-[#775a19] transition-colors">Inicio</Link>
        <span>&rsaquo;</span>
        <span className="text-[#775a19] font-semibold">Mis Favoritos</span>
      </nav>

      {/* HEADER SECTION */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-3xl sm:text-4xl font-serif text-[#1c1c19] font-bold">Tus Favoritos</h1>
        <div className="h-1 w-16 bg-[#775a19] my-4 rounded" />
        <p className="text-sm text-[#4e4639] leading-relaxed">
          Una selección de tus caprichos más deseados. Todo listo para que vuelvan a tu mesa con un solo clic.
        </p>
      </div>

      {/* FAVORITE PRODUCTS LIST */}
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map(product => {
            const hasDiscount = !!product.precio_oferta;

            return (
              <div 
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#e1d4fd]/10 hover-gold-grow flex flex-col justify-between"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 group">
                  <Link to={`/producto/${product.id}`}>
                    <img 
                      src={product.imagen_url} 
                      alt={product.nombre} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 cursor-pointer"
                    />
                  </Link>
                  {/* Remove from favorites */}
                  <button 
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-4 right-4 p-2.5 rounded-full shadow-md bg-white text-red-500 hover:bg-red-50 transition-colors"
                    title="Quitar de favoritos"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Content details */}
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
                    <div className="flex flex-col">
                      {hasDiscount ? (
                        <>
                          <span className="text-xs text-gray-400 line-through">S/ {product.precio.toFixed(2)}</span>
                          <span className="text-lg font-bold text-[#775a19]">S/ {product.precio_oferta.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-[#775a19]">S/ {product.precio.toFixed(2)}</span>
                      )}
                    </div>
                    
                    {product.personalizaciones.length > 0 ? (
                      <Link 
                        to={`/producto/${product.id}`}
                        className="px-4 py-2 bg-[#775a19] text-white rounded-xl text-xs font-bold hover:bg-[#5e4713] transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Personalizar
                      </Link>
                    ) : (
                      <button 
                        onClick={() => addToCart(product, 1, {})}
                        className="px-4 py-2 bg-[#775a19] text-white rounded-xl text-xs font-bold hover:bg-[#5e4713] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Añadir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* BLANK STATE FAVORITES */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#e1d4fd]/10 shadow-sm max-w-xl mx-auto my-10 px-6">
          <div className="w-20 h-20 bg-[#f8dac5]/30 rounded-full flex items-center justify-center text-[#775a19] mb-6 animate-pulse">
            <ArchiveX className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1c1c19] mb-2">Tu lista de favoritos está vacía</h2>
          <p className="text-sm text-[#4e4639] text-center max-w-sm leading-relaxed mb-8">
            Guarda tus delicias y pasteles preferidos haciendo clic en el corazón para tenerlos listos en cualquier ocasión.
          </p>
          <Link 
            to="/catalogo"
            className="px-6 py-3 bg-[#775a19] text-white font-semibold rounded-xl text-sm hover:bg-[#5e4713] transition-all flex items-center gap-2 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Explorar Catálogo
          </Link>
        </div>
      )}
    </div>
  );
}

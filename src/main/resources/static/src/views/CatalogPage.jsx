import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, Star, ShoppingBag, SlidersHorizontal, Check } from 'lucide-react';

export default function CatalogPage({ products = [], categories = [], toggleFavorite, favorites, addToCart }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse category query parameter from URL reactively
  const getCategoryFromUrl = () => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('category') || 'todo';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromUrl());
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync category filter when URL search parameter changes
  useEffect(() => {
    setSelectedCategory(getCategoryFromUrl());
  }, [location.search]);

  // Apply filters in real-time
  const filteredProducts = products.filter(product => {
    // 1. Search Query
    if (searchQuery && !product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Category
    if (selectedCategory !== 'todo' && product.categoria !== selectedCategory) {
      return false;
    }
    // 3. Min Price
    const price = product.precio_oferta || product.precio;
    if (priceMin && price < parseFloat(priceMin)) {
      return false;
    }
    // 4. Max Price
    if (priceMax && price > parseFloat(priceMax)) {
      return false;
    }
    // 5. Offers
    if (onlyOffers && !product.precio_oferta) {
      return false;
    }
    return true;
  });

  // Pagination logic (6 items per page)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceMin, priceMax, onlyOffers]);

  const handleCategoryFilter = (catName) => {
    if (catName === 'todo') {
      navigate('/catalogo');
    } else {
      navigate(`/catalogo?category=${catName}`);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
    setOnlyOffers(false);
    navigate('/catalogo');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MOBILE FILTER TOGGLE BUTTON */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow border border-gray-200 text-sm font-semibold text-[#1c1c19]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#775a19]" />
            {showMobileFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <span className="text-xs text-gray-500 font-semibold">{filteredProducts.length} productos</span>
        </div>

        {/* SIDEBAR FILTERS (Left Column) */}
        <aside className={`${
          showMobileFilters ? 'block' : 'hidden'
        } lg:block lg:col-span-3 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-[#e1d4fd]/10 h-fit`}>
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-[#1c1c19]">Filtros</h3>
            <button 
              onClick={clearFilters}
              className="text-xs text-[#775a19] hover:underline font-semibold"
            >
              Limpiar todo
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-[#494551] uppercase">Buscar</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdf9f4] text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20 focus:border-[#775a19]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-[#494551] uppercase">Categorías</label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => handleCategoryFilter('todo')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                  selectedCategory === 'todo'
                    ? 'bg-[#775a19] text-white'
                    : 'text-[#1d1b20] hover:bg-gray-50'
                }`}
              >
                <span>Todo</span>
                {selectedCategory === 'todo' && <Check className="w-4 h-4" />}
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.nombre)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    selectedCategory === cat.nombre
                      ? 'bg-[#775a19] text-white'
                      : 'text-[#1d1b20] hover:bg-gray-50'
                  }`}
                >
                  <span>{cat.display}</span>
                  {selectedCategory === cat.nombre && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-[#494551] uppercase">Rango de Precio (S/)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 bg-[#fdf9f4] text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input 
                type="number" 
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 bg-[#fdf9f4] text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
              />
            </div>
          </div>

          {/* Promotions Offer Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-[#494551] uppercase">Promociones</label>
            <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-[#1d1b20] py-1 select-none">
              <input 
                type="checkbox"
                checked={onlyOffers}
                onChange={(e) => setOnlyOffers(e.target.checked)}
                className="w-4.5 h-4.5 accent-[#775a19] rounded border-gray-300 focus:ring-[#775a19]"
              />
              <span>En Oferta</span>
            </label>
          </div>
        </aside>

        {/* PRODUCT GRID CANVAS (Right Column) */}
        <main className="lg:col-span-9 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-3xl font-serif text-[#1c1c19] font-bold">Nuestro Catálogo</h2>
              <p className="text-sm text-gray-500 mt-1">Descubre la maestría artesanal en cada detalle.</p>
            </div>
            <span className="hidden lg:inline text-sm text-gray-500 font-semibold mt-2 md:mt-0">
              Mostrando <strong className="text-[#775a19]">{filteredProducts.length}</strong> productos
            </span>
          </div>

          {/* Grid Layout */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map(product => {
                const isFav = favorites.includes(product.id);
                const hasDiscount = !!product.precio_oferta;
                const discountPercentage = hasDiscount 
                  ? Math.round(((product.precio - product.precio_oferta) / product.precio) * 100) 
                  : 0;

                return (
                  <div 
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#e1d4fd]/10 hover-gold-grow flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100 group">
                      <Link to={`/producto/${product.id}`}>
                        <img 
                          src={product.imagen_url} 
                          alt={product.nombre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 cursor-pointer"
                        />
                      </Link>
                      
                      {/* Badge Offer */}
                      {hasDiscount && (
                        <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest uppercase bg-[#775a19] text-white px-2 py-1 rounded">
                          -{discountPercentage}% HOY
                        </span>
                      )}

                      {/* Favorite Button */}
                      <button 
                        onClick={() => toggleFavorite(product.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors ${
                          isFav ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
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
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <span className="text-lg font-bold text-gray-500 mb-2">No se encontraron productos</span>
              <p className="text-sm text-gray-400 mb-6">Prueba cambiando los filtros de búsqueda o categoría.</p>
              <button 
                onClick={clearFilters}
                className="px-6 py-2.5 bg-[#775a19] text-white font-semibold rounded-xl text-sm hover:bg-[#5e4713] transition-colors"
              >
                Restaurar Catálogo
              </button>
            </div>
          )}

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 bg-white text-gray-600 rounded-xl shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                &larr;
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#775a19] text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 bg-white text-gray-600 rounded-xl shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                &rarr;
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

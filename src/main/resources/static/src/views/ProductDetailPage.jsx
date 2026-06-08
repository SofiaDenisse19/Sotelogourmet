import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Plus, Minus, MessageSquare, Shield } from 'lucide-react';
import { RESEÑAS } from '../data/mockData';

export default function ProductDetailPage({ products = [], toggleFavorite, favorites, addToCart }) {
  // Extract dynamic product ID from React Router parameters
  const { id } = useParams();
  const productId = parseInt(id);

  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-serif mb-4">Producto no encontrado</h2>
        <Link 
          to="/catalogo"
          className="px-6 py-2 bg-[#775a19] text-white rounded-xl"
        >
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(product.id);
  const [quantity, setQuantity] = useState(1);
  
  // Customization state
  const [selections, setSelections] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(product.precio_oferta || product.precio);

  // Initialize customizations
  useEffect(() => {
    const initialSelections = {};
    product.personalizaciones.forEach(custom => {
      if (custom.tipo === 'seleccion') {
        initialSelections[custom.nombre] = custom.opciones[0].valor;
      } else if (custom.tipo === 'texto') {
        initialSelections[custom.nombre] = '';
      }
    });
    setSelections(initialSelections);
    setQuantity(1);
  }, [productId]);

  // Recalculate price when selections change
  useEffect(() => {
    let extra = 0;
    product.personalizaciones.forEach(custom => {
      if (custom.tipo === 'seleccion' && selections[custom.nombre]) {
        const selectedOpt = custom.opciones.find(o => o.valor === selections[custom.nombre]);
        if (selectedOpt) {
          extra += selectedOpt.precio_extra;
        }
      }
    });
    const base = product.precio_oferta || product.precio;
    setCalculatedPrice(base + extra);
  }, [selections, productId]);

  const handleSelectionChange = (name, value) => {
    setSelections(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (val) => {
    setQuantity(prev => Math.max(1, prev + val));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selections);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selections);
  };

  // Get related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => p.categoria === product.categoria && p.id !== product.id)
    .slice(0, 2);

  // Fallback related products if none in the same category
  const finalRelated = relatedProducts.length > 0 
    ? relatedProducts 
    : products.filter(p => p.id !== product.id).slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 select-none">
        <Link to="/" className="hover:text-[#775a19] transition-colors">Inicio</Link>
        <span>&rsaquo;</span>
        <Link to={`/catalogo?category=${product.categoria}`} className="hover:text-[#775a19] transition-colors uppercase">
          {product.categoria}
        </Link>
        <span>&rsaquo;</span>
        <span className="text-[#1c1c19] font-semibold truncate max-w-[200px]">{product.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: Image & Reviews */}
        <div className="lg:col-span-6 space-y-12">
          {/* Main Product Image Container */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
            <img 
              src={product.imagen_url} 
              alt={product.nombre} 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => toggleFavorite(product.id)}
              className={`absolute top-6 right-6 p-3 rounded-full shadow-lg transition-colors ${
                isFav ? 'bg-red-50 text-red-500' : 'bg-white text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* REVIEWS SECTION */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif text-[#1d1b20] font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#775a19]" />
              Reseñas de Clientes
            </h3>
            
            <div className="space-y-6">
              {RESEÑAS.map(rev => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-[#e1d4fd]/10 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f8dac5] text-[#775a19] font-bold text-sm flex items-center justify-center">
                        {rev.iniciales}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1d1b20]">{rev.usuario}</h4>
                        <span className="text-xs text-gray-400">{rev.fecha}</span>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < rev.calificacion ? 'fill-[#c5a059] text-[#c5a059]' : 'text-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#494551] leading-relaxed italic">
                    {rev.comentario}
                  </p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => alert('Próximamente: Integración de la plataforma de opiniones completa.')}
              className="w-full py-3 bg-white text-[#775a19] border border-[#775a19]/30 rounded-xl text-sm font-semibold hover:bg-[#775a19]/5 transition-colors text-center"
            >
              Ver todas las reseñas
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Info & Customization Form */}
        <div className="lg:col-span-6 space-y-8">
          {/* Header Info */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#1d1b20] font-extrabold leading-tight">
              {product.nombre}
            </h1>
            
            <div className="flex items-center gap-2 select-none">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-[#c5a059] text-[#c5a059]' : 'text-gray-200'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#1d1b20]">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reseñas_count} reseñas)</span>
            </div>

            <div className="text-3xl font-extrabold text-[#775a19] pt-2">
              S/ {calculatedPrice.toFixed(2)}
            </div>
            
            <p className="text-sm text-[#494551] leading-relaxed">
              {product.descripcion}
            </p>
          </div>

          {/* DYNAMIC CUSTOMIZATION FORM */}
          {product.personalizaciones.length > 0 && (
            <div className="bg-[#f8f2fa] p-6 rounded-3xl space-y-6 border border-[#e1d4fd]/40">
              <h3 className="text-xs font-bold tracking-widest text-[#1d1b20] uppercase border-b border-gray-200/60 pb-2.5">
                Personaliza tu pedido
              </h3>

              {product.personalizaciones.map(custom => {
                if (custom.tipo === 'texto') {
                  return (
                    <div key={custom.id} className="space-y-2">
                      <label className="text-xs font-bold text-[#1d1b20] uppercase block">
                        {custom.nombre} {custom.requerido && <span className="text-red-500">*</span>}
                      </label>
                      <input 
                        type="text" 
                        value={selections[custom.nombre] || ''}
                        onChange={(e) => handleSelectionChange(custom.nombre, e.target.value)}
                        placeholder={custom.placeholder}
                        maxLength={60}
                        className="w-full px-4 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
                      />
                      <span className="text-[10px] text-gray-400 block text-right">
                        {(selections[custom.nombre] || '').length}/60 caracteres
                      </span>
                    </div>
                  );
                }

                if (custom.tipo === 'seleccion') {
                  return (
                    <div key={custom.id} className="space-y-2.5">
                      <label className="text-xs font-bold text-[#1d1b20] uppercase block">
                        {custom.nombre} {custom.requerido && <span className="text-red-500">*</span>}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {custom.opciones.map(opt => {
                          const isSelected = selections[custom.nombre] === opt.valor;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectionChange(custom.nombre, opt.valor)}
                              className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                                isSelected 
                                  ? 'border-[#775a19] bg-[#775a19]/5 shadow-sm' 
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <span className={`font-bold ${isSelected ? 'text-[#775a19]' : 'text-[#1c1c19]'}`}>
                                {opt.valor}
                              </span>
                              {opt.precio_extra > 0 && (
                                <span className="text-[10px] font-bold text-[#775a19] mt-1">
                                  + S/ {opt.precio_extra.toFixed(2)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          {/* QUANTITY SELECTOR & BUY BUTTONS */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#1c1c19] uppercase">Cantidad</span>
              
              <div className="flex items-center border border-gray-200 rounded-xl bg-[#fdf9f4]">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3 text-gray-500 hover:text-[#775a19] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 font-bold text-[#1c1c19] select-none text-sm">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="p-3 text-gray-500 hover:text-[#775a19] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button 
                onClick={handleAddToCart}
                className="w-full py-4 bg-white text-[#775a19] border-2 border-[#775a19] hover:bg-[#775a19]/5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                Añadir al Carrito
              </button>
              <button 
                onClick={handleBuyNow}
                className="w-full py-4 bg-[#775a19] text-white hover:bg-[#5e4713] font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#775a19]/15 cursor-pointer"
              >
                Comprar Ahora
              </button>
            </div>
          </div>

          {/* SAFE CHECKOUT BADGE */}
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100">
            <Shield className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 leading-snug">
              Compra 100% segura. Despachamos con empaques sellados sanitizados y refrigerados.
            </span>
          </div>

          {/* RELATED PRODUCTS */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#1d1b20]">Te podría interesar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {finalRelated.map(item => (
                <Link 
                  key={item.id}
                  to={`/producto/${item.id}`}
                  className="bg-white p-3 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer flex gap-3 items-center hover:shadow-sm transition-all text-left"
                >
                  <img 
                    src={item.imagen_url} 
                    alt={item.nombre} 
                    className="w-16 h-16 object-cover rounded-lg shrink-0"
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-[#1d1b20] truncate">{item.nombre}</h4>
                    <span className="text-xs text-[#775a19] font-bold block mt-0.5">
                      S/ {item.precio.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5 select-none">
                      <Star className="w-3 h-3 fill-[#c5a059] text-[#c5a059]" />
                      <span className="text-[10px] text-gray-500 font-semibold">{item.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

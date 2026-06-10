import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  MapPin, 
  Store, 
  Calendar, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  Loader2,
  FileText
} from 'lucide-react';

export default function CheckoutPage({ 
  cart = [], 
  updateCartQty, 
  removeCartItem, 
  cartSubtotal = 0, 
  shippingCost = 0, 
  cartTotal = 0, 
  clearCart,
  user,
  addToCart,
  products = []
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial step based on router state or query param
  const getInitialStep = () => {
    if (location.state?.step) return location.state.step;
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    return stepParam ? parseInt(stepParam, 10) : 1;
  };

  const [step, setStep] = useState(getInitialStep);

  // Sync step changes when navigating with different state/search
  useEffect(() => {
    if (location.state?.step) {
      setStep(location.state.step);
    } else {
      const params = new URLSearchParams(location.search);
      const stepParam = params.get('step');
      if (stepParam) {
        setStep(parseInt(stepParam, 10));
      }
    }
  }, [location.search, location.state]);

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Fallback / Recommended products based on mockup
  const recommendedProducts = (products && products.length > 0)
    ? products.filter(p => [9, 10, 11].includes(Number(p.id))).slice(0, 3)
    : [
        {
          id: 9,
          nombre: 'Torta Ganache Royale',
          descripcion: 'Bizcocho de chocolate 70% cacao con capas de ganache suave, mousse de chocolate y perlas crujientes belgas.',
          precio: 120.00,
          imagen_url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
          personalizaciones: []
        },
        {
          id: 10,
          nombre: 'Macarons de Autor (x12)',
          descripcion: 'Colección de sabores estacionales hechos a mano: Lavanda, Pistacho y Frutos Rojos con harina de almendras fina.',
          precio: 45.00,
          imagen_url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop&q=80',
          personalizaciones: []
        },
        {
          id: 11,
          nombre: 'Cupcakes Red Velvet',
          descripcion: 'Pack de 6 unidades con bizcocho Red Velvet húmedo, frosting de queso crema premium y decoraciones de chocolate.',
          precio: 55.00,
          imagen_url: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=600&auto=format&fit=crop&q=80',
          personalizaciones: []
        }
      ];

  // Form states
  const [tipoEntrega, setTipoEntrega] = useState('domicilio'); // 'domicilio' | 'recojo'
  const [calle, setCalle] = useState('');
  const [distrito, setDistrito] = useState('Miraflores');
  const [referencia, setReferencia] = useState('');
  const [sedeRecojo, setSedeRecojo] = useState('Sede Vallejo');
  const [fechaEntrega, setFechaEntrega] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [horaEntrega, setHoraEntrega] = useState('09:00 - 11:00 AM');
  const [metodoPago, setMetodoPago] = useState('tarjeta'); // 'tarjeta' | 'yape'
  const [notas, setNotas] = useState('');

  // Tarjeta states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Yape states
  const [yapeCelular, setYapeCelular] = useState('');
  const [yapeCodigo, setYapeCodigo] = useState(['', '', '', '', '', '']);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && step > 1 && step < 5) {
      alert('Debes iniciar sesión para proceder con el pedido.');
      navigate('/login');
    }
  }, [user, step, navigate]);

  const handleYapeCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...yapeCodigo];
    newCode[index] = value.slice(-1);
    setYapeCodigo(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`yape-code-${index + 1}`).focus();
    }
  };

  const handleYapeCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !yapeCodigo[index] && index > 0) {
      document.getElementById(`yape-code-${index - 1}`).focus();
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    const itemsDto = cart.map(item => ({
      productoId: item.productId || item.productoId || item.id.split('-')[0],
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      selections: item.selections || {}
    }));

    const orderPayload = {
      calle: tipoEntrega === 'domicilio' ? calle : sedeRecojo,
      distrito: tipoEntrega === 'domicilio' ? distrito : 'Recojo en Tienda',
      ciudad: 'Lima',
      referencia: tipoEntrega === 'domicilio' ? referencia : `Fecha/Hora: ${fechaEntrega} ${horaEntrega}`,
      tipoEntrega,
      sedeRecojo: tipoEntrega === 'recojo' ? sedeRecojo : null,
      fechaEntrega,
      horaEntrega,
      metodoPago,
      notas: notas + (metodoPago === 'yape' ? ` [Cel: ${yapeCelular}, Cód: ${yapeCodigo.join('')}]` : ''),
      montoTotal: cartTotal,
      items: itemsDto
    };

    try {
      const response = await fetch('/api/pedidos/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo crear el pedido');
      }

      const orderData = await response.json();
      setPlacedOrder(orderData);
      clearCart();
      setStep(5); // Ir al paso de éxito
    } catch (err) {
      alert('Error al procesar el pedido: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cost calculation helpers
  const calculatedShipping = tipoEntrega === 'recojo' ? 0 : shippingCost;
  const calculatedTotal = cartSubtotal + calculatedShipping;

  if (cart.length === 0 && step < 5) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#1c1c19]">Tu carrito está vacío</h2>
        <p className="text-sm text-gray-500">Agrega deliciosos postres y bocaditos de nuestro catálogo para iniciar tu pedido.</p>
        <Link to="/catalogo" className="inline-block px-8 py-3.5 bg-[#775a19] text-white font-bold rounded-xl hover:bg-[#5e4713] transition-colors text-sm shadow-md">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 font-sans min-h-[80vh]">
      
      {/* Progress Steps Header */}
      {step < 5 && (
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between">
            
            {/* Step 1: Resumen */}
            <button 
              onClick={() => step > 1 && setStep(1)}
              className="flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 1 ? 'bg-[#775a19] text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                step >= 1 ? 'text-[#775a19]' : 'text-gray-400'
              }`}>Carrito</span>
            </button>
            
            <div className={`flex-1 h-0.5 mx-4 transition-colors ${step >= 2 ? 'bg-[#775a19]' : 'bg-gray-200'}`} />

            {/* Step 2: Envío */}
            <button 
              onClick={() => step > 2 && setStep(2)}
              className="flex flex-col items-center gap-1.5 focus:outline-none"
              disabled={step < 2}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 2 ? 'bg-[#775a19] text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                step >= 2 ? 'text-[#775a19]' : 'text-gray-400'
              }`}>Envío</span>
            </button>

            <div className={`flex-1 h-0.5 mx-4 transition-colors ${step >= 3 ? 'bg-[#775a19]' : 'bg-gray-200'}`} />

            {/* Step 3: Pago */}
            <button 
              onClick={() => step > 3 && setStep(3)}
              className="flex flex-col items-center gap-1.5 focus:outline-none"
              disabled={step < 3}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 3 ? 'bg-[#775a19] text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                step >= 3 ? 'text-[#775a19]' : 'text-gray-400'
              }`}>Pago</span>
            </button>

            <div className={`flex-1 h-0.5 mx-4 transition-colors ${step >= 4 ? 'bg-[#775a19]' : 'bg-gray-200'}`} />

            {/* Step 4: Revisión */}
            <button 
              className="flex flex-col items-center gap-1.5 focus:outline-none"
              disabled={step < 4}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= 4 ? 'bg-[#775a19] text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                4
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                step >= 4 ? 'text-[#775a19]' : 'text-gray-400'
              }`}>Revisión</span>
            </button>

          </div>
        </div>
      )}

      {/* STEP 1: RESUMEN CARRITO */}
      {step === 1 && (
        <div className="bg-gradient-to-b from-white to-[#fdf9f4] p-6 md:p-10 rounded-3xl border border-[#d1c5b4]/20 shadow-xs space-y-12 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-1">
                <h1 className="font-serif text-3xl font-bold text-[#1c1c19]">Tu Carrito</h1>
                <p className="text-sm text-[#4e4639]">Revisa tu selección artesanal antes de finalizar el pedido.</p>
              </div>
              
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-5 bg-[#f7f3ee] rounded-2xl border border-[#d1c5b4]/20 relative shadow-2xs">
                    
                    {/* Image Container with background fill */}
                    <div className="w-24 h-24 bg-[#f1ede8] rounded-xl overflow-hidden shrink-0 border border-gray-200/50 flex items-center justify-center">
                      <img 
                        src={item.imagen_url} 
                        alt={item.nombre} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-lg font-bold text-[#1c1c19]">{item.nombre}</h3>
                          <span className="text-[#775a19] font-serif font-bold text-lg">S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                        </div>
                        
                        {/* Customizations in uppercase layout style */}
                        {Object.keys(item.selections || {}).length > 0 && (
                          <div className="flex flex-col gap-0.5 text-[10px] text-[#7f7667] font-semibold tracking-wide uppercase pt-1">
                            {Object.entries(item.selections).map(([key, val]) => (
                              <p key={key}>{key.toUpperCase()}: {String(val).toUpperCase()}</p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 mt-2 border-t border-[#d1c5b4]/10">
                        {/* Quantity Selector with white background and dark text */}
                        <div className="flex items-center border border-[#d1c5b4] rounded-full bg-white px-2 py-0.5">
                          <button 
                            onClick={() => updateCartQty(item.id, -1)}
                            className="px-2.5 py-1 text-[#1c1c19] hover:text-[#775a19] font-bold text-sm"
                          >
                            -
                          </button>
                          <span className="px-3 font-bold text-sm text-[#1c1c19]">{item.cantidad}</span>
                          <button 
                            onClick={() => updateCartQty(item.id, 1)}
                            className="px-2.5 py-1 text-[#1c1c19] hover:text-[#775a19] font-bold text-sm"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button in corporate red */}
                        <button 
                          onClick={() => removeCartItem(item.id)}
                          className="text-[#ba1a1a] hover:text-[#9e1010] text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> QUITAR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Catering Note */}
              <div className="p-4 bg-[#775a19]/5 border border-[#775a19]/10 rounded-2xl flex gap-3 text-xs text-[#775a19] leading-relaxed">
                <div className="text-lg">ⓘ</div>
                <p>Los pedidos de catering requieren al menos 48 horas de anticipación. Tu entrega está programada para el próximo horario disponible.</p>
              </div>

              {/* Seguir Comprando Button */}
              <div className="pt-2">
                <Link 
                  to="/catalogo"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#775a19] hover:text-[#5e4713] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> SEGUIR COMPRANDO
                </Link>
              </div>
            </div>

            {/* Summary Sidebar Column */}
            <div className="bg-[#ebe8e3] p-6 rounded-2xl border border-[#d1c5b4]/30 shadow-xs h-fit space-y-6">
              <h3 className="font-serif text-lg font-bold text-[#1c1c19] border-b border-[#d1c5b4]/20 pb-3">Resumen de Pedido</h3>
              <div className="space-y-3 text-sm text-[#4e4639]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#1c1c19]">S/ {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de envío</span>
                  <span className="font-bold text-[#1c1c19]">
                    {shippingCost === 0 ? 'Gratis' : `S/ ${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">* Envío gratis para compras superiores a S/ 150.00</p>
                
                <div className="flex justify-between text-base font-bold text-[#1c1c19] border-t border-[#d1c5b4]/20 pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-[#775a19] text-xl">S/ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (!user) {
                    navigate('/login?redirect=/checkout');
                  } else {
                    setStep(2);
                  }
                }}
                className="w-full py-4 bg-[#775a19] hover:bg-[#5e4713] text-white font-bold rounded-xl transition-all text-center text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {!user ? (
                  'INICIA SESIÓN PARA CONTINUAR'
                ) : (
                  <>
                    CONTINUAR AL PEDIDO <ChevronRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>

              {/* Safe Checkout Footer Area */}
              <div className="space-y-3 pt-4 border-t border-[#d1c5b4]/20">
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#4e4639]/60 font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" /> PAGO 100% SEGURO
                </div>
                
                <div className="flex items-center justify-center gap-2 select-none">
                  <span className="text-[9px] font-black tracking-tighter bg-white text-blue-900 px-2 py-0.5 rounded border border-[#d1c5b4]/10 shadow-3xs">VISA</span>
                  <span className="text-[9px] font-black tracking-tighter bg-white text-red-500 px-2 py-0.5 rounded border border-[#d1c5b4]/10 shadow-3xs">MASTERCARD</span>
                  <span className="text-[9px] font-black tracking-tighter bg-white text-blue-500 px-2 py-0.5 rounded border border-[#d1c5b4]/10 shadow-3xs">AMEX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations / Bento Grid-ish Section */}
          <div className="mt-12 pt-8 border-t border-[#d1c5b4]/15 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#1c1c19]">Te podría encantar...</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedProducts.map(product => (
                <div key={product.id} className="bg-[#fdf7ff] rounded-2xl border border-[#e1d4fd]/20 overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between p-5 group">
                  <div className="space-y-4">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img 
                        src={product.imagen_url} 
                        alt={product.nombre} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-serif text-base font-bold text-[#1c1c19] line-clamp-1">{product.nombre}</h3>
                        <span className="text-[#775a19] font-serif font-bold text-base shrink-0">S/ {(product.precio_oferta || product.precio).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.descripcion}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      addToCart(product, 1, {});
                    }}
                    className="mt-4 w-full py-2.5 bg-[#775a19] hover:bg-[#5e4713] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
                  >
                    <ShoppingBag className="w-4 h-4" /> AÑADIR AL CARRITO
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: METODO DE ENTREGA */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#775a19]">Método de Entrega</h2>
            
            {/* Delivery choice buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTipoEntrega('domicilio')}
                className={`p-6 rounded-2xl border-2 text-left space-y-2 cursor-pointer transition-all ${
                  tipoEntrega === 'domicilio' 
                    ? 'border-[#775a19] bg-[#775a19]/5' 
                    : 'border-[#d1c5b4]/30 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <MapPin className="w-6 h-6 text-[#775a19]" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tipoEntrega === 'domicilio' ? 'border-[#775a19]' : 'border-gray-300'
                  }`}>
                    {tipoEntrega === 'domicilio' && <div className="w-2 h-2 rounded-full bg-[#775a19]" />}
                  </div>
                </div>
                <h4 className="font-serif font-bold text-[#1c1c19]">Entrega a domicilio</h4>
                <p className="text-xs text-gray-500">Llegamos a tu puerta con cajas térmicas especializadas.</p>
              </button>

              <button
                type="button"
                onClick={() => setTipoEntrega('recojo')}
                className={`p-6 rounded-2xl border-2 text-left space-y-2 cursor-pointer transition-all ${
                  tipoEntrega === 'recojo' 
                    ? 'border-[#775a19] bg-[#775a19]/5' 
                    : 'border-[#d1c5b4]/30 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <Store className="w-6 h-6 text-[#775a19]" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tipoEntrega === 'recojo' ? 'border-[#775a19]' : 'border-gray-300'
                  }`}>
                    {tipoEntrega === 'recojo' && <div className="w-2 h-2 rounded-full bg-[#775a19]" />}
                  </div>
                </div>
                <h4 className="font-serif font-bold text-[#1c1c19]">Recojo en tienda</h4>
                <p className="text-xs text-gray-500">Recoge sin costo de envío en nuestras sedes de Lima.</p>
              </button>
            </div>

            {/* Domicilio Form */}
            {tipoEntrega === 'domicilio' ? (
              <div className="bg-[#f7f3ee] p-6 rounded-2xl border border-[#d1c5b4]/20 space-y-4 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-[#775a19]">Detalles del Despacho</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Calle / Avenida / Nro</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Calle Las Flores 123, Dpto 402"
                      value={calle}
                      onChange={e => setCalle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-[#d1c5b4]/40 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Distrito</label>
                    <select 
                      value={distrito}
                      onChange={e => setDistrito(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-[#d1c5b4]/40 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                    >
                      {['Miraflores', 'San Isidro', 'Santiago de Surco', 'San Borja', 'La Molina', 'Barranco', 'San Miguel', 'Lince', 'Jesús María'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Referencia de entrega</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Frente al Parque Kennedy o a dos cuadras del óvalo"
                    value={referencia}
                    onChange={e => setReferencia(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-[#d1c5b4]/40 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                  />
                </div>
              </div>
            ) : (
              // Recojo Sede selector
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#775a19]">Selecciona la Sede de Recojo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'Sede Vallejo', name: 'Sede Vallejo', address: 'Av. César Vallejo, Villa El Salvador.', sched1: 'Lun - Sáb: 8:00 AM - 9:00 PM', sched2: 'Dom: 9:00 AM - 7:00 PM' },
                    { id: 'Sede El Sol', name: 'Sede El Sol', address: 'Avenida El Sol A-06, Villa El Salvador.', sched1: 'Lun - Sáb: 8:30 AM - 9:30 PM', sched2: 'Dom: 9:00 AM - 8:00 PM' },
                    { id: 'Sede Algarrobos', name: 'Sede Algarrobos', address: 'Av. Los Algarrobos, Villa El Salvador.', sched1: 'Lun - Vie: 7:30 AM - 8:30 PM', sched2: 'Sáb: 8:00 AM - 8:00 PM' },
                    { id: 'Sede Cocharcas', name: 'Sede Cocharcas', address: 'Av. Cocharcas, Villa El Salvador.', sched1: 'Lun - Dom: 8:00 AM - 9:00 PM', sched2: '' }
                  ].map(sede => (
                    <button
                      key={sede.id}
                      type="button"
                      onClick={() => setSedeRecojo(sede.id)}
                      className={`p-5 rounded-2xl border-2 text-left space-y-2 cursor-pointer transition-all ${
                        sedeRecojo === sede.id 
                          ? 'border-[#775a19] bg-[#775a19]/5' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-serif font-bold text-[#1c1c19] text-base">{sede.name}</h4>
                      <p className="text-xs text-gray-500">{sede.address}</p>
                      <div className="text-[10px] text-[#7f7667] font-semibold pt-1 border-t border-[#d1c5b4]/20">
                        <p>{sede.sched1}</p>
                        {sede.sched2 && <p>{sede.sched2}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date and Time slots */}
            <div className="bg-[#fdfdfd] p-6 rounded-2xl border border-gray-150 space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#775a19]">Fecha y Hora Programada</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Fecha de Despacho</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      required
                      value={fechaEntrega}
                      onChange={e => setFechaEntrega(e.target.value)}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // al menos mañana
                      className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25 pl-10"
                    />
                    <Calendar className="w-4 h-4 text-[#775a19] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Horario Estimado</label>
                  <div className="relative">
                    <select
                      value={horaEntrega}
                      onChange={e => setHoraEntrega(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25 pl-10"
                    >
                      {tipoEntrega === 'domicilio' ? (
                        <>
                          <option value="09:00 - 11:00 AM">09:00 - 11:00 AM (Gourmet Mañana)</option>
                          <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Gourmet Mediodía)</option>
                          <option value="03:00 - 06:00 PM">03:00 - 06:00 PM (Gourmet Tarde)</option>
                        </>
                      ) : (
                        <>
                          <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM (Mañana)</option>
                          <option value="04:00 - 07:00 PM">04:00 - 07:00 PM (Tarde)</option>
                          <option value="07:00 - 08:30 PM">07:00 - 08:30 PM (Noche)</option>
                        </>
                      )}
                    </select>
                    <Clock className="w-4 h-4 text-[#775a19] absolute left-3.5 top-3.5" />
                  </div>
                </div>

              </div>
            </div>

            {/* Note input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Instrucciones o Notas Especiales (Opcional)</label>
              <textarea 
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Ej. Escribir 'Feliz Cumpleaños' en tarjeta, departamento, etc."
                rows={2}
                className="w-full px-4 py-3 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-xs font-bold uppercase text-[#4e4639] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Regresar al carrito
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  if (tipoEntrega === 'domicilio' && !calle) {
                    alert('Por favor, ingresa tu calle de envío.');
                    return;
                  }
                  setStep(3);
                }}
                className="px-8 py-3.5 bg-[#775a19] text-white font-bold rounded-xl hover:bg-[#5e4713] transition-colors text-sm shadow-md cursor-pointer"
              >
                Continuar al Pago
              </button>
            </div>
          </div>

          {/* Cart Sidebar Summary */}
          <div className="space-y-6">
            <div className="bg-[#ebe8e3] p-6 rounded-2xl border border-[#d1c5b4]/30 space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#775a19] uppercase tracking-wider">Envío Programado</h3>
              <div className="space-y-3 text-sm text-[#4e4639]">
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                  <p className="text-xs">
                    {tipoEntrega === 'domicilio' 
                      ? `${calle ? calle : 'Dirección por ingresar'}, ${distrito}` 
                      : `${sedeRecojo} (Recojo en Tienda)`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Calendar className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                  <p className="text-xs">Entrega: {fechaEntrega} ({horaEntrega})</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#1c1c19] uppercase tracking-wider border-b pb-2">Resumen</h3>
              <div className="space-y-2 text-xs text-gray-500">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.nombre} x {item.cantidad}</span>
                    <span className="font-bold text-gray-700">S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>S/ {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Envío</span>
                  <span>{calculatedShipping === 0 ? 'Gratis' : `S/ ${calculatedShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1c1c19] text-base border-t pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-[#775a19]">S/ {calculatedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: METODO DE PAGO */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#775a19]">Método de Pago</h2>
            
            {/* Payment options selectors */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMetodoPago('tarjeta')}
                className={`p-5 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  metodoPago === 'tarjeta' 
                    ? 'border-[#775a19] bg-[#775a19]/5' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-8 h-8 text-[#775a19]" />
                <span className="text-sm font-bold text-[#1c1c19]">Pago con Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago('yape')}
                className={`p-5 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  metodoPago === 'yape' 
                    ? 'border-[#775a19] bg-[#775a19]/5' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-8 h-8 text-[#775a19]" />
                <span className="text-sm font-bold text-[#1c1c19]">Pago con Yape</span>
              </button>
            </div>

            {/* Payment Fields */}
            {metodoPago === 'tarjeta' ? (
              <div className="bg-[#f7f3ee] p-6 rounded-2xl border border-[#d1c5b4]/20 space-y-4 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-[#775a19]">Datos de la Tarjeta</h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Nombre del Titular</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Juan Pérez Huamán"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Número de Tarjeta</label>
                  <input 
                    type="text" 
                    required
                    maxLength={19}
                    placeholder="1234 5678 1234 5678"
                    value={cardNumber}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setCardNumber(formatted);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Fecha de Vencimiento</label>
                    <input 
                      type="text" 
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) {
                          val = val.slice(0,2) + '/' + val.slice(2,4);
                        }
                        setCardExpiry(val);
                      }}
                      className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25 text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Código CVV</label>
                    <input 
                      type="password" 
                      required
                      maxLength={3}
                      placeholder="123"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25 text-center"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Yape Forms
              <div className="bg-[#f7f3ee] p-6 rounded-2xl border border-[#d1c5b4]/20 space-y-6 shadow-2xs">
                
                {/* QR instructions */}
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  {/* Styled mock QR code box */}
                  <div className="w-36 h-36 bg-white p-3 rounded-2xl border border-[#d1c5b4]/30 shadow-sm flex flex-col justify-between items-center select-none shrink-0">
                    <div className="text-[10px] font-bold text-[#775a19] uppercase tracking-wider">Yape QR</div>
                    {/* Simulated QR boxes */}
                    <div className="w-24 h-24 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SoteloGourmetPayment')] bg-cover border" />
                    <div className="text-[8px] font-black text-purple-700">SOTELO GOURMET S.A.C</div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-serif text-lg font-bold text-[#775a19]">Código de aprobación</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Escanea el código QR de arriba o yapea directamente desde tu app al celular de la pastelería. Luego, copia y pega el código de aprobación de 6 dígitos que figura en tu aplicación de Yape.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-[#d1c5b4]/20 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Ingresa tu celular Yape</label>
                    <input 
                      type="text" 
                      required
                      maxLength={9}
                      placeholder="999 999 999"
                      value={yapeCelular}
                      onChange={e => setYapeCelular(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Código de Aprobación Yape (6 dígitos)</label>
                    <div className="flex justify-between gap-2 max-w-sm">
                      {yapeCodigo.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`yape-code-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleYapeCodeChange(idx, e.target.value)}
                          onKeyDown={e => handleYapeCodeKeyDown(idx, e)}
                          className="w-10 h-12 border border-gray-300 rounded-xl bg-white text-center font-bold text-lg text-[#1c1c19] focus:outline-none focus:border-[#775a19] focus:ring-2 focus:ring-[#775a19]/20"
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-xs font-bold uppercase text-[#4e4639] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Regresar al envío
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  if (metodoPago === 'tarjeta') {
                    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
                      alert('Por favor, ingresa los datos completos de tu tarjeta.');
                      return;
                    }
                  } else {
                    if (!yapeCelular || yapeCodigo.some(c => !c)) {
                      alert('Por favor, ingresa tu número y código de aprobación de Yape.');
                      return;
                    }
                  }
                  setStep(4);
                }}
                className="px-8 py-3.5 bg-[#775a19] text-white font-bold rounded-xl hover:bg-[#5e4713] transition-colors text-sm shadow-md cursor-pointer"
              >
                Continuar a Revisión
              </button>
            </div>
          </div>

          {/* Cart Sidebar Summary */}
          <div className="space-y-6">
            <div className="bg-[#ebe8e3] p-6 rounded-2xl border border-[#d1c5b4]/30 space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#775a19] uppercase tracking-wider">Detalle de Pago</h3>
              <div className="space-y-2 text-xs text-[#4e4639]">
                <div className="flex justify-between">
                  <span>Método de Pago:</span>
                  <span className="font-bold uppercase">{metodoPago}</span>
                </div>
                <div className="flex justify-between">
                  <span>Despacho:</span>
                  <span className="font-bold uppercase">{tipoEntrega}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#1c1c19] uppercase tracking-wider border-b pb-2">Resumen</h3>
              <div className="space-y-2 text-xs text-gray-500">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.nombre} x {item.cantidad}</span>
                    <span className="font-bold text-gray-700">S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>S/ {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Envío</span>
                  <span>{calculatedShipping === 0 ? 'Gratis' : `S/ ${calculatedShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1c1c19] text-base border-t pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-[#775a19]">S/ {calculatedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVISION DEL PEDIDO */}
      {step === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#775a19]">Revisión del Pedido</h2>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detalles del Despacho</h4>
                  <p className="text-sm font-bold text-[#1c1c19]">{tipoEntrega === 'domicilio' ? 'Entrega a Domicilio' : 'Recojo en Sede'}</p>
                  <p className="text-xs text-gray-600">
                    {tipoEntrega === 'domicilio' 
                      ? `${calle}, ${distrito} (Ref: ${referencia})` 
                      : `${sedeRecojo} (Villa El Salvador)`}
                  </p>
                  <p className="text-xs text-gray-600 font-semibold pt-1">
                    Entrega programada: {fechaEntrega} en el horario {horaEntrega}.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Método de Pago</h4>
                  <p className="text-sm font-bold text-[#1c1c19] uppercase">{metodoPago}</p>
                  {metodoPago === 'tarjeta' ? (
                    <p className="text-xs text-gray-600">Tarjeta Visa/Mastercard finalizada en **{cardNumber.slice(-4)}</p>
                  ) : (
                    <p className="text-xs text-gray-600">Yape Celular: {yapeCelular}</p>
                  )}
                </div>
              </div>

              {/* Items Summary list */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Artículos en tu pedido</h4>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img 
                        src={item.imagen_url} 
                        alt={item.nombre} 
                        className="w-12 h-12 object-cover rounded-lg shrink-0 border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1c1c19] truncate">{item.nombre} x {item.cantidad}</p>
                        {Object.keys(item.selections || {}).length > 0 && (
                          <p className="text-[10px] text-gray-400 truncate">
                            {Object.entries(item.selections).map(([k,v]) => `${k}: ${v}`).join(' | ')}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#775a19]">S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security SSL badge */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold py-2">
              <Lock className="w-3.5 h-3.5" /> PAGO 100% SEGURO CIFRADO POR SSL
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button 
                type="button" 
                onClick={() => setStep(3)}
                className="flex items-center gap-2 text-xs font-bold uppercase text-[#4e4639] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Regresar al pago
              </button>
              
              <button 
                type="button" 
                disabled={loading}
                onClick={handlePlaceOrder}
                className="px-10 py-4 bg-[#775a19] hover:bg-[#5e4713] text-white font-bold rounded-xl transition-all text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                  </>
                ) : (
                  `Confirmar y Pagar S/ ${calculatedTotal.toFixed(2)}`
                )}
              </button>
            </div>
          </div>

          {/* Cart Sidebar Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#1c1c19] uppercase tracking-wider border-b pb-2">Resumen de Cuenta</h3>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>S/ {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Envío</span>
                  <span>{calculatedShipping === 0 ? 'Gratis' : `S/ ${calculatedShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1c1c19] text-base border-t pt-2 mt-1">
                  <span>Total a Pagar</span>
                  <span className="text-[#775a19]">S/ {calculatedTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PANTALLA DE CONFIRMACION EXITOSA */}
      {step === 5 && placedOrder && (
        <div className="max-w-xl mx-auto text-center space-y-8 animate-fade-in py-8">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100/50 flex items-center justify-center mx-auto text-4xl shadow-xs">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-3">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#775a19]">¡Gracias por tu pedido artesanal!</h1>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Estamos preparando tus dulces con todo nuestro amor en nuestro obrador tradicional.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="inline-block bg-[#f7f3ee] border border-[#d1c5b4]/20 px-6 py-3.5 rounded-full text-xs font-semibold text-[#705a49] tracking-wider uppercase">
            NÚMERO DE PEDIDO: {placedOrder.codigo}
          </div>

          {/* Delivery Recap Details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 text-left space-y-4 max-w-md mx-auto shadow-2xs">
            <h3 className="font-serif text-[#775a19] font-bold border-b pb-2 text-sm">Detalles de la Entrega</h3>
            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1c1c19]">{tipoEntrega === 'domicilio' ? 'Envío a Domicilio' : 'Recojo en Tienda'}</p>
                  <p>{tipoEntrega === 'domicilio' ? `${calle}, ${distrito}` : `${sedeRecojo}`}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Calendar className="w-4 h-4 text-[#775a19] shrink-0" />
                <p>Fecha programada: {fechaEntrega} ({horaEntrega})</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto pt-4">
            <button 
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full sm:w-1/2 py-3.5 bg-[#775a19] text-white font-bold rounded-xl hover:bg-[#5e4713] transition-colors text-sm shadow-md cursor-pointer"
            >
              Seguir Comprando
            </button>
            
            <button 
              onClick={() => {
                navigate('/pedidos');
              }}
              className="w-full sm:w-1/2 py-3.5 border border-[#775a19] text-[#775a19] font-bold bg-white rounded-xl hover:bg-[#775a19]/5 transition-colors text-sm shadow-sm cursor-pointer"
            >
              Ver Mis Pedidos
            </button>
          </div>

          <p className="text-[11px] text-[#4e46395c] font-semibold italic">
            Recibirás un correo electrónico con el seguimiento detallado en unos minutos.
          </p>
        </div>
      )}

    </div>
  );
}

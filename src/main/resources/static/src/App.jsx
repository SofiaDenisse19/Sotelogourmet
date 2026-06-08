import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, X, Trash2, Menu, MapPin, Clock } from 'lucide-react';

// Import views
import LandingPage from './views/LandingPage';
import CatalogPage from './views/CatalogPage';
import ProductDetailPage from './views/ProductDetailPage';
import FavoritesPage from './views/FavoritesPage';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import AdminLayout from './views/AdminLayout';
import AdminDashboardPage from './views/AdminDashboardPage';
import AdminOrdersPage from './views/AdminOrdersPage';

function SectionPlaceholder({ name }) {
  return (
    <div className="bg-white p-12 rounded-3xl border border-[#e8dac5]/40 shadow-xs text-center max-w-lg mx-auto my-16 space-y-5 animate-scale-up">
      <div className="w-16 h-16 bg-[#775a19]/5 text-[#775a19] rounded-full flex items-center justify-center mx-auto text-3xl">🚧</div>
      <h3 className="font-serif font-black text-xl text-gray-800">Sección en Desarrollo</h3>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{name}</p>
      <p className="text-sm text-gray-500 leading-relaxed font-semibold">
        Esta interfaz está siendo adaptada conforme a los requerimientos de Sotelo Gourmet. Estará disponible en la próxima versión del sistema.
      </p>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Database State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication State
  const [user, setUser] = useState(null);

  // Fetch Session on startup
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error al obtener sesión activa:', err);
      }
    };
    fetchSession();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        navigate('/');
      } else {
        alert('Error al cerrar sesión en el servidor');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al cerrar sesión');
    }
  };

  // Fetch Data from Supabase API
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/productos'),
          fetch('/api/categorias')
        ]);
        if (!prodRes.ok) throw new Error('Error al cargar productos');
        if (!catRes.ok) throw new Error('Error al cargar categorías');
        
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        
        if (active) {
          setProducts(prodData);
          // Convert database categories to display format
          const mappedCats = catData.map(c => ({
            id: c.id,
            nombre: c.nombre,
            display: c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1)
          }));
          setCategories(mappedCats);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { active = false; };
  }, []);

  // E-commerce state
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('sotelogourmet_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('sotelogourmet_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('tarjeta');
  const [checkoutAddress, setCheckoutAddress] = useState('Av. Larco 456, Miraflores');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [showMobileNav, setShowMobileNav] = useState(false);
  // Persistence
  useEffect(() => {
    localStorage.setItem('sotelogourmet_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('sotelogourmet_cart', JSON.stringify(cart));
  }, [cart]);

  // Add/Remove favorite
  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Add item to cart
  const addToCart = (product, qty, selections) => {
    const cartItemId = `${product.id}-${JSON.stringify(selections)}`;
    
    // Calculate final unit price
    let extraPrice = 0;
    product.personalizaciones.forEach(custom => {
      if (custom.tipo === 'seleccion' && selections[custom.nombre]) {
        const opt = custom.opciones.find(o => o.valor === selections[custom.nombre]);
        if (opt) extraPrice += opt.precio_extra;
      }
    });
    
    const unitPrice = (product.precio_oferta || product.precio) + extraPrice;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.id === cartItemId ? { ...item, cantidad: item.cantidad + qty } : item
        );
      }
      return [...prev, {
        id: cartItemId,
        productId: product.id,
        nombre: product.nombre,
        imagen_url: product.imagen_url,
        precioBase: product.precio_oferta || product.precio,
        precioUnitario: unitPrice,
        cantidad: qty,
        selections: selections
      }];
    });

    setIsCartOpen(true);
  };

  const updateCartQty = (id, change) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.cantidad + change);
          return { ...item, cantidad: newQty };
        }
        return item;
      })
    );
  };

  const removeCartItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Cart total calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
  const shippingCost = cartSubtotal > 150 ? 0 : (cartSubtotal > 0 ? 10 : 0);
  const cartTotal = cartSubtotal + shippingCost;

  // Simulate final checkout order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setShowCheckoutModal(false);
    setCart([]);
    alert(`¡Gracias por tu compra! Tu pedido en Sotelo Gourmet ha sido recibido y está en preparación (Pago: ${checkoutPaymentMethod.toUpperCase()}).`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7] text-[#775a19]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#775a19]/20 border-t-[#775a19] rounded-full animate-spin"></div>
          <p className="font-serif text-lg font-bold">Cargando delicias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf7] text-[#1c1c19] px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">⚠️</div>
          <h2 className="text-xl font-serif font-bold text-red-600">Error de Conexión</h2>
          <p className="text-sm text-gray-500">{error}. Verifica que la base de datos de Supabase esté activa y el servidor ejecutándose.</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-[#775a19] hover:bg-[#5e4713] text-white font-bold rounded-xl transition-all shadow-md">Reintentar</button>
        </div>
      </div>
    );
  }

  if (location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-[#fdfaf7]">
        <Routes>
          <Route path="/admin/*" element={
            user && user.rol === 'admin' ? (
              <AdminLayout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="pedidos" element={<AdminOrdersPage />} />
                  <Route path="inventario" element={<SectionPlaceholder name="Gestión de Inventario" />} />
                  <Route path="clientes" element={<SectionPlaceholder name="Gestión de Clientes" />} />
                  <Route path="promociones" element={<SectionPlaceholder name="Gestión de Promociones" />} />
                  <Route path="ajustes" element={<SectionPlaceholder name="Ajustes del Sistema" />} />
                  <Route path="*" element={<AdminDashboardPage />} />
                </Routes>
              </AdminLayout>
            ) : (
              <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf7]">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100 text-center space-y-4 animate-scale-up">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">🚫</div>
                  <h2 className="text-xl font-serif font-bold text-red-600">Acceso Denegado</h2>
                  <p className="text-sm text-gray-500">Esta zona es de uso exclusivo para el personal de administración de Sotelo Gourmet.</p>
                  <button onClick={() => navigate('/')} className="w-full py-3 bg-[#775a19] hover:bg-[#5e4713] text-white font-bold rounded-xl transition-all shadow-md">Volver al Inicio</button>
                </div>
              </div>
            )
          } />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fdfaf7] text-[#1c1c19]">
      
      {/* HEADER - TOPNAVBAR */}
      <header className="sticky top-0 z-40 w-full glass-nav border-b border-[#e1d4fd]/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="font-serif text-2xl font-black text-[#775a19] tracking-tight hover:opacity-90">
              Sotelo Gourmet
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#494551] uppercase tracking-wider">
            <Link 
              to="/"
              className={`hover:text-[#775a19] transition-colors ${location.pathname === '/' ? 'text-[#775a19]' : ''}`}
            >
              Inicio
            </Link>
            <Link 
              to="/catalogo"
              className={`hover:text-[#775a19] transition-colors ${location.pathname === '/catalogo' && !location.search.includes('category=bocaditos') ? 'text-[#775a19]' : ''}`}
            >
              Catálogo
            </Link>
            <Link 
              to="/catalogo?category=bocaditos"
              className={`hover:text-[#775a19] transition-colors ${location.search.includes('category=bocaditos') ? 'text-[#775a19]' : ''}`}
            >
              Salados
            </Link>
            <button 
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-[#775a19] transition-colors uppercase"
            >
              Nosotros
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            
            {/* Iniciar Sesión / Cuenta Icon (replaces Search) */}
            {user ? (
              <div className="relative group">
                <button 
                  className="p-2 text-[#494551] hover:text-[#775a19] hover:bg-[#775a19]/5 rounded-xl transition-all flex items-center cursor-pointer select-none"
                  title="Mi Cuenta"
                >
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-250 z-50 py-1">
                  <div className="px-4 py-2 text-[10px] border-b border-gray-50 text-gray-400 font-bold uppercase tracking-wider">
                    {user.rol}
                  </div>
                  <div className="px-4 py-1.5 text-xs text-gray-600 truncate">
                    {user.email}
                  </div>
                  {user.rol === 'admin' && (
                    <Link 
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-xs text-[#775a19] hover:bg-[#775a19]/5 transition-colors font-bold border-t border-gray-50 cursor-pointer"
                    >
                      PANEL DE CONTROL
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-bold border-t border-gray-50 cursor-pointer"
                  >
                    CERRAR SESIÓN
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login"
                className="p-2 text-[#494551] hover:text-[#775a19] hover:bg-[#775a19]/5 rounded-xl transition-all"
                title="Iniciar Sesión / Registrarse"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Favorites Icon & Badge */}
            <Link 
              to="/favoritos"
              className="p-2 text-[#494551] hover:text-[#775a19] hover:bg-[#775a19]/5 rounded-xl transition-all relative"
              title="Mis Favoritos"
            >
              <Heart className={`w-5 h-5 ${location.pathname === '/favoritos' ? 'text-red-500 fill-red-500' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart Icon & Badge */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#494551] hover:text-[#775a19] hover:bg-[#775a19]/5 rounded-xl transition-all relative"
              title="Ver Carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#775a19] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cart.reduce((sum, item) => sum + item.cantidad, 0)}
                </span>
              )}
            </button>

            {/* User welcome message */}
            {user && (
              <span className="hidden sm:inline-block text-sm font-semibold text-[#494551] select-none ml-1">
                Hola, {user.nombre.split(' ')[0]}
              </span>
            )}

            {/* Mobile Nav Toggle */}
            <button 
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="md:hidden p-2 text-[#494551] hover:text-[#775a19] rounded-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {showMobileNav && (
          <div className="md:hidden bg-white border-b border-gray-100 py-4 px-6 flex flex-col gap-4 text-sm font-semibold uppercase tracking-wider text-[#494551]">
            <Link to="/" onClick={() => setShowMobileNav(false)} className="text-left py-2 border-b border-gray-50 hover:text-[#775a19]">Inicio</Link>
            <Link to="/catalogo" onClick={() => setShowMobileNav(false)} className="text-left py-2 border-b border-gray-50 hover:text-[#775a19]">Catálogo</Link>
            <Link to="/catalogo?category=bocaditos" onClick={() => setShowMobileNav(false)} className="text-left py-2 border-b border-gray-50 hover:text-[#775a19]">Salados</Link>
            {user && user.rol === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                onClick={() => setShowMobileNav(false)} 
                className="text-left py-2 border-b border-gray-50 text-[#775a19] hover:text-[#5e4713]"
              >
                Panel Admin
              </Link>
            )}
            <button 
              onClick={() => {
                setShowMobileNav(false);
                navigate('/');
                setTimeout(() => {
                  document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} 
              className="text-left py-2 hover:text-[#775a19] uppercase"
            >
              Nosotros
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTENT VIEW CONTAINER */}
      <main className="flex-1 w-full bg-[#fdfaf7] animate-fade-in">
        <Routes>
          <Route path="/" element={
            <LandingPage 
              products={products}
              toggleFavorite={toggleFavorite} 
              favorites={favorites} 
              addToCart={addToCart}
            />
          } />
          <Route path="/catalogo" element={
            <CatalogPage 
              products={products}
              categories={categories}
              toggleFavorite={toggleFavorite} 
              favorites={favorites} 
              addToCart={addToCart}
            />
          } />
          <Route path="/producto/:id" element={
            <ProductDetailPage 
              products={products}
              toggleFavorite={toggleFavorite} 
              favorites={favorites} 
              addToCart={addToCart}
            />
          } />
          <Route path="/favoritos" element={
            <FavoritesPage 
              products={products}
              toggleFavorite={toggleFavorite} 
              favorites={favorites} 
              addToCart={addToCart}
            />
          } />
          <Route path="/login" element={
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
            />
          } />
          <Route path="/register" element={
            <RegisterPage 
              onRegisterSuccess={handleRegisterSuccess}
            />
          } />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#e6e0e9] text-[#1c1c19] py-16 px-4 md:px-8 mt-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-black text-[#775a19]">Sotelo Gourmet</h3>
            <p className="text-xs text-[#4e4639] leading-relaxed">
              Alta Pastelería Artesanal elaborada con los secretos del viejo mundo y la frescura de hoy. Diseñamos experiencias inolvidables para tu mesa.
            </p>
            <div className="flex gap-4 items-center pt-2">
              <a href="#" className="text-[#755e4d] hover:text-[#775a19]" title="Facebook">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href="#" className="text-[#755e4d] hover:text-[#775a19]" title="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Enlaces */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-[#775a19] uppercase">Enlaces</h4>
            <ul className="text-xs space-y-2 text-[#755e4d]">
              <li><a href="#" className="hover:text-[#775a19] transition-colors">Políticas de Privacidad</a></li>
              <li><a href="#" className="hover:text-[#775a19] transition-colors">Términos & Condiciones</a></li>
              <li><a href="#" className="hover:text-[#775a19] transition-colors">Zonas de Envío</a></li>
              <li><Link to="/catalogo" className="hover:text-[#775a19] text-left transition-colors">Catálogo de Productos</Link></li>
            </ul>
          </div>

          {/* Col 3: Horarios */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-[#775a19] uppercase">Horario de Atención</h4>
            <div className="text-xs text-[#755e4d] space-y-2">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#775a19]" />
                Lunes a Viernes: 9:00 am - 8:00 pm
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#775a19]" />
                Sábado a Domingo: 10:00 am - 6:00 pm
              </p>
            </div>
          </div>

          {/* Col 4: Contacto */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-[#775a19] uppercase">Ubicación</h4>
            <div className="text-xs text-[#755e4d] space-y-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#775a19]" />
                Miraflores, Lima - Perú
              </p>
              <p className="text-[11px] text-gray-500 pt-1">
                Realizamos entregas a todo Lima Metropolitana con choferes calificados y unidades refrigeradas.
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-300 text-center text-[10px] text-gray-500 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Sotelo Gourmet. Todos los derechos reservados.
        </div>
      </footer>

      {/* SHOPPING CART DRAWER (SLIDING PANEL) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#775a19]" />
                  <h3 className="font-serif font-bold text-lg text-[#1c1c19]">Tu Carrito</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <img 
                        src={item.imagen_url} 
                        alt={item.nombre} 
                        className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-200"
                      />
                      
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-sm text-[#1c1c19] line-clamp-1">{item.nombre}</h4>
                        
                        {/* Selected customization choices */}
                        {Object.keys(item.selections).length > 0 && (
                          <div className="text-[10px] text-gray-500 space-y-0.5 leading-snug">
                            {Object.entries(item.selections).map(([key, val]) => {
                              if (!val) return null;
                              return (
                                <p key={key}>
                                  <strong>{key}:</strong> {val}
                                </p>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-bold text-[#775a19]">
                            S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                          </span>
                          
                          {/* Qty Selector */}
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white scale-90">
                            <button 
                              onClick={() => updateCartQty(item.id, -1)}
                              className="px-2 py-1 text-gray-400 hover:text-[#775a19]"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold text-xs">{item.cantidad}</span>
                            <button 
                              onClick={() => updateCartQty(item.id, 1)}
                              className="px-2 py-1 text-gray-400 hover:text-[#775a19]"
                            >
                              +
                            </button>
                          </div>

                          {/* Delete button */}
                          <button 
                            onClick={() => removeCartItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Quitar artículo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-4">
                    <ShoppingBag className="w-12 h-12 text-gray-200" />
                    <p className="text-sm">Tu carrito de compras está vacío.</p>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/catalogo');
                      }}
                      className="px-5 py-2 bg-[#775a19] text-white text-xs font-semibold rounded-xl"
                    >
                      Ir a la Tienda
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom calculations & checkout CTA */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-[#fdf9f4] space-y-4">
                  <div className="space-y-2 text-sm text-[#494551]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#1c1c19]">S/ {cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span className="font-bold text-[#1c1c19]">
                        {shippingCost === 0 ? 'Gratis' : `S/ ${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    {shippingCost > 0 && (
                      <p className="text-[10px] text-gray-400">
                        * Envío gratis para compras superiores a S/ 150.00
                      </p>
                    )}
                    <div className="flex justify-between text-base font-bold text-[#1c1c19] border-t border-gray-200/60 pt-3">
                      <span>Total</span>
                      <span className="text-[#775a19] text-lg">S/ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setShowCheckoutModal(true);
                    }}
                    className="w-full py-4 bg-[#775a19] text-white font-bold rounded-xl hover:bg-[#5e4713] transition-all text-center block text-sm shadow-md"
                  >
                    Iniciar Pedido
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL (ORDER SETUP SIMULATION) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowCheckoutModal(false)} />
          
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-gray-100">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-serif font-bold text-lg text-[#1c1c19]">Detalle del Despacho</h3>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">Dirección de Envío</label>
                <input 
                  type="text" 
                  required
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'tarjeta', label: '💳 Tarjeta' },
                    { id: 'yape', label: '📱 Yape' },
                    { id: 'plin', label: '📱 Plin' },
                    { id: 'efectivo', label: '💵 Efectivo' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setCheckoutPaymentMethod(method.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                        checkoutPaymentMethod === method.id 
                          ? 'border-[#775a19] bg-[#775a19]/5 text-[#775a19]' 
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">Notas del Pedido (Opcional)</label>
                <textarea 
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Instrucciones para la entrega (ej: timbre malogrado, departamento, etc.)"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 text-sm text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
                />
              </div>

              {/* Calculations review */}
              <div className="bg-[#fdf9f4] p-4 rounded-2xl text-xs space-y-1 text-gray-500 border border-[#f8dac5]/30">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>S/ {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Costo de envío</span>
                  <span>{shippingCost === 0 ? 'Gratis' : `S/ ${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#1c1c19] pt-2 border-t border-gray-200/50 mt-1">
                  <span>Monto Total a Pagar</span>
                  <span className="text-[#775a19]">S/ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-[#775a19] text-white font-bold rounded-xl hover:bg-[#5e4713] transition-colors text-center text-sm shadow-md"
              >
                Confirmar Pedido & Pagar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

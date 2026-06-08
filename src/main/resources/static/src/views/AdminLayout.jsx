import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Tag, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  Search, 
  Bell 
} from 'lucide-react';

export default function AdminLayout({ user, onLogout, children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      path: '/admin/pedidos',
      name: 'Pedidos',
      icon: <ShoppingCart className="w-5 h-5" />
    },
    {
      path: '/admin/inventario',
      name: 'Inventario',
      icon: <Package className="w-5 h-5" />
    },
    {
      path: '/admin/clientes',
      name: 'Clientes',
      icon: <Users className="w-5 h-5" />
    },
    {
      path: '/admin/promociones',
      name: 'Promociones',
      icon: <Tag className="w-5 h-5" />
    },
    {
      path: '/admin/ajustes',
      name: 'Ajustes',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen flex bg-[#fdfaf7] text-[#1c1c19] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#fcf8f4] border-r border-[#e8dac5]/60 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="p-6 space-y-8">
          
          {/* Logo & Admin Profile */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#e8dac5]/30">
            <div className="w-10 h-10 bg-[#775a19]/15 text-[#775a19] rounded-xl flex items-center justify-center font-bold text-lg">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.58 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-sm font-black text-gray-800 tracking-tight leading-tight">
                Gourmet Admin
              </h2>
              <span className="text-[8px] uppercase tracking-widest text-[#775a19] font-bold block mt-0.5">
                Pastelería Artesanal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-full text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#f5e6d8] text-[#775a19] shadow-2xs'
                      : 'text-gray-600 hover:bg-[#775a19]/5 hover:text-[#775a19]'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-6 border-t border-[#e8dac5]/30 space-y-3">
          <button
            onClick={() => alert('Creación de pedido rápido disponible en la siguiente fase.')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#775a19] hover:bg-[#5e4713] text-white rounded-full text-xs font-bold tracking-wider transition-all shadow-xs uppercase cursor-pointer"
          >
            <span className="text-sm">+</span> Nuevo Pedido
          </button>
          <button 
            onClick={onLogout}
            className="w-full text-center text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase transition-colors tracking-widest cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 bg-white border-b border-[#e8dac5]/30 px-8 flex items-center justify-between sticky top-0 z-30">
          
          {/* Lado Izquierdo: Barra de búsqueda */}
          <div className="flex items-center w-80 max-w-full relative">
            <div className="absolute left-3.5 text-gray-400 pointer-events-none">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar pedido o cliente..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100/70 text-xs text-[#1c1c19] rounded-full border-none focus:outline-none focus:ring-1.5 focus:ring-[#775a19]/25 placeholder:text-gray-400 transition-all font-semibold"
            />
          </div>

          {/* Lado Derecho: Acciones & Perfil */}
          <div className="flex items-center gap-3.5">
            
            {/* Notificaciones */}
            <button className="p-2 text-gray-500 hover:text-[#775a19] hover:bg-[#775a19]/5 rounded-full transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>

            {/* Ajustes Rápidos */}
            <button className="p-2 text-gray-500 hover:text-[#775a19] hover:bg-[#775a19]/5 rounded-full transition-all">
              <Settings className="w-5 h-5" />
            </button>

            {/* Separador Vertical */}
            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            {/* Admin Info */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-gray-800 select-none">
                Admin Sotelo
              </span>
              {/* Profile Avatar con diseño de cuadrícula o iniciales */}
              <div className="w-10 h-10 bg-[#e8dac5]/40 text-[#775a19] rounded-full flex items-center justify-center font-bold text-xs border border-[#e8dac5]/70 shadow-2xs select-none">
                {user ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AS'}
              </div>
            </div>

          </div>
        </header>

        <div className="p-8 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}

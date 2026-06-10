import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Truck,
  PackageCheck,
  TrendingUp,
  Receipt,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function UserOrdersPage({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // 'todos' | 'en-camino' | 'entregados'
  
  // Track which order cards are expanded
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/pedidos');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pedidos/mis-pedidos');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        
        // Auto-expand the first order or any active order
        const initialExpanded = {};
        data.forEach((order, idx) => {
          if (idx === 0 || order.estado !== 'entregado') {
            initialExpanded[order.id] = true;
          }
        });
        setExpandedOrders(initialExpanded);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'pendiente':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', text: 'PENDIENTE' };
      case 'confirmado':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-100', text: 'CONFIRMADO' };
      case 'en_preparacion':
        return { bg: 'bg-pink-50 text-pink-700 border-pink-100', text: 'EN PREPARACIÓN' };
      case 'en_camino':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', text: 'EN CAMINO' };
      case 'entregado':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'ENTREGADO' };
      default:
        return { bg: 'bg-gray-50 text-gray-700 border-gray-100', text: status.toUpperCase() };
    }
  };

  // Helper to determine the state index for the timeline
  const getStatusStepIndex = (status, isRecojo) => {
    if (isRecojo) {
      switch (status) {
        case 'pendiente':
          return 0;
        case 'confirmado':
          return 1;
        case 'en_preparacion':
        case 'en_camino':
          return 2;
        case 'entregado':
          return 3;
        default:
          return 0;
      }
    } else {
      const steps = ['pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado'];
      return steps.indexOf(status);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'todos') return true;
    if (filter === 'en-camino') {
      return ['pendiente', 'confirmado', 'en_preparacion', 'en_camino'].includes(order.estado);
    }
    if (filter === 'entregados') {
      return order.estado === 'entregado';
    }
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' hs';
    } catch (e) {
      return dateString;
    }
  };

  const handleTrackOrder = (order) => {
    const stepsMessages = {
      'pendiente': 'Tu pedido ha sido recibido y está esperando la validación de pago.',
      'confirmado': 'Tu pedido ha sido confirmado por la cocina. Muy pronto iniciará su preparación.',
      'en_preparacion': 'Nuestros reposteros artesanales están elaborando tus postres con los mejores insumos.',
      'en_camino': '¡Tus dulces van en camino! Nuestro repartidor especializado los lleva en cajas térmicas.',
      'entregado': 'El pedido ha sido entregado exitosamente. ¡Que disfrutes tu experiencia Gourmet!'
    };
    alert(`Seguimiento del pedido ${order.codigo}:\n\nEstado actual: ${order.estado.toUpperCase()}\nDetalle: ${stepsMessages[order.estado] || ''}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 font-sans min-h-[85vh] bg-gradient-to-b from-white to-[#fdf9f4] space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#775a19] hover:underline">
          <User className="w-3.5 h-3.5" />
          <Link to="/perfil">MI PERFIL</Link>
        </div>
        <div className="border-b border-[#d1c5b4]/20 pb-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1c1c19]">Mis Pedidos</h1>
          <p className="text-sm text-[#4e4639] mt-1.5">
            Gestiona tus compras recientes, revisa el estado de entrega en tiempo real y descarga tus facturas.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 pb-2 overflow-x-auto select-none">
        <button
          onClick={() => setFilter('todos')}
          className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer border shrink-0 ${
            filter === 'todos'
              ? 'bg-[#775a19] text-white border-[#775a19] shadow-sm'
              : 'bg-[#f1ede8] text-[#4e4639] border-transparent hover:bg-gray-200'
          }`}
        >
          Todos los pedidos
        </button>
        <button
          onClick={() => setFilter('en-camino')}
          className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer border shrink-0 ${
            filter === 'en-camino'
              ? 'bg-[#775a19] text-white border-[#775a19] shadow-sm'
              : 'bg-[#f1ede8] text-[#4e4639] border-transparent hover:bg-gray-200'
          }`}
        >
          En camino
        </button>
        <button
          onClick={() => setFilter('entregados')}
          className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer border shrink-0 ${
            filter === 'entregados'
              ? 'bg-[#775a19] text-white border-[#775a19] shadow-sm'
              : 'bg-[#f1ede8] text-[#4e4639] border-transparent hover:bg-gray-200'
          }`}
        >
          Entregados
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#775a19]" /> Cargando tus pedidos...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 bg-[#f7f3ee]/50 rounded-3xl border border-dashed border-[#d1c5b4]/40 text-center text-sm text-gray-500 space-y-4">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
          <p>No se encontraron pedidos en esta sección.</p>
          <Link to="/catalogo" className="inline-block px-6 py-2.5 bg-[#775a19] text-white text-xs font-bold rounded-xl hover:bg-[#5e4713] transition-colors shadow-sm">
            Ir a Comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const isExpanded = !!expandedOrders[order.id];
            const badge = getStatusBadgeStyles(order.estado);
            const isRecojo = order.direccion?.distrito === 'Recojo en Tienda';
            const currentStepIdx = getStatusStepIndex(order.estado, isRecojo);

            // Resumen de nombres de productos para mostrar cuando está colapsado
            const itemsSummary = order.items.map(i => i.nombre).join(', ');

            return (
              <div 
                key={order.id} 
                className="bg-[#f7f3ee] rounded-3xl border border-[#d1c5b4]/20 overflow-hidden shadow-2xs transition-all"
              >
                {/* Header of Card (Visible always) */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-black/[0.01]"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold text-[#775a19] text-base md:text-lg">
                        ID {order.codigo}
                      </span>
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide ${badge.bg}`}>
                        {badge.text}
                      </span>
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide ${
                        isRecojo 
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      }`}>
                        {isRecojo ? 'RECOJO EN TIENDA' : 'ENVÍO A DOMICILIO'}
                      </span>
                    </div>
                    
                    {!isExpanded && (
                      <p className="text-xs text-gray-600 font-semibold line-clamp-1">
                        {itemsSummary}
                      </p>
                    )}
                    
                    <p className="text-[11px] text-[#4e4639] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#d1c5b4]" />
                      Realizado el {formatDate(order.fecha)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#d1c5b4]/20">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Total</span>
                      <span className="font-serif font-bold text-[#775a19] text-base md:text-lg">
                        S/ {order.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-white/60 border border-gray-100 flex items-center justify-center text-gray-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="bg-white border-t border-[#d1c5b4]/20 p-5 md:p-6 space-y-8 animate-fade-in">
                    
                    {/* 1. Tracking Timeline Progress */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-[#7f7667] uppercase tracking-wider">
                        {isRecojo ? 'Estado de Recojo' : 'Estado de Envío'}
                      </h4>
                      
                      {/* Timeline component */}
                      <div className="relative pt-6 pb-2">
                        {/* Connecting background line */}
                        <div className="absolute top-[2.1rem] left-8 right-8 h-1 bg-[#e6e2dd] -translate-y-1/2 z-0" />
                        
                        {/* Active progress line */}
                        <div 
                          className="absolute top-[2.1rem] left-8 h-1 bg-[#775a19] -translate-y-1/2 z-0 transition-all duration-500"
                          style={{
                            width: `${(currentStepIdx / (isRecojo ? 3 : 4)) * 82}%`
                          }}
                        />

                        {/* Steps */}
                        <div className="relative z-10 flex justify-between">
                          {(isRecojo
                            ? [
                                { name: 'Pendiente', icon: Clock },
                                { name: 'Confirmado', icon: CheckCircle },
                                { name: 'En Preparación', icon: TrendingUp },
                                { name: 'Entregado', icon: PackageCheck }
                              ]
                            : [
                                { name: 'Pendiente', icon: Clock },
                                { name: 'Confirmado', icon: CheckCircle },
                                { name: 'En Preparación', icon: TrendingUp },
                                { name: 'En Camino', icon: Truck },
                                { name: 'Entregado', icon: PackageCheck }
                              ]
                          ).map((step, idx) => {
                            const StepIcon = step.icon;
                            const isActive = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            
                            return (
                              <div key={idx} className="flex flex-col items-center gap-2 max-w-[64px]">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isActive
                                    ? 'bg-[#775a19] border-[#775a19] text-white'
                                    : 'bg-white border-[#e6e2dd] text-gray-350'
                                } ${isCurrent ? 'ring-4 ring-[#775a19]/15 scale-105' : ''}`}>
                                  <StepIcon className="w-4 h-4" />
                                </div>
                                <span className={`text-[9px] font-bold text-center tracking-tight ${
                                  isCurrent ? 'text-[#1c1c19] font-black' : isActive ? 'text-[#775a19]' : 'text-gray-400'
                                }`}>
                                  {step.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 2. Product Items */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-[#7f7667] uppercase tracking-wider">Artículos en este pedido</h4>
                      <div className="divide-y divide-[#d1c5b4]/10 space-y-3">
                        {order.items.map((item, index) => (
                          <div key={item.id || index} className="flex gap-4 items-center pt-3 first:pt-0">
                            {/* Product Image */}
                            <div className="w-12 h-12 rounded-lg bg-[#f1ede8] overflow-hidden shrink-0 border flex items-center justify-center">
                              <img 
                                src={item.imagenUrl} 
                                alt={item.nombre} 
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#1c1c19] truncate">{item.nombre}</p>
                              <p className="text-[10px] text-gray-500 font-semibold uppercase">
                                {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'} • S/ {item.precioUnitario.toFixed(2)} c/u
                              </p>
                              
                              {/* Personalizations formatted in uppercase */}
                              {Object.keys(item.selections || {}).length > 0 && (
                                <div className="flex flex-wrap gap-x-2 text-[9px] text-[#7f7667] font-bold tracking-wide uppercase mt-1">
                                  {Object.entries(item.selections).map(([k,v]) => (
                                    <span key={k} className="bg-gray-100 px-1.5 py-0.5 rounded">
                                      {k}: {String(v)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Total Line */}
                            <span className="text-sm font-bold text-[#775a19]">
                              S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Address details */}
                    <div className="border-t border-[#d1c5b4]/20 pt-4 flex flex-col sm:flex-row justify-between gap-6">
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-[#7f7667] uppercase tracking-wider block">
                          {isRecojo ? 'Sede de Recojo' : 'Dirección de Envío'}
                        </h4>
                        <div className="flex items-start gap-1.5 text-xs text-[#1c1c19] font-medium leading-relaxed">
                          <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-[#1c1c19]">{order.direccion.calle}</p>
                            <p className="text-gray-500 text-[11px]">{order.direccion.distrito}, {order.direccion.ciudad}</p>
                            {order.direccion.referencia && (
                              <p className="text-gray-400 text-[10px] italic">Referencia: {order.direccion.referencia}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons inside card */}
                      <div className="flex sm:items-end justify-start sm:justify-end gap-2.5">
                        <a
                          href={`/api/pedidos/${order.id}/factura`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#775a19] hover:bg-[#5e4713] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Descargar Factura (PDF)
                        </a>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

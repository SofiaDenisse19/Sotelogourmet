import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  X, 
  MapPin, 
  CreditCard,
  ShoppingBag,
  ClipboardList,
  Utensils,
  Banknote,
  ChevronRight
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filters = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendiente', label: 'Pendiente' },
    { id: 'confirmado', label: 'Confirmado' },
    { id: 'en_preparacion', label: 'En Preparación' },
    { id: 'en_camino', label: 'En Camino' },
    { id: 'entregado', label: 'Entregado' }
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pedidos');
      if (!response.ok) throw new Error('Error al cargar pedidos del servidor');
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = '';
    switch (currentStatus.toLowerCase()) {
      case 'pendiente': nextStatus = 'confirmado'; break;
      case 'confirmado': nextStatus = 'en_preparacion'; break;
      case 'en_preparacion': nextStatus = 'en_camino'; break;
      case 'en_camino': nextStatus = 'entregado'; break;
      default: return; // No hay más transiciones disponibles
    }

    try {
      setUpdatingId(orderId);
      const response = await fetch(`/api/admin/pedidos/${orderId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nextStatus })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'No se pudo actualizar el estado del pedido');
      }

      const updatedOrder = await response.json();
      
      // Actualizar el listado localmente
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      
      // Si el modal de detalle del pedido seleccionado está abierto, actualizarlo también
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente': 
        return { 
          bg: 'bg-stone-100 text-stone-600 border border-stone-200/50', 
          dot: 'bg-stone-500',
          label: '• Pendiente'
        };
      case 'confirmado': 
        return { 
          bg: 'bg-blue-50 text-blue-600 border border-blue-150', 
          dot: 'bg-blue-500',
          label: '• Confirmado'
        };
      case 'en_preparacion': 
        return { 
          bg: 'bg-purple-50 text-purple-600 border border-purple-150', 
          dot: 'bg-purple-500',
          label: '• Preparando'
        };
      case 'en_camino': 
        return { 
          bg: 'bg-orange-55 text-orange-600 border border-orange-150', 
          dot: 'bg-orange-500',
          label: '• En Camino'
        };
      case 'entregado': 
        return { 
          bg: 'bg-emerald-50 text-emerald-600 border border-emerald-150', 
          dot: 'bg-emerald-500',
          label: '• Entregado'
        };
      default: 
        return { 
          bg: 'bg-gray-50 text-gray-600 border border-gray-150', 
          dot: 'bg-gray-400',
          label: '• ' + status
        };
    }
  };

  const getPaymentStyle = (method) => {
    switch (method.toLowerCase()) {
      case 'yape':
      case 'plin':
        return 'bg-orange-50/70 text-orange-600 border border-orange-100/50 font-bold';
      case 'tarjeta':
        return 'bg-amber-50/80 text-amber-600 border border-amber-100/50 font-bold';
      case 'efectivo':
        return 'bg-gray-100 text-gray-600 border border-gray-200/50 font-bold';
      default:
        return 'bg-gray-50 text-gray-500 border border-gray-100 font-bold';
    }
  };

  const getNextStatusButtonLabel = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'Confirmar';
      case 'confirmado': return 'Preparar';
      case 'en_preparacion': return 'Enviar';
      case 'en_camino': return 'Entregar';
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { dateFormatted, timeFormatted };
  };

  // Filtrar pedidos según el filtro activo
  const filteredOrders = activeFilter === 'todos'
    ? orders
    : orders.filter(o => o.estado.toLowerCase() === activeFilter);

  // Calcular métricas dinámicas basadas en los pedidos
  const totalPedidos = orders.length;
  const pendientes = orders.filter(o => o.estado.toLowerCase() === 'pendiente').length;
  const enPreparacion = orders.filter(o => o.estado.toLowerCase() === 'en_preparacion').length;

  const hoyStr = new Date().toDateString();
  const ingresosHoy = orders
    .filter(o => new Date(o.fecha).toDateString() === hoyStr)
    .reduce((sum, o) => sum + o.total, 0);

  if (loading && orders.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-[#775a19]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="font-serif text-lg font-bold">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Título, Subtítulo y Botón Exportar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="font-serif text-lg font-bold text-[#775a19] leading-tight">
            Gestión de Pedidos
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Controla y actualiza el estado de los pedidos de tus clientes en tiempo real.
          </p>
        </div>
        <button
          onClick={() => alert('Exportación a Excel simulada con éxito.')}
          className="px-4 py-2 border border-[#775a19] text-[#775a19] bg-white hover:bg-[#775a19]/5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar Excel
        </button>
      </div>

      {/* Bento Grid Metrics de Gestión de Pedidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1: Total Pedidos */}
        <div className="bg-[#fdfaf7] p-6 rounded-3xl border border-[#e8dac5]/50 shadow-2xs transition-all hover:scale-[1.01] flex items-center justify-between relative">
          <span className="absolute top-4 right-4 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            +5.2%
          </span>
          <div className="space-y-1 mt-2">
            <div className="text-[#775a19]/10.5 text-gray-400">
              <ShoppingBag className="w-5 h-5 text-[#775a19]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 block pt-1.5">
              Total Pedidos
            </span>
            <p className="text-3xl font-serif font-black text-gray-800 leading-none">{totalPedidos}</p>
          </div>
        </div>

        {/* Tarjeta 2: Pendientes */}
        <div className="bg-[#fdfaf7] p-6 rounded-3xl border border-[#e8dac5]/50 shadow-2xs transition-all hover:scale-[1.01] flex items-center justify-between relative">
          <span className="absolute top-4 right-4 text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            Alta
          </span>
          <div className="space-y-1 mt-2">
            <div className="text-gray-400">
              <ClipboardList className="w-5 h-5 text-[#775a19]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 block pt-1.5">
              Pendientes
            </span>
            <p className="text-3xl font-serif font-black text-gray-800 leading-none">{pendientes}</p>
          </div>
        </div>

        {/* Tarjeta 3: En Preparación */}
        <div className="bg-[#fdfaf7] p-6 rounded-3xl border border-[#e8dac5]/50 shadow-2xs transition-all hover:scale-[1.01] flex items-center justify-between relative">
          <div className="space-y-1 mt-2">
            <div className="text-gray-400">
              <Utensils className="w-5 h-5 text-[#775a19]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450 block pt-1.5">
              En Preparación
            </span>
            <p className="text-3xl font-serif font-black text-gray-800 leading-none">
              {enPreparacion.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Tarjeta 4: Ingresos Hoy */}
        <div className="bg-[#775a19] text-white p-6 rounded-3xl border border-transparent shadow-xs transition-all hover:scale-[1.01] flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-24 h-24 rounded-full bg-white/5 blur-xl" />
          <div className="space-y-1 mt-2 relative z-10">
            <div className="text-white/80">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#f8dac5] block pt-1.5">
              Ingresos Hoy
            </span>
            <p className="text-3xl font-serif font-black text-white leading-none">S/ {ingresosHoy.toFixed(2)}</p>
          </div>
        </div>

      </div>

      {/* Filters & Actions Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        
        {/* Filtros de estado */}
        <div className="flex overflow-x-auto gap-2 py-1 max-w-full">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                activeFilter === filter.id
                  ? 'bg-[#775a19] text-white border-[#775a19] shadow-2xs'
                  : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-250/70'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Selector de periodo y filtros adicionales */}
        <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-auto">
          {/* Dropdown periodo */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-2xs cursor-pointer hover:border-gray-300">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Últimos 7 días</span>
          </div>
          
          {/* Botón de filtro */}
          <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors shadow-2xs cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Orders Table Card con borde suave y sombreado premium */}
      <div className="bg-white rounded-2xl border border-[#e8dac5]/50 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-[#fdfaf7]/50">
                <th className="py-4 px-6">Pedido</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6">Pago</th>
                <th className="py-4 px-6 text-right">Total</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold divide-y divide-gray-50 text-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const nextBtnLabel = getNextStatusButtonLabel(order.estado);
                  const isUpdating = updatingId === order.id;
                  const dateInfo = formatDate(order.fecha);
                  const styleInfo = getStatusStyle(order.estado);

                  return (
                    <tr key={order.id} className="hover:bg-[#fdfaf7]/20 transition-colors">
                      {/* ID Pedido */}
                      <td className="py-4 px-6 text-[#775a19] font-bold">
                        #SG-{order.id.toString().padStart(5, '0')}
                      </td>
                      
                      {/* Cliente */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-800 text-xs leading-none">{order.clienteNombre}</p>
                        <span className="text-[10px] text-gray-400 font-normal">{order.clienteEmail}</span>
                      </td>
                      
                      {/* Fecha y Hora en dos líneas */}
                      <td className="py-4 px-6 text-[11px] text-gray-500 font-normal leading-relaxed">
                        <p className="font-bold text-gray-700">{dateInfo.dateFormatted}</p>
                        <p className="text-gray-400">{dateInfo.timeFormatted}</p>
                      </td>
                      
                      {/* Método de pago styled badge */}
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wide border ${getPaymentStyle(order.metodoPago)}`}>
                          {order.metodoPago}
                        </span>
                      </td>
                      
                      {/* Total */}
                      <td className="py-4 px-6 text-right text-gray-800 font-black">
                        S/ {order.total.toFixed(2)}
                      </td>
                      
                      {/* Estado con puntito a la izquierda */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${styleInfo.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${styleInfo.dot}`}></span>
                          {styleInfo.label.replace('• ', '')}
                        </span>
                      </td>
                      
                      {/* Acciones detalladas */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {/* Detalle Link */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs text-[#775a19] hover:text-[#5e4713] hover:underline font-bold"
                          >
                            Detalle
                          </button>
                          
                          {/* Next Transition Button */}
                          {nextBtnLabel && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, order.estado)}
                              disabled={isUpdating}
                              className="text-[9px] text-[#775a19] hover:underline font-normal uppercase tracking-widest flex items-center gap-0.5 disabled:opacity-40"
                              title={`Avanzar a ${nextBtnLabel}`}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <>
                                  <span>{nextBtnLabel}</span>
                                  <ChevronRight className="w-2.5 h-2.5" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 text-sm">
                    No se encontraron pedidos en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] p-6 shadow-2xl space-y-6 border border-gray-100 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif font-black text-lg text-gray-800">Detalles del Pedido</h3>
                <span className="text-xs font-mono text-gray-400">ID: #SG-{selectedOrder.id.toString().padStart(5, '0')}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Info, Address, Payment Info */}
            <div className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Despacho</p>
                  <p className="text-gray-800 text-xs font-bold">{selectedOrder.clienteNombre}</p>
                  <p className="text-gray-500 font-normal leading-relaxed">{selectedOrder.direccionCompleta}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                  <CreditCard className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Método de Pago</p>
                    <p className="text-gray-800 text-xs font-bold uppercase">{selectedOrder.metodoPago}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                  {/* Status Bullet details */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Estado Logístico</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border ${getStatusStyle(selectedOrder.estado).bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyle(selectedOrder.estado).dot}`}></span>
                      {getStatusStyle(selectedOrder.estado).label.replace('• ', '')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table inside Detail */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Artículos del Pedido</p>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">{item.cantidad}x</span>
                      <span className="text-gray-800 font-bold">{item.productoNombre}</span>
                    </div>
                    <span className="text-gray-800">S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-gray-800">
                  <span>Monto Total Cobrado</span>
                  <span className="text-[#775a19] text-base">S/ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions inside Modal */}
            {getNextStatusButtonLabel(selectedOrder.estado) && (
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.estado)}
                className="w-full py-3.5 bg-[#775a19] hover:bg-[#5e4713] text-white font-bold rounded-xl transition-colors text-center text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                Avanzar a Estado: {getNextStatusButtonLabel(selectedOrder.estado)}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

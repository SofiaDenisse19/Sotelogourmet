import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, Users, Cake, Loader2, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/pedidos')
        ]);

        if (!statsRes.ok || !ordersRes.ok) {
          throw new Error('No se pudo cargar la información del panel');
        }

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();

        setStats(statsData);
        // Mostrar solo los primeros 5 pedidos más recientes
        setRecentOrders(ordersData.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-[#775a19]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="font-serif text-lg font-bold">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center max-w-lg mx-auto">
        <h3 className="text-red-600 font-bold font-serif text-lg mb-2">Error de Carga</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-[#775a19] text-white font-bold rounded-xl hover:bg-[#5e4713] transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: 'Ventas Totales',
      value: `S/ ${stats.ventasTotales.toFixed(2)}`,
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Total Pedidos',
      value: stats.totalPedidos,
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Clientes Activos',
      value: stats.totalClientes,
      icon: <Users className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-100'
    },
    {
      title: 'Productos en Catálogo',
      value: stats.totalProductos,
      icon: <Cake className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100'
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'confirmado': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'en_preparacion': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'en_camino': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'entregado': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-3xl border shadow-xs flex items-center justify-between transition-all hover:scale-[1.02] ${card.bg}`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {card.title}
              </span>
              <p className="text-2xl font-black text-gray-800">{card.value}</p>
            </div>
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-gray-100">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table: Recent Orders */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#e8dac5]/40 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="font-serif font-black text-lg text-gray-800">Pedidos Recientes</h3>
            <button 
              onClick={() => navigate('/admin/pedidos')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#775a19] hover:underline"
            >
              Gestionar Todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-3">Pedido ID</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold divide-y divide-gray-50 text-gray-700">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-mono text-xs text-gray-400">#SG-0{order.id}</td>
                      <td className="py-3">
                        <p className="font-bold text-gray-800 text-xs leading-none">{order.clienteNombre}</p>
                        <span className="text-[10px] text-gray-400 font-normal">{order.clienteEmail}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.estado)}`}>
                          {order.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-800 font-bold">
                        S/ {order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400 text-xs">
                      No hay pedidos registrados en el sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info & Admin Quick Card */}
        <div className="lg:col-span-4 bg-[#775a19] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          {/* Decorative Circles */}
          <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 rounded-full bg-white/5 blur-xl" />

          <div className="space-y-4 relative z-10">
            <span className="text-[10px] font-bold bg-white/15 px-3 py-1 rounded-full uppercase tracking-wider text-[#f8dac5]">
              Sotelo Gourmet Admin
            </span>
            <h3 className="font-serif text-2xl font-bold leading-tight">
              Control total en tus manos.
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-sans">
              Utiliza este panel para monitorear el rendimiento comercial de la pastelería, hacer seguimiento de las entregas y actualizar el estado logístico de los pedidos.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
            <div>
              <p className="text-[10px] text-white/60 uppercase">Estado Operativo</p>
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Servidor Activo
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, MapPin, Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';

export default function UserProfilePage({ user, onUpdateUser }) {
  const navigate = useNavigate();

  // Profile fields state
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address form state
  const [addrAlias, setAddrAlias] = useState(''); // E.g., 'Casa Principal', 'Oficina' (Saved in 'referencia')
  const [addrCalle, setAddrCalle] = useState('');
  const [addrDistrito, setAddrDistrito] = useState('Miraflores');
  const [addrCiudad, setAddrCiudad] = useState('Lima');
  const [addrPostal, setAddrPostal] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/perfil');
      return;
    }
    setNombre(user.nombre || '');
    setEmail(user.email || '');
    setTelefono(user.telefono || '');
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch('/api/direcciones');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Update Profile Info
      const resProfile = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono })
      });

      if (!resProfile.ok) {
        const err = await resProfile.json();
        throw new Error(err.error || 'Error al actualizar la información del perfil');
      }

      const updatedUser = await resProfile.json();
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      // 2. Update Password if filled
      if (currentPassword && newPassword) {
        const resPassword = await fetch('/api/auth/cambiar-contrasena', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword })
        });

        if (!resPassword.ok) {
          const err = await resPassword.json();
          throw new Error(err.error || 'La información de perfil se guardó, pero la contraseña no pudo cambiarse.');
        }

        setCurrentPassword('');
        setNewPassword('');
      }

      setMessage({ type: 'success', text: '¡Cambios guardados con éxito!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSavingProfile(false);
    }
  };

  // Add / Edit address submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addrCalle || !addrCiudad) {
      alert('Calle y Ciudad son campos requeridos.');
      return;
    }

    const payload = {
      calle: addrCalle,
      distrito: addrDistrito,
      ciudad: addrCiudad,
      codigoPostal: addrPostal,
      referencia: addrAlias || 'Dirección',
      esPrincipal: addresses.length === 0 // Make primary if first address
    };

    try {
      let res;
      if (editingAddressId) {
        res = await fetch(`/api/direcciones/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/direcciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        resetAddressForm();
        fetchAddresses();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al procesar la dirección');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddrAlias(addr.referencia);
    setAddrCalle(addr.calle);
    setAddrDistrito(addr.distrito);
    setAddrCiudad(addr.ciudad);
    setAddrPostal(addr.codigoPostal || '');
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) return;
    try {
      const res = await fetch(`/api/direcciones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAddresses();
      } else {
        alert('No se pudo eliminar la dirección');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetAddressForm = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddrAlias('');
    setAddrCalle('');
    setAddrDistrito('Miraflores');
    setAddrCiudad('Lima');
    setAddrPostal('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 font-sans min-h-[85vh] bg-gradient-to-b from-white to-[#fdf9f4]">
      {/* Header */}
      <div className="border-b border-[#d1c5b4]/20 pb-6 mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1c1c19]">Configuración del Perfil</h1>
        <p className="text-sm text-[#4e4639] mt-1.5">Gestiona tu información personal, direcciones de despacho y preferencias de seguridad.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm mb-6 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-[#f7f3ee] p-6 md:p-8 rounded-3xl border border-[#d1c5b4]/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#775a19]/10 flex items-center justify-center text-[#775a19]">
                <User className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#1c1c19]">Información Personal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-[#d1c5b4]/40 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Correo Electrónico</label>
                <input 
                  type="email" 
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 bg-gray-100 text-sm text-gray-400 rounded-xl border border-[#d1c5b4]/20 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Teléfono</label>
                <input 
                  type="text" 
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="Ej. +51 987 654 321"
                  className="w-full px-4 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-[#d1c5b4]/40 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-[#f7f3ee] p-6 md:p-8 rounded-3xl border border-[#d1c5b4]/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#775a19]/10 flex items-center justify-center text-[#775a19]">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#1c1c19]">Cambiar Contraseña</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Contraseña Actual</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-[#d1c5b4]/40 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-2.5 bg-white text-sm text-[#1c1c19] rounded-xl border border-[#d1c5b4]/40 focus:outline-none focus:ring-2 focus:ring-[#775a19]/25"
                />
              </div>
            </div>
          </div>

          {/* Submit / Cancel for Profile Form */}
          <div className="flex justify-end items-center gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="px-6 py-2.5 border border-[#705a49]/30 text-[#705a49] font-bold text-xs rounded-xl hover:bg-[#705a49]/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={savingProfile}
              className="px-8 py-3 bg-[#775a19] text-white font-bold text-xs rounded-xl hover:bg-[#5e4713] transition-colors cursor-pointer shadow-md flex items-center gap-2 disabled:bg-gray-400"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" /> Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>

        {/* Addresses Section */}
        <div className="bg-[#f7f3ee] p-6 md:p-8 rounded-3xl border border-[#d1c5b4]/20 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#775a19]/10 flex items-center justify-center text-[#775a19]">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#1c1c19]">Mis Direcciones</h2>
            </div>
            
            {!isAddingAddress && (
              <button 
                type="button"
                onClick={() => setIsAddingAddress(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#775a19] hover:bg-[#775a19]/5 border border-[#775a19]/20 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Añadir Nueva
              </button>
            )}
          </div>

          {/* Address Editor / Creator Form */}
          {isAddingAddress && (
            <form onSubmit={handleAddressSubmit} className="bg-white p-5 rounded-2xl border border-[#d1c5b4]/30 space-y-4 animate-fade-in">
              <h3 className="font-serif text-sm font-bold text-[#775a19]">
                {editingAddressId ? 'Editar Dirección' : 'Añadir Nueva Dirección'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Nombre / Alias (Ej. Casa, Oficina)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Casa Principal"
                    value={addrAlias}
                    onChange={e => setAddrAlias(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-xs text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Calle / Nro / Departamento</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Calle Serrano 12, 4ºB"
                    value={addrCalle}
                    onChange={e => setAddrCalle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-xs text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Distrito</label>
                  <input 
                    type="text" 
                    placeholder="Miraflores"
                    value={addrDistrito}
                    onChange={e => setAddrDistrito(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-xs text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Ciudad</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Lima"
                    value={addrCiudad}
                    onChange={e => setAddrCiudad(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-xs text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Código Postal (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="15074"
                    value={addrPostal}
                    onChange={e => setAddrPostal(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-xs text-[#1c1c19] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#775a19]/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={resetAddressForm}
                  className="px-4 py-2 border border-gray-200 text-gray-500 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#775a19] text-white font-bold text-xs rounded-xl hover:bg-[#5e4713] cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> {editingAddressId ? 'Guardar Cambios' : 'Añadir Dirección'}
                </button>
              </div>
            </form>
          )}

          {/* Addresses List */}
          {loadingAddresses ? (
            <div className="py-10 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#775a19]" /> Cargando direcciones...
            </div>
          ) : addresses.length === 0 ? (
            <div className="py-8 bg-white/50 rounded-2xl border border-dashed border-[#d1c5b4]/40 text-center text-xs text-gray-500">
              Aún no tienes direcciones registradas. ¡Añade una para tus despachos!
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(addr => (
                <div key={addr.id} className="bg-[#fdf9f4] p-5 rounded-2xl border border-[#d1c5b4]/20 flex justify-between items-center shadow-3xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-[#1c1c19] text-sm">{addr.referencia}</span>
                      {addr.esPrincipal && (
                        <span className="bg-[#775a19]/10 text-[#775a19] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4e4639]">
                      {addr.calle}, {addr.distrito}. {addr.codigoPostal ? `${addr.codigoPostal} ` : ''}{addr.ciudad}.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditAddress(addr)}
                      className="p-2 text-gray-500 hover:text-[#775a19] hover:bg-white border border-transparent hover:border-[#d1c5b4]/30 rounded-lg cursor-pointer transition-all"
                      title="Editar dirección"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 text-gray-400 hover:text-[#ba1a1a] hover:bg-red-50/50 border border-transparent hover:border-red-100 rounded-lg cursor-pointer transition-all"
                      title="Eliminar dirección"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

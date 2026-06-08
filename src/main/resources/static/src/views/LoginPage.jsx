import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al iniciar sesión');
      }

      // Login exitoso
      onLoginSuccess(data);
      if (data.rol === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 overflow-hidden bg-[#fdfaf7]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url('/assets/Img/background_login.png')` }}
      />
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white/95 rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 grid grid-cols-1 md:grid-cols-2 animate-fade-in">
        
        {/* Left Side: Mockup Image (div_login.png) or decorative cover */}
        <div className="hidden md:block relative bg-[#775a19] overflow-hidden">
          <img 
            src="/assets/Img/div_login.png" 
            alt="Sotelo Gourmet Delicias" 
            className="w-full h-full object-cover opacity-90 object-center hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-10 left-8 right-8 text-white space-y-2">
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#f8dac5]">
              Repostería Fina & Exclusiva
            </span>
            <h3 className="font-serif text-3xl font-bold leading-tight">
              Donde cada bocado <br />es una obra de arte.
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-sans max-w-xs">
              Accede a tu cuenta para realizar pedidos personalizados, guardar tus postres favoritos y disfrutar de una experiencia premium.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Back to Home link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#775a19] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio
            </Link>

            <div className="space-y-1">
              <h2 className="text-3xl font-serif font-black text-[#1c1c19]">Bienvenido</h2>
              <p className="text-sm text-gray-500">Ingresa tus credenciales para continuar en Sotelo Gourmet</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-medium animate-pulse">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#775a19]/20 focus:border-[#775a19] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#775a19]/20 focus:border-[#775a19] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-[#775a19] text-white font-bold rounded-xl hover:bg-[#5e4713] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Iniciando Sesión...
                  </>
                ) : (
                  'Ingresar'
                )}
              </button>

            </form>
          </div>

          {/* Footer Text */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/register" className="font-bold text-[#775a19] hover:underline">
              Regístrate aquí
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

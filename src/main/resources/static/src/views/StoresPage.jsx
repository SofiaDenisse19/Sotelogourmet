import React from 'react';
import { MapPin, Clock, ArrowRight, ExternalLink } from 'lucide-react';

export default function StoresPage() {
  const shops = [
    {
      id: 'vallejo',
      name: 'Sede Vallejo',
      district: 'Villa El Salvador',
      type: 'TIENDA PRINCIPAL',
      description: 'Ubicada en el corazón del distrito, nuestro local insignia ofrece la gama completa de creaciones gourmet y una exclusiva zona de degustación artesanal.',
      address: 'Av. César Vallejo, Villa El Salvador, Lima.',
      hours: 'Lun - Sáb: 8:00 AM - 9:00 PM\nDom: 9:00 AM - 7:00 PM',
      mapUrl: 'https://maps.google.com/?q=Av.+Cesar+Vallejo,+Villa+El+Salvador,+Lima',
      imageUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&auto=format&fit=crop&q=80',
      featured: true
    },
    {
      id: 'algarrobos',
      name: 'Sede Algarrobos',
      district: 'Villa El Salvador',
      type: 'EXPRESS',
      description: 'Perfecto para un café al paso y recoger tus postres favoritos de vitrina horneados diariamente.',
      address: 'Av. Los Algarrobos, Villa El Salvador, Lima.',
      hours: 'Lun - Vie: 7:30 AM - 8:30 PM\nSáb: 8:00 AM - 8:00 PM',
      mapUrl: 'https://maps.google.com/?q=Av.+Los+Algarrobos,+Villa+El+Salvador,+Lima',
      imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=80',
      featured: false
    },
    {
      id: 'cocharcas',
      name: 'Sede Cocharcas',
      district: 'Villa El Salvador',
      type: 'EXPRESS',
      description: 'Una atmósfera acogedora ideal para compartir los mejores dulces artesanales de la zona.',
      address: 'Av. Cocharcas, Villa El Salvador, Lima.',
      hours: 'Lun - Dom: 8:00 AM - 9:00 PM',
      mapUrl: 'https://maps.google.com/?q=Av.+Cocharcas,+Villa+El+Salvador,+Lima',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      featured: false
    },
    {
      id: 'elsol',
      name: 'Sede El Sol',
      district: 'Villa El Salvador',
      type: 'CAFETERÍA GOURMET',
      description: 'Un espacio amplio y luminoso diseñado para disfrutar de tus postres favoritos con la tranquilidad y calidez que mereces.',
      address: 'Avenida El Sol A-06, Villa El Salvador, Lima.',
      hours: 'Lun - Sáb: 8:30 AM - 9:30 PM\nDom: 9:00 AM - 8:00 PM',
      mapUrl: 'https://maps.google.com/?q=Avenida+El+Sol,+Villa+El+Salvador,+Lima',
      imageUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=80',
      featured: true, // we render it differently as bento flow (text left / image right)
      alternateLayout: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf9f4] font-sans pb-16">
      
      {/* Header - Hero Section */}
      <div className="relative h-[45vh] w-full overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-black/55" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl space-y-4 animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tight">
            Nuestras Tiendas
          </h1>
          <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed">
            Encuentra la experiencia Sotelo Gourmet más cerca de ti y deléitate con nuestra pastelería artesanal tradicional.
          </p>
        </div>
      </div>

      {/* Bento Grid Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Sede Vallejo (Featured - Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#d1c5b4]/20 shadow-xs overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all group">
            <div className="md:w-1/2 relative min-h-[280px]">
              <img 
                src={shops[0].imageUrl} 
                alt={shops[0].name}
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-103 transition-transform duration-300"
              />
            </div>
            
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black tracking-wider text-[#775a19] uppercase bg-[#775a19]/5 px-2.5 py-1 rounded-md">
                    {shops[0].type}
                  </span>
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1c1c19]">{shops[0].name}</h2>
                  <p className="text-xs text-gray-400 font-semibold">{shops[0].district}</p>
                </div>
                <p className="text-xs text-[#494551] leading-relaxed font-medium">
                  {shops[0].description}
                </p>
                
                <div className="space-y-2.5 pt-2 border-t border-[#d1c5b4]/10 text-xs text-[#494551] font-semibold">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span>{shops[0].address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line leading-normal">{shops[0].hours}</span>
                  </div>
                </div>
              </div>
              
              <a 
                href={shops[0].mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-fit px-5 py-3 bg-[#775a19] hover:bg-[#5e4713] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                Ver en Mapa <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 2. Sede Algarrobos (Standard Card) */}
          <div className="bg-white rounded-3xl border border-[#d1c5b4]/20 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all group">
            <div className="h-56 relative overflow-hidden">
              <img 
                src={shops[1].imageUrl} 
                alt={shops[1].name}
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-103 transition-transform duration-300"
              />
            </div>
            
            <div className="p-6 flex flex-col justify-between flex-grow space-y-5">
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#1c1c19]">{shops[1].name}</h3>
                <div className="space-y-2 text-xs text-[#494551] font-semibold pt-2 border-t border-gray-50">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span>{shops[1].address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line leading-normal">{shops[1].hours}</span>
                  </div>
                </div>
              </div>
              
              <a 
                href={shops[1].mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 border border-[#775a19] hover:bg-[#775a19]/5 text-[#775a19] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                Ver en Mapa <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 3. Sede Cocharcas (Standard Card) */}
          <div className="bg-white rounded-3xl border border-[#d1c5b4]/20 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all group">
            <div className="h-56 relative overflow-hidden">
              <img 
                src={shops[2].imageUrl} 
                alt={shops[2].name}
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-103 transition-transform duration-300"
              />
            </div>
            
            <div className="p-6 flex flex-col justify-between flex-grow space-y-5">
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#1c1c19]">{shops[2].name}</h3>
                <div className="space-y-2 text-xs text-[#494551] font-semibold pt-2 border-t border-gray-50">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span>{shops[2].address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line leading-normal">{shops[2].hours}</span>
                  </div>
                </div>
              </div>
              
              <a 
                href={shops[2].mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 border border-[#775a19] hover:bg-[#775a19]/5 text-[#775a19] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                Ver en Mapa <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 4. Sede El Sol (Featured - Spans 2 columns, opposite layout) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#d1c5b4]/20 shadow-xs overflow-hidden flex flex-col md:flex-row-reverse hover:shadow-md transition-all group">
            <div className="md:w-1/2 relative min-h-[280px]">
              <img 
                src={shops[3].imageUrl} 
                alt={shops[3].name}
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-103 transition-transform duration-300"
              />
            </div>
            
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black tracking-wider text-[#775a19] uppercase bg-[#775a19]/5 px-2.5 py-1 rounded-md">
                    {shops[3].type}
                  </span>
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1c1c19]">{shops[3].name}</h2>
                  <p className="text-xs text-gray-400 font-semibold">{shops[3].district}</p>
                </div>
                <p className="text-xs text-[#494551] leading-relaxed font-medium">
                  {shops[3].description}
                </p>
                
                <div className="space-y-2.5 pt-2 border-t border-[#d1c5b4]/10 text-xs text-[#494551] font-semibold">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span>{shops[3].address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line leading-normal">{shops[3].hours}</span>
                  </div>
                </div>
              </div>
              
              <a 
                href={shops[3].mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-fit px-5 py-3 bg-[#775a19] hover:bg-[#5e4713] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                Ver en Mapa <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}

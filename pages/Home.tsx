import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { ArrowRight, Scale, Shield, Globe, Play, X, Bell } from 'lucide-react';

const Home: React.FC = () => {
  const { content } = useContent();
  const [isInternationalVideoOpen, setIsInternationalVideoOpen] = useState(false);

  // Helper to extract video ID and create embed URL for YouTube
  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return '';
    let videoId = '';
    
    try {
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v') || '';
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }
    } catch (e) {
        console.error("Error parsing video URL", e);
        return url;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  // Check if announcement is enabled (safe check)
  const isAnnouncementEnabled = content.home.announcement?.enabled;
  const announcementText = content.home.announcement?.text || '';

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Maintenance Marquee Overlay */}
        {content.home.maintenance?.enabled && (
           <div className="absolute top-0 left-0 w-full bg-yellow-400 text-slate-900 z-30 py-3 border-b-2 border-slate-900 overflow-hidden shadow-lg">
             <div className="whitespace-nowrap animate-marquee-left inline-block w-full font-bold uppercase tracking-widest text-sm md:text-base">
                <span className="mx-8">⚠️ THE WEBSITE IS UNDER MAINTENANCE TILL {content.home.maintenance.date}</span>
                <span className="mx-8">⚠️ THE WEBSITE IS UNDER MAINTENANCE TILL {content.home.maintenance.date}</span>
                <span className="mx-8">⚠️ THE WEBSITE IS UNDER MAINTENANCE TILL {content.home.maintenance.date}</span>
                <span className="mx-8">⚠️ THE WEBSITE IS UNDER MAINTENANCE TILL {content.home.maintenance.date}</span>
             </div>
           </div>
        )}

        <div className="absolute inset-0 z-0">
          <img 
            src={content.general.heroImage} 
            alt="Law Firm Office" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-amber-400 tracking-widest uppercase text-sm font-bold mb-4 animate-fade-in-up">
            {content.general.tagline}
          </h2>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-8 leading-tight max-w-4xl mx-auto">
            {content.home.heroSubtitle}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            {content.home.introText}
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/contact"
              style={{ backgroundColor: content.general.accentColor }}
              className="px-8 py-4 text-white font-bold rounded hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-lg flex items-center gap-2"
            >
              Schedule Consultation <ArrowRight size={18} />
            </Link>
            <Link 
              to="/services"
              className="px-8 py-4 bg-transparent border border-white text-white font-bold rounded hover:bg-white hover:text-slate-900 transition-all transform hover:-translate-y-1"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENT BAR */}
      {isAnnouncementEnabled && (
        <section className="bg-slate-900 border-b-4 border-amber-500 py-4 overflow-hidden relative z-20 shadow-xl">
          <div className="whitespace-nowrap animate-marquee-left flex items-center w-full">
            {[1, 2, 3, 4].map((item) => (
               <div key={item} className="flex items-center shrink-0">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse mr-4 shadow-lg border border-red-400 flex items-center gap-1">
                    <Bell size={10} fill="currentColor"/> NEW
                  </span>
                  <span className="text-white font-medium tracking-wide mr-24 text-sm uppercase">
                    {announcementText}
                  </span>
               </div>
            ))}
          </div>
        </section>
      )}

      {/* International Section */}
      {content.home.internationalVideoUrl && (
        <section className="bg-slate-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-10">
              Yogapaartiban Associates Internationally
            </h2>

            <button
              onClick={() => setIsInternationalVideoOpen(true)}
              className="group relative inline-flex items-center justify-center w-24 h-24 bg-amber-500 rounded-full hover:bg-amber-400 transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] hover:scale-110"
            >
               <Play className="w-10 h-10 text-white fill-current ml-1" />
               {/* Ripple effect rings */}
               <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
            </button>
            <p className="text-amber-500/80 mt-8 text-sm uppercase tracking-[0.2em] font-bold">Watch Our Global Presence</p>
          </div>
        </section>
      )}

      {/* Highlights */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-xl transition-shadow group">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors">
                <Scale className="text-slate-900 group-hover:text-amber-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Expert Legal Counsel</h3>
              <p className="text-gray-600 leading-relaxed">
                Over a decade of experience arguing in Supreme Court, High Courts, and specialized tribunals across India.
              </p>
            </div>
            <div className="text-center p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-xl transition-shadow group">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors">
                <Shield className="text-slate-900 group-hover:text-amber-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Technological Insight</h3>
              <p className="text-gray-600 leading-relaxed">
                A unique fusion of law and technology, offering specialized services in cyber forensics, startups, and compliance.
              </p>
            </div>
            <div className="text-center p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-xl transition-shadow group">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-900 transition-colors">
                <Globe className="text-slate-900 group-hover:text-amber-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Global Reach</h3>
              <p className="text-gray-600 leading-relaxed">
                Serving clients internationally with connections in UK, Germany, Canada, Russia, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Preview */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
             <div>
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Our Expertise</h2>
               <div className="h-1 w-20 bg-amber-500"></div>
             </div>
             <Link to="/services" className="hidden md:flex items-center gap-2 text-slate-600 hover:text-amber-600 font-medium transition-colors">
               View All Services <ArrowRight size={16} />
             </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.services.slice(0, 4).map((service) => (
              <Link key={service.id} to="/services" className="bg-white p-6 rounded shadow-sm hover:shadow-md transition-shadow block">
                <h4 className="font-bold text-lg mb-2 text-slate-800">{service.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-3">{service.description}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 md:hidden text-center">
            <Link to="/services" className="text-amber-600 font-bold">View All Services</Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isInternationalVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
            <button
                onClick={() => setIsInternationalVideoOpen(false)}
                className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors z-50 p-2"
            >
                <X size={40}/>
            </button>
            <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800 relative">
                <iframe
                src={getEmbedUrl(content.home.internationalVideoUrl)}
                title="International Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                ></iframe>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;
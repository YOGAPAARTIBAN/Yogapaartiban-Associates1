import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gavel, Lock, Mail } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import DisclaimerModal from './DisclaimerModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { content } = useContent();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => 
    `transition-colors font-medium ${isActive(path) ? 'text-yellow-600' : 'text-gray-700 hover:text-yellow-600'}`;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      <DisclaimerModal />
      
      {/* Top Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 hidden md:flex justify-between items-center">
        <div className="flex space-x-6">
          <span className="flex items-center gap-2"><Mail size={14}/> {content.general.email}</span>
        </div>
        <div>
           <Link to="/official-login" className="flex items-center gap-1 hover:text-yellow-400 transition-colors">
             <Lock size={12} /> Official Login
           </Link>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-slate-900 p-2 rounded-sm group-hover:bg-slate-800 transition-colors">
              <Gavel className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-slate-900 uppercase">
                {content.home.heroTitle}
              </h1>
              <p className="text-[0.65rem] md:text-xs text-slate-500 tracking-widest uppercase">Advocates & Legal Consultants</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 text-sm tracking-wide uppercase">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/about" className={linkClass('/about')}>About Us</Link>
            <Link to="/services" className={linkClass('/services')}>Services</Link>
            <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-900 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 flex flex-col space-y-4 shadow-lg absolute w-full">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-800 border-b border-gray-50">Home</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-800 border-b border-gray-50">About Us</Link>
            <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-800 border-b border-gray-50">Services</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-800 border-b border-gray-50">Contact</Link>
            <Link to="/official-login" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-yellow-700 font-medium">Official Login</Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t-4" style={{ borderColor: content.general.accentColor }}>
        {/* Marquees */}
        <div className="bg-slate-800 py-2 overflow-hidden border-b border-slate-700">
           <div className="whitespace-nowrap animate-marquee-left inline-block w-full text-sm font-light tracking-widest text-slate-400">
              <span className="mx-4">Chennai</span> • 
              <span className="mx-4">Madurai</span> • 
              <span className="mx-4">Hyderabad</span> • 
              <span className="mx-4">Bangalore</span> • 
              <span className="mx-4">Delhi</span> • 
              <span className="mx-4">Cochin</span> • 
              <span className="mx-4">Navi Mumbai</span>
           </div>
        </div>
        <div className="bg-slate-800 py-2 overflow-hidden mb-8">
           <div className="whitespace-nowrap animate-marquee-right inline-block w-full text-sm font-light tracking-widest text-slate-400">
              <span className="mx-4">Cyprus</span> • 
              <span className="mx-4">Russia</span> • 
              <span className="mx-4">Malaysia</span> • 
              <span className="mx-4">Germany</span> • 
              <span className="mx-4">Canada</span> • 
              <span className="mx-4">UK</span>
           </div>
        </div>

        <div className="container mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
           <div>
             <h3 className="text-white font-serif text-lg mb-4">YOGAPAARTIBAN ASSOCIATES</h3>
             <p className="mb-4 text-slate-400">{content.general.tagline}</p>
             <p className="mb-2"><span className="text-white">Email:</span> {content.general.email}</p>
           </div>
           <div>
             <h3 className="text-white font-serif text-lg mb-4">Quick Links</h3>
             <div className="flex flex-col space-y-2">
               <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
               <Link to="/services" className="hover:text-white transition-colors">Practice Areas</Link>
               <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
             </div>
           </div>
           <div>
             <h3 className="text-white font-serif text-lg mb-4">Disclaimer</h3>
             <p className="text-xs text-slate-500 leading-relaxed">
               {content.disclaimer.footerText}
             </p>
           </div>
        </div>
        
        <div className="bg-black py-4 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Yogapaartiban Associates. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
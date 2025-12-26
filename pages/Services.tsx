import React from 'react';
import { useContent } from '../context/ContentContext';
import * as Icons from 'lucide-react';

const Services: React.FC = () => {
  const { content } = useContent();

  // Helper to dynamically render icons based on string name safely
  const renderIcon = (iconName: string) => {
    try {
        const IconComponent = (Icons as any)[iconName];
        // Ensure it's a valid React component (function or object with render)
        if (IconComponent && (typeof IconComponent === 'function' || typeof IconComponent === 'object')) {
            return <IconComponent className="w-8 h-8 text-white" />;
        }
    } catch (e) {
        // Fallback silently
    }
    return <Icons.Briefcase className="w-8 h-8 text-white" />;
  };

  // Safe array access for services (handles Firebase object/array mismatch)
  const servicesList = Array.isArray(content.services) 
    ? content.services 
    : content.services 
        ? Object.values(content.services) 
        : [];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
       <div className="bg-slate-900 py-20 text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">Practice Areas</h1>
        <p className="text-slate-400 max-w-2xl mx-auto px-4">
          Specialized legal services tailored for modern businesses and complex regulatory environments.
        </p>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service) => {
            return (
              <div key={service.id || Math.random()} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                <div className="p-8 flex-grow">
                  <div 
                    className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: content.general.accentColor }}
                  >
                    {renderIcon(service.iconName)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-amber-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Services;
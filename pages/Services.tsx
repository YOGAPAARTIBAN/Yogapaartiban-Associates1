import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import * as Icons from 'lucide-react';
import { PlayCircle, X, ExternalLink } from 'lucide-react';

const Services: React.FC = () => {
  const { content } = useContent();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Helper to dynamically render icons based on string name
  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : <Icons.Briefcase className="w-8 h-8 text-white" />;
  };

  // Helper to detect YouTube links
  const isYouTube = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
  };
  
  // Helper to extract clean URL from iframe code if pasted, or return original URL
  const getCleanUrl = (url: string) => {
    try {
        if (!url) return '';
        let cleanUrl = url.trim();
        
        // Handle case where user pastes full iframe code instead of just URL
        if (cleanUrl.startsWith('<iframe') || cleanUrl.startsWith('&lt;iframe')) {
            const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
                cleanUrl = srcMatch[1];
            }
        }
        return cleanUrl;
    } catch (e) {
        return url;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
       {/* Video Modal - Primarily for uploaded/local files now */}
       {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
            <button 
              onClick={() => setPlayingVideo(null)} 
              className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors z-50 p-2"
            >
                <X size={40}/>
            </button>
            <div className="w-full max-w-5xl flex flex-col items-center">
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800 relative flex items-center justify-center">
                    <video 
                        key={playingVideo}
                        src={playingVideo} 
                        controls 
                        autoPlay 
                        className="w-full h-full" 
                    />
                </div>
            </div>
        </div>
       )}

       <div className="bg-slate-900 py-20 text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">Practice Areas</h1>
        <p className="text-slate-400 max-w-2xl mx-auto px-4">
          Specialized legal services tailored for modern businesses and complex regulatory environments.
        </p>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.services.map((service) => {
            const cleanVideoUrl = getCleanUrl(service.videoUrl || '');
            const isYt = isYouTube(cleanVideoUrl);

            return (
              <div key={service.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="p-6">
                  <div 
                    className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: content.general.accentColor }}
                  >
                    {renderIcon(service.iconName)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  {service.videoUrl ? (
                      isYt ? (
                        /* External Link for YouTube */
                        <a 
                          href={cleanVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 uppercase tracking-wide cursor-pointer"
                        >
                          <PlayCircle size={18} /> Watch Video <ExternalLink size={14} className="opacity-50"/>
                        </a>
                      ) : (
                        /* Internal Modal for Local Files */
                        <button 
                          onClick={() => setPlayingVideo(cleanVideoUrl)}
                          className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 uppercase tracking-wide"
                        >
                          <PlayCircle size={18} /> Watch Video
                        </button>
                      )
                  ) : (
                     <span className="text-sm text-gray-400 italic flex items-center gap-2">
                        <Icons.Info size={14}/> Video coming soon
                     </span>
                  )}
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
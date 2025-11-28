import React from 'react';
import { useContent } from '../context/ContentContext';

const About: React.FC = () => {
  const { content } = useContent();
  const { founder, executives, cas } = content.about;

  return (
    <div className="bg-white pb-20">
      {/* Header */}
      <div className="bg-slate-900 py-20 text-center">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">About The Firm</h1>
        <p className="text-slate-400 max-w-2xl mx-auto px-4">
          We are a team of dedicated legal professionals and chartered accountants committed to excellence.
        </p>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        {/* Founder Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 mb-16 border-t-4" style={{ borderColor: content.general.accentColor }}>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full md:w-1/3">
               <div className="aspect-[3/4] bg-gray-200 rounded overflow-hidden shadow-lg relative">
                 {founder.image ? (
                   <img src={founder.image} alt={founder.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">No Image</div>
                 )}
               </div>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-1">{founder.name}</h2>
              <p className="text-amber-600 font-medium mb-4 uppercase tracking-wider">{founder.role}</p>
              <div className="bg-slate-50 p-4 rounded mb-6 border-l-4 border-slate-300">
                <p className="font-bold text-slate-700">Qualifications:</p>
                <p className="text-slate-600">{founder.qualifications}</p>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {founder.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Executives */}
        <div className="mb-16">
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-8 text-center relative">
            <span className="relative z-10 bg-white px-4">Executive Advocates</span>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {executives.map((exec) => (
              <div key={exec.id} className="bg-slate-50 p-8 rounded hover:bg-white hover:shadow-lg transition-all border border-gray-100">
                <h4 className="text-xl font-bold text-slate-900 mb-1">{exec.name}</h4>
                <p className="text-sm text-slate-500 mb-4 font-mono">{exec.qualifications}</p>
                <div className="w-12 h-1 bg-amber-500 mb-4"></div>
                <p className="text-gray-600 text-sm leading-relaxed">{exec.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CAs */}
        <div className="mb-16">
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-8 text-center relative">
            <span className="relative z-10 bg-white px-4">Chartered Accountants</span>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {cas.map((ca) => (
               <div key={ca.id} className="bg-white border border-gray-200 p-8 rounded shadow-sm">
                 <h4 className="text-xl font-bold text-slate-900 mb-2">{ca.name}</h4>
                 <p className="text-amber-600 text-sm font-bold uppercase mb-4">Connected Auditor</p>
                 <p className="text-gray-600 leading-relaxed">{ca.bio}</p>
               </div>
             ))}
          </div>
          <p className="text-center text-gray-500 mt-6 italic">
            * We work with numerous connected auditors across India.
          </p>
        </div>

        {/* Associates */}
        <div className="text-center bg-slate-900 text-slate-300 p-12 rounded-lg">
          <h3 className="text-xl font-serif text-white mb-4">Our Extended Network</h3>
          <p className="max-w-3xl mx-auto">
            {content.about.associatesText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
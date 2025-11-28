import React from 'react';
import { useContent } from '../context/ContentContext';
import { Calendar } from 'lucide-react';

const Posts: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-slate-900 py-20 text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">Legal Insights</h1>
        <p className="text-slate-400 max-w-2xl mx-auto px-4">
          Latest updates, case studies, and legal news.
        </p>
      </div>

      <div className="container mx-auto px-4">
        {content.posts.length === 0 ? (
          <div className="text-center text-gray-500 py-20">No posts available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {content.posts.map((post) => (
              <article key={post.id} className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {post.image && (
                  <div className="h-64 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mb-3">
                    <Calendar size={14} />
                    {post.date}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">{post.title}</h2>
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed">{post.excerpt}</p>
                  {post.externalUrl ? (
                    <a 
                      href={post.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-900 font-bold uppercase text-sm tracking-wider border-b-2 border-amber-400 self-start pb-1 hover:text-amber-600 hover:border-slate-900 transition-colors"
                    >
                      Read Article
                    </a>
                  ) : (
                    <button className="text-slate-900 font-bold uppercase text-sm tracking-wider border-b-2 border-amber-400 self-start pb-1 hover:text-amber-600 hover:border-slate-900 transition-colors opacity-50 cursor-not-allowed">
                       Read Article
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
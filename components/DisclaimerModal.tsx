import React, { useEffect, useState } from 'react';
import { useContent } from '../context/ContentContext';

const DisclaimerModal: React.FC = () => {
  const { content } = useContent();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAgreed = sessionStorage.getItem('hasAgreedToDisclaimer');
    if (!hasAgreed) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    sessionStorage.setItem('hasAgreedToDisclaimer', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border-t-4" style={{ borderColor: content.general.accentColor }}>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">DISCLAIMER</h2>
          <div className="prose prose-sm text-gray-600 mx-auto text-justify mb-8 whitespace-pre-line">
            {content.disclaimer.popupText}
          </div>
          <button
            onClick={handleAgree}
            style={{ backgroundColor: content.general.accentColor }}
            className="px-8 py-3 text-white font-bold rounded hover:opacity-90 transition-opacity uppercase tracking-wider"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import { MapPin, Mail, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const { content } = useContent();
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('sending');
    
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("https://formspree.io/f/xvgyjpqe", {
        method: "POST",
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setFormStatus('sent');
      } else {
        setFormStatus('idle');
        alert("There was a problem sending your message. Please try again.");
      }
    } catch (error) {
      setFormStatus('idle');
      alert("There was a problem sending your message. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-slate-900 py-20 text-center">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">Contact Us</h1>
        <p className="text-slate-400 max-w-2xl mx-auto px-4">
          Get in touch with our expert legal team.
        </p>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column: Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 font-serif">Get In Touch</h2>
            <div className="space-y-8">
              
              <div className="flex items-start gap-6">
                <div className="bg-amber-100 p-4 rounded-lg text-amber-700 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">Email</h4>
                  <p className="text-gray-600">{content.general.email}</p>
                  <p className="text-sm text-gray-500 mt-1">Online support 24/7</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="bg-amber-100 p-4 rounded-lg text-amber-700 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">Our Offices</h4>
                  <p className="text-gray-600 max-w-md leading-relaxed">{content.general.address}</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-slate-50 border-l-4 border-amber-500 rounded-r">
              <h5 className="font-bold text-slate-900 mb-2">Note on Confidentiality</h5>
              <p className="text-sm text-gray-600">
                All communications are strictly confidential and protected by attorney-client privilege.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 h-fit">
            <h3 className="text-xl font-bold text-slate-900 mb-6 font-serif">Send us a Message</h3>
            {formStatus === 'sent' ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center">
                <div className="mb-4 flex justify-center">
                   <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                     <Send size={20} className="text-green-600" />
                   </div>
                </div>
                <p className="font-bold text-lg mb-2">Message Sent!</p>
                <p>Thank you for reaching out. We will get back to you shortly.</p>
                <button 
                  onClick={() => setFormStatus('idle')}
                  className="mt-6 text-sm text-green-700 hover:text-green-900 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    required 
                    name="name"
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white transition-colors" 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    required 
                    name="email"
                    type="email" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white transition-colors" 
                    placeholder="john@example.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <select name="subject" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white transition-colors">
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Legal Consultation">Legal Consultation</option>
                    <option value="Corporate Services">Corporate Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea 
                    required 
                    name="message"
                    rows={5} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 focus:bg-white transition-colors resize-none" 
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={formStatus === 'sending'}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition-all transform hover:-translate-y-1 shadow-md flex items-center justify-center gap-2"
                >
                  {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                  {!formStatus && <Send size={18} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
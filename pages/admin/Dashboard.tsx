import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, LogOut, User, Upload, Image as ImageIcon, Users, Video, RotateCcw, CheckCircle, X, AlertTriangle, Database, Cloud, Lock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { content, updateContent, resetContent, isFirebaseConnected, connectionSource, connectToDatabase } = useContent();
  const navigate = useNavigate();
  
  // Local state for form handling
  const [activeTab, setActiveTab] = useState<'general' | 'home' | 'about' | 'services' | 'database'>('general');
  const [firebaseConfigInput, setFirebaseConfigInput] = useState('');
  
  // Local copy to edit before saving
  const [editContent, setEditContent] = useState(content);

  if (!isAuthenticated) {
    navigate('/official-login');
    return null;
  }

  const handleSave = () => {
    updateContent(editContent);
    alert('Changes saved successfully!' + (isFirebaseConnected ? ' Synced to Cloud.' : ' Saved locally.'));
  };

  const handleLogout = () => {
    logout();
    navigate('/official-login');
  };

  const handleConnectFirebase = () => {
      try {
          const config = JSON.parse(firebaseConfigInput);
          connectToDatabase(config, 'local').then(success => {
              if(success) alert("Connected to Database Successfully!");
          });
      } catch (e) {
          alert("Invalid JSON format. Please paste the configuration object exactly as provided by Firebase.");
      }
  };

  // Helper for nested object updates (1 level deep)
  const updateNested = (section: keyof typeof content, key: string, value: string) => {
    setEditContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }));
  };

  // Helper to handle file uploads and convert to base64
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic size check (5MB limit for localStorage safety)
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large! Please upload a file smaller than 5MB to ensure it saves correctly.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <span className="text-amber-500">CMS</span> Admin Panel
        </h1>
        <div className="flex items-center gap-2 md:gap-4">
           {isFirebaseConnected && (
               <span className="hidden md:flex items-center gap-1 text-xs bg-green-900 text-green-200 px-2 py-1 rounded border border-green-700">
                   <Cloud size={12}/> Live Sync Active
               </span>
           )}
          <button 
            onClick={resetContent}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors"
            title="Reset to original content"
          >
            <RotateCcw size={16} /> <span className="hidden md:inline">Reset Defaults</span>
          </button>
          <button 
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors"
          >
            <Save size={18} /> Save Changes
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="bg-white rounded shadow min-h-[600px] flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-gray-200 p-4 flex flex-col gap-2">
            {(['general', 'home', 'about', 'services'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-4 py-3 rounded font-medium capitalize transition-colors ${activeTab === tab ? 'bg-slate-200 text-slate-900' : 'text-gray-600 hover:bg-slate-100'}`}
              >
                {tab} Settings
              </button>
            ))}
            <div className="my-2 border-t border-gray-200"></div>
            <button
                onClick={() => setActiveTab('database')}
                className={`text-left px-4 py-3 rounded font-medium capitalize transition-colors flex items-center gap-2 ${activeTab === 'database' ? 'bg-amber-100 text-amber-900' : 'text-gray-600 hover:bg-slate-100'}`}
              >
                <Database size={16} /> Database
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-150px)]">
            
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">General Settings</h2>
                <div className="grid gap-6">
                  
                  {/* Contact Info Group */}
                  <div className="bg-slate-50 p-4 rounded border border-gray-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><User size={16}/> Basic Info</h3>
                    <div className="grid gap-4">
                      <label className="block">
                        <span className="text-gray-700 text-sm font-bold">Website Tagline</span>
                        <input 
                          type="text" 
                          value={editContent.general.tagline}
                          onChange={e => updateNested('general', 'tagline', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded p-2"
                        />
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="text-gray-700 text-sm font-bold">Phone Number</span>
                          <input 
                            type="text" 
                            value={editContent.general.phone}
                            onChange={e => updateNested('general', 'phone', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                          />
                        </label>
                        <label className="block">
                          <span className="text-gray-700 text-sm font-bold">Email Address</span>
                          <input 
                            type="text" 
                            value={editContent.general.email}
                            onChange={e => updateNested('general', 'email', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* HERO IMAGE EDIT */}
                  <div className="bg-slate-50 p-4 rounded border border-gray-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><ImageIcon size={16}/> Home Hero Image</h3>
                    
                    <label className="block mb-4">
                      <span className="text-gray-700 text-sm font-bold">Upload New Image</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        onChange={(e) => handleFileUpload(e, (base64) => updateNested('general', 'heroImage', base64))}
                      />
                    </label>

                    <label className="block mb-4">
                      <span className="text-gray-700 text-sm font-bold">Or Image URL</span>
                      <input 
                        type="text" 
                        value={editContent.general.heroImage}
                        onChange={e => updateNested('general', 'heroImage', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                        placeholder="https://..."
                      />
                    </label>
                    
                    {editContent.general.heroImage && (
                      <div className="mt-2 h-40 w-full bg-gray-100 overflow-hidden rounded border-2 border-white shadow-md">
                        <img src={editContent.general.heroImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <label className="block">
                    <span className="text-gray-700 text-sm font-bold">Accent Color (Hex)</span>
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="color" 
                        value={editContent.general.accentColor}
                        onChange={e => updateNested('general', 'accentColor', e.target.value)}
                        className="h-10 w-10 p-0 border-0 rounded overflow-hidden"
                      />
                      <input 
                        type="text" 
                        value={editContent.general.accentColor}
                        onChange={e => updateNested('general', 'accentColor', e.target.value)}
                        className="block w-full border border-gray-300 rounded p-2"
                      />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Home Tab */}
            {activeTab === 'home' && (
               <div className="space-y-6 max-w-2xl">
               <h2 className="text-2xl font-bold mb-6 border-b pb-2">Home Page Content</h2>
               
               {/* Maintenance Mode Controls */}
               <div className="bg-orange-50 p-4 rounded border border-orange-200 mb-6">
                 <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                   <AlertTriangle size={18}/> Maintenance Marquee
                 </h3>
                 <div className="grid gap-4">
                   <label className="flex items-center gap-3 p-3 bg-white rounded border border-orange-100 cursor-pointer hover:bg-orange-50 transition-colors">
                     <input 
                       type="checkbox"
                       checked={editContent.home.maintenance.enabled}
                       onChange={(e) => {
                         setEditContent(prev => ({
                           ...prev,
                           home: {
                             ...prev.home,
                             maintenance: {
                               ...prev.home.maintenance,
                               enabled: e.target.checked
                             }
                           }
                         }));
                       }}
                       className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                     />
                     <span className="font-bold text-gray-800">Enable Scrolling Marquee</span>
                   </label>
                   
                   <label className="block">
                     <span className="text-gray-700 text-sm font-bold">Maintenance Till Date (dd/mm/yyyy)</span>
                     <input 
                       type="text"
                       placeholder="e.g. 31/12/2024"
                       value={editContent.home.maintenance.date}
                       onChange={(e) => {
                          setEditContent(prev => ({
                            ...prev,
                            home: {
                              ...prev.home,
                              maintenance: {
                                ...prev.home.maintenance,
                                date: e.target.value
                              }
                            }
                          }));
                       }}
                       className="mt-1 block w-full border border-gray-300 rounded p-2"
                     />
                     <p className="text-xs text-gray-500 mt-1">
                       Preview: "THE WEBSITE IS UNDER MAINTENANCE TILL {editContent.home.maintenance.date}"
                     </p>
                   </label>
                 </div>
               </div>

               <div className="grid gap-4">
                 <label className="block">
                   <span className="text-gray-700 text-sm font-bold">Hero Main Title</span>
                   <input 
                     type="text" 
                     value={editContent.home.heroTitle}
                     onChange={e => updateNested('home', 'heroTitle', e.target.value)}
                     className="mt-1 block w-full border border-gray-300 rounded p-2"
                   />
                 </label>
                 <label className="block">
                   <span className="text-gray-700 text-sm font-bold">Hero Subtitle</span>
                   <textarea 
                     rows={2}
                     value={editContent.home.heroSubtitle}
                     onChange={e => updateNested('home', 'heroSubtitle', e.target.value)}
                     className="mt-1 block w-full border border-gray-300 rounded p-2"
                   />
                 </label>
                 <label className="block">
                   <span className="text-gray-700 text-sm font-bold">Intro Text</span>
                   <textarea 
                     rows={4}
                     value={editContent.home.introText}
                     onChange={e => updateNested('home', 'introText', e.target.value)}
                     className="mt-1 block w-full border border-gray-300 rounded p-2"
                   />
                 </label>
               </div>
             </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-8 max-w-4xl">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">About Page Settings</h2>

                {/* Founder Section */}
                <div className="bg-slate-50 p-6 rounded border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 border-b pb-4 border-gray-200">
                    <User className="text-amber-600" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-none">Founder Profile</h3>
                        <p className="text-xs text-gray-500 mt-1">Edit the main founder details and photo</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                      {/* Image Column */}
                      <div className="w-full md:w-1/3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Profile Picture</label>
                        <div className="aspect-[3/4] bg-gray-200 rounded overflow-hidden mb-4 border-2 border-white shadow-md relative group">
                            {editContent.about.founder.image ? (
                                <img src={editContent.about.founder.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                            )}
                        </div>
                        
                        <label className="block mb-2">
                            <span className="sr-only">Upload</span>
                            <input 
                                type="file"
                                accept="image/*"
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                onChange={(e) => handleFileUpload(e, (base64) => {
                                    setEditContent(prev => ({
                                        ...prev,
                                        about: {
                                            ...prev.about,
                                            founder: { ...prev.about.founder, image: base64 }
                                        }
                                    }))
                                })}
                            />
                        </label>
                        <div className="text-center text-xs text-gray-400 mb-2">- OR -</div>
                        <input 
                            type="text"
                            value={editContent.about.founder.image || ''}
                            onChange={e => {
                                setEditContent(prev => ({
                                    ...prev,
                                    about: {
                                        ...prev.about,
                                        founder: { ...prev.about.founder, image: e.target.value }
                                    }
                                }))
                            }}
                            className="block w-full border border-gray-300 rounded p-1 text-xs"
                            placeholder="Paste Image URL"
                        />
                      </div>

                      {/* Fields Column */}
                      <div className="w-full md:w-2/3 grid gap-4 content-start">
                        <label className="block">
                        <span className="text-gray-700 text-sm font-bold">Founder Name</span>
                        <input 
                            type="text"
                            value={editContent.about.founder.name}
                            onChange={e => {
                                setEditContent(prev => ({
                                    ...prev,
                                    about: {
                                        ...prev.about,
                                        founder: { ...prev.about.founder, name: e.target.value }
                                    }
                                }))
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                        />
                        </label>

                        <label className="block">
                        <span className="text-gray-700 text-sm font-bold">Role</span>
                        <input 
                            type="text"
                            value={editContent.about.founder.role}
                            onChange={e => {
                                setEditContent(prev => ({
                                    ...prev,
                                    about: {
                                        ...prev.about,
                                        founder: { ...prev.about.founder, role: e.target.value }
                                    }
                                }))
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                        />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 text-sm font-bold">Qualifications</span>
                            <input
                                type="text"
                                value={editContent.about.founder.qualifications}
                                onChange={e => {
                                    setEditContent(prev => ({
                                        ...prev,
                                        about: {
                                            ...prev.about,
                                            founder: { ...prev.about.founder, qualifications: e.target.value || '' }
                                        }
                                    }))
                                }}
                                className="mt-1 block w-full border border-gray-300 rounded p-2"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 text-sm font-bold">Bio</span>
                            <textarea
                                rows={8}
                                value={editContent.about.founder.bio}
                                onChange={e => {
                                    setEditContent(prev => ({
                                        ...prev,
                                        about: {
                                            ...prev.about,
                                            founder: { ...prev.about.founder, bio: e.target.value }
                                        }
                                    }))
                                }}
                                className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                            />
                        </label>
                      </div>
                  </div>
                </div>

                {/* Executive Advocates */}
                <div className="bg-slate-50 p-6 rounded border border-gray-200 shadow-sm mt-8">
                    <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                        <div className="flex items-center gap-2">
                            <Users className="text-amber-600" />
                            <h3 className="text-lg font-bold text-slate-900 leading-none">Executive Advocates</h3>
                        </div>
                        <button 
                            onClick={() => {
                                const newExec = {
                                    id: `exec-${Date.now()}`,
                                    name: "New Advocate",
                                    role: "Executive Advocate",
                                    qualifications: "Qualifications",
                                    bio: "Bio..."
                                };
                                setEditContent(prev => ({
                                    ...prev,
                                    about: { ...prev.about, executives: [...prev.about.executives, newExec] }
                                }));
                            }}
                            className="text-sm bg-slate-900 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-slate-800"
                        >
                            <Plus size={14} /> Add Executive
                        </button>
                    </div>
                    
                    <div className="grid gap-6">
                        {editContent.about.executives.map((exec, index) => (
                            <div key={exec.id} className="border p-4 rounded bg-white relative hover:shadow-sm transition-shadow">
                                <button 
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 z-10"
                                    title="Delete Executive"
                                    onClick={() => {
                                        const newExecs = [...editContent.about.executives];
                                        newExecs.splice(index, 1);
                                        setEditContent(prev => ({
                                            ...prev,
                                            about: { ...prev.about, executives: newExecs }
                                        }));
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Name</span>
                                        <input 
                                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                                            value={exec.name}
                                            onChange={(e) => {
                                                const newExecs = [...editContent.about.executives];
                                                newExecs[index].name = e.target.value;
                                                setEditContent(prev => ({ ...prev, about: { ...prev.about, executives: newExecs } }));
                                            }}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Qualifications</span>
                                        <input 
                                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                                            value={exec.qualifications}
                                            onChange={(e) => {
                                                const newExecs = [...editContent.about.executives];
                                                newExecs[index].qualifications = e.target.value;
                                                setEditContent(prev => ({ ...prev, about: { ...prev.about, executives: newExecs } }));
                                            }}
                                        />
                                    </label>
                                    <label className="block md:col-span-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Bio</span>
                                        <textarea 
                                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                                            rows={3}
                                            value={exec.bio}
                                            onChange={(e) => {
                                                const newExecs = [...editContent.about.executives];
                                                newExecs[index].bio = e.target.value;
                                                setEditContent(prev => ({ ...prev, about: { ...prev.about, executives: newExecs } }));
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Chartered Accountants */}
                 <div className="bg-slate-50 p-6 rounded border border-gray-200 shadow-sm mt-8">
                    <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                        <div className="flex items-center gap-2">
                            <Users className="text-amber-600" />
                            <h3 className="text-lg font-bold text-slate-900 leading-none">Chartered Accountants</h3>
                        </div>
                        <button 
                            onClick={() => {
                                const newCA = {
                                    id: `ca-${Date.now()}`,
                                    name: "New CA",
                                    role: "Chartered Accountant",
                                    bio: "Bio..."
                                };
                                setEditContent(prev => ({
                                    ...prev,
                                    about: { ...prev.about, cas: [...prev.about.cas, newCA] }
                                }));
                            }}
                            className="text-sm bg-slate-900 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-slate-800"
                        >
                            <Plus size={14} /> Add CA
                        </button>
                    </div>
                    
                    <div className="grid gap-6">
                        {editContent.about.cas.map((ca, index) => (
                            <div key={ca.id} className="border p-4 rounded bg-white relative hover:shadow-sm transition-shadow">
                                <button 
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 z-10"
                                    title="Delete CA"
                                    onClick={() => {
                                        const newCAs = [...editContent.about.cas];
                                        newCAs.splice(index, 1);
                                        setEditContent(prev => ({
                                            ...prev,
                                            about: { ...prev.about, cas: newCAs }
                                        }));
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                                
                                <div className="grid gap-4">
                                    <label className="block">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Name</span>
                                        <input 
                                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                                            value={ca.name}
                                            onChange={(e) => {
                                                const newCAs = [...editContent.about.cas];
                                                newCAs[index].name = e.target.value;
                                                setEditContent(prev => ({ ...prev, about: { ...prev.about, cas: newCAs } }));
                                            }}
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Bio</span>
                                        <textarea 
                                            className="mt-1 block w-full border border-gray-300 rounded p-2 text-sm"
                                            rows={3}
                                            value={ca.bio}
                                            onChange={(e) => {
                                                const newCAs = [...editContent.about.cas];
                                                newCAs[index].bio = e.target.value;
                                                setEditContent(prev => ({ ...prev, about: { ...prev.about, cas: newCAs } }));
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Associates Text */}
                <div className="bg-slate-50 p-6 rounded border border-gray-200 shadow-sm mt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Associates Network Text</h3>
                    <textarea 
                        className="w-full p-3 border border-gray-300 rounded"
                        rows={3}
                        value={editContent.about.associatesText}
                        onChange={(e) => setEditContent(prev => ({
                            ...prev,
                            about: { ...prev.about, associatesText: e.target.value }
                        }))}
                    />
                </div>

              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
               <div className="space-y-6">
               <div className="flex justify-between items-center mb-6 border-b pb-2">
                 <h2 className="text-2xl font-bold">Services List</h2>
                 <button className="text-sm bg-slate-900 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-slate-800" onClick={() => {
                    const newService = {
                        id: `srv-${Date.now()}`,
                        title: "New Service",
                        description: "Service description...",
                        iconName: "Briefcase",
                        videoUrl: ""
                    };
                    setEditContent(prev => ({ ...prev, services: [...prev.services, newService] }));
                 }}>
                    <Plus size={14} /> Add Service
                 </button>
               </div>
               <div className="grid gap-6">
                 {editContent.services.map((srv, index) => (
                   <div key={srv.id} className="border p-4 rounded bg-gray-50 relative hover:shadow-sm transition-shadow">
                     <button 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                        title="Delete Service"
                        onClick={() => {
                          const newServices = [...editContent.services];
                          newServices.splice(index, 1);
                          setEditContent(prev => ({ ...prev, services: newServices }));
                        }}
                      >
                       <Trash2 size={16} />
                     </button>
                     <div className="grid gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Service Title</label>
                            <input 
                            className="font-bold p-2 border rounded w-full" 
                            value={srv.title}
                            onChange={(e) => {
                                const newServices = [...editContent.services];
                                newServices[index].title = e.target.value;
                                setEditContent(prev => ({...prev, services: newServices}));
                            }}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea 
                            className="p-2 border rounded w-full text-sm" 
                            rows={3}
                            value={srv.description}
                            onChange={(e) => {
                                const newServices = [...editContent.services];
                                newServices[index].description = e.target.value;
                                setEditContent(prev => ({...prev, services: newServices}));
                            }}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Icon Name (Lucide React)</label>
                                <input 
                                className="p-2 border rounded w-full text-xs font-mono" 
                                value={srv.iconName}
                                onChange={(e) => {
                                    const newServices = [...editContent.services];
                                    newServices[index].iconName = e.target.value;
                                    setEditContent(prev => ({...prev, services: newServices}));
                                }}
                                />
                            </div>
                            
                            {/* VIDEO UPLOAD SECTION */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                                    <Video size={12}/> Service Video
                                </label>
                                <div className="space-y-2">
                                     {/* URL Input */}
                                     <input 
                                        className="p-2 border rounded w-full text-xs" 
                                        placeholder="Paste YouTube/Vimeo URL..."
                                        value={srv.videoUrl || ''}
                                        onChange={(e) => {
                                            const newServices = [...editContent.services];
                                            newServices[index].videoUrl = e.target.value;
                                            setEditContent(prev => ({...prev, services: newServices}));
                                        }}
                                     />
                                     
                                     <div className="text-center text-xs text-gray-400 font-bold">- OR -</div>
                                     
                                     {/* File Upload Button */}
                                     <div className="flex items-center gap-2">
                                        <label className="flex-1 cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded p-2 flex items-center justify-center gap-2 transition-colors">
                                            <Upload size={14} />
                                            <span className="text-xs font-bold">Upload Video File (Max 5MB)</span>
                                            <input 
                                                type="file" 
                                                accept="video/*"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, (base64) => {
                                                    const newServices = [...editContent.services];
                                                    newServices[index].videoUrl = base64;
                                                    setEditContent(prev => ({...prev, services: newServices}));
                                                })}
                                            />
                                        </label>
                                        
                                        {srv.videoUrl && (
                                            <button 
                                                onClick={() => {
                                                    const newServices = [...editContent.services];
                                                    newServices[index].videoUrl = "";
                                                    setEditContent(prev => ({...prev, services: newServices}));
                                                }}
                                                className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 border border-red-200"
                                                title="Remove Video"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                     </div>

                                     {/* Status Indicator */}
                                     {srv.videoUrl && (
                                         <div className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 p-1 rounded border border-green-100">
                                             <CheckCircle size={10} /> Video Set
                                             {srv.videoUrl.startsWith('data:') && ' (Uploaded File)'}
                                             {srv.videoUrl.includes('youtube') && ' (YouTube)'}
                                         </div>
                                     )}
                                </div>
                            </div>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
            )}
            
            {/* Database Tab */}
            {activeTab === 'database' && (
                <div className="space-y-6 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-6 border-b pb-2">Database & Sync</h2>
                    
                    <div className="bg-blue-50 p-6 rounded border border-blue-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="text-blue-600 w-8 h-8" />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Connect to Firebase</h3>
                                <p className="text-sm text-gray-600">Sync your changes across all devices in real-time.</p>
                            </div>
                        </div>
                        
                        {connectionSource === 'hardcoded' ? (
                             <div className="bg-green-100 border border-green-300 text-green-800 p-6 rounded text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-green-200 p-3 rounded-full">
                                        <Lock size={32} className="text-green-700" />
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold mb-2">Permanently Connected</h4>
                                <p className="text-sm">
                                    This website is now configured via the source code to connect to the Firebase database automatically.
                                </p>
                                <p className="text-xs mt-2 text-green-700 opacity-75">
                                    Source: <code>PERMANENT_FIREBASE_CONFIG</code> in <code>context/ContentContext.tsx</code>
                                </p>
                             </div>
                        ) : isFirebaseConnected ? (
                            <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded flex items-center gap-2 mb-4">
                                <CheckCircle size={20} />
                                <div>
                                    <p className="font-bold">Connected Successfully (Local)</p>
                                    <p className="text-xs">Your changes are syncing, but only from this browser.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-sm text-gray-700 bg-white p-4 rounded border border-gray-200">
                                    <p className="font-bold mb-2">Instructions:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Firebase Console</a> and create a project.</li>
                                        <li>Create a <strong>Realtime Database</strong> in test mode.</li>
                                        <li>Go to Project Settings -&gt; General -&gt; Your apps.</li>
                                        <li>Select Web (&lt;/&gt;) and register the app.</li>
                                        <li>Copy the <code>firebaseConfig</code> object.</li>
                                        <li>Paste it below.</li>
                                    </ol>
                                </div>
                                
                                <label className="block">
                                    <span className="text-gray-700 text-sm font-bold">Firebase Configuration JSON</span>
                                    <textarea 
                                        rows={8}
                                        value={firebaseConfigInput}
                                        onChange={(e) => setFirebaseConfigInput(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded p-3 font-mono text-xs"
                                        placeholder='{ "apiKey": "...", "authDomain": "...", "databaseURL": "..." }'
                                    />
                                </label>
                                
                                <button 
                                    onClick={handleConnectFirebase}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors w-full"
                                >
                                    Connect to Firebase
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {connectionSource !== 'hardcoded' && (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Important Note</h4>
                            <p className="text-sm text-yellow-800">
                                Currently, this connection is saved to your browser. To make the website work for <strong>everyone</strong> with this database connection, you will eventually need to update the source code with these credentials in <code>context/ContentContext.tsx</code>.
                            </p>
                        </div>
                    )}
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
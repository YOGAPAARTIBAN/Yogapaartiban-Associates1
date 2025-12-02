import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, LogOut, User, Upload, Image as ImageIcon, Users, Video, RotateCcw, CheckCircle, X, AlertTriangle, Database, Cloud, Lock, Copy, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Eye, EyeOff, MapPin } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { content, updateContent, resetContent, isFirebaseConnected, connectionSource, connectToDatabase } = useContent();
  const navigate = useNavigate();
  
  // Local state for form handling
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'home' | 'about' | 'services' | 'database' | 'security'>('general');
  const [firebaseConfigInput, setFirebaseConfigInput] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
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
          let input = firebaseConfigInput.trim();
          let configObject;

          // 1. Try standard JSON parse first
          try {
             configObject = JSON.parse(input);
          } catch (e) {
             // 2. If JSON fails, try to parse as JavaScript Object (handling const x = { ... })
             // Remove variable declarations like "const firebaseConfig =" or "var config ="
             if (input.includes('=')) {
                 input = input.split('=').slice(1).join('=').trim();
             }
             // Remove trailing semicolons
             if (input.endsWith(';')) input = input.slice(0, -1);
             
             // Use Function constructor to safely evaluate the object string
             // This handles unquoted keys and URLs correctly: { key: "value", url: "https://..." }
             try {
                 configObject = new Function('return ' + input)();
             } catch (evalError) {
                 throw new Error("Could not parse configuration object.");
             }
          }

          // Validate keys
          if (!configObject || !configObject.apiKey || !configObject.projectId) {
              alert("Invalid Configuration. Missing apiKey or projectId.");
              return;
          }

          connectToDatabase(configObject, 'local').then(success => {
              if(success) {
                  // Generate the code immediately for display
                  const code = `// COPY THIS BLOCK INTO context/ContentContext.tsx
// REPLACE the existing empty PERMANENT_FIREBASE_CONFIG variable.

const PERMANENT_FIREBASE_CONFIG = {
  apiKey: "${configObject.apiKey || ''}",
  authDomain: "${configObject.authDomain || ''}",
  databaseURL: "${configObject.databaseURL || ''}",
  projectId: "${configObject.projectId || ''}",
  storageBucket: "${configObject.storageBucket || ''}",
  messagingSenderId: "${configObject.messagingSenderId || ''}",
  appId: "${configObject.appId || ''}"
};`;
                  setGeneratedCode(code);
                  alert("Connected to Database Successfully!");
              }
          });
      } catch (e) {
          console.error(e);
          alert("Could not parse the Configuration. Please ensure you are copying the full 'const firebaseConfig = { ... }' block.");
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

  // Helper to generate the deployment code snippet from storage (fallback)
  const getDeploymentCode = () => {
    if (generatedCode) return generatedCode; // Return immediate state if available
    try {
        const localConfig = localStorage.getItem('firebase_config');
        if (!localConfig) return null;
        const configObj = JSON.parse(localConfig);
        
        return `// COPY THIS BLOCK INTO context/ContentContext.tsx
// REPLACE the existing empty PERMANENT_FIREBASE_CONFIG variable.

const PERMANENT_FIREBASE_CONFIG = {
  apiKey: "${configObj.apiKey || ''}",
  authDomain: "${configObj.authDomain || ''}",
  databaseURL: "${configObj.databaseURL || ''}",
  projectId: "${configObj.projectId || ''}",
  storageBucket: "${configObj.storageBucket || ''}",
  messagingSenderId: "${configObj.messagingSenderId || ''}",
  appId: "${configObj.appId || ''}"
};`;
    } catch (e) {
        return null;
    }
  };

  const deploymentCode = getDeploymentCode();

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
            {(['general', 'contact', 'home', 'about', 'services'] as const).map(tab => (
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
            <button
                onClick={() => setActiveTab('security')}
                className={`text-left px-4 py-3 rounded font-medium capitalize transition-colors flex items-center gap-2 ${activeTab === 'security' ? 'bg-red-50 text-red-900' : 'text-gray-600 hover:bg-slate-100'}`}
              >
                <ShieldCheck size={16} /> Security
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-150px)]">
            
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">General Settings</h2>
                <div className="grid gap-6">
                  
                  {/* Basic Branding */}
                  <div className="bg-slate-50 p-4 rounded border border-gray-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><User size={16}/> Branding & Site Info</h3>
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
                </div>
              </div>
            )}

            {/* Contact Settings Tab */}
            {activeTab === 'contact' && (
                <div className="space-y-6 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-6 border-b pb-2">Contact Page Settings</h2>
                    <div className="bg-slate-50 p-6 rounded border border-gray-200">
                         <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MapPin size={16}/> Contact Information</h3>
                         <div className="grid gap-6">
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
                            <label className="block">
                                <span className="text-gray-700 text-sm font-bold">Office Addresses</span>
                                <textarea 
                                    rows={4}
                                    value={editContent.general.address}
                                    onChange={e => updateNested('general', 'address', e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded p-2"
                                    placeholder="List your office locations..."
                                />
                                <p className="text-xs text-gray-500 mt-1">This text appears on the Contact page and Footer.</p>
                            </label>
                         </div>
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
                                {/* Instructions Toggle */}
                                <div className="bg-white rounded border border-blue-200 overflow-hidden">
                                  <button 
                                    onClick={() => setShowGuide(!showGuide)}
                                    className="w-full flex justify-between items-center p-3 bg-blue-100/50 hover:bg-blue-100 text-blue-800 font-bold text-sm transition-colors"
                                  >
                                    <span className="flex items-center gap-2"><HelpCircle size={16}/> How to get the Firebase JSON? (Step-by-Step)</span>
                                    {showGuide ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                  </button>
                                  
                                  {showGuide && (
                                    <div className="p-4 text-sm text-gray-700 space-y-3 bg-white">
                                      <div className="flex gap-3">
                                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                                        <p>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">console.firebase.google.com</a> and login.</p>
                                      </div>
                                      <div className="flex gap-3">
                                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                                        <p>Click <strong>"Create a project"</strong>, name it, and follow the steps (you can skip Analytics).</p>
                                      </div>
                                      <div className="flex gap-3">
                                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                                        <div>
                                          <p>Go to <strong>Build &rarr; Realtime Database</strong> on the left menu.</p>
                                          <p>Click <strong>Create Database</strong> &rarr; Select location &rarr; Next.</p>
                                          <p className="text-red-600 font-bold">IMPORTANT: Select "Start in test mode" and click Enable.</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-3">
                                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                                        <div>
                                          <p>Click the <strong>Gear Icon ⚙️</strong> (Project Settings) at the top left.</p>
                                          <p>Scroll down to "Your apps" and click the <strong>Web icon (&lt;/&gt;)</strong>.</p>
                                          <p>Register the app (any name).</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-3">
                                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">5</span>
                                        <div>
                                          <p>Copy the code inside <code>const firebaseConfig = &#123; ... &#125;;</code></p>
                                          <p>Paste it in the box below.</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <label className="block">
                                    <span className="text-gray-700 text-sm font-bold">Paste Firebase Configuration Here</span>
                                    <textarea 
                                        rows={8}
                                        value={firebaseConfigInput}
                                        onChange={(e) => setFirebaseConfigInput(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded p-3 font-mono text-xs"
                                        placeholder='const firebaseConfig = { ... }'
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
                    
                    {/* DEPLOYMENT CODE GENERATOR - ALWAYS VISIBLE if not hardcoded */}
                    {connectionSource !== 'hardcoded' && (
                        <div className="mt-8 bg-slate-800 text-slate-200 p-6 rounded border border-slate-700 shadow-xl">
                            <h3 className="text-amber-400 font-bold text-lg mb-2 flex items-center gap-2">
                                <Lock size={20} /> DEPLOYMENT CODE GENERATOR
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                To make your database connection work for <strong>public visitors</strong> (Netlify/GitHub Pages), you must copy the code below and paste it into <code>context/ContentContext.tsx</code>.
                            </p>
                            
                            {deploymentCode ? (
                                <div className="relative group">
                                    <pre className="bg-black p-4 rounded text-xs font-mono overflow-x-auto text-green-400 border border-slate-600">
                                        {deploymentCode}
                                    </pre>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(deploymentCode);
                                            alert("Code copied to clipboard!");
                                        }}
                                        className="absolute top-2 right-2 bg-white text-black text-xs font-bold px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
                                    >
                                    <Copy size={12}/> Copy Code
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-slate-700 p-4 rounded text-center text-sm text-slate-400 border border-slate-600">
                                    <p>⚠️ No active configuration found.</p>
                                    <p className="mt-1">Please paste your Firebase JSON in the "Connect to Firebase" section above and click Connect first.</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {connectionSource !== 'hardcoded' && !isFirebaseConnected && (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Important Note</h4>
                            <p className="text-sm text-yellow-800">
                                Currently, this connection is saved to your browser. To make the website work for <strong>everyone</strong> with this database connection, you will eventually need to update the source code with these credentials in <code>context/ContentContext.tsx</code>.
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6 max-w-xl">
                    <h2 className="text-2xl font-bold mb-6 border-b pb-2">Security Settings</h2>
                    
                    <div className="bg-red-50 p-6 rounded border border-red-200">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-red-600 w-8 h-8" />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Admin Credentials</h3>
                                <p className="text-sm text-gray-600">Update the login details for the official admin panel.</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <label className="block">
                                <span className="text-gray-700 text-sm font-bold">New Username</span>
                                <input 
                                    type="text"
                                    value={editContent.credentials?.username || ''}
                                    onChange={(e) => {
                                        setEditContent(prev => ({
                                            ...prev,
                                            credentials: {
                                                ...prev.credentials,
                                                username: e.target.value
                                            }
                                        }));
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded p-3"
                                    placeholder="Enter new username"
                                />
                            </label>

                            <label className="block relative">
                                <span className="text-gray-700 text-sm font-bold">New Password</span>
                                <div className="relative mt-1">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={editContent.credentials?.password || ''}
                                        onChange={(e) => {
                                            setEditContent(prev => ({
                                                ...prev,
                                                credentials: {
                                                    ...prev.credentials,
                                                    password: e.target.value
                                                }
                                            }));
                                        }}
                                        className="block w-full border border-gray-300 rounded p-3 pr-10"
                                        placeholder="Enter new password"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </label>
                            
                            <div className="bg-white p-3 rounded text-xs text-gray-500 border border-gray-200">
                                <strong>Note:</strong> Changes will take effect immediately after saving. Please ensure you remember your new credentials.
                            </div>
                        </div>
                    </div>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
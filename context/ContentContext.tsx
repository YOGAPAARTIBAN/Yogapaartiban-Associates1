import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteContent } from '../types';
import { INITIAL_CONTENT } from '../constants';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, onValue, get } from 'firebase/database';

const PERMANENT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCzL-ygh7T-0pdLq-TL-VEBucGJ6bBu-UI",
  authDomain: "yogapaartiban-web.firebaseapp.com",
  databaseURL: "https://yogapaartiban-web-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "yogapaartiban-web",
  storageBucket: "yogapaartiban-web.firebasestorage.app",
  messagingSenderId: "853696584202",
  appId: "1:853696584202:web:872ea5b3852e00d3d29df3"
};

interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => Promise<void>;
  resetContent: () => void;
  isFirebaseConnected: boolean;
  connectionSource: 'hardcoded' | 'local' | 'none';
  connectToDatabase: (config: any, source?: 'hardcoded' | 'local') => Promise<boolean>;
  getDbRef: (path: string) => any;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [connectionSource, setConnectionSource] = useState<'hardcoded' | 'local' | 'none'>('none');
  const [db, setDb] = useState<any>(null);

  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const savedContent = localStorage.getItem('site_content_v1');
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        return { ...INITIAL_CONTENT, ...parsed };
      }
    } catch (error) {
      console.error("Failed to load content from storage", error);
    }
    return INITIAL_CONTENT;
  });

  useEffect(() => {
    if (PERMANENT_FIREBASE_CONFIG.apiKey && PERMANENT_FIREBASE_CONFIG.databaseURL) {
        connectToDatabase(PERMANENT_FIREBASE_CONFIG, 'hardcoded');
        return;
    }
  }, []);

  const connectToDatabase = async (config: any, source: 'hardcoded' | 'local' = 'local') => {
    try {
      let app = getApps().length === 0 ? initializeApp(config) : getApp();
      const database = getDatabase(app);
      setDb(database);
      setIsFirebaseConnected(true);
      setConnectionSource(source);

      const contentRef = ref(database, 'site_content');
      onValue(contentRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setContent((prev) => {
             // CRITICAL: Deep merge to ensure founder image is not lost
             const merged = { 
                 ...INITIAL_CONTENT,
                 ...prev, 
                 ...data,
                 general: { ...INITIAL_CONTENT.general, ...(prev.general || {}), ...(data.general || {}) },
                 home: { 
                   ...INITIAL_CONTENT.home, 
                   ...(prev.home || {}), 
                   ...(data.home || {}),
                   announcement: { ...INITIAL_CONTENT.home.announcement, ...(prev.home?.announcement || {}), ...(data.home?.announcement || {}) },
                   maintenance: { ...INITIAL_CONTENT.home.maintenance, ...(prev.home?.maintenance || {}), ...(data.home?.maintenance || {}) }
                 },
                 about: { 
                   ...INITIAL_CONTENT.about, 
                   ...(prev.about || {}), 
                   ...(data.about || {}),
                   founder: { 
                     ...INITIAL_CONTENT.about.founder, 
                     ...(prev.about?.founder || {}), 
                     ...(data.about?.founder || {}) 
                   }
                 },
                 disclaimer: { ...INITIAL_CONTENT.disclaimer, ...(prev.disclaimer || {}), ...(data.disclaimer || {}) }
             };
             try { localStorage.setItem('site_content_v1', JSON.stringify(merged)); } catch(e) {}
             return merged;
          });
        }
      });
      return true;
    } catch (error: any) {
      return false;
    }
  };

  const getDbRef = (path: string) => {
      if (!db) return null;
      return ref(db, path);
  };

  const updateContent = async (newContent: SiteContent) => {
    setContent(newContent);
    try { localStorage.setItem('site_content_v1', JSON.stringify(newContent)); } catch (e) {}
    if (isFirebaseConnected && db) {
        return set(ref(db, 'site_content'), newContent);
    }
  };

  const resetContent = () => {
    if (window.confirm('Reset all content to defaults?')) {
      setContent(INITIAL_CONTENT);
      localStorage.removeItem('site_content_v1');
      if (isFirebaseConnected && db) set(ref(db, 'site_content'), INITIAL_CONTENT);
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent, isFirebaseConnected, connectionSource, connectToDatabase, getDbRef }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteContent } from '../types';
import { INITIAL_CONTENT } from '../constants';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

// ------------------------------------------------------------------
// INSTRUCTION: PASTE YOUR FIREBASE CONFIGURATION HERE
// This ensures that all visitors connect to the same database.
// ------------------------------------------------------------------
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
  updateContent: (newContent: Partial<SiteContent>) => void;
  resetContent: () => void;
  isFirebaseConnected: boolean;
  connectionSource: 'hardcoded' | 'local' | 'none';
  connectToDatabase: (config: any, source?: 'hardcoded' | 'local') => Promise<boolean>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for Firebase connection
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [connectionSource, setConnectionSource] = useState<'hardcoded' | 'local' | 'none'>('none');
  const [db, setDb] = useState<any>(null);

  // Initialize state from localStorage if available to persist changes locally first
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const savedContent = localStorage.getItem('site_content_v1');
      if (savedContent) {
        return { ...INITIAL_CONTENT, ...JSON.parse(savedContent) };
      }
    } catch (error) {
      console.error("Failed to load content from storage", error);
    }
    return INITIAL_CONTENT;
  });

  // Effect to check for configuration on load
  useEffect(() => {
    // 1. Check Hardcoded Config (Production)
    if (PERMANENT_FIREBASE_CONFIG.apiKey && PERMANENT_FIREBASE_CONFIG.databaseURL) {
        connectToDatabase(PERMANENT_FIREBASE_CONFIG, 'hardcoded');
        return;
    }

    // 2. Check LocalStorage (Admin/Dev)
    const storedConfig = localStorage.getItem('firebase_config');
    if (storedConfig) {
      try {
        const config = JSON.parse(storedConfig);
        connectToDatabase(config, 'local');
      } catch (e) {
        console.error("Invalid stored firebase config");
      }
    }
  }, []);

  const connectToDatabase = async (config: any, source: 'hardcoded' | 'local' = 'local') => {
    try {
      // Check if apps are already initialized to avoid errors in strict mode
      // Simple strategy: Try to init, if it fails, it might be dup, or use existing
      let app;
      try {
         app = initializeApp(config);
      } catch(e: any) {
         if (e.code === 'app/duplicate-app') {
             // If duplicate, we can ignore or grab existing, but usually context mounts once
             console.warn("Firebase App already initialized");
             return true; 
         }
         throw e;
      }

      const database = getDatabase(app);
      setDb(database);
      setIsFirebaseConnected(true);
      setConnectionSource(source);

      if (source === 'local') {
         localStorage.setItem('firebase_config', JSON.stringify(config));
      }

      // Set up Realtime Listener
      const contentRef = ref(database, 'site_content');
      onValue(contentRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Merge incoming cloud data with current structure
          setContent((prev) => ({ ...prev, ...data }));
          // Also update local storage to keep them in sync
          try {
            localStorage.setItem('site_content_v1', JSON.stringify({ ...content, ...data }));
          } catch(e) {}
        }
      });

      return true;
    } catch (error: any) {
      console.error("Firebase Connection Error", error);
      if (source === 'local') {
          alert("Failed to connect to Firebase. Check your configuration.");
      }
      return false;
    }
  };

  // Save to localStorage whenever content changes (Backup)
  useEffect(() => {
    try {
      localStorage.setItem('site_content_v1', JSON.stringify(content));
    } catch (error) {
      console.error("Failed to save content to storage", error);
    }
  }, [content]);

  const updateContent = (newContent: Partial<SiteContent>) => {
    const updated = { ...content, ...newContent };
    
    // Update State
    setContent(updated);

    // Update Local Storage
    try {
        localStorage.setItem('site_content_v1', JSON.stringify(updated));
    } catch (e) {
        alert("Local storage quota exceeded. Large files might not save locally.");
    }

    // Update Firebase if connected
    if (isFirebaseConnected && db) {
        set(ref(db, 'site_content'), updated).catch(err => {
            console.error("Firebase write failed", err);
            alert("Failed to sync with database. " + err.message);
        });
    }
  };

  const resetContent = () => {
    if (window.confirm('Are you sure you want to reset all content to the original defaults? This cannot be undone.')) {
      setContent(INITIAL_CONTENT);
      localStorage.removeItem('site_content_v1');
      
      if (isFirebaseConnected && db) {
          set(ref(db, 'site_content'), INITIAL_CONTENT);
      }
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent, isFirebaseConnected, connectionSource, connectToDatabase }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
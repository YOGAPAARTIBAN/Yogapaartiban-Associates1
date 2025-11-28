import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import { ContentProvider } from './context/ContentContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ContentProvider>
        <Router>
          <Routes>
            <Route path="/official-login" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
      </ContentProvider>
    </AuthProvider>
  );
};

export default App;
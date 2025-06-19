import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/componentshr/Sidebar';
import { Dashboard } from '@/componentshr/Dashboard';
import { Courses } from '@/componentshr/Courses';
import { Blogs } from '@/componentshr/Blogs';
import { Tests } from '@/componentshr/Tests';

import { Jobs } from '@/componentshr/Jobs';
import { Profile } from '@/componentshr/Profile';
import { Students } from '@/componentshr/Student';
import { Teachers } from '@/componentshr/Teacher';
import { HRs } from '@/componentshr/Hr';
import { ThemeProvider } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';



const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.clear(); 
    sessionStorage.clear();
    setToken(null); 
    window.location.replace("/");  // navigate('/');
  };

  const location = useLocation();
  console.log(location.state);

  useEffect(() => {
    // Load saved section from sessionStorage on mount
    const savedSection = sessionStorage.getItem("activeSection");
    if (savedSection) {
      setActiveSection(savedSection);
    }
  }, []);

  useEffect(() => {
    // Update sessionStorage whenever activeSection changes
    sessionStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  // 📦 Restore from location state (on back navigation)
  useEffect(() => {
    if (location.state?.section) {
      setActiveSection(location.state.section);
    }
  }, [location.state]);

  // Function to render the active section
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'tests':
        return <Tests />;
      
    
       
      
      case 'jobs':
        return <Jobs />;
      case 'blog':
        return <Blogs />;
      case 'students':
        return <Students />;
      case 'teachers':
        return <Teachers />;
      case 'hr':
        return <HRs />;
      case 'profile':
        return <Profile />;
      case 'logout':
        handleLogout();
        return null;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex bg-background">
        <Sidebar activeSection={activeSection} onSectionChange={(section: string) => setActiveSection(section)} />
        <main className={`flex-1 ml-16 md:ml-64 transition-all duration-300 min-h-screen`}>
          {renderSection()}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;

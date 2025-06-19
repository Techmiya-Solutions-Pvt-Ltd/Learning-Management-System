import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Sidebar';

import { Courses } from '@/components/Courses';

import { Blogs } from '@/components/Blogs';

import BlogCreator from '@/components/BlogCreater';
import { Tests } from '@/components/Tests';
import { Assignments } from '@/components/Assignments';
import { Jobs } from '@/components/Jobs';
import { Interview } from '@/components/Interview';
import { Profile } from '@/components/Profile';
import { ThemeProvider } from '@/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import {OffCampusJobs} from '@/components/offcampusjobs';


const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("authToken"));

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.clear(); 
    sessionStorage.clear();
    setToken(null); 
    window.location.replace("/");
  };

  const location = useLocation();
  console.log(location.state);

  useEffect(() => {
    const savedSection = sessionStorage.getItem("activeSection");
    if (savedSection) {
      setActiveSection(savedSection);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  useEffect(() => {
    if (location.state?.section) {
      setActiveSection(location.state.section);
    }
  }, [location.state]);

  const renderSection = () => {
    switch (activeSection) {
      // case 'dashboard':
      //   return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'Blogs':
        return <Blogs />;
      case 'BlogCreater':
        return <BlogCreater />;
      case 'tests':
        return <Tests />;
      case 'assignments':
        return <Assignments />;
      case 'jobs':
        return <Jobs />;
      case 'offcampusjobs':
        return <OffCampusJobs />;
      case 'interview':
        return <Interview />;
      case 'profile':
        return <Profile />;
      case 'manage-profile':
        return <Profile />;
      case 'logout':
        handleLogout();
        return null;
      default:
        return<Courses />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background  ">
        <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 pt-16 min-h-screen">
          {renderSection()}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;
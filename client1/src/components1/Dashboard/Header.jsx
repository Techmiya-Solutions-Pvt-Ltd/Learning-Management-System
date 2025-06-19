import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo.jpeg";



import { 
  BookOpen, 
  Briefcase, 
  User, 
  Menu,
  Settings,
  Home,
  GraduationCap,
  UserCog,
  Shield
} from 'lucide-react';

const Header = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Define navigation items
  const navItems = [
    { id: 'explore', label: 'Courses', icon: Home },
    { id: 'explore1', label: 'Blogs', icon: Home },
    { id: 'opportunities', label: 'Jobs', icon: Briefcase },
    { id: 'teach', label: 'Teach on LMS', icon: BookOpen },
  ];

  // Profile dropdown items
  const profileItems = [
   
    { id: 'login-student', label: 'Login as Student', icon: GraduationCap },
    { id: 'login-teacher', label: 'Login as Teacher', icon: UserCog },
    { id: 'login-hr', label: 'Login as Hr', icon: Shield },
    { id: 'login-admin', label: 'Login as Admin', icon: Shield },
  ];

  const handleProfileAction = (id) => {
    setIsProfileOpen(false);
    switch(id) {
   
      case 'login-student':
        navigate('/login');
        break;
      case 'login-teacher':
        navigate('/loginteacher');
        break;
      case 'login-hr':
          window.open('https://lms-job.onrender.com/loginhr/', '_blank'); // open in new tab
        break;
      case 'login-admin':
        navigate('/loginadmin');
        break;
      case 'logout':
        // Handle logout logic
        break;
      default:
        break;
    }
  };

  const navItemClasses = (isActive) => 
    isActive
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900';

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b shadow-sm bg-white border-gray-200 text-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
<div
  className="flex items-center cursor-pointer"
  onClick={() => window.location.reload()}
>
  <div className="flex-shrink-0">
    <img
      src={logo}
      alt="TechmiyaLMS Logo"
      className="h-8 w-8"
    />
  </div>
  <span className="ml-3 text-xl font-bold text-gray-800">
    Techmiya Ed-Tech
  </span>
</div>



          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${navItemClasses(activeTab === item.id)}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="ml-4 flex items-center">
              <div className="relative">
                <button
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${navItemClasses(false)}`}
                  onClick={toggleProfile}
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg border z-40 bg-white border-gray-200">
                    <div className="py-1">
                      {profileItems.map((item) => (
                        <button
                          key={item.id}
                          className="w-full px-4 py-2 text-sm flex items-center text-gray-700 hover:bg-gray-100"
                          onClick={() => handleProfileAction(item.id)}
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={toggleMenu}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${navItemClasses(activeTab === item.id)}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
            
            {/* Profile dropdown items in mobile */}
            <div className="pt-2 border-t border-gray-200">
              <button
                className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${navItemClasses(false)}`}
                onClick={toggleProfile}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </button>
              
              {isProfileOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {profileItems.map((item) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleProfileAction(item.id);
                        setIsMenuOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Briefcase, 
  User, 
  LogOut,
  Menu,
  Settings,
  Bookmark,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onSectionChange }) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Always reset to light mode on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleJobsDropdown = () => {
    setIsJobsOpen(!isJobsOpen);
  };

  // Define navigation items
  const navItems = [
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'tests', label: 'Tests', icon: FileText },
    { id: 'Blogs', label: 'Blogs', icon: FileText },
  ];

  // Jobs dropdown items
  const jobsItems = [
    { id: 'jobs', label: 'On Campus Jobs', icon: Briefcase },
    { id: 'offcampusjobs', label: 'Off Campus Jobs', icon: Briefcase },
  ];

  // Profile dropdown items
  const profileItems = [
    { id: 'manage-profile', label: 'Manage Profile', icon: Settings },
    { id: 'my-courses', label: 'My Courses', icon: Bookmark },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const handleProfileAction = (id: string) => {
    setIsProfileOpen(false);
    if (id === 'logout') {
      onSectionChange('logout');
    } else {
      onSectionChange(id);
    }
  };

  const handleJobSelection = (id: string) => {
    onSectionChange(id);
    setIsJobsOpen(false);
    if (isMobile) setIsMenuOpen(false);
  };

  const isJobsActive = activeSection === 'jobs' || activeSection === 'offcampusjobs';

  const ThemeToggle = ({ className = '' }) => (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-sidebar z-30 border-b border-gray-200 dark:border-sidebar-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                TL
              </div>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-800 dark:text-sidebar-foreground">
              TechmiyaLMS
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'secondary' : 'ghost'}
                className={`flex items-center ${
                  activeSection === item.id 
                    ? 'bg-blue-50 dark:bg-accent text-blue-600 dark:text-white' 
                    : 'text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
            
            {/* Jobs dropdown */}
            <div className="relative">
              <Button
                variant={isJobsActive ? 'secondary' : 'ghost'}
                className={`flex items-center ${
                  isJobsActive
                    ? 'bg-blue-50 dark:bg-accent text-blue-600 dark:text-white' 
                    : 'text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={toggleJobsDropdown}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs
              
              </Button>
              
              {isJobsOpen && (
                <div className="absolute left-0 mt-1 w-48 origin-top-left bg-white dark:bg-sidebar rounded-md shadow-lg border border-gray-200 dark:border-sidebar-border z-40">
                  <div className="py-1">
                    {jobsItems.map((item) => (
                      <button
                        key={item.id}
                        className={`w-full px-4 py-2 text-sm flex items-center ${
                          activeSection === item.id
                            ? 'bg-blue-50 dark:bg-accent text-blue-600 dark:text-white'
                            : 'text-gray-700 dark:text-sidebar-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handleJobSelection(item.id)}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <div className="ml-4 flex items-center">
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={toggleProfile}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-sidebar rounded-md shadow-lg border border-gray-200 dark:border-sidebar-border z-40">
                    <div className="py-1">
                      {profileItems.map((item) => (
                        <button
                          key={item.id}
                          className="w-full px-4 py-2 text-sm text-gray-700 dark:text-sidebar-foreground hover:bg-gray-100 dark:hover:bg-accent flex items-center"
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
            <ThemeToggle className="mr-2" />
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              <Menu size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-sidebar border-t border-gray-200 dark:border-sidebar-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${
                  activeSection === item.id 
                    ? 'bg-blue-50 dark:bg-accent text-blue-600 dark:text-white' 
                    : 'text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  onSectionChange(item.id);
                  setIsMenuOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
            
            {/* Jobs dropdown in mobile */}
            <div className="w-full">
              <Button
                variant={isJobsActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${
                  isJobsActive
                    ? 'bg-blue-50 dark:bg-accent text-blue-600 dark:text-white' 
                    : 'text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={toggleJobsDropdown}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs
                
              </Button>
              
              {isJobsOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {jobsItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${
                        activeSection === item.id 
                          ? 'bg-blue-50 dark:bg-accent text-blue-600 dark:text-white' 
                          : 'text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleJobSelection(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Profile dropdown items in mobile */}
            <div className="pt-2 border-t border-gray-200 dark:border-sidebar-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={toggleProfile}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              
              {isProfileOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {profileItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="w-full justify-start text-gray-700 dark:text-sidebar-foreground hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleProfileAction(item.id);
                        setIsMenuOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
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
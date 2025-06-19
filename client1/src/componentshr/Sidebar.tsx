import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { 
  BarChart, 
  BookOpen, 
  FileText, 
  ClipboardCheck, 
  Briefcase, 
  Users, 
  User, 
  LogOut,
  Menu,
  ChevronLeft,
  UserCog,
  FileSignature,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'tests', label: 'Tests', icon: FileText },
    { id: 'blog', label: 'Blog', icon: FileSignature },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    
    { id: 'students', label: 'Student Details', icon: Users },
    { id: 'hr', label: 'HR Details', icon: UserCog },
    { id: 'teachers', label: 'Teacher Details', icon: User },
  ];

  const bottomItems = [
    { id: 'profile', label: 'Your Profile', icon: User },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-sidebar z-30 transition-all duration-300 ease-in-out flex flex-col border-r border-sidebar-border ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-sidebar-border">
        <h1
          className={`font-bold text-lg text-sidebar-foreground transition-opacity duration-300 ${
            isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
          }`}
        >
          TechMiya
        </h1>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar-item w-full justify-${isCollapsed ? 'center' : 'start'} ${
                  activeSection === item.id ? 'active' : ''
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <item.icon size={20} />
                <span
                  className={`ml-2 transition-opacity duration-300 ${
                    isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-sidebar-border px-2 py-4">
        <ul className="space-y-1">
          {bottomItems.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar-item w-full justify-${isCollapsed ? 'center' : 'start'} ${
                  activeSection === item.id ? 'active' : ''
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <item.icon size={20} />
                <span
                  className={`ml-2 transition-opacity duration-300 ${
                    isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className={`mt-4 flex ${isCollapsed ? 'justify-center' : 'justify-center'} pt-2 border-t border-sidebar-border`}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

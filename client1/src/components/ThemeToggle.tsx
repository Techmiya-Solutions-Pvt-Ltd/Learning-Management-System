
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full transition-all duration-300"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 text-sidebar-foreground transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-sidebar-foreground transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

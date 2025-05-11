
// src/components/theme-toggle-button.tsx
"use client";

import React from "react";
import { useTheme } from "@/contexts/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null on the server/initial client render to avoid hydration mismatch
    return <Button variant="ghost" className="h-9 w-full justify-start px-2 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center" disabled />;
  }

  return (
    <Button 
        variant="ghost" 
        onClick={toggleTheme} 
        className={cn(
            "h-9 w-full justify-start px-2 text-sm gap-2", // Ensures consistent height, full width, left alignment, padding, text size, and gap
            "group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2" // Collapsed styles
        )}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
        {theme === "light" ? (
            <>
                <Sun className="h-4 w-4" /> {/* Consistent icon size */}
                <span className="group-data-[collapsible=icon]:hidden">Light Mode</span>
            </>
        ) : (
            <>
                <Moon className="h-4 w-4" /> {/* Consistent icon size */}
                <span className="group-data-[collapsible=icon]:hidden">Dark Mode</span>
            </>
        )}
      {/* sr-only text removed as button text is now visible */}
    </Button>
  );
}

    


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
    return <Button variant="ghost" className={cn(
        "h-10 w-full justify-start p-2 text-base gap-2",
        "group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
      )} disabled />;
  }

  return (
    <Button 
        variant="ghost" 
        onClick={toggleTheme} 
        className={cn(
            "h-10 w-full justify-start p-2 text-base gap-2", 
            "group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
        )}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
        {theme === "light" ? (
            <>
                <Sun className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Light Mode</span>
            </>
        ) : (
            <>
                <Moon className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Dark Mode</span>
            </>
        )}
    </Button>
  );
}

    

    
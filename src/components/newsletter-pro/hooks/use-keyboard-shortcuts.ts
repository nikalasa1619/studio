
// src/components/newsletter-pro/hooks/use-keyboard-shortcuts.ts
"use client";

import { useEffect } from 'react';
import type { ContentType, Project, WorkspaceView } from '../types';

interface UseKeyboardShortcutsProps {
  activeProject: Project | null;
  isGenerating: boolean;
  currentOverallView: WorkspaceView;
  activeUITab: ContentType;
  setShowOnlySelected: React.Dispatch<React.SetStateAction<Record<ContentType, boolean>>>;
  // Add more actions/setters here as needed for other shortcuts
}

export function useKeyboardShortcuts({
  activeProject,
  isGenerating,
  currentOverallView,
  activeUITab,
  setShowOnlySelected,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + V to toggle "Show Only Selected"
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v') {
        if (activeProject && !isGenerating && currentOverallView !== 'savedItems') {
          event.preventDefault();
          setShowOnlySelected(prev => ({ ...prev, [activeUITab]: !prev[activeUITab] }));
        }
      }

      // Placeholder for other shortcuts (Cmd/Ctrl + A, S, F, T, N, P)
      // These are more complex as they would need to interact with dropdowns or trigger specific filter/sort actions
      // For now, they are only listed in the dialog.
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (isCmdOrCtrl) {
        switch(key) {
          // case 'a': // Filter by Author
          // case 's': // Sort Items
          // case 'f': // Filter Fact Type
          // case 't': // Filter Tool Type
          // case 'n': // Filter Newsletter Frequency
          // case 'p': // Filter Podcast Frequency
          //   if (activeProject && !isGenerating) {
          //     event.preventDefault();
          //     console.log(`Shortcut ${isCmdOrCtrl ? 'Cmd/Ctrl' : ''}+${key.toUpperCase()} pressed - functionality pending.`);
          //     // Here you would typically open the corresponding dropdown or trigger a filter action.
          //   }
          //   break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProject, activeUITab, isGenerating, currentOverallView, setShowOnlySelected]);
}

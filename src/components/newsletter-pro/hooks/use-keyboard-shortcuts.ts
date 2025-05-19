

// src/components/newsletter-pro/hooks/use-keyboard-shortcuts.ts
"use client";

import { useEffect } from 'react';
import type { ContentType, Project, WorkspaceView, LogEntryType } from '../types';

interface UseKeyboardShortcutsProps {
  activeProject: Project | null;
  isGenerating: boolean;
  currentOverallView: WorkspaceView;
  activeUITab: ContentType;
  setShowOnlySelected: React.Dispatch<React.SetStateAction<Record<ContentType, boolean>>>;
  addLogEntry: (message: string, type?: LogEntryType) => void;
}

export function useKeyboardShortcuts({
  activeProject,
  isGenerating,
  currentOverallView,
  activeUITab,
  setShowOnlySelected,
  addLogEntry,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      // Cmd/Ctrl + V to toggle "Show Only Selected"
      if (isCmdOrCtrl && key === 'v') {
        if (activeProject && !isGenerating && currentOverallView !== 'savedItems') {
          event.preventDefault();
          setShowOnlySelected(prev => {
            const newState = !prev[activeUITab];
            addLogEntry(`Toggled 'Show Only Selected' for ${activeUITab} to ${newState ? 'ON' : 'OFF'} via shortcut.`, 'info');
            return { ...prev, [activeUITab]: newState };
          });
        }
      }
      // Other shortcuts (Cmd/Ctrl + A, S, F, T, N, P) are placeholders in the dialog
      // and not fully implemented here to avoid complexity with dropdown interactions.
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProject, activeUITab, isGenerating, currentOverallView, setShowOnlySelected, addLogEntry]);
}


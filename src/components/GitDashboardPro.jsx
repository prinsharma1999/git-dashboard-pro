import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  BookOpen, 
  BarChart,
  Home,
  Settings,
  Sparkles
} from 'lucide-react';

// Import components
import { 
  AICommandGenerator, 
  LearningView, 
  CommandList, 
  CommandEditor 
} from './index';

// Import hooks and data
import { useLocalStorage } from '../hooks/useLocalStorage';
import { themes } from '../data/themes';
import { tagCategories } from '../data/tagCategories';
import { learningPaths } from '../data/learningPaths';
import { gitCommandsData } from '../data/gitCommandsData';

/**
 * Main Git Dashboard Pro component that serves as the application container
 */
const GitDashboardPro = () => {
  // Theme state management
  const [themeId, setThemeId] = useLocalStorage('gitdashpro-theme', 'light');
  const theme = themes.find(t => t.id === themeId) || themes[0];
  
  // Command state management
  const [commands, setCommands] = useLocalStorage('gitdashpro-commands', gitCommandsData);
  const [currentView, setCurrentView] = useState('home');
  const [editingCommand, setEditingCommand] = useState(null);
  const [showAddCommand, setShowAddCommand] = useState(false);
  
  // Progress tracking
  const [progress, setProgress] = useLocalStorage('gitdashpro-progress', {
    completedLessons: [],
    completedPaths: []
  });
  
  // Apply theme when it changes
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme.id);
  }, [theme]);
  
  // Toggle theme between light and dark
  const toggleTheme = () => {
    setThemeId(themeId === 'light' ? 'dark' : 'light');
  };
  
  // Copy command to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };
  
  // Toggle favorite status for a command
  const toggleFavorite = (commandId) => {
    setCommands(prevCommands => 
      prevCommands.map(cmd => 
        cmd.id === commandId 
          ? { ...cmd, isFavorite: !cmd.isFavorite } 
          : cmd
      )
    );
  };
  
  // Save a new or edited command
  const saveCommand = (commandData) => {
    if (editingCommand) {
      // Update existing command
      setCommands(prevCommands => 
        prevCommands.map(cmd => 
          cmd.id === commandData.id ? commandData : cmd
        )
      );
      setEditingCommand(null);
    } else {
      // Add new command with unique ID
      const newCommand = {
        ...commandData,
        id: Date.now().toString(),
        isFavorite: false
      };
      setCommands(prevCommands => [...prevCommands, newCommand]);
    }
    setShowAddCommand(false);
  };
  
  // Delete a command
  const deleteCommand = (commandId) => {
    setCommands(prevCommands => 
      prevCommands.filter(cmd => cmd.id !== commandId)
    );
  };
  
  // Handle starting to edit a command
  const startEditCommand = (command) => {
    setEditingCommand(command);
    setShowAddCommand(true);
  };
  
  // Handle completing a lesson
  const completeLesson = (lessonId) => {
    setProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId]
    }));
  };
  
  // Determine if a learning path is completed
  const isPathCompleted = (pathId) => {
    const path = learningPaths.find(p => p.id === pathId);
    if (!path) return false;
    
    return path.lessons.every(lesson => 
      progress.completedLessons.includes(lesson.id)
    );
  };
  
  // Handle completing a learning path
  const completePath = (pathId) => {
    if (isPathCompleted(pathId) && !progress.completedPaths.includes(pathId)) {
      setProgress(prev => ({
        ...prev,
        completedPaths: [...prev.completedPaths, pathId]
      }));
    }
  };
  
  // Render the main content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <CommandList
            commands={commands}
            tagCategories={tagCategories}
            onAddCommand={() => {
              setEditingCommand(null);
              setShowAddCommand(true);
            }}
            onCopyCommand={copyToClipboard}
            onEditCommand={startEditCommand}
            onDeleteCommand={deleteCommand}
            onToggleFavorite={toggleFavorite}
          />
        );
      
      case 'learn':
        return (
          <LearningView
            learningPaths={learningPaths}
            progress={progress}
            onCompleteLesson={completeLesson}
            onCompletePath={completePath}
          />
        );
      
      case 'ai':
        return (
          <AICommandGenerator
            onAddCommand={(commandData) => {
              saveCommand({
                ...commandData,
                id: Date.now().toString(),
                isFavorite: false
              });
            }}
          />
        );
      
      case 'stats':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Statistics & Progress</h2>
            {/* Stats content would go here */}
          </div>
        );
      
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            {/* Settings content would go here */}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Git Dashboard Pro</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme.id === 'light' ? (
                <Moon size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-16 md:w-64 bg-white dark:bg-gray-800 shadow-sm flex flex-col">
          <div className="flex-1 py-8 space-y-2">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center w-full px-4 py-3 rounded-lg 
                        ${currentView === 'home' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Home size={20} className="min-w-[20px]" />
              <span className="ml-3 hidden md:inline">Dashboard</span>
            </button>
            
            <button
              onClick={() => setCurrentView('learn')}
              className={`flex items-center w-full px-4 py-3 rounded-lg 
                        ${currentView === 'learn' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <BookOpen size={20} className="min-w-[20px]" />
              <span className="ml-3 hidden md:inline">Learn</span>
            </button>
            
            <button
              onClick={() => setCurrentView('ai')}
              className={`flex items-center w-full px-4 py-3 rounded-lg 
                        ${currentView === 'ai' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Sparkles size={20} className="min-w-[20px]" />
              <span className="ml-3 hidden md:inline">AI Assistant</span>
            </button>
            
            <button
              onClick={() => setCurrentView('stats')}
              className={`flex items-center w-full px-4 py-3 rounded-lg 
                        ${currentView === 'stats' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <BarChart size={20} className="min-w-[20px]" />
              <span className="ml-3 hidden md:inline">Stats</span>
            </button>
            
            <button
              onClick={() => setCurrentView('settings')}
              className={`flex items-center w-full px-4 py-3 rounded-lg 
                        ${currentView === 'settings' 
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Settings size={20} className="min-w-[20px]" />
              <span className="ml-3 hidden md:inline">Settings</span>
            </button>
          </div>
          
          <div className="p-4 hidden md:block">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Git Dashboard Pro v1.0</p>
              <p>Created with ❤️</p>
            </div>
          </div>
        </nav>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Command editor modal */}
      {showAddCommand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CommandEditor
              command={editingCommand}
              tagCategories={tagCategories}
              onSave={saveCommand}
              onCancel={() => {
                setShowAddCommand(false);
                setEditingCommand(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GitDashboardPro; 
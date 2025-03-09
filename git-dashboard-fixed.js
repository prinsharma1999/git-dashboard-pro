// GitDashboardPro.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Save, Trash2, Copy, Star, Edit, Command, GitBranch, GitCommit, GitMerge, 
  GitPullRequest, Terminal, Book, Settings, HelpCircle, ChevronDown, ChevronRight, ChevronLeft,
  Code, CheckCircle, X, Info, AlertTriangle, ArrowRight, Bookmark, Filter, RefreshCw,
  Folder, Clock, Eye, RotateCcw, Download, Upload, FileText, Share, Zap, Award,
  Users, Server, Database, Moon, Sun, BarChart2, Activity, Globe, Target, 
  MessageSquare, Sliders, Tag, Paperclip, Codesandbox, Cpu, ExternalLink, Maximize,
  PlusCircle, PlayCircle, Lock, Unlock, Layers, LifeBuoy, Coffee, ThumbsUp, Sidebar,
  Monitor, Smartphone, Tablet, Layout, MessageCircle, Flag, CornerDownRight, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Custom hooks - Definition added to fix the missing imports
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    }
  
  // Main dashboard return
  return (
    <div 
      className="flex flex-col h-screen"
      style={{ backgroundColor: theme.background.default }}
    >
      {/* Header */}
      <header 
        className="flex justify-between items-center p-4 border-b"
        style={{ 
          backgroundColor: theme.background.paper,
          borderColor: theme.border.main
        }}
      >
        <div className="flex items-center">
          <button
            className="p-2 rounded-lg mr-2 md:hidden"
            style={{ color: theme.text.primary }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
          <div className="flex items-center">
            <GitBranch size={24} className="mr-2" style={{ color: theme.primary.main }} />
            <h1 className="text-xl font-bold" style={{ color: theme.text.primary }}>
              Git Dashboard Pro
            </h1>
          </div>
        </div>
        
        <div className="flex-1 mx-4 max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search git commands... (Ctrl+K)"
              className="w-full py-2 px-4 pl-10 rounded-lg"
              style={{ 
                backgroundColor: theme.background.default,
                color: theme.text.primary,
                borderColor: theme.border.main
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ref={searchRef}
            />
            <Search 
              className="absolute left-3 top-2.5" 
              size={18} 
              style={{ color: theme.text.hint }}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-2.5"
                style={{ color: theme.text.hint }}
                onClick={() => setSearchTerm('')}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-lg"
            style={{ color: theme.text.primary }}
            onClick={() => setShowTerminal(!showTerminal)}
            title="Terminal (Ctrl+/)"
          >
            <Terminal size={20} />
          </button>
          <button
            className="p-2 rounded-lg hidden md:block"
            style={{ color: theme.text.primary }}
            onClick={() => setIsAddingCommand(true)}
            title="Add custom command"
          >
            <Plus size={20} />
          </button>
          <div className="relative">
            <button
              className="p-2 rounded-lg"
              style={{ color: theme.text.primary }}
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            {showSettings && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50 overflow-hidden"
                style={{ 
                  backgroundColor: theme.background.paper,
                  border: `1px solid ${theme.border.main}`
                }}
              >
                <div 
                  className="px-4 py-3 border-b"
                  style={{ borderColor: theme.border.main }}
                >
                  <h3 className="font-semibold" style={{ color: theme.text.primary }}>
                    Settings
                  </h3>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      Theme
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(themes).map(key => (
                        <button
                          key={key}
                          className="px-3 py-2 rounded-lg text-sm transition-colors"
                          style={{ 
                            backgroundColor: themeId === key ? themes[key].primary.main : 'transparent',
                            color: themeId === key ? themes[key].primary.contrast : theme.text.primary,
                            border: `1px solid ${themeId === key ? themes[key].primary.main : theme.border.main}`
                          }}
                          onClick={() => setThemeId(key)}
                        >
                          {themes[key].name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      Display Options
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={userPreferences.showDescriptions} 
                          onChange={() => setUserPreferences({
                            ...userPreferences,
                            showDescriptions: !userPreferences.showDescriptions
                          })}
                          className="mr-2"
                        />
                        <span style={{ color: theme.text.secondary }}>Show descriptions</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={userPreferences.showTags} 
                          onChange={() => setUserPreferences({
                            ...userPreferences,
                            showTags: !userPreferences.showTags
                          })}
                          className="mr-2"
                        />
                        <span style={{ color: theme.text.secondary }}>Show tags</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={userPreferences.showExamples} 
                          onChange={() => setUserPreferences({
                            ...userPreferences,
                            showExamples: !userPreferences.showExamples
                          })}
                          className="mr-2"
                        />
                        <span style={{ color: theme.text.secondary }}>Show examples</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                      Data Management
                    </h4>
                    <div className="space-y-2">
                      <button
                        className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors"
                        style={{ 
                          backgroundColor: 'transparent',
                          color: theme.text.primary,
                          border: `1px solid ${theme.border.main}`
                        }}
                        onClick={exportUserData}
                      >
                        <Download size={14} className="inline-block mr-2" />
                        Export Data
                      </button>
                      <button
                        className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors"
                        style={{ 
                          backgroundColor: 'transparent',
                          color: theme.text.primary,
                          border: `1px solid ${theme.border.main}`
                        }}
                        onClick={() => setActiveModal('import')}
                      >
                        <Upload size={14} className="inline-block mr-2" />
                        Import Data
                      </button>
                      <button
                        className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors"
                        style={{ 
                          backgroundColor: 'transparent',
                          color: theme.status.error,
                          border: `1px solid ${theme.status.error}`
                        }}
                        onClick={resetDashboard}
                      >
                        <RefreshCw size={14} className="inline-block mr-2" />
                        Reset Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`${sidebarOpen ? 'w-64' : 'w-0'} md:w-64 flex-shrink-0 transition-all duration-300 overflow-hidden border-r`}
          style={{ 
            borderColor: theme.border.main
          }}
        >
          <div className="p-2 overflow-y-auto h-full" style={{ backgroundColor: theme.background.elevated }}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 px-2" style={{ color: theme.text.primary }}>
                Categories
              </h2>
              <div className="space-y-1">
                <button
                  className={`w-full flex items-center rounded-lg px-3 py-2 transition-colors ${
                    activeCategory === 'all' ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{ 
                    backgroundColor: activeCategory === 'all' ? theme.primary.main : 'transparent',
                    color: activeCategory === 'all' ? theme.primary.main : theme.text.primary,
                    borderLeft: activeCategory === 'all' ? `3px solid ${theme.primary.main}` : '3px solid transparent'
                  }}
                  onClick={() => setActiveCategory('all')}
                >
                  <Command className="mr-3" />
                  <span>All Commands</span>
                </button>
                <button
                  className={`w-full flex items-center rounded-lg px-3 py-2 transition-colors ${
                    activeCategory === 'favorites' ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{ 
                    backgroundColor: activeCategory === 'favorites' ? theme.primary.main : 'transparent',
                    color: activeCategory === 'favorites' ? theme.primary.main : theme.text.primary,
                    borderLeft: activeCategory === 'favorites' ? `3px solid ${theme.primary.main}` : '3px solid transparent'
                  }}
                  onClick={() => setActiveCategory('favorites')}
                >
                  <Star className="mr-3" />
                  <span>Favorites</span>
                  {favorites.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: theme.primary.main, color: theme.primary.contrast }}>
                      {favorites.length}
                    </span>
                  )}
                </button>
                <button
                  className={`w-full flex items-center rounded-lg px-3 py-2 transition-colors ${
                    activeCategory === 'recent' ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{ 
                    backgroundColor: activeCategory === 'recent' ? theme.primary.main : 'transparent',
                    color: activeCategory === 'recent' ? theme.primary.main : theme.text.primary,
                    borderLeft: activeCategory === 'recent' ? `3px solid ${theme.primary.main}` : '3px solid transparent'
                  }}
                  onClick={() => setActiveCategory('recent')}
                >
                  <Clock className="mr-3" />
                  <span>Recently Used</span>
                  {recentlyUsed.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: theme.primary.main, color: theme.primary.contrast }}>
                      {recentlyUsed.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 px-2" style={{ color: theme.text.primary }}>
                Git Commands
              </h2>
              <div className="space-y-1">
                {Object.keys(commands).map(category => (
                  <button
                    key={category}
                    className={`w-full flex items-center rounded-lg px-3 py-2 transition-colors ${
                      activeCategory === category ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                    }`}
                    style={{ 
                      backgroundColor: activeCategory === category ? theme.primary.main : 'transparent',
                      color: activeCategory === category ? theme.primary.main : theme.text.primary,
                      borderLeft: activeCategory === category ? `3px solid ${theme.primary.main}` : '3px solid transparent'
                    }}
                    onClick={() => setActiveCategory(category)}
                  >
                    <span className="capitalize">{category}</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: theme.background.default, color: theme.text.secondary }}>
                      {commands[category].length}
                    </span>
                  </button>
                ))}
                <button
                  className={`w-full flex items-center rounded-lg px-3 py-2 transition-colors ${
                    activeCategory === 'custom' ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{ 
                    backgroundColor: activeCategory === 'custom' ? theme.primary.main : 'transparent',
                    color: activeCategory === 'custom' ? theme.primary.main : theme.text.primary,
                    borderLeft: activeCategory === 'custom' ? `3px solid ${theme.primary.main}` : '3px solid transparent'
                  }}
                  onClick={() => setActiveCategory('custom')}
                >
                  <Edit className="mr-3" />
                  <span>Custom Commands</span>
                  {customCommands.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: theme.primary.main, color: theme.primary.contrast }}>
                      {customCommands.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 px-2" style={{ color: theme.text.primary }}>
                Other Views
              </h2>
              <div className="space-y-1">
                <button
                  className={`w-full flex items-center rounded-lg px-3 py-2 transition-colors ${
                    view === 'workflows' ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{ 
                    backgroundColor: view === 'workflows' ? theme.primary.main : 'transparent',
                    color: view === 'workflows' ? theme.primary.main : theme.text.primary,
                    borderLeft: view === 'workflows' ? `3px solid ${theme.primary.main}` : '3px solid transparent'
                  }}
                  onClick={() => setView('workflows')}
                >
                  <GitPullRequest className="mr-3" />
                  <span>Git Workflows</span>
                </button>
                <button
                  className={`w-full flex items-center rounded-lg px-3 py-2 transition-colors ${
                    view === 'scenarios' ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{ 
                    backgroundColor: view === 'scenarios' ? theme.primary.main : 'transparent',
                    color: view === 'scenarios' ? theme.primary.main : theme.text.primary,
                    borderLeft: view === 'scenarios' ? `3px solid ${theme.primary.main}` : '3px solid transparent'
                  }}
                  onClick={() => setView('scenarios')}
                >
                  <HelpCircle className="mr-3" />
                  <span>Common Scenarios</span>
                </button>
                <button
                  className={`w-full flex items-center rounded-lg px-3 py-2 transition-colors ${
                    view === 'tutorials' ? 'bg-opacity-10' : 'hover:bg-opacity-5'
                  }`}
                  style={{ 
                    backgroundColor: view === 'tutorials' ? theme.primary.main : 'transparent',
                    color: view === 'tutorials' ? theme.primary.main : theme.text.primary,
                    borderLeft: view === 'tutorials' ? `3px solid ${theme.primary.main}` : '3px solid transparent'
                  }}
                  onClick={() => setView('tutorials')}
                >
                  <Book className="mr-3" />
                  <span>Tutorials</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Tag filters */}
          {availableTags.length > 0 && (
            <div 
              className="p-2 border-b overflow-x-auto whitespace-nowrap"
              style={{ 
                backgroundColor: theme.background.paper,
                borderColor: theme.border.main
              }}
            >
              <div className="flex items-center space-x-2">
                <span style={{ color: theme.text.hint }}>Filter by:</span>
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    className={`px-2 py-1 rounded-full text-xs flex items-center transition-colors`}
                    style={{ 
                      backgroundColor: filterTags.includes(tag.id) ? tag.color : 'transparent',
                      color: filterTags.includes(tag.id) ? 'white' : theme.text.secondary,
                      border: `1px solid ${filterTags.includes(tag.id) ? tag.color : theme.border.main}`
                    }}
                    onClick={() => {
                      if (filterTags.includes(tag.id)) {
                        setFilterTags(filterTags.filter(t => t !== tag.id));
                      } else {
                        setFilterTags([...filterTags, tag.id]);
                      }
                    }}
                  >
                    {tag.icon && <span className="mr-1">{tag.icon}</span>}
                    {tag.name}
                  </button>
                ))}
                
                {filterTags.length > 0 && (
                  <button
                    className="px-2 py-1 rounded-full text-xs transition-colors"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: theme.text.secondary,
                      border: `1px solid ${theme.border.main}`
                    }}
                    onClick={() => setFilterTags([])}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Content area */}
          <div className="flex-1 overflow-hidden flex">
            <div className="flex-1 overflow-y-auto">
              {view === 'commands' && (
                <div className="p-4">
                  {activeCategory === 'favorites' && favorites.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 p-8">
                      <Star size={64} style={{ color: theme.text.hint }} />
                      <h3 className="text-xl font-semibold mt-4" style={{ color: theme.text.primary }}>No favorites yet</h3>
                      <p className="text-center mt-2" style={{ color: theme.text.secondary }}>
                        Star your favorite commands to access them quickly.
                      </p>
                    </div>
                  )}
                  
                  {activeCategory === 'favorites' && favorites.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map(id => {
                        const command = getCommandById(id);
                        if (!command) return null;
                        return <CommandCard key={id} command={command} showCategory={true} />;
                      })}
                    </div>
                  )}
                  
                  {activeCategory === 'recent' && recentlyUsed.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 p-8">
                      <Clock size={64} style={{ color: theme.text.hint }} />
                      <h3 className="text-xl font-semibold mt-4" style={{ color: theme.text.primary }}>No recent commands</h3>
                      <p className="text-center mt-2" style={{ color: theme.text.secondary }}>
                        Commands you use will appear here for easy access.
                      </p>
                    </div>
                  )}
                  
                  {activeCategory === 'recent' && recentlyUsed.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentlyUsed.map(id => {
                        const command = getCommandById(id);
                        if (!command) return null;
                        return <CommandCard key={id} command={command} showCategory={true} />;
                      })}
                    </div>
                  )}
                  
                  {activeCategory === 'custom' && customCommands.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 p-8">
                      <Edit size={64} style={{ color: theme.text.hint }} />
                      <h3 className="text-xl font-semibold mt-4" style={{ color: theme.text.primary }}>No custom commands</h3>
                      <p className="text-center mt-2" style={{ color: theme.text.secondary }}>
                        Create your own commands for specific workflows.
                      </p>
                      <button
                        className="mt-4 px-4 py-2 rounded-lg"
                        style={{ 
                          backgroundColor: theme.primary.main,
                          color: theme.primary.contrast
                        }}
                        onClick={() => setIsAddingCommand(true)}
                      >
                        <Plus size={16} className="inline-block mr-2" />
                        Create Command
                      </button>
                    </div>
                  )}
                  
                  {activeCategory === 'custom' && customCommands.length > 0 && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold" style={{ color: theme.text.primary }}>
                          Custom Commands
                        </h2>
                        <button
                          className="px-4 py-2 rounded-lg"
                          style={{ 
                            backgroundColor: theme.primary.main,
                            color: theme.primary.contrast
                          }}
                          onClick={() => setIsAddingCommand(true)}
                        >
                          <Plus size={16} className="inline-block mr-2" />
                          Add Command
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customCommands.map(command => (
                          <CommandCard key={command.id} command={{ ...command, category: 'custom' }} />
                        ))}
                      </div>
                    </>
                  )} catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Themes configuration with extended color schemes
const themes = {
  light: {
    id: 'light',
    name: 'Light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrast: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
      elevated: '#f1f5f9',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      hint: '#94a3b8',
      disabled: '#cbd5e1',
    },
    border: {
      light: '#e2e8f0',
      main: '#cbd5e1',
      dark: '#94a3b8',
    },
    status: {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#0ea5e9',
    },
    syntax: {
      keyword: '#8956FF',
      string: '#22c55e',
      function: '#3b82f6',
      comment: '#64748b',
      variable: '#f59e0b',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrast: '#0f172a',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
      elevated: '#334155',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      hint: '#94a3b8',
      disabled: '#64748b',
    },
    border: {
      light: '#334155',
      main: '#475569',
      dark: '#64748b',
    },
    status: {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#0ea5e9',
    },
    syntax: {
      keyword: '#c084fc',
      string: '#4ade80',
      function: '#60a5fa',
      comment: '#94a3b8',
      variable: '#fbbf24',
    },
  },
  github: {
    id: 'github',
    name: 'GitHub',
    primary: {
      main: '#2188ff',
      light: '#58a6ff',
      dark: '#1f6feb',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#6a737d',
      light: '#8b949e',
      dark: '#586069',
      contrast: '#ffffff',
    },
    background: {
      default: '#f6f8fa',
      paper: '#ffffff',
      elevated: '#f1f5f9',
    },
    text: {
      primary: '#24292e',
      secondary: '#586069',
      hint: '#8b949e',
      disabled: '#afb8c1',
    },
    border: {
      light: '#eaecef',
      main: '#e1e4e8',
      dark: '#d1d5da',
    },
    status: {
      success: '#28a745',
      error: '#d73a49',
      warning: '#ffbc0b',
      info: '#0366d6',
    },
    syntax: {
      keyword: '#d73a49',
      string: '#28a745',
      function: '#0366d6',
      comment: '#6a737d',
      variable: '#e36209',
    },
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    primary: {
      main: '#bd93f9',
      light: '#d8b9ff',
      dark: '#9580ff',
      contrast: '#282a36',
    },
    secondary: {
      main: '#6272a4',
      light: '#7b89b9',
      dark: '#4d5b8c',
      contrast: '#f8f8f2',
    },
    background: {
      default: '#282a36',
      paper: '#44475a',
      elevated: '#6272a4',
    },
    text: {
      primary: '#f8f8f2',
      secondary: '#d8d8d2',
      hint: '#bfbfb2',
      disabled: '#6272a4',
    },
    border: {
      light: '#44475a',
      main: '#6272a4',
      dark: '#8293c8',
    },
    status: {
      success: '#50fa7b',
      error: '#ff5555',
      warning: '#ffb86c',
      info: '#8be9fd',
    },
    syntax: {
      keyword: '#ff79c6',
      string: '#f1fa8c',
      function: '#50fa7b',
      comment: '#6272a4',
      variable: '#8be9fd',
    },
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    primary: {
      main: '#88c0d0',
      light: '#8fbcbb',
      dark: '#81a1c1',
      contrast: '#2e3440',
    },
    secondary: {
      main: '#81a1c1',
      light: '#88c0d0',
      dark: '#5e81ac',
      contrast: '#eceff4',
    },
    background: {
      default: '#2e3440',
      paper: '#3b4252',
      elevated: '#434c5e',
    },
    text: {
      primary: '#eceff4',
      secondary: '#e5e9f0',
      hint: '#d8dee9',
      disabled: '#4c566a',
    },
    border: {
      light: '#434c5e',
      main: '#4c566a',
      dark: '#5e6779',
    },
    status: {
      success: '#a3be8c',
      error: '#bf616a',
      warning: '#ebcb8b',
      info: '#88c0d0',
    },
    syntax: {
      keyword: '#81a1c1',
      string: '#a3be8c',
      function: '#8fbcbb',
      comment: '#4c566a',
      variable: '#d8dee9',
    },
  },
  solarized: {
    id: 'solarized',
    name: 'Solarized',
    primary: {
      main: '#268bd2',
      light: '#2aa198',
      dark: '#6c71c4',
      contrast: '#fdf6e3',
    },
    secondary: {
      main: '#93a1a1',
      light: '#eee8d5',
      dark: '#839496',
      contrast: '#002b36',
    },
    background: {
      default: '#fdf6e3',
      paper: '#eee8d5',
      elevated: '#ded9c7',
    },
    text: {
      primary: '#073642',
      secondary: '#586e75',
      hint: '#839496',
      disabled: '#93a1a1',
    },
    border: {
      light: '#eee8d5',
      main: '#93a1a1',
      dark: '#839496',
    },
    status: {
      success: '#859900',
      error: '#dc322f',
      warning: '#b58900',
      info: '#268bd2',
    },
    syntax: {
      keyword: '#cb4b16',
      string: '#859900',
      function: '#268bd2',
      comment: '#93a1a1',
      variable: '#b58900',
    },
  },
};

// Enhanced tag system with hierarchical categories
const tagCategories = [
  {
    id: 'skill',
    name: 'Skill Level',
    color: '#4ade80',
    tags: [
      { id: 'beginner', name: 'Beginner', color: '#34D399', icon: <Target size={14} /> },
      { id: 'intermediate', name: 'Intermediate', color: '#10B981', icon: <Award size={14} /> },
      { id: 'advanced', name: 'Advanced', color: '#059669', icon: <Zap size={14} /> },
      { id: 'expert', name: 'Expert', color: '#047857', icon: <Award size={14} /> },
    ]
  },
  {
    id: 'context',
    name: 'Context',
    color: '#60a5fa',
    tags: [
      { id: 'setup', name: 'Setup', color: '#3B82F6', icon: <Settings size={14} /> },
      { id: 'local', name: 'Local', color: '#2563EB', icon: <Folder size={14} /> },
      { id: 'remote', name: 'Remote', color: '#1D4ED8', icon: <Server size={14} /> },
      { id: 'teamwork', name: 'Team Collaboration', color: '#1E40AF', icon: <Users size={14} /> },
    ]
  },
  {
    id: 'operation',
    name: 'Operation Type',
    color: '#f472b6',
    tags: [
      { id: 'branching', name: 'Branching', color: '#EC4899', icon: <GitBranch size={14} /> },
      { id: 'commits', name: 'Commits', color: '#DB2777', icon: <GitCommit size={14} /> },
      { id: 'merging', name: 'Merging', color: '#BE185D', icon: <GitMerge size={14} /> },
      { id: 'history', name: 'History', color: '#9D174D', icon: <Clock size={14} /> },
    ]
  },
  {
    id: 'safety',
    name: 'Safety',
    color: '#fbbf24',
    tags: [
      { id: 'safe', name: 'Safe', color: '#F59E0B', icon: <Lock size={14} /> },
      { id: 'caution', name: 'Use with Caution', color: '#D97706', icon: <AlertTriangle size={14} /> },
      { id: 'dangerous', name: 'Potentially Destructive', color: '#EF4444', icon: <AlertTriangle size={14} /> },
    ]
  },
  {
    id: 'purpose',
    name: 'Purpose',
    color: '#c084fc',
    tags: [
      { id: 'fix', name: 'Fix & Troubleshoot', color: '#8B5CF6', icon: <LifeBuoy size={14} /> },
      { id: 'optimize', name: 'Optimization', color: '#7C3AED', icon: <Zap size={14} /> },
      { id: 'workflow', name: 'Workflow', color: '#6D28D9', icon: <GitPullRequest size={14} /> },
      { id: 'maintenance', name: 'Maintenance', color: '#5B21B6', icon: <LifeBuoy size={14} /> },
    ]
  },
];

// Combine all tags into a flat array for easy access
const availableTags = tagCategories.flatMap(category => 
  category.tags.map(tag => ({
    ...tag,
    categoryId: category.id,
    categoryName: category.name,
    categoryColor: category.color
  }))
);

// Define initial git command data (abbreviated for clarity)
const gitCommandsData = {
  setup: [
    { 
      id: 'config-name', 
      command: 'git config --global user.name "[name]"', 
      description: 'Set the name you want attached to your commits',
      longDescription: 'Sets the name that will be attached to your commits and tags. This should be your real name or a consistent pseudonym, not your username. This information becomes part of the immutable commit metadata.',
      tags: ['beginner', 'setup'],
      examples: [
        { description: 'Set your username', command: 'git config --global user.name "John Doe"' }
      ],
      options: [
        { flag: '--global', description: 'Sets the config for all repos' },
        { flag: '--local', description: 'Sets the config for the current repo only' },
        { flag: '--system', description: 'Sets the config for all users on the system' }
      ],
      relatedCommands: ['config-email', 'config-editor'],
      links: [
        { title: 'Git Config Documentation', url: 'https://git-scm.com/docs/git-config' },
        { title: 'First-Time Git Setup Guide', url: 'https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup' }
      ],
      tips: ['Always set your name before making your first commit', 'Consider using the same name across different services for consistency'],
      category: 'setup',
      subcategory: 'identity',
      usage: 0,
      favorite: false,
      lastUsed: null,
      usageByWeekday: [0, 0, 0, 0, 0, 0, 0], // Sun-Sat
      usageByHour: Array(24).fill(0),
      usageHistory: [] // Will store {date, count} objects
    }
  ],
  basic: [
    { 
      id: 'init', 
      command: 'git init', 
      description: 'Initialize a local Git repository',
      longDescription: 'Creates a new Git repository in the current directory, which includes a .git subdirectory with all the metadata needed for version tracking. This allows you to start tracking files and making commits.',
      tags: ['beginner', 'setup', 'local'],
      examples: [
        { description: 'Initialize a repo in current directory', command: 'git init' },
        { description: 'Initialize a repo in a specific directory', command: 'git init [directory]' },
        { description: 'Initialize a bare repository', command: 'git init --bare' }
      ],
      options: [
        { flag: '--bare', description: 'Create a repository without a working directory' },
        { flag: '--quiet, -q', description: 'Only print error and warning messages' },
        { flag: '--template=<directory>', description: 'Specify a custom template directory' },
        { flag: '--separate-git-dir=<gitdir>', description: 'Create the .git directory at the specified path' }
      ],
      relatedCommands: ['clone', 'config'],
      links: [
        { title: 'Git Init Documentation', url: 'https://git-scm.com/docs/git-init' },
        { title: 'Getting Started with Git', url: 'https://git-scm.com/book/en/v2/Getting-Started-Git-Basics' }
      ],
      tips: ['Use .gitignore to exclude files you don\'t want to track', 'Initialize repositories at the root of your project, not in subdirectories'],
      category: 'basic',
      subcategory: 'create',
      usage: 0,
      favorite: false,
      lastUsed: null,
      usageByWeekday: [0, 0, 0, 0, 0, 0, 0],
      usageByHour: Array(24).fill(0),
      usageHistory: []
    }
  ],
  branches: [
    { 
      id: 'branch', 
      command: 'git branch', 
      description: 'List, create, or delete branches',
      longDescription: 'Branches allow you to develop features, fix bugs, or experiment safely in a container isolated from other work. The branch command lets you manage branches by listing, creating, renaming, and deleting them.',
      tags: ['beginner', 'local', 'branching'],
      examples: [
        { description: 'List local branches (current branch highlighted)', command: 'git branch' },
        { description: 'List remote branches', command: 'git branch -r' },
        { description: 'List both local and remote branches', command: 'git branch -a' },
        { description: 'Create a new branch', command: 'git branch feature-branch' },
        { description: 'Delete a branch (after merging)', command: 'git branch -d feature-branch' },
        { description: 'Force delete a branch (even if not merged)', command: 'git branch -D feature-branch' },
        { description: 'Rename current branch', command: 'git branch -m new-name' }
      ],
      options: [
        { flag: '-a, --all', description: 'List both remote-tracking and local branches' },
        { flag: '-r, --remotes', description: 'List remote-tracking branches' },
        { flag: '-v, --verbose', description: 'Show commit SHA1 and subject line for each branch' },
        { flag: '-d, --delete', description: 'Delete a branch (safe)' },
        { flag: '-D, --delete --force', description: 'Force delete a branch' },
        { flag: '-m, --move', description: 'Rename a branch' },
        { flag: '--no-merged', description: 'List branches not merged into HEAD' },
        { flag: '--merged', description: 'List branches merged into HEAD' }
      ],
      relatedCommands: ['checkout', 'merge', 'push', 'fetch'],
      links: [
        { title: 'Git Branch Documentation', url: 'https://git-scm.com/docs/git-branch' },
        { title: 'Git Branching Basics', url: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell' }
      ],
      tips: [
        'Use descriptive branch names like "feature/user-authentication" or "bugfix/login-error"',
        'Clean up branches after they\'re merged to avoid accumulating outdated references',
        'Use --no-merged to find branches that need attention before deletion'
      ],
      category: 'branches',
      subcategory: 'manage',
      usage: 0,
      favorite: false,
      lastUsed: null,
      usageByWeekday: [0, 0, 0, 0, 0, 0, 0],
      usageByHour: Array(24).fill(0),
      usageHistory: []
    }
  ]
};

// Simplified Git workflows data
const gitWorkflows = {
  gitFlow: {
    name: 'Git Flow',
    description: 'A robust branching model designed for managing larger projects with scheduled releases',
    branches: [
      { name: 'master', type: 'permanent', color: '#E11D48', description: 'Main production branch, contains release code only' },
      { name: 'develop', type: 'permanent', color: '#8B5CF6', description: 'Main development branch, contains latest development code' },
      { name: 'feature/*', type: 'temporary', color: '#10B981', description: 'Feature branches, one per feature development' },
      { name: 'release/*', type: 'temporary', color: '#F59E0B', description: 'Release preparation branches, for finalization before production' },
      { name: 'hotfix/*', type: 'temporary', color: '#EF4444', description: 'Urgent fixes for production code' }
    ],
    flowRules: [
      { from: 'develop', to: 'feature/*', description: 'Create feature branches from develop' },
      { from: 'feature/*', to: 'develop', description: 'Merge completed features back to develop' },
      { from: 'develop', to: 'release/*', description: 'Branch releases from develop when ready' },
      { from: 'release/*', to: ['master', 'develop'], description: 'Merge releases to both master and develop' },
      { from: 'master', to: 'hotfix/*', description: 'Create hotfixes from master for critical bugs' },
      { from: 'hotfix/*', to: ['master', 'develop'], description: 'Merge hotfixes to both master and develop' }
    ],
    steps: [
      {
        name: 'Initialize Git Flow',
        description: 'Set up the Git Flow structure in your repository',
        commands: [
          { command: 'git flow init', description: 'Initialize Git Flow with default branch names' },
          { command: 'git flow init -d', description: 'Initialize Git Flow with default values for all questions' }
        ]
      },
      {
        name: 'Feature Development',
        description: 'Create and develop new features in isolation',
        commands: [
          { command: 'git flow feature start feature-name', description: 'Create a new feature branch' },
          { command: 'git flow feature publish feature-name', description: 'Push feature branch to remote repository' },
          { command: 'git flow feature finish feature-name', description: 'Merge feature back to develop and delete the branch' }
        ]
      }
    ],
    bestPractices: [
      'Always keep master identical to production code',
      'Never commit directly to master or develop branches',
      'Use release branches for QA, testing, and release preparation'
    ],
    advantages: [
      'Well-defined structure for large teams',
      'Great for projects with scheduled releases'
    ],
    disadvantages: [
      'Complex and potentially overhead for smaller projects',
      'Long-lived branches can lead to integration challenges'
    ]
  },
  githubFlow: {
    name: 'GitHub Flow',
    description: 'A lightweight, branch-based workflow built around regular deployments',
    branches: [
      { name: 'main', type: 'permanent', color: '#10B981', description: 'The primary branch that always contains deployable code' },
      { name: 'feature/*', type: 'temporary', color: '#8B5CF6', description: 'Feature or fix branches that branch from and merge back to main' }
    ],
    flowRules: [
      { from: 'main', to: 'feature/*', description: 'Create feature branches from main' },
      { from: 'feature/*', to: 'main', description: 'Merge back to main via pull request when complete' }
    ],
    steps: [
      {
        name: 'Branch',
        description: 'Create a branch for new work from main',
        commands: [
          { command: 'git checkout main', description: 'Switch to the main branch' },
          { command: 'git pull origin main', description: 'Get latest changes from remote' },
          { command: 'git checkout -b descriptive-branch-name', description: 'Create and switch to a new branch' }
        ]
      }
    ],
    bestPractices: [
      'Branch names should be descriptive of the work being done',
      'Commit early and often with clear messages'
    ],
    advantages: [
      'Simple and easy to understand',
      'Works well with GitHub\'s pull request model'
    ],
    disadvantages: [
      'Less structured than Git Flow',
      'Not ideal for projects that need to maintain multiple versions'
    ]
  }
};

// Simplified scenarios data
const gitScenarios = [
  {
    id: 'committed-wrong-branch',
    title: 'Committed to the wrong branch',
    description: 'You made a commit on one branch but intended to commit to another branch',
    solutions: [
      {
        title: 'Using cherry-pick (preferred for a single commit)',
        steps: [
          '1. Note the commit hash you want to move',
          '2. Switch to the correct branch',
          '3. Cherry-pick the commit to the new branch',
          '4. Switch back to the original branch',
          '5. Reset to remove the commit from the wrong branch'
        ],
        commands: [
          { command: 'git log', description: 'Find the commit hash' },
          { command: 'git checkout correct-branch', description: 'Switch to the correct branch' },
          { command: 'git cherry-pick abc1234', description: 'Apply the commit to the correct branch' },
          { command: 'git checkout wrong-branch', description: 'Go back to the original branch' },
          { command: 'git reset --hard HEAD~1', description: 'Remove the commit from the wrong branch' }
        ],
        safetyLevel: 'caution',
        notes: 'This approach creates a new commit on the target branch with the same changes but a different commit hash'
      }
    ]
  }
];

// Tutorial data
const DummyTutorialData = {
  tutorials: [
    {
      id: 'basics',
      title: 'Git Basics',
      description: 'Learn the essential Git commands and workflows',
      duration: '30 minutes',
      level: 'Beginner',
      modules: [
        { id: 'what-is-git', title: 'What is Git?', duration: '5 min' },
        { id: 'first-commit', title: 'Your First Commit', duration: '10 min' },
        { id: 'branching', title: 'Branching Basics', duration: '15 min' }
      ]
    }
  ]
};

// Main GitDashboardPro Component
const GitDashboardPro = () => {
  // Core state management
  const [initializing, setInitializing] = useState(true);
  const [themeId, setThemeId] = useLocalStorage('themeId', 'dark');
  const [theme, setTheme] = useState(themes[themeId]);
  const [view, setView] = useLocalStorage('dashboardView', 'commands');
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebarOpen', true);
  const [rightPanelOpen, setRightPanelOpen] = useLocalStorage('rightPanelOpen', false);
  const [rightPanelView, setRightPanelView] = useLocalStorage('rightPanelView', 'details');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [activeCategory, setActiveCategory] = useLocalStorage('activeCategory', 'basic');
  const [activeSectionId, setActiveSectionId] = useLocalStorage('activeSectionId', null);
  const [commandDetailId, setCommandDetailId] = useState(null);
  const [commands, setCommands] = useLocalStorage('gitCommands', gitCommandsData);
  const [customCommands, setCustomCommands] = useLocalStorage('customCommands', []);
  const [recentlyUsed, setRecentlyUsed] = useLocalStorage('recentlyUsed', []);
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [viewMode, setViewMode] = useLocalStorage('viewMode', 'grid'); // grid, list, compact
  const [sortBy, setSortBy] = useLocalStorage('sortBy', 'category'); // category, name, usage, recent
  const [commandHistory, setCommandHistory] = useLocalStorage('commandHistory', []);
  const [workflowView, setWorkflowView] = useLocalStorage('workflowView', 'gitFlow');
  const [showOnboarding, setShowOnboarding] = useLocalStorage('showOnboarding', true);
  const [userPreferences, setUserPreferences] = useLocalStorage('userPreferences', {
    fontSize: 'medium', // small, medium, large
    codeColorization: true,
    showDescriptions: true,
    showExamples: true,
    showTags: true,
    showTips: true,
    showRelated: true,
    autoSuggestions: true,
    analyticsEnabled: true,
    tutorialMode: false,
    terminalPreferences: {
      fontFamily: 'Menlo, monospace',
      showLineNumbers: true,
      darkTheme: true
    }
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [isAddingCommand, setIsAddingCommand] = useState(false);
  const [isEditingCommand, setIsEditingCommand] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [dashboardLayout, setDashboardLayout] = useLocalStorage('dashboardLayout', 'default'); // default, compact, expanded
  const [lastSync, setLastSync] = useState(null);
  const [deviceSize, setDeviceSize] = useState('desktop'); // mobile, tablet, desktop
  const [showHelp, setShowHelp] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'Git Terminal Simulator v2.0' },
    { type: 'system', content: 'Type "help" for available commands' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalRef = useRef(null);
  const searchRef = useRef(null);
  
  // Stats and metrics
  const [usageStats, setUsageStats] = useLocalStorage('usageStats', {
    totalUsage: 0,
    commandUsage: {},
    usageByDay: Array(7).fill(0),
    usageByHour: Array(24).fill(0),
    usageHistory: [], // [{date, count}]
    popularCommands: [],
    topCategories: []
  });
  
  // New command form state
  const [newCommand, setNewCommand] = useState({
    command: '',
    description: '',
    longDescription: '',
    tags: [],
    examples: [],
    options: [],
    category: 'custom',
    subcategory: 'general',
    notes: ''
  });
  
  // Handle theme change
  useEffect(() => {
    setTheme(themes[themeId]);
    document.documentElement.style.setProperty('--color-primary', themes[themeId].primary.main);
    document.documentElement.style.setProperty('--color-background', themes[themeId].background.default);
    document.documentElement.style.setProperty('--color-text', themes[themeId].text.primary);
  }, [themeId]);
  
  // Initialization effect
  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboard = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      setLoading(false);
      setInitializing(false);
    };
    
    loadDashboard();
    
    // Check screen size on mount and when window resizes
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDeviceSize('mobile');
        setSidebarOpen(false);
      } else if (window.innerWidth < 1024) {
        setDeviceSize('tablet');
      } else {
        setDeviceSize('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchRef.current) searchRef.current.focus();
      }
      
      // Ctrl/Cmd + / to toggle terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        if (activeModal) setActiveModal(null);
        else if (showTerminal) setShowTerminal(false);
        else if (rightPanelOpen) setRightPanelOpen(false);
        else if (isAddingCommand) setIsAddingCommand(false);
        else if (isEditingCommand) setIsEditingCommand(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, showTerminal, rightPanelOpen, isAddingCommand, isEditingCommand, setRightPanelOpen]);
  
  // Filter commands based on search and tags
  const filteredCommands = useMemo(() => {
    let result = {};
    
    Object.entries(commands).forEach(([category, categoryCommands]) => {
      const filtered = categoryCommands.filter(cmd => {
        // Skip if not in active category (unless searching)
        if (!searchTerm && activeCategory !== 'all' && category !== activeCategory) {
          return false;
        }
        
        // Apply search filter
        const matchesSearch = !searchTerm || 
          cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) || 
          cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Apply tag filter
        const matchesTags = filterTags.length === 0 || 
          filterTags.every(tag => cmd.tags && cmd.tags.includes(tag));
        
        return matchesSearch && matchesTags;
      });
      
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    
    // Add custom commands if they match
    const filteredCustom = customCommands.filter(cmd => {
      const matchesSearch = !searchTerm || 
        cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = filterTags.length === 0 || 
        filterTags.every(tag => cmd.tags && cmd.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
    
    if (filteredCustom.length > 0) {
      result.custom = filteredCustom;
    }
    
    return result;
  }, [commands, customCommands, searchTerm, filterTags, activeCategory]);
  
  // Get all available commands in a flat array
  const allCommands = useMemo(() => {
    const commandsArray = [];
    
    Object.entries(commands).forEach(([category, categoryCommands]) => {
      categoryCommands.forEach(cmd => {
        commandsArray.push({ ...cmd, category });
      });
    });
    
    customCommands.forEach(cmd => {
      commandsArray.push({ ...cmd, category: 'custom' });
    });
    
    return commandsArray;
  }, [commands, customCommands]);
  
  // Get command by ID (including custom commands)
  const getCommandById = useCallback((id) => {
    for (const category in commands) {
      const command = commands[category].find(c => c.id === id);
      if (command) return { ...command, category };
    }
    
    const customCommand = customCommands.find(c => c.id === id);
    if (customCommand) return { ...customCommand, category: 'custom' };
    
    return null;
  }, [commands, customCommands]);
  
  // Handle command usage tracking
  const trackCommandUsage = useCallback((commandId) => {
    const command = getCommandById(commandId);
    if (!command) return;
    
    // Update command usage
    const now = new Date();
    const updatedCommands = { ...commands };
    
    if (command.category === 'custom') {
      const updatedCustomCommands = customCommands.map(cmd => {
        if (cmd.id === commandId) {
          return {
            ...cmd,
            usage: (cmd.usage || 0) + 1,
            lastUsed: now.toISOString(),
            usageByWeekday: cmd.usageByWeekday 
              ? cmd.usageByWeekday.map((count, i) => i === now.getDay() ? count + 1 : count)
              : Array(7).fill(0).map((_, i) => i === now.getDay() ? 1 : 0),
            usageByHour: cmd.usageByHour
              ? cmd.usageByHour.map((count, i) => i === now.getHours() ? count + 1 : count)
              : Array(24).fill(0).map((_, i) => i === now.getHours() ? 1 : 0),
            usageHistory: [
              ...(cmd.usageHistory || []),
              { date: now.toISOString(), id: commandId }
            ]
          };
        }
        return cmd;
      });
      
      setCustomCommands(updatedCustomCommands);
    } else {
      if (updatedCommands[command.category]) {
        updatedCommands[command.category] = updatedCommands[command.category].map(cmd => {
          if (cmd.id === commandId) {
            return {
              ...cmd,
              usage: (cmd.usage || 0) + 1,
              lastUsed: now.toISOString(),
              usageByWeekday: cmd.usageByWeekday 
                ? cmd.usageByWeekday.map((count, i) => i === now.getDay() ? count + 1 : count)
                : Array(7).fill(0).map((_, i) => i === now.getDay() ? 1 : 0),
              usageByHour: cmd.usageByHour
                ? cmd.usageByHour.map((count, i) => i === now.getHours() ? count + 1 : count)
                : Array(24).fill(0).map((_, i) => i === now.getHours() ? 1 : 0),
              usageHistory: [
                ...(cmd.usageHistory || []),
                { date: now.toISOString(), id: commandId }
              ]
            };
          }
          return cmd;
        });
      }
      
      setCommands(updatedCommands);
    }
    
    // Update recently used commands
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== commandId);
      return [commandId, ...filtered].slice(0, 10);
    });
    
    // Update command history
    setCommandHistory(prev => {
      return [
        { id: commandId, command: command.command, timestamp: now.toISOString() },
        ...prev
      ].slice(0, 100); // Keep last 100 commands
    });
    
    // Update global usage stats
    setUsageStats(prev => {
      const dayOfWeek = now.getDay();
      const hourOfDay = now.getHours();
      const newUsageByDay = [...prev.usageByDay];
      newUsageByDay[dayOfWeek] = (newUsageByDay[dayOfWeek] || 0) + 1;
      
      const newUsageByHour = [...prev.usageByHour];
      newUsageByHour[hourOfDay] = (newUsageByHour[hourOfDay] || 0) + 1;
      
      // Update command usage counts
      const newCommandUsage = { ...prev.commandUsage };
      newCommandUsage[commandId] = (newCommandUsage[commandId] || 0) + 1;
      
      // Update history
      const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
      let historyUpdated = false;
      
      const newHistory = prev.usageHistory.map(entry => {
        if (entry.date === dateString) {
          historyUpdated = true;
          return { ...entry, count: entry.count + 1 };
        }
        return entry;
      });
      
      if (!historyUpdated) {
        newHistory.push({ date: dateString, count: 1 });
      }
      
      // Sort and return the top commands
      const sortedCommands = Object.entries(newCommandUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, count]) => ({ id, count }));
      
      // Calculate top categories
      const categoryCounts = {};
      Object.values(commands).forEach(categoryCommands => {
        categoryCommands.forEach(cmd => {
          if (newCommandUsage[cmd.id]) {
            categoryCounts[cmd.category] = (categoryCounts[cmd.category] || 0) + newCommandUsage[cmd.id];
          }
        });
      });
      
      const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));
      
      return {
        totalUsage: prev.totalUsage + 1,
        commandUsage: newCommandUsage,
        usageByDay: newUsageByDay,
        usageByHour: newUsageByHour,
        usageHistory: newHistory,
        popularCommands: sortedCommands,
        topCategories: sortedCategories
      };
    });
  }, [commands, customCommands, getCommandById, setCommands, setCustomCommands, setRecentlyUsed, setCommandHistory, setUsageStats]);
  
  // Handle copying command to clipboard
  const handleCopyCommand = useCallback((command, id) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard');
    
    if (id) {
      trackCommandUsage(id);
    }
  }, [trackCommandUsage]);
  
  // Toggle favorite status for a command
  const toggleFavorite = useCallback((commandId) => {
    if (favorites.includes(commandId)) {
      setFavorites(favorites.filter(id => id !== commandId));
      toast.success('Removed from favorites');
    } else {
      setFavorites([...favorites, commandId]);
      toast.success('Added to favorites');
    }
  }, [favorites, setFavorites]);
  
  // Add a new custom command
  const addCustomCommand = useCallback((command) => {
    const id = `custom-${Date.now()}`;
    const newCmd = {
      ...command,
      id,
      usage: 0,
      lastUsed: null,
      usageByWeekday: Array(7).fill(0),
      usageByHour: Array(24).fill(0),
      usageHistory: []
    };
    
    setCustomCommands(prev => [...prev, newCmd]);
    toast.success('Command added successfully');
    setIsAddingCommand(false);
    setNewCommand({
      command: '',
      description: '',
      longDescription: '',
      tags: [],
      examples: [],
      options: [],
      category: 'custom',
      subcategory: 'general',
      notes: ''
    });
    
    // Set active category to custom to show the new command
    setActiveCategory('custom');
  }, [setCustomCommands, setActiveCategory]);
  
  // Edit an existing custom command
  const editCustomCommand = useCallback((id, updatedCommand) => {
    setCustomCommands(prev =>
      prev.map(cmd => 
        cmd.id === id ? { ...cmd, ...updatedCommand } : cmd
      )
    );
    toast.success('Command updated successfully');
    setIsEditingCommand(null);
  }, [setCustomCommands]);
  
  // Delete a custom command
  const deleteCustomCommand = useCallback((id) => {
    setCustomCommands(prev => prev.filter(cmd => cmd.id !== id));
    setFavorites(prev => prev.filter(favId => favId !== id));
    setRecentlyUsed(prev => prev.filter(recentId => recentId !== id));
    toast.success('Command deleted successfully');
  }, [setCustomCommands, setFavorites, setRecentlyUsed]);
  
  // Handle terminal commands
  const handleTerminalCommand = useCallback((e) => {
    e.preventDefault();
    
    if (!terminalInput.trim()) return;
    
    // Add to terminal history
    setTerminalHistory(prev => [
      ...prev,
      { type: 'input', content: terminalInput }
    ]);
    
    // Process the command
    const input = terminalInput.trim();
    
    if (input === 'clear' || input === 'cls') {
      setTerminalHistory([
        { type: 'system', content: 'Git Terminal Simulator v2.0' },
        { type: 'system', content: 'Type "help" for available commands' }
      ]);
    } else if (input === 'help') {
      setTerminalHistory(prev => [
        ...prev,
        { 
          type: 'output',
          content: `Available commands:
  help                  - Show this help message
  clear                 - Clear terminal
  git <command>         - Simulate a git command
  history               - Show command history
  tutorial              - Start interactive tutorial
  favorites             - List favorite commands
  stats                 - Show usage statistics
  exit                  - Close terminal`
        }
      ]);
    } else if (input === 'exit') {
      setShowTerminal(false);
    } else if (input === 'history') {
      const historyOutput = commandHistory.length > 0
        ? commandHistory.map((item, i) => `${i + 1}. ${item.command}`).join('\n')
        : 'No command history yet';
      
      setTerminalHistory(prev => [
        ...prev,
        { type: 'output', content: historyOutput }
      ]);
    } else if (input === 'favorites') {
      const favoriteCommands = favorites.map(id => {
        const cmd = getCommandById(id);
        return cmd ? `${cmd.command} - ${cmd.description}` : null;
      }).filter(Boolean);
      
      const output = favoriteCommands.length > 0
        ? favoriteCommands.join('\n')
        : 'No favorite commands yet';
      
      setTerminalHistory(prev => [
        ...prev,
        { type: 'output', content: output }
      ]);
    } else if (input === 'stats') {
      setTerminalHistory(prev => [
        ...prev,
        { 
          type: 'output', 
          content: `Usage Statistics:
Total commands used: ${usageStats.totalUsage}
Top commands:
${usageStats.popularCommands.slice(0, 5).map(cmd => {
  const command = getCommandById(cmd.id);
  return command ? `  ${command.command}: ${cmd.count} uses` : null;
}).filter(Boolean).join('\n')}`
        }
      ]);
    } else if (input.startsWith('git ')) {
      // Handle git command simulation
      const gitCommand = input.substring(4);
      
      // Find matching command
      let foundCommand = null;
      let exactMatch = false;
      
      for (const cmd of allCommands) {
        if (cmd.command === input) {
          foundCommand = cmd;
          exactMatch = true;
          break;
        } else if (cmd.command.includes(gitCommand) || input.includes(cmd.command)) {
          foundCommand = cmd;
          if (!exactMatch) exactMatch = cmd.command === input;
        }
      }
      
      if (foundCommand) {
        trackCommandUsage(foundCommand.id);
        setTerminalHistory(prev => [
          ...prev,
          { 
            type: 'output', 
            content: `Executing: ${input}\n\n${foundCommand.description}\n\n✓ Command executed successfully.`
          }
        ]);
      } else {
        // Try to suggest similar commands
        const similarCommands = allCommands
          .filter(cmd => cmd.command.includes('git') && 
                        (cmd.command.includes(gitCommand) || 
                         cmd.tags && cmd.tags.some(tag => gitCommand.includes(tag))))
          .slice(0, 3)
          .map(cmd => cmd.command);
        
        const suggestionText = similarCommands.length > 0 
          ? `\n\nDid you mean:\n${similarCommands.join('\n')}` 
          : '';
        
        setTerminalHistory(prev => [
          ...prev,
          { 
            type: 'error', 
            content: `Command not recognized: ${input}${suggestionText}`
          }
        ]);
      }
    } else {
      setTerminalHistory(prev => [
        ...prev,
        { 
          type: 'error', 
          content: `Unknown command: ${input}. Type 'help' to see available commands.`
        }
      ]);
    }
    
    // Clear input and scroll to bottom
    setTerminalInput('');
    
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 10);
  }, [terminalInput, commandHistory, favorites, usageStats, allCommands, getCommandById, trackCommandUsage]);
  
  // Export user data (for backup or sharing)
  const exportUserData = useCallback(() => {
    const userData = {
      customCommands,
      favorites,
      recentlyUsed,
      userPreferences,
      usageStats,
      commandHistory,
      lastExported: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `git-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Dashboard data exported successfully');
  }, [customCommands, favorites, recentlyUsed, userPreferences, usageStats, commandHistory]);
  
  // Import user data
  const importUserData = useCallback((fileData) => {
    try {
      const importedData = JSON.parse(fileData);
      
      // Validate the data structure
      if (!importedData.customCommands || !importedData.favorites) {
        throw new Error('Invalid backup file format');
      }
      
      // Import the data
      setCustomCommands(importedData.customCommands);
      setFavorites(importedData.favorites);
      setRecentlyUsed(importedData.recentlyUsed || []);
      setUserPreferences(importedData.userPreferences || userPreferences);
      
      // Optionally import usage data if user confirms
      if (window.confirm('Do you want to import usage statistics as well?')) {
        setUsageStats(importedData.usageStats || { 
          totalUsage: 0, 
          commandUsage: {}, 
          usageByDay: Array(7).fill(0), 
          usageByHour: Array(24).fill(0), 
          usageHistory: [], 
          popularCommands: [], 
          topCategories: [] 
        });
        setCommandHistory(importedData.commandHistory || []);
      }
      
      toast.success('Dashboard data imported successfully');
      setLastSync(new Date().toISOString());
      
    } catch (error) {
      toast.error(`Import failed: ${error.message}`);
    }
  }, [userPreferences, setCustomCommands, setFavorites, setRecentlyUsed, setUserPreferences, setUsageStats, setCommandHistory]);
  
  // Reset dashboard data
  const resetDashboard = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all dashboard data? This action cannot be undone.')) {
      // Export data first as a safety measure
      exportUserData();
      
      // Reset all data
      setCustomCommands([]);
      setFavorites([]);
      setRecentlyUsed([]);
      setUserPreferences({
        fontSize: 'medium',
        codeColorization: true,
        showDescriptions: true,
        showExamples: true,
        showTags: true,
        showTips: true,
        showRelated: true,
        autoSuggestions: true,
        analyticsEnabled: true,
        tutorialMode: false,
        terminalPreferences: {
          fontFamily: 'Menlo, monospace',
          showLineNumbers: true,
          darkTheme: true
        }
      });
      setUsageStats({
        totalUsage: 0,
        commandUsage: {},
        usageByDay: Array(7).fill(0),
        usageByHour: Array(24).fill(0),
        usageHistory: [],
        popularCommands: [],
        topCategories: []
      });
      setCommandHistory([]);
      setShowOnboarding(true);
      
      toast.success('Dashboard has been reset to default settings');
    }
  }, [exportUserData, setCustomCommands, setFavorites, setRecentlyUsed, setUserPreferences, setUsageStats, setCommandHistory, setShowOnboarding]);
  
  // Render command card component
  const CommandCard = ({ command, showCategory = false }) => {
    const isFavorite = favorites.includes(command.id);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="command-card p-4 rounded-lg transition-shadow hover:shadow-md"
        style={{
          backgroundColor: theme.background.paper,
          border: `1px solid ${isFavorite ? theme.primary.main : theme.border.main}`,
          boxShadow: isFavorite ? `0 0 0 1px ${theme.primary.main}` : 'none'
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            {showCategory && (
              <span 
                className="inline-block px-2 py-0.5 rounded text-xs mb-1"
                style={{ 
                  backgroundColor: theme.secondary.main, 
                  color: theme.secondary.contrast
                }}
              >
                {command.category}
              </span>
            )}
            <h3 
              className="font-mono text-base font-semibold cursor-pointer" 
              style={{ color: theme.primary.main }}
              onClick={() => {
                setCommandDetailId(command.id);
                setRightPanelOpen(true);
                setRightPanelView('details');
              }}
            >
              {command.command}
            </h3>
          </div>
          <div className="flex space-x-1">
            <button
              className="p-1 rounded transition-colors hover:bg-opacity-10"
              style={{ 
                color: isFavorite ? theme.status.warning : theme.text.hint,
                backgroundColor: 'transparent'
              }}
              onClick={() => toggleFavorite(command.id)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={16} fill={isFavorite ? theme.status.warning : 'none'} />
            </button>
            <button
              className="p-1 rounded transition-colors hover:bg-opacity-10"
              style={{ 
                color: theme.text.hint,
                backgroundColor: 'transparent'
              }}
              onClick={() => handleCopyCommand(command.command, command.id)}
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </button>
            {command.category === 'custom' && (
              <>
                <button
                  className="p-1 rounded transition-colors hover:bg-opacity-10"
                  style={{ 
                    color: theme.text.hint,
                    backgroundColor: 'transparent'
                  }}
                  onClick={() => {
                    setIsEditingCommand(command);
                    setNewCommand({...command});
                  }}
                  title="Edit command"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="p-1 rounded transition-colors hover:bg-opacity-10"
                  style={{ 
                    color: theme.status.error,
                    backgroundColor: 'transparent'
                  }}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${command.command}"?`)) {
                      deleteCustomCommand(command.id);
                    }
                  }}
                  title="Delete command"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
        <p 
          className="text-sm mb-2" 
          style={{ color: theme.text.secondary }}
        >
          {command.description}
        </p>
        {userPreferences.showTags && command.tags && command.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {command.tags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              if (!tag) return null;
              
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                  style={{ backgroundColor: tag.color, color: 'white' }}
                >
                  {tag.icon && <span className="mr-1">{tag.icon}</span>}
                  {tag.name}
                </span>
              );
            })}
          </div>
        )}
        {userPreferences.showExamples && command.examples && command.examples.length > 0 && viewMode !== 'compact' && (
          <div className="mt-3">
            <div className="text-xs font-medium mb-1" style={{ color: theme.text.secondary }}>Example:</div>
            <div 
              className="font-mono text-xs p-2 rounded cursor-pointer transition-colors"
              style={{ 
                backgroundColor: theme.background.default,
                color: theme.syntax.function,
                borderLeft: `3px solid ${theme.primary.main}`
              }}
              onClick={() => handleCopyCommand(command.examples[0].command, command.id)}
            >
              {command.examples[0].command}
            </div>
          </div>
        )}
        {command.usage > 0 && (
          <div className="mt-2 text-xs" style={{ color: theme.text.hint }}>
            Used {command.usage} times
            {command.lastUsed && ` • Last used ${new Date(command.lastUsed).toLocaleDateString()}`}
          </div>
        )}
      </motion.div>
    );
  };
  
  // If loading, show loading screen
  if (loading || initializing) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-screen"
        style={{ backgroundColor: theme.background.default }}
      >
        <GitBranch size={64} style={{ color: theme.primary.main }} />
        <h1 
          className="text-2xl font-bold mt-4 mb-2" 
          style={{ color: theme.text.primary }}
        >
          Git Command Dashboard Pro
        </h1>
        <p style={{ color: theme.text.secondary }}>Loading your dashboard...</p>
      </div>
    );
  }
  
  // Show onboarding screen first time
  if (showOnboarding) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-screen p-4"
        style={{ backgroundColor: theme.background.default }}
      >
        <div 
          className="max-w-2xl w-full p-6 rounded-lg"
          style={{ 
            backgroundColor: theme.background.paper,
            border: `1px solid ${theme.border.main}`
          }}
        >
          <div className="text-center mb-6">
            <GitBranch size={64} className="mx-auto" style={{ color: theme.primary.main }} />
            <h1 
              className="text-3xl font-bold mt-4" 
              style={{ color: theme.text.primary }}
            >
              Welcome to Git Command Dashboard Pro
            </h1>
            <p className="mt-2" style={{ color: theme.text.secondary }}>
              Your ultimate Git command reference and learning tool
            </p>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="flex items-start">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0"
                style={{ backgroundColor: theme.primary.main }}
              >
                <Command size={24} style={{ color: theme.primary.contrast }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text.primary }}>
                  Comprehensive Command Reference
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  Access hundreds of Git commands organized by category, with detailed explanations, examples, and usage tips.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0"
                style={{ backgroundColor: theme.primary.main }}
              >
                <GitPullRequest size={24} style={{ color: theme.primary.contrast }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text.primary }}>
                  Workflow Visualizations
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  Explore common Git workflows with interactive diagrams and step-by-step guides for different team sizes and project types.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0"
                style={{ backgroundColor: theme.primary.main }}
              >
                <Edit size={24} style={{ color: theme.primary.contrast }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text.primary }}>
                  Custom Commands
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  Create and save your own custom Git commands and aliases for your specific workflows and projects.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0"
                style={{ backgroundColor: theme.primary.main }}
              >
                <Book size={24} style={{ color: theme.primary.contrast }} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ color: theme.text.primary }}>
                  Interactive Learning
                </h2>
                <p style={{ color: theme.text.secondary }}>
                  Master Git through interactive tutorials, common scenario guides, and visualizations of Git's internal workings.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              className="px-6 py-3 rounded-lg text-lg transition-colors"
              style={{ 
                backgroundColor: theme.primary.main,
                color: theme.primary.contrast
              }}
              onClick={() => setShowOnboarding(false)}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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
import { toast } from 'react-hot-toast';
import { themes } from '../data/themes';
import { tagCategories } from '../data/tagCategories';

// Custom hooks
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
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

// Sample git commands data
const gitCommandsData = {
  basic: [
    {
      id: 'init',
      command: 'git init',
      description: 'Initialize a local Git repository',
      tags: ['beginner', 'setup', 'local'],
      category: 'basic'
    },
    {
      id: 'clone',
      command: 'git clone [url]',
      description: 'Clone a repository from a remote source',
      tags: ['beginner', 'remote'],
      category: 'basic'
    }
  ],
  branches: [
    {
      id: 'branch',
      command: 'git branch',
      description: 'List, create, or delete branches',
      tags: ['beginner', 'branching'],
      category: 'branches'
    },
    {
      id: 'checkout',
      command: 'git checkout [branch-name]',
      description: 'Switch to a branch',
      tags: ['beginner', 'branching'],
      category: 'branches'
    }
  ]
};

const GitDashboardPro = () => {
  // Core state management
  const [initializing, setInitializing] = useState(true);
  const [themeId, setThemeId] = useLocalStorage('themeId', 'dark');
  const [theme, setTheme] = useState(themes[themeId]);
  const [view, setView] = useLocalStorage('dashboardView', 'commands');
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebarOpen', true);
  const [deviceSize, setDeviceSize] = useState('desktop');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [activeCategory, setActiveCategory] = useLocalStorage('activeCategory', 'all');
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [recentlyUsed, setRecentlyUsed] = useLocalStorage('recentlyUsed', []);
  const [customCommands, setCustomCommands] = useLocalStorage('customCommands', []);
  const [commandHistory, setCommandHistory] = useLocalStorage('commandHistory', []);
  const [showOnboarding, setShowOnboarding] = useLocalStorage('showOnboarding', true);
  const [commands, setCommands] = useLocalStorage('commands', gitCommandsData);
  const [userPreferences, setUserPreferences] = useLocalStorage('userPreferences', {
    fontSize: 'medium',
    codeColorization: true,
    showDescriptions: true,
    showExamples: true,
    tutorialMode: false,
    terminalPreferences: {
      fontFamily: 'Menlo, monospace',
      showLineNumbers: true,
      darkTheme: true
    }
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'Git Terminal Simulator v2.0' },
    { type: 'system', content: 'Type "help" for available commands' }
  ]);
  const terminalRef = useRef(null);
  const searchRef = useRef(null);
  
  // Additional UI state
  const [activeModal, setActiveModal] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [isAddingCommand, setIsAddingCommand] = useState(false);
  const [isEditingCommand, setIsEditingCommand] = useState(null);

  // Effect for theme changes
  useEffect(() => {
    setTheme(themes[themeId]);
    document.documentElement.style.setProperty('--color-primary', themes[themeId].primary.main);
    document.documentElement.style.setProperty('--color-background', themes[themeId].background.default);
    document.documentElement.style.setProperty('--color-text', themes[themeId].text.primary);
  }, [themeId]);

  // Effect for initialization and resize handling
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setLoading(false);
      setInitializing(false);
    };

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

    loadDashboard();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  // Loading screen
  if (loading || initializing) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-screen"
        style={{ backgroundColor: theme.background.default }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={48} style={{ color: theme.primary.main }} />
        </motion.div>
        <h1 className="mt-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
          Loading Git Dashboard Pro...
        </h1>
      </div>
    );
  }

  // Main render
  return (
    <div 
      className="flex flex-col h-screen"
      style={{ backgroundColor: theme.background.default }}
    >
      {/* Header */}
      <header 
        className="flex items-center justify-between p-4 border-b"
        style={{ 
          backgroundColor: theme.background.paper,
          borderColor: theme.border.light,
          color: theme.text.primary
        }}
      >
        <div className="flex items-center">
          <GitBranch size={24} className="mr-2" style={{ color: theme.primary.main }} />
          <h1 className="text-xl font-bold">Git Dashboard Pro</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 rounded-full hover:bg-opacity-10"
            style={{ 
              color: theme.text.primary,
              backgroundColor: `${theme.background.elevated}30`
            }}
            onClick={() => setThemeId(themeId === 'light' ? 'dark' : 'light')}
          >
            {themeId === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
            Welcome to Git Dashboard Pro
          </h2>
          <p className="mb-4" style={{ color: theme.text.secondary }}>
            Your interactive guide to Git commands and workflows.
          </p>
          
          {/* Command categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {Object.entries(commands).map(([category, categoryCommands]) => (
              <div 
                key={category}
                className="p-4 rounded-lg shadow-md"
                style={{ 
                  backgroundColor: theme.background.paper,
                  borderColor: theme.border.light
                }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text.primary }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <ul>
                  {categoryCommands.map(cmd => (
                    <li 
                      key={cmd.id}
                      className="py-2 border-b last:border-0"
                      style={{ borderColor: theme.border.light }}
                    >
                      <div className="font-mono" style={{ color: theme.primary.main }}>
                        {cmd.command}
                      </div>
                      <div style={{ color: theme.text.secondary }}>
                        {cmd.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GitDashboardPro; 
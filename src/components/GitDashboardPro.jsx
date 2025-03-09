import React, { useState, useEffect } from 'react';
import { GitBranch, Moon, Sun } from 'lucide-react';
import { themes } from '../data/themes';

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
  const [themeId, setThemeId] = useLocalStorage('themeId', 'dark');
  const [theme, setTheme] = useState(themes[themeId]);
  const [commands] = useLocalStorage('commands', gitCommandsData);

  // Effect for theme changes
  useEffect(() => {
    setTheme(themes[themeId]);
    document.documentElement.style.setProperty('--color-primary', themes[themeId].primary.main);
    document.documentElement.style.setProperty('--color-background', themes[themeId].background.default);
    document.documentElement.style.setProperty('--color-text', themes[themeId].text.primary);
  }, [themeId]);

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
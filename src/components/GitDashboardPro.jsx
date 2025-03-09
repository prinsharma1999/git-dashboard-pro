import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GitBranch, Moon, Sun, Search, Star, Filter, Terminal, 
  Copy, X, ChevronRight, ChevronLeft, Plus, Edit, Trash2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
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
    },
    {
      id: 'add',
      command: 'git add [file]',
      description: 'Add a file to the staging area',
      tags: ['beginner', 'local'],
      category: 'basic'
    },
    {
      id: 'commit',
      command: 'git commit -m "[message]"',
      description: 'Commit changes to the repository',
      tags: ['beginner', 'local', 'commits'],
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
    },
    {
      id: 'merge',
      command: 'git merge [branch]',
      description: 'Merge a branch into the active branch',
      tags: ['intermediate', 'merging'],
      category: 'branches'
    }
  ],
  remote: [
    {
      id: 'push',
      command: 'git push origin [branch]',
      description: 'Push changes to remote repository',
      tags: ['beginner', 'remote'],
      category: 'remote'
    },
    {
      id: 'pull',
      command: 'git pull',
      description: 'Pull changes from remote repository',
      tags: ['beginner', 'remote'],
      category: 'remote'
    },
    {
      id: 'fetch',
      command: 'git fetch',
      description: 'Fetch changes from remote repository',
      tags: ['beginner', 'remote'],
      category: 'remote'
    }
  ]
};

const GitDashboardPro = () => {
  // Core state management
  const [themeId, setThemeId] = useLocalStorage('themeId', 'dark');
  const [theme, setTheme] = useState(themes[themeId]);
  const [commands, setCommands] = useLocalStorage('commands', gitCommandsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [activeCategory, setActiveCategory] = useLocalStorage('activeCategory', 'all');
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [recentlyUsed, setRecentlyUsed] = useLocalStorage('recentlyUsed', []);
  const [customCommands, setCustomCommands] = useLocalStorage('customCommands', []);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'Git Terminal Simulator v2.0' },
    { type: 'system', content: 'Type "help" for available commands' }
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddingCommand, setIsAddingCommand] = useState(false);
  const searchRef = useRef(null);
  const terminalRef = useRef(null);

  // Flattened tags for filtering
  const availableTags = tagCategories.flatMap(category => 
    category.tags.map(tag => ({
      ...tag,
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color
    }))
  );

  // Effect for theme changes
  useEffect(() => {
    setTheme(themes[themeId]);
    document.documentElement.style.setProperty('--color-primary', themes[themeId].primary.main);
    document.documentElement.style.setProperty('--color-background', themes[themeId].background.default);
    document.documentElement.style.setProperty('--color-text', themes[themeId].text.primary);
  }, [themeId]);

  // Effect for keyboard shortcuts
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
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter commands based on search and tags
  const filteredCommands = () => {
    let result = {};
    
    Object.entries(commands).forEach(([category, categoryCommands]) => {
      const filtered = categoryCommands.filter(cmd => {
        // Skip if not in active category (unless searching or viewing all)
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
    
    if (filteredCustom.length > 0 && (activeCategory === 'all' || activeCategory === 'custom')) {
      result.custom = filteredCustom;
    }
    
    return result;
  };

  // Handle copying command to clipboard
  const handleCopyCommand = useCallback((command, id) => {
    navigator.clipboard.writeText(command);
    toast.success('Command copied to clipboard');
    
    if (id) {
      // Add to recently used
      setRecentlyUsed(prev => {
        const filtered = prev.filter(prevId => prevId !== id);
        return [id, ...filtered].slice(0, 10);
      });
    }
  }, [setRecentlyUsed]);

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
  help                   - Show this help message
  clear, cls             - Clear terminal
  git [command]          - Simulate a git command
  favorites              - List favorite commands
  exit                   - Close terminal`
        }
      ]);
    } else if (input === 'exit') {
      setShowTerminal(false);
    } else if (input === 'favorites') {
      const favoriteCommands = favorites.map(id => {
        // Find command in regular commands
        for (const category in commands) {
          const cmd = commands[category].find(c => c.id === id);
          if (cmd) return `${cmd.command} - ${cmd.description}`;
        }
        // Check custom commands
        const customCmd = customCommands.find(c => c.id === id);
        return customCmd ? `${customCmd.command} - ${customCmd.description}` : null;
      }).filter(Boolean);
      
      const output = favoriteCommands.length > 0
        ? favoriteCommands.join('\n')
        : 'No favorite commands yet';
      
      setTerminalHistory(prev => [
        ...prev,
        { type: 'output', content: output }
      ]);
    } else if (input.startsWith('git ')) {
      // Find matching command for simulation
      const gitCmd = input.substring(4);
      const allCommands = [
        ...Object.values(commands).flat(),
        ...customCommands
      ];
      
      const matchingCommand = allCommands.find(cmd => 
        cmd.command.includes(gitCmd) || gitCmd.includes(cmd.command)
      );
      
      if (matchingCommand) {
        setTerminalHistory(prev => [
          ...prev,
          { type: 'output', content: `Simulating: ${matchingCommand.command}\n${matchingCommand.description}` }
        ]);
        
        // Add to recently used
        setRecentlyUsed(prev => {
          const filtered = prev.filter(id => id !== matchingCommand.id);
          return [matchingCommand.id, ...filtered].slice(0, 10);
        });
      } else {
        setTerminalHistory(prev => [
          ...prev,
          { type: 'error', content: `Command not found: ${gitCmd}` }
        ]);
      }
    } else {
      setTerminalHistory(prev => [
        ...prev,
        { type: 'error', content: `Unknown command: ${input}` }
      ]);
    }
    
    setTerminalInput('');
    
    // Scroll to bottom of terminal
    if (terminalRef.current) {
      setTimeout(() => {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }, 0);
    }
  }, [commands, customCommands, favorites, setRecentlyUsed, terminalInput]);

  // Main render
  return (
    <div 
      className="flex flex-col h-screen"
      style={{ backgroundColor: theme.background.default }}
    >
      <Toaster position="top-right" />
      
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} style={{ color: theme.text.hint }} />
            </div>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search commands..."
              className="py-2 pl-10 pr-4 rounded-md w-64"
              style={{ 
                backgroundColor: theme.background.elevated,
                color: theme.text.primary,
                borderColor: theme.border.main
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="p-2 rounded-full hover:bg-opacity-10"
            style={{ 
              color: theme.text.primary,
              backgroundColor: `${theme.background.elevated}30`
            }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-opacity-10"
            style={{ 
              color: theme.text.primary,
              backgroundColor: `${theme.background.elevated}30`
            }}
            onClick={() => setShowTerminal(!showTerminal)}
          >
            <Terminal size={20} />
          </button>
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

      {/* Categories selector */}
      <div 
        className="flex overflow-x-auto border-b p-2"
        style={{ 
          backgroundColor: theme.background.paper,
          borderColor: theme.border.light
        }}
      >
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${activeCategory === 'all' ? 'font-bold' : ''}`}
          style={{ 
            backgroundColor: activeCategory === 'all' ? theme.primary.main : 'transparent',
            color: activeCategory === 'all' ? theme.primary.contrast : theme.text.primary
          }}
          onClick={() => setActiveCategory('all')}
        >
          All Commands
        </button>
        {Object.keys(commands).map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${activeCategory === category ? 'font-bold' : ''}`}
            style={{ 
              backgroundColor: activeCategory === category ? theme.primary.main : 'transparent',
              color: activeCategory === category ? theme.primary.contrast : theme.text.primary
            }}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${activeCategory === 'favorites' ? 'font-bold' : ''}`}
          style={{ 
            backgroundColor: activeCategory === 'favorites' ? theme.primary.main : 'transparent',
            color: activeCategory === 'favorites' ? theme.primary.contrast : theme.text.primary
          }}
          onClick={() => setActiveCategory('favorites')}
        >
          Favorites
        </button>
        <button
          className={`px-4 py-2 rounded-md mr-2 whitespace-nowrap ${activeCategory === 'custom' ? 'font-bold' : ''}`}
          style={{ 
            backgroundColor: activeCategory === 'custom' ? theme.primary.main : 'transparent',
            color: activeCategory === 'custom' ? theme.primary.contrast : theme.text.primary
          }}
          onClick={() => setActiveCategory('custom')}
        >
          Custom Commands
        </button>
      </div>

      {/* Tag filters */}
      {showFilters && (
        <div 
          className="flex flex-wrap p-3 border-b gap-2"
          style={{ 
            backgroundColor: theme.background.paper,
            borderColor: theme.border.light
          }}
        >
          {availableTags.map(tag => (
            <button
              key={tag.id}
              className={`px-3 py-1 rounded-full text-sm flex items-center ${
                filterTags.includes(tag.id) ? 'opacity-100' : 'opacity-70'
              }`}
              style={{ 
                backgroundColor: filterTags.includes(tag.id) ? tag.color : `${tag.color}40`,
                color: '#fff'
              }}
              onClick={() => {
                if (filterTags.includes(tag.id)) {
                  setFilterTags(filterTags.filter(t => t !== tag.id));
                } else {
                  setFilterTags([...filterTags, tag.id]);
                }
              }}
            >
              {tag.name}
              {filterTags.includes(tag.id) && <X size={14} className="ml-1" />}
            </button>
          ))}
          {filterTags.length > 0 && (
            <button
              className="px-3 py-1 rounded-full text-sm"
              style={{ color: theme.text.secondary }}
              onClick={() => setFilterTags([])}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4">
        {activeCategory === 'favorites' && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center rounded-lg"
            style={{ backgroundColor: theme.background.paper }}
          >
            <Star size={64} style={{ color: theme.text.hint }} />
            <h3 className="mt-4 text-xl font-semibold" style={{ color: theme.text.primary }}>
              No favorites yet
            </h3>
            <p className="mt-2" style={{ color: theme.text.secondary }}>
              Click the star icon on any command to add it to your favorites.
            </p>
          </div>
        )}
        
        {(activeCategory === 'favorites' && favorites.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map(id => {
              // Find command in regular commands
              let command = null;
              let category = '';
              
              for (const cat in commands) {
                const cmd = commands[cat].find(c => c.id === id);
                if (cmd) {
                  command = cmd;
                  category = cat;
                  break;
                }
              }
              
              // Check custom commands if not found
              if (!command) {
                const customCmd = customCommands.find(c => c.id === id);
                if (customCmd) {
                  command = customCmd;
                  category = 'custom';
                }
              }
              
              if (!command) return null;
              
              return (
                <div
                  key={id}
                  className="p-4 rounded-lg shadow-md"
                  style={{ 
                    backgroundColor: theme.background.paper,
                    borderColor: theme.border.light
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: theme.background.elevated,
                        color: theme.text.secondary
                      }}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                    <button
                      className="text-yellow-400"
                      onClick={() => toggleFavorite(id)}
                    >
                      <Star size={16} fill="currentColor" />
                    </button>
                  </div>
                  <div className="font-mono mb-2" style={{ color: theme.primary.main }}>
                    {command.command}
                  </div>
                  <div className="mb-3" style={{ color: theme.text.secondary }}>
                    {command.description}
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="px-3 py-1 rounded text-sm flex items-center"
                      style={{ 
                        backgroundColor: theme.primary.main,
                        color: theme.primary.contrast
                      }}
                      onClick={() => handleCopyCommand(command.command, command.id)}
                    >
                      <Copy size={14} className="mr-1" />
                      Copy
                    </button>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        )}
        
        {activeCategory !== 'favorites' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filteredCommands()).map(([category, categoryCommands]) => (
              categoryCommands.map(cmd => (
                <div
                  key={cmd.id}
                  className="p-4 rounded-lg shadow-md"
                  style={{ 
                    backgroundColor: theme.background.paper,
                    borderColor: theme.border.light
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: theme.background.elevated,
                        color: theme.text.secondary
                      }}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                    <button
                      className={favorites.includes(cmd.id) ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}
                      onClick={() => toggleFavorite(cmd.id)}
                    >
                      <Star size={16} fill={favorites.includes(cmd.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="font-mono mb-2" style={{ color: theme.primary.main }}>
                    {cmd.command}
                  </div>
                  <div className="mb-3" style={{ color: theme.text.secondary }}>
                    {cmd.description}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {cmd.tags && cmd.tags.map(tagId => {
                      const tag = availableTags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tagId}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ 
                            backgroundColor: `${tag.color}30`,
                            color: tag.color
                          }}
                        >
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="px-3 py-1 rounded text-sm flex items-center"
                      style={{ 
                        backgroundColor: theme.primary.main,
                        color: theme.primary.contrast
                      }}
                      onClick={() => handleCopyCommand(cmd.command, cmd.id)}
                    >
                      <Copy size={14} className="mr-1" />
                      Copy
                    </button>
                  </div>
                </div>
              ))
            ))}
            
            {activeCategory === 'custom' && (
              <div 
                className="flex flex-col items-center justify-center h-64 p-4 rounded-lg border-2 border-dashed cursor-pointer"
                style={{ 
                  borderColor: theme.border.light,
                  color: theme.text.secondary
                }}
                onClick={() => setIsAddingCommand(true)}
              >
                <Plus size={48} />
                <p className="mt-2 text-center">Add Custom Command</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Terminal */}
      {showTerminal && (
        <div 
          className="border-t"
          style={{ 
            backgroundColor: theme.background.default,
            borderColor: theme.border.light,
            height: '300px'
          }}
        >
          <div className="flex justify-between items-center px-4 py-2 border-b"
            style={{ 
              backgroundColor: theme.background.paper,
              borderColor: theme.border.light
            }}
          >
            <h3 style={{ color: theme.text.primary }}>Git Terminal</h3>
            <button
              className="hover:bg-opacity-10 p-1 rounded"
              style={{ color: theme.text.secondary }}
              onClick={() => setShowTerminal(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div 
            ref={terminalRef}
            className="h-[calc(300px-40px)] overflow-y-auto p-4 font-mono text-sm"
            style={{ backgroundColor: '#1e1e1e', color: '#f0f0f0' }}
          >
            {terminalHistory.map((entry, idx) => (
              <div key={idx} className="mb-2">
                {entry.type === 'input' && (
                  <div className="flex">
                    <span className="text-green-400 mr-1">$</span>
                    <span>{entry.content}</span>
                  </div>
                )}
                {entry.type === 'output' && (
                  <div className="whitespace-pre-wrap pl-3">{entry.content}</div>
                )}
                {entry.type === 'error' && (
                  <div className="text-red-400 pl-3">{entry.content}</div>
                )}
                {entry.type === 'system' && (
                  <div className="text-blue-400">{entry.content}</div>
                )}
              </div>
            ))}
            <form onSubmit={handleTerminalCommand} className="flex">
              <span className="text-green-400 mr-1">$</span>
              <input
                type="text"
                className="flex-1 bg-transparent outline-none"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                autoFocus
              />
            </form>
          </div>
        </div>
      )}
      
      {/* Simplified Add Command Modal */}
      {isAddingCommand && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div 
            className="w-full max-w-md p-6 rounded-lg"
            style={{ backgroundColor: theme.background.paper }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>Add Custom Command</h3>
              <button
                className="hover:bg-opacity-10 p-1 rounded"
                style={{ color: theme.text.secondary }}
                onClick={() => setIsAddingCommand(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1" style={{ color: theme.text.secondary }}>Command</label>
                <input
                  type="text"
                  className="w-full p-2 rounded"
                  style={{ 
                    backgroundColor: theme.background.elevated,
                    color: theme.text.primary,
                    borderColor: theme.border.main
                  }}
                  placeholder="git example [options]"
                />
              </div>
              <div>
                <label className="block mb-1" style={{ color: theme.text.secondary }}>Description</label>
                <input
                  type="text"
                  className="w-full p-2 rounded"
                  style={{ 
                    backgroundColor: theme.background.elevated,
                    color: theme.text.primary,
                    borderColor: theme.border.main
                  }}
                  placeholder="Short description of what the command does"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  className="px-4 py-2 rounded"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: theme.text.secondary
                  }}
                  onClick={() => setIsAddingCommand(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded"
                  style={{ 
                    backgroundColor: theme.primary.main,
                    color: theme.primary.contrast
                  }}
                  onClick={() => {
                    toast.success('Custom command added');
                    setIsAddingCommand(false);
                  }}
                >
                  Add Command
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitDashboardPro; 
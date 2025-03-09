import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GitBranch, Moon, Sun, Search, Star, Filter, Terminal, 
  Copy, X, ChevronRight, ChevronLeft, Plus, Edit, Trash2, ChevronDown, ExternalLink, Clock
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { themes } from '../data/themes';
import { tagCategories } from '../data/tagCategories';
import { motion } from 'framer-motion';

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
  setup: [
    {
      id: 'config-name',
      command: 'git config --global user.name "[name]"',
      description: 'Set the name you want attached to your commits',
      longDescription: 'Sets the name that will be attached to your commits and tags. This should be your real name or a consistent pseudonym.',
      tags: ['beginner', 'setup', 'configuration'],
      examples: [
        { description: 'Set your username', command: 'git config --global user.name "John Doe"' }
      ],
      category: 'setup'
    },
    {
      id: 'config-email',
      command: 'git config --global user.email "[email]"',
      description: 'Set the email you want attached to your commits',
      longDescription: 'Sets the email that will be attached to your commits. Should match your GitHub email for proper attribution.',
      tags: ['beginner', 'setup', 'configuration'],
      examples: [
        { description: 'Set your email', command: 'git config --global user.email "john@example.com"' }
      ],
      category: 'setup'
    }
  ],
  basic: [
    {
      id: 'init',
      command: 'git init',
      description: 'Initialize a local Git repository',
      longDescription: 'Creates a new Git repository in the current directory with a .git subdirectory.',
      tags: ['beginner', 'setup', 'local'],
      examples: [
        { description: 'Initialize in current directory', command: 'git init' },
        { description: 'Initialize in specific directory', command: 'git init [directory]' }
      ],
      category: 'basic'
    },
    {
      id: 'clone',
      command: 'git clone [url]',
      description: 'Clone a repository from a remote source',
      longDescription: 'Creates a copy of a remote repository on your local machine.',
      tags: ['beginner', 'setup', 'remote'],
      examples: [
        { description: 'Clone via HTTPS', command: 'git clone https://github.com/user/repo.git' },
        { description: 'Clone via SSH', command: 'git clone git@github.com:user/repo.git' },
        { description: 'Clone to specific directory', command: 'git clone [url] [directory]' }
      ],
      category: 'basic'
    }
  ],
  stage: [
    {
      id: 'add',
      command: 'git add [file]',
      description: 'Add file(s) to staging area',
      longDescription: 'Adds changes in specified files to the staging area for the next commit.',
      tags: ['beginner', 'staging'],
      examples: [
        { description: 'Add specific file', command: 'git add file.txt' },
        { description: 'Add all files', command: 'git add .' },
        { description: 'Add all files with specific extension', command: 'git add *.js' }
      ],
      category: 'stage'
    },
    {
      id: 'reset',
      command: 'git reset [file]',
      description: 'Unstage file(s) while keeping changes',
      longDescription: 'Removes files from the staging area but preserves their contents.',
      tags: ['intermediate', 'staging', 'undo'],
      examples: [
        { description: 'Unstage specific file', command: 'git reset file.txt' },
        { description: 'Unstage all files', command: 'git reset' }
      ],
      category: 'stage'
    }
  ],
  commit: [
    {
      id: 'commit',
      command: 'git commit -m "[message]"',
      description: 'Commit staged changes with a message',
      longDescription: 'Records changes to the repository with a descriptive message.',
      tags: ['beginner', 'commit'],
      examples: [
        { description: 'Basic commit', command: 'git commit -m "Add feature"' },
        { description: 'Commit with detailed message', command: 'git commit -m "Subject" -m "Description"' }
      ],
      category: 'commit'
    },
    {
      id: 'commit-amend',
      command: 'git commit --amend',
      description: 'Modify the last commit',
      longDescription: 'Updates the last commit with new changes or message.',
      tags: ['intermediate', 'commit', 'modify'],
      examples: [
        { description: 'Change commit message', command: 'git commit --amend -m "New message"' },
        { description: 'Add files to last commit', command: 'git commit --amend --no-edit' }
      ],
      category: 'commit'
    }
  ],
  branches: [
    {
      id: 'branch-list',
      command: 'git branch',
      description: 'List all local branches',
      longDescription: 'Shows all local branches, with * marking the current branch.',
      tags: ['beginner', 'branch'],
      examples: [
        { description: 'List branches', command: 'git branch' },
        { description: 'List remote branches', command: 'git branch -r' },
        { description: 'List all branches', command: 'git branch -a' }
      ],
      category: 'branches'
    },
    {
      id: 'branch-create',
      command: 'git branch [name]',
      description: 'Create a new branch',
      longDescription: 'Creates a new branch at the current commit.',
      tags: ['beginner', 'branch', 'create'],
      examples: [
        { description: 'Create branch', command: 'git branch feature' },
        { description: 'Create and switch', command: 'git checkout -b feature' }
      ],
      category: 'branches'
    }
  ],
  remote: [
    {
      id: 'remote-add',
      command: 'git remote add [name] [url]',
      description: 'Add a remote repository',
      longDescription: 'Creates a connection to a remote repository.',
      tags: ['intermediate', 'remote', 'setup'],
      examples: [
        { description: 'Add origin', command: 'git remote add origin https://github.com/user/repo.git' },
        { description: 'Add upstream', command: 'git remote add upstream https://github.com/original/repo.git' }
      ],
      category: 'remote'
    },
    {
      id: 'push',
      command: 'git push [remote] [branch]',
      description: 'Push commits to remote repository',
      longDescription: 'Uploads local branch commits to the remote repository.',
      tags: ['beginner', 'remote', 'sync'],
      examples: [
        { description: 'Push to origin', command: 'git push origin main' },
        { description: 'Push all branches', command: 'git push --all origin' }
      ],
      category: 'remote'
    }
  ],
  sync: [
    {
      id: 'fetch',
      command: 'git fetch [remote]',
      description: 'Download objects and refs from remote',
      longDescription: 'Downloads all branches and tags from the remote without merging.',
      tags: ['intermediate', 'remote', 'sync'],
      examples: [
        { description: 'Fetch from origin', command: 'git fetch origin' },
        { description: 'Fetch all remotes', command: 'git fetch --all' }
      ],
      category: 'sync'
    },
    {
      id: 'pull',
      command: 'git pull [remote] [branch]',
      description: 'Fetch and merge remote changes',
      longDescription: 'Downloads and integrates changes from a remote repository.',
      tags: ['beginner', 'remote', 'sync'],
      examples: [
        { description: 'Pull from origin', command: 'git pull origin main' },
        { description: 'Pull with rebase', command: 'git pull --rebase origin main' }
      ],
      category: 'sync'
    }
  ],
  history: [
    {
      id: 'log',
      command: 'git log',
      description: 'View commit history',
      longDescription: 'Shows the commit history with details about each commit.',
      tags: ['beginner', 'history', 'view'],
      examples: [
        { description: 'View basic log', command: 'git log' },
        { description: 'View oneline format', command: 'git log --oneline' },
        { description: 'View graph format', command: 'git log --graph --oneline --decorate' }
      ],
      category: 'history'
    },
    {
      id: 'diff',
      command: 'git diff',
      description: 'Show changes between commits, commit and working tree, etc',
      longDescription: 'Shows differences between various Git objects.',
      tags: ['intermediate', 'history', 'view'],
      examples: [
        { description: 'View unstaged changes', command: 'git diff' },
        { description: 'View staged changes', command: 'git diff --staged' },
        { description: 'Compare branches', command: 'git diff branch1..branch2' }
      ],
      category: 'history'
    }
  ],
  advanced: [
    {
      id: 'rebase',
      command: 'git rebase [branch]',
      description: 'Reapply commits on top of another base',
      longDescription: 'Moves or combines a sequence of commits to a new base commit.',
      tags: ['advanced', 'modify', 'history'],
      examples: [
        { description: 'Rebase onto main', command: 'git rebase main' },
        { description: 'Interactive rebase', command: 'git rebase -i HEAD~3' }
      ],
      category: 'advanced'
    },
    {
      id: 'cherry-pick',
      command: 'git cherry-pick [commit]',
      description: 'Apply the changes from specific commits',
      longDescription: 'Applies the changes from specific commits to the current branch.',
      tags: ['advanced', 'modify', 'commit'],
      examples: [
        { description: 'Cherry-pick commit', command: 'git cherry-pick abc123' },
        { description: 'Cherry-pick range', command: 'git cherry-pick abc123..def456' }
      ],
      category: 'advanced'
    }
  ],
  cleanup: [
    {
      id: 'clean',
      command: 'git clean',
      description: 'Remove untracked files from working directory',
      longDescription: 'Removes untracked files from the working directory.',
      tags: ['advanced', 'cleanup', 'remove'],
      examples: [
        { description: 'Dry run', command: 'git clean -n' },
        { description: 'Remove files', command: 'git clean -f' },
        { description: 'Remove files and directories', command: 'git clean -fd' }
      ],
      category: 'cleanup'
    },
    {
      id: 'gc',
      command: 'git gc',
      description: 'Clean up unnecessary files and optimize local repository',
      longDescription: 'Cleans up unnecessary files and optimizes the local repository.',
      tags: ['advanced', 'cleanup', 'optimize'],
      examples: [
        { description: 'Basic cleanup', command: 'git gc' },
        { description: 'Aggressive cleanup', command: 'git gc --aggressive' }
      ],
      category: 'cleanup'
    }
  ],
  stash: [
    {
      id: 'stash-save',
      command: 'git stash',
      description: 'Temporarily store modified tracked files',
      longDescription: 'Saves modified and staged changes for later use.',
      tags: ['intermediate', 'stash', 'save'],
      examples: [
        { description: 'Basic stash', command: 'git stash' },
        { description: 'Stash with message', command: 'git stash save "message"' },
        { description: 'Stash untracked files', command: 'git stash -u' }
      ],
      category: 'stash'
    },
    {
      id: 'stash-pop',
      command: 'git stash pop',
      description: 'Restore and remove stashed changes',
      longDescription: 'Applies stashed changes and removes them from the stash.',
      tags: ['intermediate', 'stash', 'apply'],
      examples: [
        { description: 'Pop latest stash', command: 'git stash pop' },
        { description: 'Pop specific stash', command: 'git stash pop stash@{2}' }
      ],
      category: 'stash'
    }
  ],
  tags: [
    {
      id: 'tag-create',
      command: 'git tag [name]',
      description: 'Create a tag',
      longDescription: 'Creates a reference to a specific point in Git history.',
      tags: ['intermediate', 'tag', 'release'],
      examples: [
        { description: 'Create lightweight tag', command: 'git tag v1.0.0' },
        { description: 'Create annotated tag', command: 'git tag -a v1.0.0 -m "Version 1.0.0"' }
      ],
      category: 'tags'
    },
    {
      id: 'tag-push',
      command: 'git push [remote] [tag]',
      description: 'Push tags to remote',
      longDescription: 'Uploads tags to the remote repository.',
      tags: ['intermediate', 'tag', 'remote'],
      examples: [
        { description: 'Push specific tag', command: 'git push origin v1.0.0' },
        { description: 'Push all tags', command: 'git push origin --tags' }
      ],
      category: 'tags'
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
  const [commandDetailId, setCommandDetailId] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelView, setRightPanelView] = useState('details');

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

  // Right Panel Component
  const RightPanel = ({ command }) => {
    if (!command) return null;

    return (
      <div 
        className="h-full overflow-y-auto"
        style={{ backgroundColor: theme.background.paper }}
      >
        <div className="sticky top-0 z-10 p-4 border-b flex justify-between items-center"
          style={{ 
            backgroundColor: theme.background.paper,
            borderColor: theme.border.light
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
            Command Details
          </h2>
          <button
            className="p-2 rounded hover:bg-opacity-10"
            style={{ color: theme.text.secondary }}
            onClick={() => setRightPanelOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Command Header */}
          <div>
            <div className="flex items-center justify-between">
              <span 
                className="px-2 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: theme.secondary.main,
                  color: theme.secondary.contrast
                }}
              >
                {command.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className={`p-1 rounded hover:bg-opacity-10 ${
                    favorites.includes(command.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                  onClick={() => toggleFavorite(command.id)}
                >
                  <Star size={20} fill={favorites.includes(command.id) ? "currentColor" : "none"} />
                </button>
                <button
                  className="p-1 rounded hover:bg-opacity-10"
                  style={{ color: theme.text.secondary }}
                  onClick={() => handleCopyCommand(command.command, command.id)}
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
            <h1 
              className="font-mono text-xl font-bold mt-2" 
              style={{ color: theme.primary.main }}
            >
              {command.command}
            </h1>
            <p className="mt-2" style={{ color: theme.text.secondary }}>
              {command.description}
            </p>
          </div>

          {/* Long Description */}
          {command.longDescription && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Description
              </h3>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                {command.longDescription}
              </p>
            </div>
          )}

          {/* Examples */}
          {command.examples && command.examples.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Examples
              </h3>
              <div className="space-y-3">
                {command.examples.map((example, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded"
                    style={{ backgroundColor: theme.background.elevated }}
                  >
                    <div className="mb-2 text-sm" style={{ color: theme.text.secondary }}>
                      {example.description}
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-sm" style={{ color: theme.primary.main }}>
                        {example.command}
                      </code>
                      <button
                        className="p-1 rounded hover:bg-opacity-10"
                        style={{ color: theme.text.secondary }}
                        onClick={() => handleCopyCommand(example.command)}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          {command.options && command.options.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Options
              </h3>
              <div className="space-y-2">
                {command.options.map((option, index) => (
                  <div 
                    key={index}
                    className="flex items-start p-2 rounded"
                    style={{ backgroundColor: theme.background.elevated }}
                  >
                    <code 
                      className="font-mono text-sm mr-3 whitespace-nowrap"
                      style={{ color: theme.primary.main }}
                    >
                      {option.flag}
                    </code>
                    <span className="text-sm" style={{ color: theme.text.secondary }}>
                      {option.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Commands */}
          {command.relatedCommands && command.relatedCommands.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Related Commands
              </h3>
              <div className="space-y-2">
                {command.relatedCommands.map(cmdId => {
                  const relatedCmd = getCommandById(cmdId);
                  if (!relatedCmd) return null;
                  return (
                    <button
                      key={cmdId}
                      className="w-full text-left p-2 rounded hover:bg-opacity-10 flex items-center justify-between"
                      style={{ 
                        backgroundColor: theme.background.elevated,
                        color: theme.text.secondary
                      }}
                      onClick={() => setCommandDetailId(cmdId)}
                    >
                      <span className="font-mono text-sm" style={{ color: theme.primary.main }}>
                        {relatedCmd.command}
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Usage Statistics */}
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
              Usage Statistics
            </h3>
            <div 
              className="p-3 rounded space-y-2"
              style={{ backgroundColor: theme.background.elevated }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: theme.text.secondary }}>Times Used:</span>
                <span style={{ color: theme.text.primary }}>{command.usage || 0}</span>
              </div>
              {command.lastUsed && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: theme.text.secondary }}>Last Used:</span>
                  <span style={{ color: theme.text.primary }}>
                    {new Date(command.lastUsed).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* External Links */}
          {command.links && command.links.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Learn More
              </h3>
              <div className="space-y-2">
                {command.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded text-sm hover:bg-opacity-10 flex items-center"
                    style={{ 
                      backgroundColor: theme.background.elevated,
                      color: theme.primary.main
                    }}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
              placeholder="Search commands (Ctrl/⌘ + K)..."
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div 
          className="w-64 border-r flex-shrink-0 overflow-y-auto"
          style={{ 
            backgroundColor: theme.background.paper,
            borderColor: theme.border.light
          }}
        >
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
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
                  <span>All Commands</span>
                </button>
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
                    <span 
                      className="ml-auto px-2 py-0.5 rounded-full text-xs"
                      style={{ 
                        backgroundColor: theme.background.elevated,
                        color: theme.text.secondary
                      }}
                    >
                      {commands[category].length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-sm font-semibold mb-2" style={{ color: theme.text.primary }}>
                Quick Access
              </h2>
              <div className="space-y-1">
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
                  <Star size={16} className="mr-2" />
                  <span>Favorites</span>
                  <span 
                    className="ml-auto px-2 py-0.5 rounded-full text-xs"
                    style={{ 
                      backgroundColor: theme.background.elevated,
                      color: theme.text.secondary
                    }}
                  >
                    {favorites.length}
                  </span>
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
                  <Clock size={16} className="mr-2" />
                  <span>Recently Used</span>
                  <span 
                    className="ml-auto px-2 py-0.5 rounded-full text-xs"
                    style={{ 
                      backgroundColor: theme.background.elevated,
                      color: theme.text.secondary
                    }}
                  >
                    {recentlyUsed.length}
                  </span>
                </button>
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
                  <Plus size={16} className="mr-2" />
                  <span>Custom Commands</span>
                  <span 
                    className="ml-auto px-2 py-0.5 rounded-full text-xs"
                    style={{ 
                      backgroundColor: theme.background.elevated,
                      color: theme.text.secondary
                    }}
                  >
                    {customCommands.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Command List */}
          <div className="flex-1 overflow-y-auto p-4">
            {showFilters && (
              <div 
                className="mb-4 p-4 rounded-lg border"
                style={{ 
                  backgroundColor: theme.background.paper,
                  borderColor: theme.border.light
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: theme.text.primary }}>
                    Filters
                  </h3>
                  <button
                    className="text-sm"
                    style={{ color: theme.text.secondary }}
                    onClick={() => setFilterTags([])}
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
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
                      {filterTags.includes(tag.id) && <X size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(filteredCommands()).map(([category, categoryCommands]) =>
                categoryCommands.map(command => (
                  <CommandCard
                    key={command.id}
                    command={command}
                    showCategory={activeCategory === 'all' || activeCategory === 'favorites' || activeCategory === 'recent'}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Panel */}
          {rightPanelOpen && (
            <div 
              className="w-96 border-l flex-shrink-0"
              style={{ 
                backgroundColor: theme.background.paper,
                borderColor: theme.border.light
              }}
            >
              <RightPanel command={commandDetailId ? getCommandById(commandDetailId) : null} />
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default GitDashboardPro; 
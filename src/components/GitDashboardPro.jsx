import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  GitBranch, Moon, Sun, Search, Star, Filter, Terminal, 
  Copy, X, ChevronRight, ChevronLeft, Plus, Edit, Trash2, ChevronDown, ExternalLink, Clock, Book, Command, GitPullRequest, Brain, Trophy, Target
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { themes } from '../data/themes';
import { tagCategories } from '../data/tagCategories';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenAI } from 'openai';

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  baseUrl: "https://openrouter.ai/api/v1",
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

// Learning paths data
const learningPaths = {
  beginner: {
    name: 'Git Basics',
    description: 'Learn the fundamental Git commands and concepts',
    modules: [
      {
        id: 'intro',
        name: 'Introduction to Git',
        description: 'Understanding version control and Git basics',
        lessons: [
          {
            id: 'what-is-git',
            name: 'What is Git?',
            content: 'Git is a distributed version control system...',
            quiz: [
              {
                question: 'What type of version control system is Git?',
                options: ['Centralized', 'Distributed', 'Linear', 'Sequential'],
                correct: 1
              }
            ]
          }
        ]
      }
    ]
  },
  intermediate: {
    name: 'Git Advanced',
    description: 'Master advanced Git concepts and workflows',
    modules: []
  },
  expert: {
    name: 'Git Expert',
    description: 'Learn expert-level Git techniques and best practices',
    modules: []
  }
};

// Progress tracking interface
const ProgressTracker = ({ progress, theme }) => {
  const totalPoints = progress.totalPoints || 0;
  const level = Math.floor(totalPoints / 100) + 1;
  const nextLevelPoints = level * 100;
  const progressPercent = ((totalPoints % 100) / 100) * 100;

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: theme.background.paper }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
            Level {level}
          </h3>
          <p style={{ color: theme.text.secondary }}>
            {totalPoints} points earned
          </p>
        </div>
        <Trophy size={24} style={{ color: theme.primary.main }} />
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.background.elevated }}>
        <div
          className="h-full transition-all duration-500"
          style={{ 
            width: `${progressPercent}%`,
            backgroundColor: theme.primary.main
          }}
        />
      </div>
      <p className="mt-2 text-sm" style={{ color: theme.text.hint }}>
        {nextLevelPoints - totalPoints} points to next level
      </p>
    </div>
  );
};

// AI Command Generator component
const AICommandGenerator = ({ theme, onCommandGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCommand, setGeneratedCommand] = useState(null);
  const [error, setError] = useState(null);

  const generateCommand = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using a more reliable model
        messages: [
          {
            role: "system",
            content: `You are a Git expert assistant. Generate Git commands based on natural language descriptions.
            Format your response as JSON with the following structure:
            {
              "command": "the git command",
              "description": "brief description",
              "explanation": "detailed explanation of how the command works",
              "tags": ["relevant", "tags"],
              "safetyLevel": "safe|caution|dangerous",
              "examples": [{"description": "example description", "command": "example command"}]
            }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        extra_headers: {
          "HTTP-Referer": "https://gitdashboardpro.com",
          "X-Title": "Git Dashboard Pro",
        }
      });

      try {
        const response = completion.choices[0].message.content;
        console.log("AI Response:", response);
        
        // Handle potential non-JSON responses
        let commandData;
        try {
          commandData = JSON.parse(response);
        } catch (jsonError) {
          // Try to extract JSON from the response if it contains other text
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            commandData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Could not parse JSON response");
          }
        }
        
        // Validate the response has the required fields
        if (!commandData.command || !commandData.description || !commandData.explanation) {
          throw new Error("Invalid response format");
        }
        
        // Ensure tags is an array
        if (!Array.isArray(commandData.tags)) {
          commandData.tags = [];
        }
        
        // Ensure examples is an array
        if (!Array.isArray(commandData.examples)) {
          commandData.examples = [];
        }
        
        // Ensure safetyLevel is valid
        if (!['safe', 'caution', 'dangerous'].includes(commandData.safetyLevel)) {
          commandData.safetyLevel = 'safe';
        }
        
        // Add the prompt to the command data for history
        commandData.prompt = prompt;
        
        setGeneratedCommand(commandData);
        onCommandGenerated(commandData);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        setError('Failed to parse AI response. Please try again.');
        toast.error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('AI Error:', error);
      setError('Failed to generate command. Please try again.');
      toast.error('Failed to generate command. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg shadow-lg"
      style={{ backgroundColor: theme.background.paper }}
    >
      <div className="flex items-center mb-4">
        <Brain size={24} className="mr-2" style={{ color: theme.primary.main }} />
        <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
          AI Command Generator
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label 
            className="block mb-2 text-sm font-medium" 
            style={{ color: theme.text.primary }}
          >
            Describe what you want to do with Git
          </label>
          <textarea
            className="w-full p-3 rounded-lg resize-none"
            style={{ 
              backgroundColor: theme.background.elevated,
              color: theme.text.primary,
              border: `1px solid ${theme.border.main}`
            }}
            rows="3"
            placeholder="e.g., 'I want to undo my last commit' or 'How do I merge feature branch into main?'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button
          className="w-full py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
          style={{ 
            backgroundColor: theme.primary.main,
            color: theme.primary.contrast,
            opacity: loading ? 0.7 : 1
          }}
          onClick={generateCommand}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Command size={16} />
              <span>Generate Command</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-2 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {generatedCommand && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-lg"
            style={{ backgroundColor: theme.background.elevated }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-mono font-medium" style={{ color: theme.text.primary }}>
                {generatedCommand.command}
              </h4>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: theme.background.paper,
                    color: theme.primary.main
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCommand.command);
                    toast.success('Command copied to clipboard');
                  }}
                >
                  <Copy size={16} />
                </button>
                <button
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: theme.background.paper,
                    color: theme.primary.main
                  }}
                  onClick={() => onCommandGenerated(generatedCommand)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            <p className="text-sm mb-2" style={{ color: theme.text.secondary }}>
              {generatedCommand.description}
            </p>
            
            <div className="space-y-2">
              <div className="text-sm" style={{ color: theme.text.secondary }}>
                <strong>Safety Level:</strong>{' '}
                <span className={`px-2 py-0.5 rounded text-xs ${
                  generatedCommand.safetyLevel === 'dangerous' ? 'bg-red-500' :
                  generatedCommand.safetyLevel === 'caution' ? 'bg-yellow-500' :
                  'bg-green-500'
                } text-white`}>
                  {generatedCommand.safetyLevel}
                </span>
              </div>
              
              {generatedCommand.examples && generatedCommand.examples.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    Examples:
                  </h5>
                  <div className="space-y-2">
                    {generatedCommand.examples.map((example, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded"
                        style={{ backgroundColor: theme.background.paper }}
                      >
                        <p className="text-sm mb-1" style={{ color: theme.text.secondary }}>
                          {example.description}
                        </p>
                        <code className="block text-sm font-mono p-2 rounded" style={{ backgroundColor: theme.background.elevated }}>
                          {example.command}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Learning view component
const LearningView = ({ theme, progress, onComplete }) => {
  const [activePath, setActivePath] = useState('beginner');
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  const handleLessonComplete = (lesson) => {
    onComplete({
      type: 'lesson',
      id: lesson.id,
      points: 10
    });
    toast.success('Lesson completed! +10 points');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
          Learn Git
        </h2>
        
        <ProgressTracker progress={progress} theme={theme} />

        <div className="mt-6 grid gap-4">
          {Object.entries(learningPaths).map(([pathId, path]) => (
            <div
              key={pathId}
              className="p-4 rounded-lg cursor-pointer transition-all"
              style={{ 
                backgroundColor: theme.background.paper,
                border: `1px solid ${activePath === pathId ? theme.primary.main : theme.border.main}`
              }}
              onClick={() => setActivePath(pathId)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                  {path.name}
                </h3>
                <Target size={20} style={{ color: theme.primary.main }} />
              </div>
              <p className="mt-2" style={{ color: theme.text.secondary }}>
                {path.description}
              </p>
              
              {activePath === pathId && path.modules.map(module => (
                <div key={module.id} className="mt-4">
                  <h4 
                    className="text-md font-semibold mb-2 cursor-pointer"
                    style={{ color: theme.text.primary }}
                    onClick={() => setActiveModule(module.id)}
                  >
                    {module.name}
                  </h4>
                  
                  {activeModule === module.id && (
                    <div className="space-y-2">
                      {module.lessons.map(lesson => (
                        <div
                          key={lesson.id}
                          className="p-3 rounded"
                          style={{ backgroundColor: theme.background.elevated }}
                        >
                          <h5 
                            className="font-medium cursor-pointer"
                            style={{ color: theme.text.primary }}
                            onClick={() => setActiveLesson(lesson.id)}
                          >
                            {lesson.name}
                          </h5>
                          
                          {activeLesson === lesson.id && (
                            <div className="mt-2">
                              <p style={{ color: theme.text.secondary }}>
                                {lesson.content}
                              </p>
                              {lesson.quiz && (
                                <div className="mt-4">
                                  <h6 className="font-medium mb-2" style={{ color: theme.text.primary }}>
                                    Quiz
                                  </h6>
                                  {lesson.quiz.map((q, idx) => (
                                    <div key={idx} className="mb-4">
                                      <p className="mb-2" style={{ color: theme.text.primary }}>
                                        {q.question}
                                      </p>
                                      <div className="space-y-2">
                                        {q.options.map((option, optIdx) => (
                                          <button
                                            key={optIdx}
                                            className="w-full p-2 rounded text-left"
                                            style={{ 
                                              backgroundColor: theme.background.paper,
                                              color: theme.text.primary,
                                              border: `1px solid ${theme.border.main}`
                                            }}
                                            onClick={() => {
                                              if (optIdx === q.correct) {
                                                handleLessonComplete(lesson);
                                              } else {
                                                toast.error('Try again!');
                                              }
                                            }}
                                          >
                                            {option}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
  const [commandDetailId, setCommandDetailId] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelView, setRightPanelView] = useState('details');
  const searchRef = useRef(null);
  const terminalRef = useRef(null);
  const [view, setView] = useLocalStorage('dashboardView', 'commands');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(true);
  const [aiHistory, setAiHistory] = useState([]);
  
  // Flattened tags for filtering
  const availableTags = tagCategories.flatMap(category => 
    category.tags.map(tag => ({
      ...tag,
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color
    }))
  );

  // Get command by ID (including custom commands)
  const getCommandById = useCallback((id) => {
    if (!id) return null;
    
    // Check in regular commands
    for (const category in commands) {
      const command = commands[category].find(c => c.id === id);
      if (command) return { ...command, category };
    }
    
    // Check in custom commands
    const customCommand = customCommands.find(c => c.id === id);
    if (customCommand) return { ...customCommand, category: 'custom' };
    
    return null;
  }, [commands, customCommands]);

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

  // Toggle favorite status
  const toggleFavorite = useCallback((commandId) => {
    if (!commandId) return;
    
    if (favorites.includes(commandId)) {
      setFavorites(favorites.filter(id => id !== commandId));
      toast.success('Removed from favorites');
    } else {
      setFavorites([...favorites, commandId]);
      toast.success('Added to favorites');
    }
  }, [favorites, setFavorites]);

  // Render command card component
  const CommandCard = ({ command, showCategory = false }) => {
    const isFavorite = favorites.includes(command.id);
    const [showExamples, setShowExamples] = useState(false);
    
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
          <div className="flex-1">
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
          <div className="flex items-center space-x-2">
            <button
              className={`p-1 rounded hover:bg-opacity-10 transition-colors ${
                isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
              }`}
              onClick={() => toggleFavorite(command.id)}
            >
              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              className="p-1 rounded hover:bg-opacity-10 transition-colors"
              style={{ color: theme.text.secondary }}
              onClick={() => handleCopyCommand(command.command, command.id)}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="mb-3" style={{ color: theme.text.secondary }}>
          {command.description}
        </div>

        {command.longDescription && (
          <div 
            className="mb-3 text-sm" 
            style={{ color: theme.text.hint }}
          >
            {command.longDescription}
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {command.tags && command.tags.map(tagId => {
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

        {command.examples && command.examples.length > 0 && (
          <div className="mt-4">
            <button
              className="text-sm flex items-center gap-1"
              style={{ color: theme.primary.main }}
              onClick={() => setShowExamples(!showExamples)}
            >
              {showExamples ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              {showExamples ? 'Hide Examples' : 'Show Examples'}
            </button>
            
            {showExamples && (
              <div className="mt-2 space-y-2">
                {command.examples.map((example, index) => (
                  <div 
                    key={index}
                    className="p-2 rounded text-sm"
                    style={{ backgroundColor: theme.background.elevated }}
                  >
                    <div className="mb-1" style={{ color: theme.text.secondary }}>
                      {example.description}
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="font-mono" style={{ color: theme.primary.main }}>
                        {example.command}
                      </code>
                      <button
                        className="p-1 rounded hover:bg-opacity-10"
                        style={{ color: theme.text.secondary }}
                        onClick={() => handleCopyCommand(example.command)}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {command.options && command.options.length > 0 && (
          <div className="mt-4 text-sm">
            <div className="font-semibold mb-2" style={{ color: theme.text.primary }}>
              Options:
            </div>
            <div className="space-y-1">
              {command.options.map((option, index) => (
                <div key={index} className="flex">
                  <code 
                    className="font-mono mr-2"
                    style={{ color: theme.primary.main }}
                  >
                    {option.flag}
                  </code>
                  <span style={{ color: theme.text.secondary }}>
                    {option.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

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
    
    // If viewing favorites, only show favorite commands
    if (activeCategory === 'favorites') {
      const favoriteCommands = favorites.map(id => getCommandById(id)).filter(Boolean);
      
      // Group by category
      favoriteCommands.forEach(cmd => {
        if (!result[cmd.category]) {
          result[cmd.category] = [];
        }
        result[cmd.category].push(cmd);
      });
      
      return result;
    }
    
    // If viewing recent, only show recently used commands
    if (activeCategory === 'recent') {
      const recentCommands = recentlyUsed
        .map(id => getCommandById(id))
        .filter(Boolean);
      
      // Group by category
      recentCommands.forEach(cmd => {
        if (!result[cmd.category]) {
          result[cmd.category] = [];
        }
        result[cmd.category].push(cmd);
      });
      
      return result;
    }
    
    // If viewing custom, only show custom commands
    if (activeCategory === 'custom') {
      return { custom: customCommands };
    }
    
    // If viewing a specific category, only show commands from that category
    if (activeCategory !== 'all') {
      return { [activeCategory]: commands[activeCategory] || [] };
    }
    
    // If viewing all, filter by search and tags
    Object.entries(commands).forEach(([category, categoryCommands]) => {
      const filtered = categoryCommands.filter(command => {
        // Filter by search
        if (searchTerm && !command.command.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !command.description.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filter by tags
        if (filterTags.length > 0) {
          const commandTags = command.tags || [];
          return filterTags.some(tag => commandTags.includes(tag));
        }
        
        return true;
      });
      
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    
    // Add custom commands if viewing all
    if (customCommands.length > 0) {
      const filtered = customCommands.filter(command => {
        // Filter by search
        if (searchTerm && !command.command.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !command.description.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filter by tags
        if (filterTags.length > 0) {
          const commandTags = command.tags || [];
          return filterTags.some(tag => commandTags.includes(tag));
        }
        
        return true;
      });
      
      if (filtered.length > 0) {
        result.custom = filtered;
      }
    }
    
    return result;
  };

  // Add AI suggestion function
  const getAiSuggestions = async (input) => {
    setIsLoadingAiSuggestions(true);
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a Git expert. Given the user's input command, suggest correct Git commands and explain why. Format your response as JSON:
            {
              "suggestions": [
                {
                  "command": "git command here",
                  "explanation": "why this command is suggested",
                  "example": "example usage"
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Suggest Git commands for: ${input}`
          }
        ],
        extra_headers: {
          "HTTP-Referer": "https://gitdashboardpro.com",
          "X-Title": "Git Dashboard Pro",
        }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      setAiSuggestions(response.suggestions);
    } catch (error) {
      console.error('AI Error:', error);
      setAiSuggestions([]);
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };

  // Update terminal command handler
  const handleTerminalCommand = useCallback((e) => {
    e.preventDefault();
    
    if (!terminalInput.trim()) return;
    
    setTerminalHistory(prev => [
      ...prev,
      { type: 'input', content: terminalInput }
    ]);
    
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
ai                     - Toggle AI suggestions
exit                   - Close terminal`
        }
      ]);
    } else if (input === 'exit') {
      setShowTerminal(false);
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
    } else if (input === 'ai') {
      setShowAiSuggestions(!showAiSuggestions);
      setTerminalHistory(prev => [
        ...prev,
        { type: 'system', content: `AI suggestions ${showAiSuggestions ? 'disabled' : 'enabled'}` }
      ]);
    } else if (input.startsWith('git ')) {
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
        
        setRecentlyUsed(prev => {
          const filtered = prev.filter(id => id !== matchingCommand.id);
          return [matchingCommand.id, ...filtered].slice(0, 10);
        });
      } else {
        // Get AI suggestions for incorrect commands
        getAiSuggestions(gitCmd);
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
    
    if (terminalRef.current) {
      setTimeout(() => {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }, 0);
    }
  }, [commands, customCommands, favorites, setRecentlyUsed, terminalInput, showAiSuggestions]);

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
                      <code className="font-mono" style={{ color: theme.primary.main }}>
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

  // Add new state for learning features
  const [learningProgress, setLearningProgress] = useLocalStorage('learningProgress', {
    completedLessons: [],
    totalPoints: 0,
    achievements: []
  });
  
  // Handle learning progress
  const handleProgress = (progress) => {
    setLearningProgress(prev => ({
      ...prev,
      completedLessons: [...prev.completedLessons, progress.id],
      totalPoints: prev.totalPoints + progress.points
    }));
  };

  // Handle AI-generated commands
  const handleCommandGenerated = (commandData) => {
    try {
      if (!commandData || !commandData.command) {
        throw new Error("Invalid command data");
      }
      
      const newCommand = {
        id: `custom-${Date.now()}`,
        command: commandData.command,
        description: commandData.description || "No description provided",
        longDescription: commandData.explanation || "No explanation provided",
        tags: [...(commandData.tags || []), commandData.safetyLevel || "safe"],
        examples: commandData.examples || [],
        category: 'custom',
        usage: 0,
        lastUsed: null,
        usageByWeekday: Array(7).fill(0),
        usageByHour: Array(24).fill(0),
        usageHistory: []
      };

      setCustomCommands(prev => [...prev, newCommand]);
      
      // Only add to history if prompt exists
      if (commandData.prompt) {
        setAiHistory(prev => [...prev, { 
          timestamp: new Date(), 
          prompt: commandData.prompt, 
          command: newCommand 
        }]);
      }
      
      toast.success('Command added to custom commands');
      
      // Switch to commands view and select the custom category
      setView('commands');
      setActiveCategory('custom');
      setCommandDetailId(newCommand.id);
    } catch (error) {
      console.error('Error handling generated command:', error);
      toast.error('Failed to add command. Please try again.');
    }
  };

  // Main render
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.background.default, color: theme.text.primary }}
    >
      <Toaster position="bottom-right" />
      
      {/* Header with tabs */}
      <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: theme.border.main }}>
        <div className="flex items-center">
          <GitBranch size={24} className="mr-2" style={{ color: theme.primary.main }} />
          <h1 className="text-xl font-bold">Git Dashboard Pro</h1>
        </div>
        
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg transition-colors`}
            style={{ 
              backgroundColor: view === 'commands' ? theme.primary.main : 'transparent',
              color: view === 'commands' ? theme.primary.contrast : theme.text.primary
            }}
            onClick={() => setView('commands')}
          >
            Commands
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors`}
            style={{ 
              backgroundColor: view === 'learn' ? theme.primary.main : 'transparent',
              color: view === 'learn' ? theme.primary.contrast : theme.text.primary
            }}
            onClick={() => setView('learn')}
          >
            Learn
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors`}
            style={{ 
              backgroundColor: view === 'ai' ? theme.primary.main : 'transparent',
              color: view === 'ai' ? theme.primary.contrast : theme.text.primary
            }}
            onClick={() => setView('ai')}
          >
            AI Assistant
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-lg"
            style={{ color: theme.text.secondary }}
            onClick={() => setShowTerminal(prev => !prev)}
          >
            <Terminal size={20} />
          </button>
          <button
            className="p-2 rounded-lg"
            style={{ color: theme.text.secondary }}
            onClick={() => setThemeId(themeId === 'dark' ? 'light' : 'dark')}
          >
            {themeId === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {view === 'commands' && (
          <div 
            className="w-64 border-r p-4 flex flex-col"
            style={{ borderColor: theme.border.main }}
          >
            {/* Search */}
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                className="w-full p-2 pl-8 rounded-lg"
                style={{ 
                  backgroundColor: theme.background.elevated,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.main}`
                }}
                placeholder="Search commands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search 
                size={16} 
                className="absolute left-2.5 top-2.5" 
                style={{ color: theme.text.secondary }} 
              />
            </div>
            
            {/* Categories */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center`}
                    style={{ 
                      backgroundColor: activeCategory === 'all' ? `${theme.primary.main}20` : 'transparent',
                      color: activeCategory === 'all' ? theme.primary.main : theme.text.primary
                    }}
                    onClick={() => setActiveCategory('all')}
                  >
                    <span>All Commands</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center`}
                    style={{ 
                      backgroundColor: activeCategory === 'favorites' ? `${theme.primary.main}20` : 'transparent',
                      color: activeCategory === 'favorites' ? theme.primary.main : theme.text.primary
                    }}
                    onClick={() => setActiveCategory('favorites')}
                  >
                    <Star size={16} className="mr-2" style={{ color: theme.primary.main }} />
                    <span>Favorites</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center`}
                    style={{ 
                      backgroundColor: activeCategory === 'recent' ? `${theme.primary.main}20` : 'transparent',
                      color: activeCategory === 'recent' ? theme.primary.main : theme.text.primary
                    }}
                    onClick={() => setActiveCategory('recent')}
                  >
                    <Clock size={16} className="mr-2" style={{ color: theme.primary.main }} />
                    <span>Recently Used</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center`}
                    style={{ 
                      backgroundColor: activeCategory === 'custom' ? `${theme.primary.main}20` : 'transparent',
                      color: activeCategory === 'custom' ? theme.primary.main : theme.text.primary
                    }}
                    onClick={() => setActiveCategory('custom')}
                  >
                    <Plus size={16} className="mr-2" style={{ color: theme.primary.main }} />
                    <span>Custom Commands</span>
                    <span className="ml-auto bg-opacity-20 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: theme.primary.main }}>
                      {customCommands.length}
                    </span>
                  </button>
                </li>
                {Object.keys(commands).map(category => (
                  <li key={category}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center`}
                      style={{ 
                        backgroundColor: activeCategory === category ? `${theme.primary.main}20` : 'transparent',
                        color: activeCategory === category ? theme.primary.main : theme.text.primary
                      }}
                      onClick={() => setActiveCategory(category)}
                    >
                      <span className="capitalize">{category}</span>
                      <span className="ml-auto bg-opacity-20 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: theme.primary.main }}>
                        {commands[category].length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Tags */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium" style={{ color: theme.text.secondary }}>Filter by Tags</h3>
                <button
                  className="text-xs"
                  style={{ color: theme.primary.main }}
                  onClick={() => setFilterTags([])}
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(tagCategories).map(([tagId, tag]) => (
                  <button
                    key={tagId}
                    className={`px-2 py-1 rounded-full text-xs transition-colors`}
                    style={{ 
                      backgroundColor: filterTags.includes(tagId) ? tag.color : `${tag.color}30`,
                      color: filterTags.includes(tagId) ? '#fff' : theme.text.primary
                    }}
                    onClick={() => {
                      if (filterTags.includes(tagId)) {
                        setFilterTags(filterTags.filter(t => t !== tagId));
                      } else {
                        setFilterTags([...filterTags, tagId]);
                      }
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {view === 'commands' ? (
            <div className="flex-1 flex">
              {/* Command list */}
              <div className="flex-1 overflow-y-auto p-4">
                {Object.entries(filteredCommands()).map(([category, categoryCommands]) => (
                  <div key={category} className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 capitalize" style={{ color: theme.text.primary }}>
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryCommands.map(command => (
                        <CommandCard
                          key={command.id}
                          command={command}
                          showCategory={activeCategory === 'all' || activeCategory === 'favorites' || activeCategory === 'recent'}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                
                {Object.keys(filteredCommands()).length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Search size={48} style={{ color: theme.text.secondary, opacity: 0.5 }} />
                    <p className="mt-4 text-lg" style={{ color: theme.text.secondary }}>
                      No commands found
                    </p>
                    <p style={{ color: theme.text.secondary }}>
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
              
              {/* Right panel */}
              <RightPanel command={commandDetailId ? getCommandById(commandDetailId) : null} />
            </div>
          ) : view === 'learn' ? (
            <div className="flex-1 overflow-y-auto">
              <LearningView 
                theme={theme} 
                progress={learningProgress}
                onComplete={handleProgress}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-3xl mx-auto">
                <div 
                  className="p-6 rounded-lg mb-6"
                  style={{ backgroundColor: theme.background.paper }}
                >
                  <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
                    AI Git Assistant
                  </h2>
                  <p className="mb-4" style={{ color: theme.text.secondary }}>
                    Get help with Git commands, learn best practices, and receive personalized recommendations.
                  </p>
                  <AICommandGenerator theme={theme} onCommandGenerated={handleCommandGenerated} />
                </div>
                
                <div 
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: theme.background.paper }}
                >
                  <h3 className="text-xl font-bold mb-4" style={{ color: theme.text.primary }}>
                    Recent AI Interactions
                  </h3>
                  {aiHistory && aiHistory.length > 0 ? (
                    <div className="space-y-4">
                      {aiHistory.map((item, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg"
                          style={{ backgroundColor: theme.background.elevated }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                              <p className="text-sm italic" style={{ color: theme.text.secondary }}>
                                "{item.prompt}"
                              </p>
                            </div>
                            <button
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: theme.background.paper }}
                              onClick={() => {
                                setCommandDetailId(item.command.id);
                                setView('commands');
                              }}
                            >
                              <ExternalLink size={16} style={{ color: theme.primary.main }} />
                            </button>
                          </div>
                          <div 
                            className="p-2 rounded font-mono text-sm"
                            style={{ backgroundColor: theme.background.paper }}
                          >
                            {item.command.command}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: theme.text.secondary }}>
                      No AI interactions yet. Try generating a command above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Terminal */}
      {showTerminal && (
        <div 
          className="border-t p-4"
          style={{ 
            borderColor: theme.border.main,
            backgroundColor: theme.background.paper
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Terminal size={16} className="mr-2" style={{ color: theme.primary.main }} />
              <h3 className="text-sm font-medium" style={{ color: theme.text.primary }}>
                Git Terminal Simulator
              </h3>
            </div>
            <button
              className="p-1 rounded hover:bg-opacity-10"
              style={{ 
                color: theme.text.secondary,
                backgroundColor: 'transparent',
                hoverBackgroundColor: theme.primary.main
              }}
              onClick={() => setShowTerminal(false)}
            >
              <X size={16} />
            </button>
          </div>
          
          <div 
            ref={terminalRef}
            className="h-64 overflow-y-auto p-3 rounded font-mono text-sm mb-2"
            style={{ 
              backgroundColor: theme.background.elevated,
              color: theme.text.primary
            }}
          >
            {terminalHistory.map((entry, idx) => (
              <div key={idx} className="mb-1">
                {entry.type === 'input' && (
                  <div className="flex">
                    <span style={{ color: theme.primary.main }}>$ </span>
                    <span>{entry.content}</span>
                  </div>
                )}
                {entry.type === 'output' && (
                  <div className="whitespace-pre-wrap pl-2">{entry.content}</div>
                )}
                {entry.type === 'error' && (
                  <div className="whitespace-pre-wrap pl-2" style={{ color: theme.error.main }}>
                    {entry.content}
                  </div>
                )}
                {entry.type === 'system' && (
                  <div className="whitespace-pre-wrap" style={{ color: theme.text.secondary }}>
                    {entry.content}
                  </div>
                )}
              </div>
            ))}

            {/* Terminal AI Suggestions */}
            {isLoadingAiSuggestions && (
              <div className="pl-3 text-yellow-400">
                Getting AI suggestions...
              </div>
            )}
            {showAiSuggestions && aiSuggestions.length > 0 && (
              <div className="pl-3 mt-2 border-l-2 border-blue-400">
                <div className="text-blue-400 mb-1">AI Suggestions:</div>
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="text-green-400 cursor-pointer hover:underline" 
                      onClick={() => {
                        setTerminalInput(suggestion.command);
                        setAiSuggestions([]);
                      }}>
                      {suggestion.command}
                    </div>
                    <div className="text-gray-400 text-sm">{suggestion.explanation}</div>
                    <div className="text-gray-500 text-sm">Example: {suggestion.example}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <form onSubmit={handleTerminalCommand}>
            <div className="flex">
              <span className="mr-2 font-mono" style={{ color: theme.primary.main }}>$</span>
              <input
                type="text"
                className="flex-1 bg-transparent outline-none font-mono"
                style={{ color: theme.text.primary }}
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type a git command..."
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GitDashboardPro; 
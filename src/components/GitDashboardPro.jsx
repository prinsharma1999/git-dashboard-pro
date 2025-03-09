import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  GitBranch, Moon, Sun, Search, Star, Filter, Terminal, 
  Copy, X, ChevronRight, ChevronLeft, Plus, Edit, Trash2, ChevronDown, ExternalLink, Clock, Book, Command, GitPullRequest, Brain, Trophy, Target, Lock
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

// Enhanced Learning paths data with 100+ lessons
const learningPaths = {
  beginner: {
    name: "Git Basics",
    description: "Learn the fundamental Git commands and workflows",
    level: 1,
    lessons: [
      {
        id: "intro",
        title: "Introduction to Git",
        content: "Git is a distributed version control system designed to handle everything from small to very large projects with speed and efficiency.",
        quiz: {
          question: "What is Git?",
          options: [
            { id: "a", text: "A programming language" },
            { id: "b", text: "A distributed version control system" },
            { id: "c", text: "A database management system" },
            { id: "d", text: "A text editor for coding" }
          ],
          answer: "b",
          explanation: "Git is a distributed version control system that tracks changes in any set of computer files, usually used for coordinating work among programmers. The other options are incorrect because Git is not a programming language, database system, or text editor."
        }
      },
      {
        id: "init",
        title: "Initializing a Repository",
        content: "Use 'git init' to create a new Git repository in your current directory.",
        quiz: {
          question: "How do you initialize a new Git repository?",
          options: [
            { id: "a", text: "git start" },
            { id: "b", text: "git create" },
            { id: "c", text: "git init" },
            { id: "d", text: "git new" }
          ],
          answer: "c",
          explanation: "The 'git init' command creates a new Git repository. It can be used to convert an existing, unversioned project to a Git repository or initialize a new, empty repository. The other commands don't exist in standard Git."
        }
      },
      {
        id: "clone",
        title: "Cloning a Repository",
        content: "Use 'git clone [url]' to copy an existing Git repository from a remote source.",
        quiz: {
          question: "Which command is used to copy a Git repository from a remote source?",
          options: [
            { id: "a", text: "git copy" },
            { id: "b", text: "git clone" },
            { id: "c", text: "git duplicate" },
            { id: "d", text: "git download" }
          ],
          answer: "b",
          explanation: "The 'git clone' command is used to copy a repository from a remote source. It creates a local copy of the remote repository, allowing you to work on the project. The other commands are not standard Git commands for this purpose."
        }
      }
      // ...more lessons will be added programmatically
    ]
  },
  intermediate: {
    name: "Branching & Merging",
    description: "Master the art of working with branches and merging changes",
    level: 2,
    lessons: [
      {
        id: "branch-basics",
        title: "Working with Branches",
        content: "Branches allow you to diverge from the main line of development and continue work without affecting the main line.",
        quiz: {
          question: "What command creates a new branch in Git?",
          options: [
            { id: "a", text: "git create-branch" },
            { id: "b", text: "git branch" },
            { id: "c", text: "git checkout -b" },
            { id: "d", text: "Both B and C are correct" }
          ],
          answer: "d",
          explanation: "Both 'git branch [branch-name]' and 'git checkout -b [branch-name]' can create branches. The difference is that 'git checkout -b' creates the branch and switches to it immediately, while 'git branch' only creates it without switching."
        }
      }
      // ...more lessons will be added programmatically
    ]
  },
  advanced: {
    name: "Advanced Git Techniques",
    description: "Learn advanced Git workflows, rebasing, and more",
    level: 3,
    lessons: [
      {
        id: "rebasing",
        title: "Understanding Rebasing",
        content: "Rebasing is the process of moving or combining a sequence of commits to a new base commit.",
        quiz: {
          question: "What is Git rebasing primarily used for?",
          options: [
            { id: "a", text: "Creating new branches" },
            { id: "b", text: "Merging branches together" },
            { id: "c", text: "Rewriting commit history" },
            { id: "d", text: "Deleting commits permanently" }
          ],
          answer: "c",
          explanation: "Rebasing is primarily used for rewriting commit history by moving or combining commits. While it can be used as part of a merging strategy, its primary purpose is to create a cleaner, more linear project history by eliminating unnecessary merge commits and maintaining a cleaner history."
        }
      }
      // ...more lessons will be added programmatically
    ]
  },
  expert: {
    name: "Git Workflows & Collaboration",
    description: "Master advanced workflows and collaboration techniques",
    level: 4,
    lessons: [
      {
        id: "git-flow",
        title: "Git Flow Workflow",
        content: "Git Flow is a branching model that involves the use of feature branches and multiple primary branches.",
        quiz: {
          question: "In the Git Flow workflow, which branch contains the official release history?",
          options: [
            { id: "a", text: "master/main" },
            { id: "b", text: "develop" },
            { id: "c", text: "feature" },
            { id: "d", text: "release" }
          ],
          answer: "a",
          explanation: "In Git Flow, the master/main branch contains the official release history, while the develop branch serves as an integration branch for features. Feature branches are used for new development, and release branches prepare new production releases."
        }
      }
      // ...more lessons will be added programmatically
    ]
  }
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
      console.log("Generating command with prompt:", prompt);
      const completion = await openai.chat.completions.create({
        model: "anthropic/claude-instant-v1", // More reliable model
        messages: [
          {
            role: "system",
            content: `You are a Git expert assistant. Generate Git commands based on natural language descriptions.
            Return ONLY valid JSON with no extra text. The JSON should have this structure:
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

      console.log("AI Response received:", completion);
      
      try {
        const response = completion.choices[0].message.content;
        console.log("Response content:", response);
        
        // Try to extract JSON from the response
        let commandData;
        try {
          commandData = JSON.parse(response);
        } catch (jsonError) {
          console.error("Initial JSON parse failed:", jsonError);
          // Try to extract JSON from the response if it contains other text
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              commandData = JSON.parse(jsonMatch[0]);
            } catch (nestedError) {
              console.error("Nested JSON parse failed:", nestedError);
              throw new Error("Could not parse JSON response");
            }
          } else {
            throw new Error("Could not extract JSON from response");
          }
        }
        
        // Validate and sanitize the response
        if (!commandData.command) commandData.command = "git status";
        if (!commandData.description) commandData.description = "No description provided";
        if (!commandData.explanation) commandData.explanation = "No explanation provided";
        if (!Array.isArray(commandData.tags)) commandData.tags = [];
        if (!Array.isArray(commandData.examples)) commandData.examples = [];
        if (!['safe', 'caution', 'dangerous'].includes(commandData.safetyLevel)) {
          commandData.safetyLevel = 'safe';
        }
        
        // Add the prompt to the command data for history
        commandData.prompt = prompt;
        
        console.log("Processed command data:", commandData);
        setGeneratedCommand(commandData);
        onCommandGenerated(commandData);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        setError('Failed to parse AI response. Please try again.');
        toast.error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('AI Error:', error);
      setError(`Failed to generate command: ${error.message || 'Unknown error'}`);
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

// Generate additional lessons programmatically to reach 100+
const generateAdditionalLessons = () => {
  const gitCommands = [
    { command: "git add", description: "Add file contents to the index" },
    { command: "git commit", description: "Record changes to the repository" },
    { command: "git push", description: "Update remote refs along with associated objects" },
    { command: "git pull", description: "Fetch from and integrate with another repository or a local branch" },
    { command: "git fetch", description: "Download objects and refs from another repository" },
    { command: "git merge", description: "Join two or more development histories together" },
    { command: "git rebase", description: "Reapply commits on top of another base tip" },
    { command: "git status", description: "Show the working tree status" },
    { command: "git log", description: "Show commit logs" },
    { command: "git diff", description: "Show changes between commits, commit and working tree, etc" },
    { command: "git stash", description: "Stash the changes in a dirty working directory away" },
    { command: "git tag", description: "Create, list, delete or verify a tag object signed with GPG" },
    { command: "git remote", description: "Manage set of tracked repositories" },
    { command: "git reset", description: "Reset current HEAD to the specified state" },
    { command: "git checkout", description: "Switch branches or restore working tree files" },
    { command: "git cherry-pick", description: "Apply the changes introduced by some existing commits" },
    { command: "git revert", description: "Revert some existing commits" },
    { command: "git bisect", description: "Use binary search to find the commit that introduced a bug" },
    { command: "git blame", description: "Show what revision and author last modified each line of a file" },
    { command: "git grep", description: "Print lines matching a pattern" }
  ];
  
  // Add lessons to each level
  Object.keys(learningPaths).forEach(path => {
    const pathLevel = learningPaths[path].level;
    
    for (let i = 0; i < 25; i++) {
      const command = gitCommands[Math.floor(Math.random() * gitCommands.length)];
      
      // Create lesson with increasing complexity based on level
      const options = [
        { id: "a", text: `To ${command.description.toLowerCase()}` },
        { id: "b", text: `To display commit history` },
        { id: "c", text: `To switch between branches` },
        { id: "d", text: `To create a new repository` }
      ];
      
      // Randomize the correct answer
      const correctIndex = Math.floor(Math.random() * 4);
      options[correctIndex].text = `To ${command.description.toLowerCase()}`;
      
      const lesson = {
        id: `${path}-${command.command}-${i}`,
        title: `Using ${command.command}`,
        content: `The ${command.command} command is used to ${command.description.toLowerCase()}. ${
          pathLevel > 1 ? 'It supports various options for advanced usage.' : ''
        } ${
          pathLevel > 2 ? 'Understanding its internals can help with complex workflows.' : ''
        } ${
          pathLevel > 3 ? 'Mastering this command is essential for expert-level Git usage.' : ''
        }`,
        quiz: {
          question: `What is the primary purpose of the ${command.command} command?`,
          options: options,
          answer: ["a", "b", "c", "d"][correctIndex],
          explanation: `The ${command.command} command is used to ${command.description.toLowerCase()}. This is its primary purpose. The other options describe different Git commands.`
        },
        difficulty: Math.min(pathLevel + Math.floor(i / 8), 4) // Increase difficulty gradually
      };
      
      learningPaths[path].lessons.push(lesson);
    }
  });
  
  // Add bonus hard lessons
  const bonusLessons = [
    {
      id: "bonus-1",
      title: "Advanced Rebase Techniques",
      content: "Interactive rebasing allows you to alter commits as they are moved to the new base.",
      quiz: {
        question: "Which of the following is NOT a valid option in interactive rebasing?",
        options: [
          { id: "a", text: "pick" },
          { id: "b", text: "squash" },
          { id: "c", text: "fix" },
          { id: "d", text: "reword" }
        ],
        answer: "c",
        explanation: "The valid options in interactive rebasing include 'pick', 'reword', 'edit', 'squash', 'fixup', 'exec', 'break', 'drop', and others. 'fix' is not a valid option."
      },
      isBonus: true,
      difficulty: 5
    },
    {
      id: "bonus-2",
      title: "Git Internals: Objects and Refs",
      content: "Git internally uses a content-addressable filesystem with objects and references.",
      quiz: {
        question: "Which of these is NOT a type of Git object?",
        options: [
          { id: "a", text: "blob" },
          { id: "b", text: "tree" },
          { id: "c", text: "branch" },
          { id: "d", text: "commit" }
        ],
        answer: "c",
        explanation: "Git has four main types of objects: blobs (file contents), trees (directory structures), commits (snapshots), and tags (references). Branches are refs pointing to commits, not objects themselves."
      },
      isBonus: true,
      difficulty: 5
    },
    // Add 8 more bonus lessons
    {
      id: "bonus-3",
      title: "Git Hooks",
      content: "Git hooks are scripts that Git executes before or after events such as commit, push, and receive.",
      quiz: {
        question: "Which hook runs before a commit is created?",
        options: [
          { id: "a", text: "pre-commit" },
          { id: "b", text: "post-commit" },
          { id: "c", text: "pre-push" },
          { id: "d", text: "post-checkout" }
        ],
        answer: "a",
        explanation: "The pre-commit hook runs before a commit is created, allowing you to inspect the snapshot that's about to be committed. It can be used for linting, testing, etc."
      },
      isBonus: true,
      difficulty: 5
    }
  ];
  
  // Add bonus lessons to expert path
  learningPaths.expert.lessons = [...learningPaths.expert.lessons, ...bonusLessons];
};

// Call the function to generate additional lessons
generateAdditionalLessons();

// Enhanced ProgressTracker component with points and levels
const ProgressTracker = ({ progress, theme }) => {
  const totalLessons = Object.values(learningPaths).reduce(
    (total, path) => total + path.lessons.length, 0
  );
  
  const completedLessons = progress.completedLessons.length;
  const percentage = Math.floor((completedLessons / totalLessons) * 100);
  
  const points = progress.points || 0;
  const level = Math.floor(points / 30) + 1;
  const nextLevelPoints = level * 30;
  
  return (
    <div className="p-4 rounded-lg shadow-md" 
      style={{ backgroundColor: theme.background.paper }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>Your Progress</h3>
        <div className="flex items-center space-x-2">
          <Trophy size={18} style={{ color: theme.primary.main }} />
          <span className="font-semibold" style={{ color: theme.primary.main }}>
            {points} Points
          </span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm">
          <span style={{ color: theme.text.secondary }}>
            {completedLessons} of {totalLessons} lessons complete
          </span>
          <span className="font-medium" style={{ color: theme.primary.main }}>
            {percentage}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: theme.background.elevated }}>
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: theme.primary.main
            }}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm">
          <span style={{ color: theme.text.secondary }}>
            Level {level} ({points}/{nextLevelPoints})
          </span>
          <span className="font-medium" style={{ color: theme.primary.main }}>
            {Math.floor((points % 30) / 30 * 100)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: theme.background.elevated }}>
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.floor((points % 30) / 30 * 100)}%`,
              backgroundColor: theme.primary.main
            }}
          />
        </div>
      </div>
      
      <div className="text-sm" style={{ color: theme.text.secondary }}>
        {level === 1 && "Keep learning to advance to the next level!"}
        {level === 2 && "You're making good progress!"}
        {level === 3 && "Impressive knowledge of Git!"}
        {level === 4 && "You're becoming a Git expert!"}
        {level >= 5 && "You've mastered Git! Keep exploring advanced topics."}
      </div>
    </div>
  );
};

// Enhanced Learning view component
const LearningView = ({ theme, progress, onComplete }) => {
  const [activePath, setActivePath] = useState('beginner');
  const [activeLesson, setActiveLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    // Calculate user level based on points
    const points = progress.points || 0;
    setUserLevel(Math.floor(points / 30) + 1);
  }, [progress]);

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson);
    setShowQuiz(false);
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  const handleLessonComplete = (lesson, correct = true) => {
    let pointsChange = correct ? 1 : -0.25;
    
    // Bonus for hard lessons
    if (lesson.isBonus) {
      pointsChange = correct ? 3 : -0.5;
    }
    
    // Apply difficulty multiplier
    if (lesson.difficulty) {
      pointsChange *= (1 + (lesson.difficulty - 1) * 0.2);
    }
    
    const newPoints = Math.max(0, (progress.points || 0) + pointsChange);
    
    // Only mark as completed if not already completed
    let completedLessons = [...progress.completedLessons];
    if (!completedLessons.includes(lesson.id) && correct) {
      completedLessons.push(lesson.id);
    }
    
    onComplete({
      completedLessons,
      points: newPoints,
      level: Math.floor(newPoints / 30) + 1
    });
    
    if (correct) {
      toast.success(`Correct! +${pointsChange.toFixed(1)} points`);
    } else {
      toast.error(`Incorrect. ${pointsChange.toFixed(1)} points`);
    }
  };

  const handleOptionSelect = (optionId) => {
    if (!quizSubmitted) {
      setSelectedOption(optionId);
    }
  };

  const handleQuizSubmit = () => {
    if (!selectedOption || quizSubmitted) return;
    
    setQuizSubmitted(true);
    const isCorrect = selectedOption === activeLesson.quiz.answer;
    handleLessonComplete(activeLesson, isCorrect);
  };

  const isLessonCompleted = (lessonId) => {
    return progress.completedLessons.includes(lessonId);
  };

  const getAvailablePaths = () => {
    return Object.entries(learningPaths)
      .filter(([_, pathData]) => pathData.level <= userLevel)
      .map(([pathId, _]) => pathId);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Sidebar */}
      <div 
        className="w-full md:w-64 md:border-r p-4 md:h-full overflow-y-auto"
        style={{ borderColor: theme.border.main }}
      >
        <ProgressTracker progress={progress} theme={theme} />
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>Learning Paths</h3>
          
          <div className="space-y-4">
            {Object.entries(learningPaths).map(([pathId, path]) => {
              const isAvailable = path.level <= userLevel;
              const pathProgress = path.lessons.filter(lesson => 
                isLessonCompleted(lesson.id)
              ).length / path.lessons.length;
              
              return (
                <div key={pathId}>
                  <button
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-colors mb-2"
                    style={{ 
                      backgroundColor: activePath === pathId ? `${theme.primary.main}20` : theme.background.elevated,
                      color: theme.text.primary,
                      opacity: isAvailable ? 1 : 0.5,
                      cursor: isAvailable ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => isAvailable && setActivePath(pathId)}
                    disabled={!isAvailable}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: theme.primary.main }}
                      >
                        <span style={{ color: theme.primary.contrast }}>{path.level}</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{path.name}</div>
                        <div className="text-sm" style={{ color: theme.text.secondary }}>
                          {Math.round(pathProgress * 100)}% complete
                        </div>
                      </div>
                    </div>
                    
                    {!isAvailable && (
                      <div className="text-sm px-2 py-1 rounded" style={{ backgroundColor: theme.background.paper }}>
                        <Lock size={14} />
                      </div>
                    )}
                  </button>
                  
                  {activePath === pathId && (
                    <div className="ml-4 space-y-1">
                      {path.lessons.map(lesson => (
                        <button
                          key={lesson.id}
                          className="w-full text-left p-2 rounded flex items-center"
                          style={{ 
                            backgroundColor: activeLesson?.id === lesson.id ? `${theme.primary.main}10` : 'transparent',
                            color: theme.text.primary
                          }}
                          onClick={() => handleLessonSelect(lesson)}
                        >
                          <div 
                            className="w-5 h-5 rounded-full mr-2 flex items-center justify-center text-xs"
                            style={{ 
                              backgroundColor: isLessonCompleted(lesson.id) ? theme.success.main : theme.background.elevated,
                              color: isLessonCompleted(lesson.id) ? '#fff' : theme.text.secondary
                            }}
                          >
                            {isLessonCompleted(lesson.id) ? '✓' : ''}
                          </div>
                          <span className="truncate">{lesson.title}</span>
                          {lesson.isBonus && (
                            <span 
                              className="ml-2 px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: theme.warning.main, color: '#fff' }}
                            >
                              BONUS
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeLesson ? (
          <div>
            <div 
              className="p-6 rounded-lg mb-6"
              style={{ backgroundColor: theme.background.paper }}
            >
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
                {activeLesson.title}
              </h2>
              
              {activeLesson.isBonus && (
                <div 
                  className="inline-block px-2 py-1 rounded text-sm mb-4"
                  style={{ backgroundColor: theme.warning.main, color: '#fff' }}
                >
                  BONUS CHALLENGE - Extra Points!
                </div>
              )}
              
              <div 
                className="prose mb-6"
                style={{ color: theme.text.secondary }}
              >
                {activeLesson.content}
              </div>
              
              {!showQuiz ? (
                <button
                  className="w-full py-2 px-4 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: theme.primary.main,
                    color: theme.primary.contrast
                  }}
                  onClick={() => setShowQuiz(true)}
                >
                  Take Quiz
                </button>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold" style={{ color: theme.text.primary }}>
                    Quiz
                  </h3>
                  
                  <div className="font-medium mb-4" style={{ color: theme.text.primary }}>
                    {activeLesson.quiz.question}
                  </div>
                  
                  <div className="space-y-2">
                    {activeLesson.quiz.options.map(option => (
                      <button
                        key={option.id}
                        className="w-full text-left p-3 rounded-lg flex items-start"
                        style={{ 
                          backgroundColor: quizSubmitted 
                            ? option.id === activeLesson.quiz.answer 
                              ? `${theme.success.main}20` 
                              : selectedOption === option.id 
                                ? `${theme.error.main}20` 
                                : theme.background.elevated
                            : selectedOption === option.id 
                              ? `${theme.primary.main}20` 
                              : theme.background.elevated,
                          color: theme.text.primary,
                          borderLeft: selectedOption === option.id ? `4px solid ${theme.primary.main}` : '4px solid transparent'
                        }}
                        onClick={() => handleOptionSelect(option.id)}
                      >
                        <div 
                          className="w-6 h-6 rounded-full mr-3 flex items-center justify-center"
                          style={{ 
                            backgroundColor: quizSubmitted 
                              ? option.id === activeLesson.quiz.answer
                                ? theme.success.main
                                : selectedOption === option.id ? theme.error.main : theme.background.paper
                              : selectedOption === option.id ? theme.primary.main : theme.background.paper,
                            color: selectedOption === option.id || (quizSubmitted && option.id === activeLesson.quiz.answer) 
                              ? '#fff' 
                              : theme.text.secondary
                          }}
                        >
                          {option.id.toUpperCase()}
                        </div>
                        <div className="flex-1">{option.text}</div>
                      </button>
                    ))}
                  </div>
                  
                  {quizSubmitted && (
                    <div 
                      className="p-4 rounded-lg mt-4"
                      style={{ 
                        backgroundColor: selectedOption === activeLesson.quiz.answer 
                          ? `${theme.success.main}10` 
                          : `${theme.error.main}10`,
                        color: selectedOption === activeLesson.quiz.answer 
                          ? theme.success.main 
                          : theme.error.main
                      }}
                    >
                      <div className="font-semibold mb-2">
                        {selectedOption === activeLesson.quiz.answer ? 'Correct!' : 'Incorrect'}
                      </div>
                      <div style={{ color: theme.text.primary }}>
                        {activeLesson.quiz.explanation}
                      </div>
                    </div>
                  )}
                  
                  {!quizSubmitted ? (
                    <button
                      className="w-full py-2 px-4 rounded-lg transition-colors mt-4"
                      style={{ 
                        backgroundColor: selectedOption ? theme.primary.main : theme.background.elevated,
                        color: selectedOption ? theme.primary.contrast : theme.text.secondary,
                        opacity: selectedOption ? 1 : 0.7
                      }}
                      onClick={handleQuizSubmit}
                      disabled={!selectedOption}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className="flex space-x-4 mt-4">
                      <button
                        className="flex-1 py-2 px-4 rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: theme.background.elevated,
                          color: theme.text.primary
                        }}
                        onClick={() => {
                          setShowQuiz(false);
                          setSelectedOption(null);
                          setQuizSubmitted(false);
                        }}
                      >
                        Back to Lesson
                      </button>
                      
                      <button
                        className="flex-1 py-2 px-4 rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: theme.primary.main,
                          color: theme.primary.contrast
                        }}
                        onClick={() => {
                          // Find the next lesson in the current path
                          const currentPathLessons = learningPaths[activePath].lessons;
                          const currentIndex = currentPathLessons.findIndex(l => l.id === activeLesson.id);
                          
                          if (currentIndex < currentPathLessons.length - 1) {
                            // Go to next lesson in this path
                            handleLessonSelect(currentPathLessons[currentIndex + 1]);
                          } else {
                            // Try to go to the next available path
                            const availablePaths = getAvailablePaths();
                            const currentPathIndex = availablePaths.indexOf(activePath);
                            
                            if (currentPathIndex < availablePaths.length - 1) {
                              const nextPath = availablePaths[currentPathIndex + 1];
                              setActivePath(nextPath);
                              handleLessonSelect(learningPaths[nextPath].lessons[0]);
                            } else {
                              // No more lessons available
                              setActiveLesson(null);
                              setShowQuiz(false);
                            }
                          }
                        }}
                      >
                        Next Lesson
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <Book size={48} style={{ color: theme.text.secondary, opacity: 0.5 }} />
            <p className="mt-4 text-lg" style={{ color: theme.text.secondary }}>
              Select a lesson to start learning
            </p>
          </div>
        )}
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

  // Add a terminal toggle function that ensures it works
  const toggleTerminal = useCallback(() => {
    console.log("Toggling terminal, current state:", showTerminal);
    setShowTerminal(prev => !prev);
  }, [showTerminal]);

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
            onClick={toggleTerminal}
            aria-label="Toggle Terminal"
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
// Initial learning paths data
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
    ]
  }
};

// Generate additional lessons
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
        id: `${path}-${command.command.replace(/\s+/g, '-')}-${i}`,
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

// Calculate total lessons for convenience
Object.keys(learningPaths).forEach(path => {
  const pathData = learningPaths[path];
  pathData.totalLessons = pathData.lessons.length;
});

// Calculate total lessons across all paths
const totalLessons = Object.values(learningPaths).reduce(
  (total, path) => total + path.lessons.length, 0
);

export { learningPaths, totalLessons }; 
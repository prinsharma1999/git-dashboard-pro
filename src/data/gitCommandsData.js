// Git commands data with detailed information
export const gitCommandsData = [
  {
    id: 1,
    command: "git init",
    shortDescription: "Initialize a new Git repository",
    longDescription: "Creates a new Git repository in the current directory, setting up the necessary data structures and files that Git needs to operate.",
    example: "git init",
    tags: ["basics", "setup"],
    isFavorite: false
  },
  {
    id: 2,
    command: "git clone [url]",
    shortDescription: "Clone a repository",
    longDescription: "Creates a copy of an existing Git repository. This includes all files, branches, and commits from the original repository.",
    example: "git clone https://github.com/username/repository.git",
    tags: ["basics", "remote"],
    isFavorite: false
  },
  {
    id: 3,
    command: "git add [file]",
    shortDescription: "Add file to staging area",
    longDescription: "Adds a file to the staging area, preparing it to be included in the next commit.",
    example: "git add index.html\ngit add .",
    tags: ["basics", "changes"],
    isFavorite: false
  },
  {
    id: 4,
    command: "git commit -m [message]",
    shortDescription: "Commit staged changes",
    longDescription: "Records the changes in the staging area to the repository history with a descriptive message.",
    example: "git commit -m \"Add new feature\"",
    tags: ["basics", "changes"],
    isFavorite: false
  },
  {
    id: 5,
    command: "git status",
    shortDescription: "Check repository status",
    longDescription: "Shows the current state of your working directory and staging area, including which files are modified, staged, or untracked.",
    example: "git status",
    tags: ["basics", "info"],
    isFavorite: false
  },
  {
    id: 6,
    command: "git push",
    shortDescription: "Push commits to remote",
    longDescription: "Uploads local repository commits to a remote repository.",
    example: "git push origin main",
    tags: ["remote", "sharing"],
    isFavorite: false
  },
  {
    id: 7,
    command: "git pull",
    shortDescription: "Pull changes from remote",
    longDescription: "Fetches changes from a remote repository and merges them into the current branch.",
    example: "git pull origin main",
    tags: ["remote", "sync"],
    isFavorite: false
  },
  {
    id: 8,
    command: "git branch",
    shortDescription: "List branches",
    longDescription: "Lists all local branches in the current repository. The current branch is highlighted with an asterisk.",
    example: "git branch",
    tags: ["branch", "info"],
    isFavorite: false
  },
  {
    id: 9,
    command: "git checkout [branch]",
    shortDescription: "Switch to branch",
    longDescription: "Switches to the specified branch and updates the working directory to match.",
    example: "git checkout feature-branch",
    tags: ["branch", "navigation"],
    isFavorite: false
  },
  {
    id: 10,
    command: "git merge [branch]",
    shortDescription: "Merge branch into current",
    longDescription: "Combines the specified branch's history into the current branch.",
    example: "git merge feature-branch",
    tags: ["branch", "changes"],
    isFavorite: false
  },
  {
    id: 11,
    command: "git log",
    shortDescription: "View commit history",
    longDescription: "Shows a log of commits for the current branch, with commit messages, authors, and timestamps.",
    example: "git log\ngit log --oneline",
    tags: ["info", "history"],
    isFavorite: false
  },
  {
    id: 12,
    command: "git reset [file]",
    shortDescription: "Unstage file",
    longDescription: "Removes the specified file from the staging area, but preserves its contents.",
    example: "git reset HEAD file.txt",
    tags: ["changes", "undo"],
    isFavorite: false
  },
  {
    id: 13,
    command: "git stash",
    shortDescription: "Stash changes",
    longDescription: "Temporarily stores all modified tracked files so you can switch branches without committing.",
    example: "git stash\ngit stash pop",
    tags: ["changes", "workflow"],
    isFavorite: false
  },
  {
    id: 14,
    command: "git remote -v",
    shortDescription: "List remote repositories",
    longDescription: "Shows all remote repositories configured for the current project, along with their URLs.",
    example: "git remote -v",
    tags: ["remote", "info"],
    isFavorite: false
  },
  {
    id: 15,
    command: "git fetch",
    shortDescription: "Download remote changes",
    longDescription: "Downloads objects and refs from another repository without merging them into your local branches.",
    example: "git fetch origin",
    tags: ["remote", "sync"],
    isFavorite: false
  }
];

export default gitCommandsData; 
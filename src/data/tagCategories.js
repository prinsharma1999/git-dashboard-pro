import React from 'react';
import { Target, Award, Zap, Settings, Folder, Server, Users, GitBranch, GitCommit, GitMerge, Clock, Lock, AlertTriangle, LifeBuoy, GitPullRequest } from 'lucide-react';

export const tagCategories = [
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
      { id: 'workflow', name: 'Workflow', color: '#6D28D9', icon: <GitBranch size={14} /> },
      { id: 'maintenance', name: 'Maintenance', color: '#5B21B6', icon: <LifeBuoy size={14} /> },
    ]
  },
]; 
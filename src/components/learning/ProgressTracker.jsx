import React from 'react';
import { Trophy } from 'lucide-react';

const ProgressTracker = ({ progress, theme }) => {
  const totalLessons = progress.totalLessons || 0; 
  
  const completedLessons = progress.completedLessons?.length || 0;
  const percentage = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;
  
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

export default ProgressTracker; 
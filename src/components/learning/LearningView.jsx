import React, { useState, useEffect } from 'react';
import { Book, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProgressTracker from './ProgressTracker';
import { learningPaths } from '../../data/learningPaths';

const LearningView = ({ theme, progress, onComplete }) => {
  const [activePath, setActivePath] = useState('beginner');
  const [activeLesson, setActiveLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Calculate user level based on points
    try {
      const points = progress?.points || 0;
      setUserLevel(Math.floor(points / 30) + 1);
    } catch (err) {
      console.error("Error calculating user level:", err);
      // Set a default level to prevent breaking
      setUserLevel(1);
    }
  }, [progress]);

  const handleLessonSelect = (lesson) => {
    try {
      setError(null);
      setActiveLesson(lesson);
      setShowQuiz(false);
      setSelectedOption(null);
      setQuizSubmitted(false);
    } catch (err) {
      console.error("Error selecting lesson:", err);
      setError("Could not load lesson. Please try again.");
    }
  };

  const handleLessonComplete = (lesson, correct = true) => {
    try {
      let pointsChange = correct ? 1 : -0.25;
      
      // Bonus for hard lessons
      if (lesson.isBonus) {
        pointsChange = correct ? 3 : -0.5;
      }
      
      // Apply difficulty multiplier
      if (lesson.difficulty) {
        pointsChange *= (1 + (lesson.difficulty - 1) * 0.2);
      }
      
      // Handle the case where progress might be undefined
      const currentProgress = progress || { completedLessons: [], points: 0 };
      const newPoints = Math.max(0, (currentProgress.points || 0) + pointsChange);
      
      // Only mark as completed if not already completed
      let completedLessons = [...(currentProgress.completedLessons || [])];
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
    } catch (err) {
      console.error("Error completing lesson:", err);
      toast.error("Couldn't update progress. Please try again.");
    }
  };

  const handleOptionSelect = (optionId) => {
    try {
      if (!quizSubmitted) {
        setSelectedOption(optionId);
      }
    } catch (error) {
      console.error("Error selecting option:", error);
      // Prevent blanking by handling errors
      toast.error("Error selecting option. Please try again.");
    }
  };

  const handleQuizSubmit = () => {
    try {
      if (!selectedOption || quizSubmitted) return;
      
      setQuizSubmitted(true);
      if (!activeLesson || !activeLesson.quiz || !activeLesson.quiz.answer) {
        throw new Error("Quiz data is invalid");
      }
      
      const isCorrect = selectedOption === activeLesson.quiz.answer;
      handleLessonComplete(activeLesson, isCorrect);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const isLessonCompleted = (lessonId) => {
    try {
      if (!progress || !progress.completedLessons) return false;
      return progress.completedLessons.includes(lessonId);
    } catch (error) {
      console.error("Error checking lesson completion:", error);
      return false;
    }
  };

  const getAvailablePaths = () => {
    try {
      return Object.entries(learningPaths)
        .filter(([_, pathData]) => pathData.level <= userLevel)
        .map(([pathId, _]) => pathId);
    } catch (error) {
      console.error("Error getting available paths:", error);
      return ['beginner']; // Fallback to beginner path
    }
  };

  // Add error display and fallback
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <div className="text-red-500 mb-4">
          <AlertCircle size={48} />
        </div>
        <p className="text-lg mb-2" style={{ color: theme.error.main }}>
          {error}
        </p>
        <button
          className="px-4 py-2 mt-4 rounded-lg"
          style={{ backgroundColor: theme.primary.main, color: theme.primary.contrast }}
          onClick={() => {
            setError(null);
            setActiveLesson(null);
          }}
        >
          Return to Lessons
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Sidebar */}
      <div 
        className="w-full md:w-64 md:border-r p-4 md:h-full overflow-y-auto"
        style={{ borderColor: theme.border.main }}
      >
        <ProgressTracker progress={{...progress, totalLessons: learningPaths.totalLessons}} theme={theme} />
        
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

export default LearningView; 
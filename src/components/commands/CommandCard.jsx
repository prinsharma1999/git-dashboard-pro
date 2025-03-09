import React from 'react';
import { Copy, Star, Tag, Edit, Trash, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * CommandCard component displays an individual Git command with details and actions
 * 
 * @param {Object} props - Component props
 * @param {Object} props.command - Command data object containing name, description, etc.
 * @param {Function} props.onCopy - Function to handle copying command to clipboard
 * @param {Function} props.onFavorite - Function to toggle favorite status
 * @param {Function} props.onEdit - Function to handle edit action
 * @param {Function} props.onDelete - Function to handle delete action
 * @param {Array} props.tagCategories - Available tag categories for filtering
 */
const CommandCard = ({ 
  command, 
  onCopy, 
  onFavorite, 
  onEdit, 
  onDelete,
  tagCategories 
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  // Function to render tags with appropriate colors
  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map(tag => {
          // Find the category this tag belongs to
          const category = tagCategories.find(
            c => c.tags.includes(tag)
          );
          
          // Default color if category not found
          const tagColor = category ? category.color : "bg-gray-200";
          
          return (
            <span 
              key={tag} 
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${tagColor} text-white`}
            >
              <Tag size={12} className="mr-1" />
              {tag}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {command.command}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {command.description}
          </p>
          {renderTags(command.tags)}
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onCopy(command.command)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Copy command"
          >
            <Copy size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
          
          <button 
            onClick={() => onFavorite(command.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title={command.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star 
              size={18} 
              className={command.isFavorite 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-500 dark:text-gray-400"} 
            />
          </button>
          
          <button 
            onClick={() => onEdit(command)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Edit command"
          >
            <Edit size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
          
          <button 
            onClick={() => onDelete(command.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Delete command"
          >
            <Trash size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
          
          <button
            onClick={toggleExpand}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title={expanded ? "Show less" : "Show more"}
          >
            {expanded 
              ? <ChevronUp size={18} className="text-gray-500 dark:text-gray-400" />
              : <ChevronDown size={18} className="text-gray-500 dark:text-gray-400" />
            }
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          {command.longDescription && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Description
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                {command.longDescription}
              </p>
            </div>
          )}
          
          {command.examples && command.examples.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Examples
              </h4>
              <ul className="list-disc list-inside">
                {command.examples.map((example, idx) => (
                  <li key={idx} className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                      {example.command}
                    </code>
                    {example.description && (
                      <span className="ml-2">{example.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommandCard; 
import React, { useState } from 'react';
import { Search, Filter, X, PlusCircle } from 'lucide-react';
import CommandCard from './CommandCard';

/**
 * CommandList component displays a filterable list of Git commands
 * 
 * @param {Object} props - Component props
 * @param {Array} props.commands - Array of command objects to display
 * @param {Array} props.tagCategories - Available tag categories for filtering
 * @param {Function} props.onAddCommand - Function to handle adding a new command
 * @param {Function} props.onCopyCommand - Function to handle copying a command
 * @param {Function} props.onEditCommand - Function to handle editing a command
 * @param {Function} props.onDeleteCommand - Function to handle deleting a command
 * @param {Function} props.onToggleFavorite - Function to toggle favorite status
 */
const CommandList = ({
  commands,
  tagCategories,
  onAddCommand,
  onCopyCommand,
  onEditCommand,
  onDeleteCommand,
  onToggleFavorite
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle a tag in the filter selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTags([]);
    setShowOnlyFavorites(false);
  };

  // Filter commands based on search term, selected tags, and favorites
  const filteredCommands = commands.filter(command => {
    // Filter by search term
    const matchesSearch = 
      command.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (command.longDescription && 
        command.longDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by tags
    const matchesTags = 
      selectedTags.length === 0 || 
      (command.tags && 
        selectedTags.every(tag => command.tags.includes(tag)));
    
    // Filter by favorites
    const matchesFavorites = 
      !showOnlyFavorites || command.isFavorite;
    
    return matchesSearch && matchesTags && matchesFavorites;
  });

  return (
    <div className="w-full">
      {/* Search and filter bar */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="relative flex-grow">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search commands..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300
                      hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Filter size={20} />
          </button>
          
          <button
            onClick={onAddCommand}
            className="ml-2 p-2 bg-blue-500 rounded-lg text-white
                      hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
            title="Add new command"
          >
            <PlusCircle size={20} />
          </button>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear all
              </button>
            </div>
            
            <div className="mb-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showOnlyFavorites}
                  onChange={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  Show only favorites
                </span>
              </label>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tagCategories.flatMap(category => 
                  category.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium
                                ${selectedTags.includes(tag) 
                                  ? category.color + ' text-white' 
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Command cards */}
      <div className="space-y-4">
        {filteredCommands.length > 0 ? (
          filteredCommands.map(command => (
            <CommandCard
              key={command.id}
              command={command}
              onCopy={onCopyCommand}
              onFavorite={onToggleFavorite}
              onEdit={onEditCommand}
              onDelete={onDeleteCommand}
              tagCategories={tagCategories}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No commands found matching your filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandList; 
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Command Editor Component for creating and editing Git commands
 */
const CommandEditor = ({ command, onSave, onCancel, theme, tagCategories }) => {
  const [editedCommand, setEditedCommand] = useState({
    command: command ? command.command : '',
    description: command ? command.description : '',
    longDescription: command ? command.longDescription || '' : '',
    tags: command ? [...(command.tags || [])] : [],
    examples: command ? [...(command.examples || [])] : [],
  });
  
  const [newExample, setNewExample] = useState({ description: '', command: '' });
  const [selectedTags, setSelectedTags] = useState(
    command && command.tags ? 
    command.tags.filter(tag => tagCategories && Object.keys(tagCategories).includes(tag)) : 
    []
  );

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create updated command
    const updatedCommand = {
      ...command,
      ...editedCommand,
      id: command ? command.id : `custom-${Date.now()}`,
      tags: selectedTags,
      category: 'custom',
    };
    
    onSave(updatedCommand);
  };

  // Add new example to the list
  const handleAddExample = () => {
    if (newExample.description && newExample.command) {
      setEditedCommand({
        ...editedCommand,
        examples: [...(editedCommand.examples || []), { ...newExample }]
      });
      setNewExample({ description: '', command: '' });
    }
  };

  // Remove example from the list
  const handleRemoveExample = (index) => {
    const updatedExamples = [...editedCommand.examples];
    updatedExamples.splice(index, 1);
    setEditedCommand({
      ...editedCommand,
      examples: updatedExamples
    });
  };

  // Toggle tag selection
  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return (
    <div
      className="p-6 rounded-lg"
      style={{ backgroundColor: theme.background.paper }}
    >
      <h3 className="text-xl font-semibold mb-4" style={{ color: theme.text.primary }}>
        {command ? 'Edit Command' : 'Create New Command'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium" style={{ color: theme.text.primary }}>
            Command
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg"
            style={{ 
              backgroundColor: theme.background.elevated,
              color: theme.text.primary,
              border: `1px solid ${theme.border.main}`
            }}
            value={editedCommand.command}
            onChange={(e) => setEditedCommand({ ...editedCommand, command: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium" style={{ color: theme.text.primary }}>
            Short Description
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg"
            style={{ 
              backgroundColor: theme.background.elevated,
              color: theme.text.primary,
              border: `1px solid ${theme.border.main}`
            }}
            value={editedCommand.description}
            onChange={(e) => setEditedCommand({ ...editedCommand, description: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium" style={{ color: theme.text.primary }}>
            Detailed Explanation
          </label>
          <textarea
            className="w-full p-2 rounded-lg resize-none"
            style={{ 
              backgroundColor: theme.background.elevated,
              color: theme.text.primary,
              border: `1px solid ${theme.border.main}`
            }}
            rows="4"
            value={editedCommand.longDescription}
            onChange={(e) => setEditedCommand({ ...editedCommand, longDescription: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium" style={{ color: theme.text.primary }}>
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tagCategories && Object.entries(tagCategories).map(([tagId, tag]) => (
              <button
                key={tagId}
                type="button"
                className={`px-2 py-1 rounded-full text-xs transition-colors`}
                style={{ 
                  backgroundColor: selectedTags.includes(tagId) ? tag.color : `${tag.color}30`,
                  color: selectedTags.includes(tagId) ? '#fff' : theme.text.primary
                }}
                onClick={() => handleTagToggle(tagId)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium" style={{ color: theme.text.primary }}>
            Examples
          </label>
          
          {editedCommand.examples && editedCommand.examples.length > 0 && (
            <div className="mb-3 space-y-2">
              {editedCommand.examples.map((example, index) => (
                <div 
                  key={index}
                  className="p-2 rounded-lg flex items-start justify-between"
                  style={{ backgroundColor: theme.background.elevated }}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                      {example.description}
                    </div>
                    <code className="text-sm" style={{ color: theme.primary.main }}>
                      {example.command}
                    </code>
                  </div>
                  
                  <button
                    type="button"
                    className="p-1 rounded-lg"
                    style={{ color: theme.error.main }}
                    onClick={() => handleRemoveExample(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                className="w-full p-2 rounded-lg"
                style={{ 
                  backgroundColor: theme.background.elevated,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.main}`
                }}
                placeholder="Example description"
                value={newExample.description}
                onChange={(e) => setNewExample({ ...newExample, description: e.target.value })}
              />
              
              <input
                type="text"
                className="w-full p-2 rounded-lg"
                style={{ 
                  backgroundColor: theme.background.elevated,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border.main}`
                }}
                placeholder="Example command"
                value={newExample.command}
                onChange={(e) => setNewExample({ ...newExample, command: e.target.value })}
              />
            </div>
            
            <button
              type="button"
              className="mt-2 p-2 rounded-lg"
              style={{ 
                backgroundColor: theme.primary.main,
                color: theme.primary.contrast
              }}
              onClick={handleAddExample}
              disabled={!newExample.description || !newExample.command}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: theme.background.elevated,
              color: theme.text.primary
            }}
            onClick={onCancel}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: theme.primary.main,
              color: theme.primary.contrast
            }}
          >
            Save Command
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommandEditor; 
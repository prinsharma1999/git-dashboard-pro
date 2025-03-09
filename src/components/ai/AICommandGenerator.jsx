import React, { useState } from 'react';
import { Brain, Command, Copy, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
      
      // Use direct fetch approach as recommended by OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "HTTP-Referer": "https://gitdashboardpro.com",
          "X-Title": "Git Dashboard Pro",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "qwen/qwq-32b:free",
          "messages": [
            {
              "role": "system",
              "content": `You are a Git expert assistant. Generate Git commands based on natural language descriptions.
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
              "role": "user",
              "content": prompt
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const completion = await response.json();
      console.log("AI Response received:", completion);
      
      if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        throw new Error("Invalid API response structure");
      }
      
      try {
        const responseContent = completion.choices[0].message.content;
        console.log("Response content:", responseContent);
        
        // Try to extract JSON from the response
        let commandData = null;
        
        // First, try direct parsing
        try {
          commandData = JSON.parse(responseContent);
          console.log("Successfully parsed JSON directly");
        } catch (jsonError) {
          console.error("Initial JSON parse failed:", jsonError);
          
          // Next, try to find a JSON object in the text
          try {
            const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              commandData = JSON.parse(jsonMatch[0]);
              console.log("Successfully extracted JSON from response text");
            } else {
              // If no JSON object found, try to create a simple command object from the text
              const lines = responseContent.split('\n').filter(line => line.trim());
              if (lines.length >= 2) {
                commandData = {
                  command: lines[0].replace(/^[`"']+|[`"']+$/g, ''),
                  description: lines[1],
                  explanation: lines.slice(2).join('\n'),
                  tags: ["git"],
                  safetyLevel: "safe",
                  examples: []
                };
                console.log("Created command object from text:", commandData);
              } else {
                throw new Error("Could not extract command information from response");
              }
            }
          } catch (extractError) {
            console.error("Failed to extract JSON:", extractError);
            throw new Error("Could not parse response as a valid command");
          }
        }
        
        if (!commandData) {
          throw new Error("Failed to extract command data from response");
        }
        
        // Validate and sanitize the response
        if (!commandData.command) commandData.command = "git status";
        if (!commandData.description) commandData.description = "No description provided";
        if (!commandData.explanation) commandData.explanation = "No explanation provided";
        if (!Array.isArray(commandData.tags)) commandData.tags = ["git"];
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
        setError(`Failed to parse AI response: ${parseError.message}`);
        toast.error('Failed to parse AI response. Please try again with a clearer description.');
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

export default AICommandGenerator; 
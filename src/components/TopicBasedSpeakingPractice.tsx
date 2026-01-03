import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Collapse,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as BrainIcon,
  Mic as MicIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { deepseekApi, SpeakingExercise } from '../services/deepseekApi';
import SpeakingPractice from './SpeakingPractice';

interface Topic {
  id: string;
  name: string;
  category: string;
  isCustom?: boolean;
}

const predefinedTopics: Topic[] = [
  // Business & Professional
  { id: 'job-interview', name: 'Job Interviews', category: 'Business & Professional' },
  { id: 'workplace', name: 'Workplace Communication', category: 'Business & Professional' },
  { id: 'presentations', name: 'Business Presentations', category: 'Business & Professional' },
  { id: 'negotiations', name: 'Negotiations', category: 'Business & Professional' },
  { id: 'networking', name: 'Professional Networking', category: 'Business & Professional' },

  // Academic & Education
  { id: 'university', name: 'University Life', category: 'Academic & Education' },
  { id: 'research', name: 'Research & Studies', category: 'Academic & Education' },
  { id: 'scientific', name: 'Scientific Discussions', category: 'Academic & Education' },
  { id: 'conferences', name: 'Academic Conferences', category: 'Academic & Education' },

  // Daily Life & Social
  { id: 'healthcare', name: 'Healthcare & Medical', category: 'Daily Life & Social' },
  { id: 'banking', name: 'Banking & Finance', category: 'Daily Life & Social' },
  { id: 'travel', name: 'Travel & Tourism', category: 'Daily Life & Social' },
  { id: 'housing', name: 'Housing & Accommodation', category: 'Daily Life & Social' },
  { id: 'shopping', name: 'Shopping & Services', category: 'Daily Life & Social' },

  // Culture & Society
  { id: 'environment', name: 'Environmental Issues', category: 'Culture & Society' },
  { id: 'politics', name: 'Politics & Current Affairs', category: 'Culture & Society' },
  { id: 'technology', name: 'Technology & Innovation', category: 'Culture & Society' },
  { id: 'culture', name: 'German Culture & Traditions', category: 'Culture & Society' },
  { id: 'media', name: 'Media & Entertainment', category: 'Culture & Society' },

  // Advanced Topics
  { id: 'philosophy', name: 'Philosophy & Ethics', category: 'Advanced Topics' },
  { id: 'psychology', name: 'Psychology & Human Behavior', category: 'Advanced Topics' },
  { id: 'economics', name: 'Economics & Markets', category: 'Advanced Topics' },
  { id: 'law', name: 'Legal Matters', category: 'Advanced Topics' }
];

export default function TopicBasedSpeakingPractice() {
  const { currentUser } = useAuth();
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [customTopics, setCustomTopics] = useState<Topic[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'B1' | 'B2' | 'C1'>('B1');
  const [generatedExercises, setGeneratedExercises] = useState<SpeakingExercise[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customTopicName, setCustomTopicName] = useState('');
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    'Business & Professional': true,
    'Daily Life & Social': true
  });

  useEffect(() => {
    // Auto-select a few default topics based on difficulty
    const defaultTopics = selectedDifficulty === 'B1' 
      ? predefinedTopics.filter(t => ['job-interview', 'healthcare', 'travel'].includes(t.id))
      : selectedDifficulty === 'B2'
      ? predefinedTopics.filter(t => ['workplace', 'university', 'environment'].includes(t.id))
      : predefinedTopics.filter(t => ['presentations', 'scientific', 'philosophy'].includes(t.id));
    
    setSelectedTopics(defaultTopics);
  }, [selectedDifficulty]);

  const allTopics = [...predefinedTopics, ...customTopics];
  const groupedTopics = allTopics.reduce((groups, topic) => {
    const category = topic.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(topic);
    return groups;
  }, {} as { [key: string]: Topic[] });

  const handleTopicToggle = (topic: Topic) => {
    setSelectedTopics(prev => {
      const isSelected = prev.some(t => t.id === topic.id);
      if (isSelected) {
        return prev.filter(t => t.id !== topic.id);
      } else {
        return [...prev, topic];
      }
    });
  };

  const handleAddCustomTopic = () => {
    if (!customTopicName.trim()) return;
    
    const newTopic: Topic = {
      id: `custom-${Date.now()}`,
      name: customTopicName,
      category: 'Custom Topics',
      isCustom: true
    };
    
    setCustomTopics(prev => [...prev, newTopic]);
    setSelectedTopics(prev => [...prev, newTopic]);
    setCustomTopicName('');
    setShowCustomDialog(false);
  };

  const handleGenerateExercises = async () => {
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const topicNames = selectedTopics.map(t => t.name);
      const exercises = await deepseekApi.generateSpeakingExercises(
        topicNames,
        selectedDifficulty,
        15
      );
      
      setGeneratedExercises(exercises);
      console.log(`Generated ${exercises.length} exercises for topics: ${topicNames.join(', ')}`);
      
    } catch (error: any) {
      console.error('Failed to generate speaking exercises:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate exercises. ';
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage += 'Network connection issue detected. This may be a temporary server problem. Please try again in a moment.';
      } else if (error.message.includes('API key')) {
        errorMessage += 'API configuration issue. Please check your settings.';
      } else if (error.message.includes('HTTP 500')) {
        errorMessage += 'Server is temporarily unavailable. Please try again.';
      } else {
        errorMessage += error.message || 'Please try again in a moment.';
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (!currentUser) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Please log in to access personalized speaking practice
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ 
          color: 'white', 
          fontWeight: 700, 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
          🎯 Topic-Based Speaking Practice
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Select topics and difficulty level to generate personalized speaking exercises with AI
        </Typography>
      </Box>

      {/* Difficulty Selection */}
      <Card sx={{ 
        mb: 3,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            📊 Difficulty Level
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {(['B1', 'B2', 'C1'] as const).map((level) => (
              <Button
                key={level}
                variant={selectedDifficulty === level ? 'contained' : 'outlined'}
                onClick={() => setSelectedDifficulty(level)}
                sx={{
                  borderRadius: '12px',
                  background: selectedDifficulty === level
                    ? level === 'B1' ? '#4caf50' : level === 'B2' ? '#ff9800' : '#9c27b0'
                    : 'transparent',
                  borderColor: level === 'B1' ? '#4caf50' : level === 'B2' ? '#ff9800' : '#9c27b0',
                  color: selectedDifficulty === level ? 'white' : 
                    (level === 'B1' ? '#4caf50' : level === 'B2' ? '#ff9800' : '#9c27b0'),
                  '&:hover': {
                    background: selectedDifficulty === level
                      ? (level === 'B1' ? '#45a049' : level === 'B2' ? '#f57c00' : '#7b1fa2')
                      : `rgba(${level === 'B1' ? '76, 175, 80' : level === 'B2' ? '255, 152, 0' : '156, 39, 176'}, 0.1)`
                  }
                }}
              >
                {level} {level === 'B1' ? 'Intermediate' : level === 'B2' ? 'Upper-Intermediate' : 'Advanced'}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Topic Selection */}
      <Card sx={{ 
        mb: 3,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              🏷️ Select Topics ({selectedTopics.length} selected)
            </Typography>
            <Button
              onClick={() => setShowCustomDialog(true)}
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: '8px',
                borderColor: '#06d6a0',
                color: '#06d6a0',
                '&:hover': { borderColor: '#34d399', background: 'rgba(6, 214, 160, 0.1)' }
              }}
            >
              Add Custom
            </Button>
          </Box>

          {/* Selected Topics */}
          {selectedTopics.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                Selected Topics:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedTopics.map((topic) => (
                  <Chip
                    key={topic.id}
                    label={topic.name}
                    onDelete={() => handleTopicToggle(topic)}
                    sx={{
                      background: '#06d6a0',
                      color: 'white',
                      '& .MuiChip-deleteIcon': { color: 'white' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Topic Categories */}
          {Object.entries(groupedTopics).map(([category, topics]) => (
            <Accordion
              key={category}
              expanded={expandedCategories[category] || false}
              onChange={() => handleCategoryToggle(category)}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                mb: 1,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {category} ({topics.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {topics.map((topic) => {
                    const isSelected = selectedTopics.some(t => t.id === topic.id);
                    return (
                      <Chip
                        key={topic.id}
                        label={topic.name}
                        onClick={() => handleTopicToggle(topic)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.8)',
                          background: isSelected ? 'rgba(6, 214, 160, 0.3)' : 'transparent',
                          '&:hover': {
                            background: isSelected ? 'rgba(6, 214, 160, 0.4)' : 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      />
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Button
          onClick={handleGenerateExercises}
          disabled={isGenerating || selectedTopics.length === 0}
          variant="contained"
          size="large"
          startIcon={isGenerating ? <CircularProgress size={20} /> : <BrainIcon />}
          sx={{
            borderRadius: '16px',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)',
            }
          }}
        >
          {isGenerating ? 'Generating Exercises...' : `Generate ${selectedDifficulty} Speaking Exercises`}
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            color: '#ff6b6b',
            border: '1px solid rgba(244, 67, 54, 0.3)'
          }}
          action={
            <IconButton
              size="small"
              onClick={() => setError('')}
              sx={{ color: '#ff6b6b' }}
            >
              <CloseIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Generated Exercises */}
      {generatedExercises.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
            🎤 Your Personalized Speaking Exercises
          </Typography>
          <SpeakingPractice 
            exercises={generatedExercises}
            onComplete={(exerciseId, score) => {
              console.log(`Completed exercise ${exerciseId} with score ${score}`);
            }}
          />
        </Box>
      )}

      {/* Custom Topic Dialog */}
      <Dialog
        open={showCustomDialog}
        onClose={() => setShowCustomDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Add Custom Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Topic Name"
            value={customTopicName}
            onChange={(e) => setCustomTopicName(e.target.value)}
            placeholder="e.g., Space Exploration, Cooking, Sports..."
            sx={{
              mt: 2,
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
              '& .MuiOutlinedInput-input': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCustomDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddCustomTopic}
            variant="contained"
            disabled={!customTopicName.trim()}
            sx={{
              background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }
            }}
          >
            Add Topic
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
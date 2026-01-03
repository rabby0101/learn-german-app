import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tabs,
  Tab,
  Paper,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Psychology as BrainIcon,
  Translate as TranslateIcon,
  Article as ArticleIcon
} from '@mui/icons-material';

interface WritingExercise {
  id: string;
  type: 'sentence-building' | 'translation' | 'free-writing' | 'essay' | 'letter';
  title: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  prompt: string;
  context?: string;
  wordBank?: string[];
  sampleAnswer?: string;
  rubric?: {
    grammar: number;
    vocabulary: number;
    structure: number;
    creativity: number;
  };
  tips?: string[];
  minWords?: number;
  maxWords?: number;
}

interface WritingPracticeProps {
  exercises?: WritingExercise[];
  onComplete?: (exerciseId: string, score: number, text: string) => void;
}

const defaultExercises: WritingExercise[] = [
  {
    id: 'w1',
    type: 'sentence-building',
    title: 'Build a Sentence',
    difficulty: 'A1',
    prompt: 'Create a sentence using all the words from the word bank to describe what you do in the morning.',
    context: 'Daily routine',
    wordBank: ['ich', 'stehe', 'um', 'sieben', 'Uhr', 'auf'],
    sampleAnswer: 'Ich stehe um sieben Uhr auf.',
    tips: ['Remember German word order', 'Separable verbs go to the end'],
    minWords: 5,
    maxWords: 10
  },
  {
    id: 'w2',
    type: 'translation',
    title: 'Translation Practice',
    difficulty: 'A2',
    prompt: 'Translate this sentence into German: "I would like to order a coffee and a piece of cake, please."',
    context: 'At a café',
    sampleAnswer: 'Ich möchte gerne einen Kaffee und ein Stück Kuchen bestellen, bitte.',
    tips: ['Use "möchte" for polite requests', 'Don\'t forget the accusative case', '"gerne" makes it more polite'],
    minWords: 8,
    maxWords: 12
  },
  {
    id: 'w3',
    type: 'free-writing',
    title: 'Describe Your Day',
    difficulty: 'B1',
    prompt: 'Write a short paragraph describing your typical day. Include at least 3 activities and use time expressions.',
    context: 'Personal description',
    tips: [
      'Use time expressions: "zuerst", "dann", "später", "am Ende"',
      'Include separable verbs',
      'Use perfect tense for completed actions'
    ],
    minWords: 60,
    maxWords: 100
  },
  {
    id: 'w4',
    type: 'letter',
    title: 'Informal Letter',
    difficulty: 'B2',
    prompt: 'Write a short letter to a German friend inviting them to visit your city. Mention what you could do together and why they should come.',
    context: 'Personal correspondence',
    tips: [
      'Start with "Liebe/r [Name]"',
      'Use subjunctive II for suggestions: "Wir könnten..."',
      'End with "Viele Grüße" or "Bis bald"',
      'Use informal "du" form'
    ],
    minWords: 80,
    maxWords: 120
  },
  {
    id: 'w5',
    type: 'essay',
    title: 'Opinion Essay',
    difficulty: 'C1',
    prompt: 'Write a short essay about the advantages and disadvantages of social media. Present both sides and give your opinion.',
    context: 'Academic writing',
    tips: [
      'Structure: Introduction, Advantages, Disadvantages, Conclusion',
      'Use connecting words: "einerseits", "andererseits", "jedoch", "außerdem"',
      'Express opinions: "Meiner Meinung nach...", "Ich bin der Ansicht, dass..."',
      'Use formal register'
    ],
    minWords: 150,
    maxWords: 200
  }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function WritingPractice({ exercises = defaultExercises, onComplete }: WritingPracticeProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userText, setUserText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showTips, setShowTips] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [wordCount, setWordCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    const words = userText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [userText]);

  const analyzeWriting = () => {
    if (!userText.trim()) {
      setFeedback('Please write something first!');
      setScore(0);
      setShowFeedback(true);
      return;
    }

    // Simulate writing analysis (in a real app, you'd use language processing APIs)
    const wordCount = userText.trim().split(/\s+/).length;
    let calculatedScore = 0;

    // Basic scoring based on length and requirements
    if (currentExercise.minWords && wordCount >= currentExercise.minWords) {
      calculatedScore += 30;
    }

    if (currentExercise.maxWords && wordCount <= currentExercise.maxWords) {
      calculatedScore += 20;
    } else if (!currentExercise.maxWords) {
      calculatedScore += 20;
    }

    // Check for specific requirements
    switch (currentExercise.type) {
      case 'sentence-building':
        if (currentExercise.wordBank?.every(word => 
          userText.toLowerCase().includes(word.toLowerCase())
        )) {
          calculatedScore += 30;
        }
        break;
      
      case 'translation':
        // Simple keyword matching for translation
        const keywords = ['möchte', 'kaffee', 'kuchen', 'bestellen', 'bitte'];
        const foundKeywords = keywords.filter(keyword => 
          userText.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        calculatedScore += (foundKeywords / keywords.length) * 30;
        break;
      
      default:
        calculatedScore += Math.min(wordCount / (currentExercise.minWords || 50), 1) * 30;
    }

    // Bonus points for proper structure and complexity
    calculatedScore += Math.floor(Math.random() * 20); // Simulate grammar/style scoring

    calculatedScore = Math.min(Math.round(calculatedScore), 100);

    // Generate feedback
    let feedbackText = '';
    if (calculatedScore >= 90) {
      feedbackText = 'Excellent work! Your writing demonstrates strong German skills.';
    } else if (calculatedScore >= 80) {
      feedbackText = 'Great job! Your writing is well-structured and clear.';
    } else if (calculatedScore >= 70) {
      feedbackText = 'Good effort! Focus on grammar and vocabulary expansion.';
    } else if (calculatedScore >= 60) {
      feedbackText = 'Decent attempt! Consider reviewing sentence structure.';
    } else {
      feedbackText = 'Keep practicing! Review the tips and try again.';
    }

    // Add specific feedback based on exercise type
    switch (currentExercise.type) {
      case 'sentence-building':
        if (currentExercise.wordBank && 
            !currentExercise.wordBank.every(word => 
              userText.toLowerCase().includes(word.toLowerCase())
            )) {
          feedbackText += ' Make sure to use all words from the word bank.';
        }
        break;
      
      case 'free-writing':
        if (wordCount < (currentExercise.minWords || 0)) {
          feedbackText += ` Try to write at least ${currentExercise.minWords} words.`;
        }
        break;
    }

    setScore(calculatedScore);
    setFeedback(feedbackText);
    setShowFeedback(true);

    if (calculatedScore >= 70) {
      setCompletedExercises(prev => new Set(Array.from(prev).concat(currentExercise.id)));
      if (onComplete) {
        onComplete(currentExercise.id, calculatedScore, userText);
      }
    }
  };

  const resetExercise = () => {
    setUserText('');
    setShowFeedback(false);
    setScore(null);
    setFeedback('');
    setShowTips(false);
    setShowSample(false);
  };

  const nextExercise = () => {
    setCurrentExerciseIndex(prev => (prev + 1) % exercises.length);
    resetExercise();
  };

  const previousExercise = () => {
    setCurrentExerciseIndex(prev => prev === 0 ? exercises.length - 1 : prev - 1);
    resetExercise();
  };

  const getDifficultyColor = (level: string): string => {
    const colors = {
      'A1': '#4caf50',
      'A2': '#8bc34a',
      'B1': '#ff9800',
      'B2': '#ff5722',
      'C1': '#9c27b0',
      'C2': '#673ab7'
    };
    return colors[level as keyof typeof colors] || '#757575';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#06d6a0';
    if (score >= 80) return '#34d399';
    if (score >= 70) return '#fbbf24';
    return '#ff6b6b';
  };

  const getWordCountColor = (): string => {
    if (!currentExercise.minWords) return 'rgba(255, 255, 255, 0.8)';
    
    if (wordCount < currentExercise.minWords) return '#ff6b6b';
    if (currentExercise.maxWords && wordCount > currentExercise.maxWords) return '#fbbf24';
    return '#06d6a0';
  };

  const filteredExercises = exercises.filter(ex => {
    switch (selectedTab) {
      case 0: return ex.type === 'sentence-building' || ex.type === 'translation';
      case 1: return ex.type === 'free-writing' || ex.type === 'letter';
      case 2: return ex.type === 'essay';
      default: return true;
    }
  });

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={(_, newValue) => setSelectedTab(newValue)}
            centered
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                textTransform: 'none',
                '&.Mui-selected': { color: '#06d6a0' },
              },
              '& .MuiTabs-indicator': { backgroundColor: '#06d6a0' },
            }}
          >
            <Tab icon={<TranslateIcon />} label="Basic" iconPosition="start" />
            <Tab icon={<EditIcon />} label="Creative" iconPosition="start" />
            <Tab icon={<ArticleIcon />} label="Academic" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
            ✍️ {currentExercise.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={currentExercise.difficulty}
              sx={{
                background: getDifficultyColor(currentExercise.difficulty),
                color: 'white',
                fontWeight: 600,
              }}
            />
            <Chip
              label={`${currentExerciseIndex + 1}/${exercises.length}`}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Exercise Prompt */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            📝 Task:
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
            {currentExercise.prompt}
          </Typography>
          
          {currentExercise.context && (
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontStyle: 'italic' 
            }}>
              Context: {currentExercise.context}
            </Typography>
          )}

          {/* Word requirements */}
          {(currentExercise.minWords || currentExercise.maxWords) && (
            <Typography variant="body2" sx={{ 
              color: '#fbbf24', 
              fontWeight: 600,
              mt: 1
            }}>
              Length: {currentExercise.minWords && `Min ${currentExercise.minWords} words`}
              {currentExercise.minWords && currentExercise.maxWords && ', '}
              {currentExercise.maxWords && `Max ${currentExercise.maxWords} words`}
            </Typography>
          )}
        </Paper>

        {/* Word Bank (for sentence building exercises) */}
        {currentExercise.wordBank && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
              📦 Word Bank:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentExercise.wordBank.map((word, index) => (
                <Chip
                  key={index}
                  label={word}
                  variant="outlined"
                  sx={{
                    borderColor: userText.toLowerCase().includes(word.toLowerCase()) 
                      ? '#06d6a0' 
                      : 'rgba(255, 255, 255, 0.3)',
                    color: userText.toLowerCase().includes(word.toLowerCase()) 
                      ? '#06d6a0' 
                      : 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: userText.toLowerCase().includes(word.toLowerCase()) 
                      ? 'rgba(6, 214, 160, 0.1)' 
                      : 'transparent'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Writing Area */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ color: 'white' }}>
              Your Answer:
            </Typography>
            <Typography variant="body2" sx={{ color: getWordCountColor(), fontWeight: 600 }}>
              Words: {wordCount}
              {currentExercise.minWords && ` / ${currentExercise.minWords}${currentExercise.maxWords ? `-${currentExercise.maxWords}` : '+'}`}
            </Typography>
          </Box>
          
          <TextField
            multiline
            rows={currentExercise.type === 'essay' ? 8 : currentExercise.type === 'letter' ? 6 : 4}
            fullWidth
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder={`Start writing in German...`}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#06d6a0',
                },
              },
              '& .MuiOutlinedInput-input': {
                fontSize: '1rem',
                lineHeight: 1.6,
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={analyzeWriting}
            startIcon={<BrainIcon />}
            disabled={!userText.trim()}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.5,
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
            Check Writing
          </Button>

          <Button
            variant="outlined"
            onClick={() => setShowTips(!showTips)}
            startIcon={showTips ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              borderRadius: '12px',
              borderColor: '#fbbf24',
              color: '#fbbf24',
              '&:hover': {
                borderColor: '#f59e0b',
                background: 'rgba(251, 191, 36, 0.1)',
              },
            }}
          >
            Tips
          </Button>

          {currentExercise.sampleAnswer && (
            <Button
              variant="outlined"
              onClick={() => setShowSample(!showSample)}
              startIcon={showSample ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                borderRadius: '12px',
                borderColor: '#6366f1',
                color: '#6366f1',
                '&:hover': {
                  borderColor: '#8b5cf6',
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              Sample
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={resetExercise}
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: '12px',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Reset
          </Button>
        </Box>

        {/* Tips Section */}
        <Collapse in={showTips}>
          <Paper sx={{ 
            p: 2, 
            mb: 3, 
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            <Typography variant="subtitle2" sx={{ color: '#fbbf24', fontWeight: 600, mb: 1 }}>
              💡 Writing Tips:
            </Typography>
            <List dense>
              {currentExercise.tips?.map((tip, index) => (
                <ListItem key={index} sx={{ py: 0.5, pl: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <LightbulbIcon sx={{ color: '#fbbf24', fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={tip}
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontSize: '0.9rem' 
                      } 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Collapse>

        {/* Sample Answer Section */}
        <Collapse in={showSample}>
          <Paper sx={{ 
            p: 2, 
            mb: 3, 
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <Typography variant="subtitle2" sx={{ color: '#6366f1', fontWeight: 600, mb: 1 }}>
              📋 Sample Answer:
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontStyle: 'italic',
              lineHeight: 1.6
            }}>
              {currentExercise.sampleAnswer}
            </Typography>
          </Paper>
        </Collapse>

        {/* Feedback Section */}
        {showFeedback && score !== null && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ 
              color: getScoreColor(score), 
              fontWeight: 700, 
              textAlign: 'center', 
              mb: 2 
            }}>
              Score: {score}%
            </Typography>
            
            <LinearProgress
              variant="determinate"
              value={score}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                mb: 2,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: `linear-gradient(90deg, ${getScoreColor(score)} 0%, ${getScoreColor(score)}88 100%)`,
                },
              }}
            />
            
            <Alert 
              severity={score >= 70 ? "success" : "info"}
              sx={{ 
                backgroundColor: score >= 70 
                  ? 'rgba(6, 214, 160, 0.1)' 
                  : 'rgba(99, 102, 241, 0.1)',
                color: 'white',
                border: `1px solid ${score >= 70 ? '#06d6a0' : '#6366f1'}`,
                '& .MuiAlert-icon': {
                  color: score >= 70 ? '#06d6a0' : '#6366f1'
                }
              }}
            >
              {feedback}
            </Alert>

            {completedExercises.has(currentExercise.id) && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                <CheckIcon sx={{ color: '#06d6a0' }} />
                <Typography variant="body2" sx={{ color: '#06d6a0', fontWeight: 600 }}>
                  Exercise Completed!
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={previousExercise}
            startIcon={<span>⬅️</span>}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Previous
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Progress: {completedExercises.size} / {exercises.length}
            </Typography>
            {completedExercises.has(currentExercise.id) && (
              <CheckIcon sx={{ color: '#06d6a0' }} />
            )}
          </Box>

          <Button
            onClick={nextExercise}
            endIcon={<span>➡️</span>}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Next
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
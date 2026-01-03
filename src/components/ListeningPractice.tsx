import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  VolumeUp as VolumeUpIcon,
  VolumeDown as VolumeDownIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { TTSService } from '../services/ttsService';

interface ListeningExercise {
  id: string;
  title: string;
  type: 'multiple-choice' | 'fill-blanks' | 'true-false' | 'short-answer';
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  audioText: string; // Text to be spoken
  transcript?: string; // Optional transcript for advanced exercises
  questions: {
    id: string;
    question: string;
    type: 'multiple-choice' | 'fill-blank' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string;
    explanation?: string;
  }[];
  context: string;
  vocabulary?: string[];
}

interface ListeningPracticeProps {
  exercises?: ListeningExercise[];
  onComplete?: (exerciseId: string, score: number) => void;
}

const defaultExercises: ListeningExercise[] = [
  {
    id: 'l1',
    title: 'At the Bakery',
    type: 'multiple-choice',
    difficulty: 'A2',
    audioText: 'Guten Morgen! Ich hätte gern zwei Brötchen und ein Schwarzbrot, bitte. Was kostet das? Acht Euro? Das ist teuer! Haben Sie auch billiges Brot?',
    context: 'A customer is shopping at a German bakery',
    vocabulary: ['Brötchen (bread rolls)', 'Schwarzbrot (dark bread)', 'teuer (expensive)', 'billig (cheap)'],
    questions: [
      {
        id: 'q1',
        question: 'What does the customer want to buy?',
        type: 'multiple-choice',
        options: [
          'Two bread rolls and dark bread',
          'Only bread rolls',
          'Cake and coffee',
          'Only dark bread'
        ],
        correctAnswer: 'Two bread rolls and dark bread',
        explanation: 'The customer says "zwei Brötchen und ein Schwarzbrot" (two bread rolls and one dark bread)'
      },
      {
        id: 'q2',
        question: 'How does the customer react to the price?',
        type: 'multiple-choice',
        options: [
          'They think it\'s reasonable',
          'They think it\'s too expensive',
          'They are happy with the price',
          'They don\'t mention the price'
        ],
        correctAnswer: 'They think it\'s too expensive',
        explanation: 'The customer says "Das ist teuer!" (That is expensive!)'
      }
    ]
  },
  {
    id: 'l2',
    title: 'Weather Report',
    type: 'fill-blanks',
    difficulty: 'B1',
    audioText: 'Das Wetter heute: Am Morgen ist es bewölkt mit einer Temperatur von fünfzehn Grad. Am Nachmittag scheint die Sonne und es wird zweiundzwanzig Grad warm. Am Abend gibt es leichten Regen.',
    context: 'A weather forecast for today',
    vocabulary: ['bewölkt (cloudy)', 'Temperatur (temperature)', 'scheinen (to shine)', 'Regen (rain)'],
    questions: [
      {
        id: 'q1',
        question: 'Am Morgen ist es _____ mit einer Temperatur von _____ Grad.',
        type: 'fill-blank',
        correctAnswer: 'bewölkt, fünfzehn',
        explanation: 'The morning weather is cloudy (bewölkt) with 15 degrees'
      },
      {
        id: 'q2',
        question: 'Am Nachmittag wird es _____ Grad warm.',
        type: 'fill-blank',
        correctAnswer: 'zweiundzwanzig',
        explanation: 'In the afternoon it gets 22 degrees warm'
      }
    ]
  }
];

export default function ListeningPractice({ exercises = defaultExercises, onComplete }: ListeningPracticeProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [speechSupported, setSpeechSupported] = useState(true);

  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const checkSpeechSupport = () => {
      const synthesis = 'speechSynthesis' in window;
      setSpeechSupported(synthesis);
      
      if (synthesis) {
        speechSynthesis.current = window.speechSynthesis;
      }
    };

    checkSpeechSupport();
  }, []);

  const currentExercise = exercises[currentExerciseIndex];

  const playAudio = async () => {
    if (isPlaying) {
      // Stop current audio
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    try {
      // Use Google Cloud TTS service for high-quality German pronunciation at 1.0 speed
      await TTSService.speak(currentExercise.audioText, undefined, 1.0);
      console.log('🔊 Playing German listening exercise with Google Cloud TTS at 1.0 speed');
      
      // Estimate duration and reset playing state
      const estimatedDuration = currentExercise.audioText.length * 80 + 1000; // Adjust for playback rate
      setTimeout(() => {
        setIsPlaying(false);
      }, estimatedDuration * (2 - playbackRate)); // Adjust for speed
      
    } catch (error) {
      console.error('Google Cloud TTS error:', error);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsPlaying(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const checkAnswers = () => {
    const totalQuestions = currentExercise.questions.length;
    let correctAnswers = 0;

    currentExercise.questions.forEach(question => {
      const userAnswer = userAnswers[question.id]?.toLowerCase().trim();
      const correctAnswer = question.correctAnswer.toLowerCase().trim();
      
      if (question.type === 'fill-blank') {
        // For fill-in-the-blank, check if all required words are present
        const correctWords = correctAnswer.split(',').map(word => word.trim());
        const userWords = userAnswer?.split(/[,\s]+/).filter(word => word.length > 0) || [];
        
        if (correctWords.every(word => userWords.some(userWord => userWord.includes(word)))) {
          correctAnswers++;
        }
      } else {
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      }
    });

    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(calculatedScore);
    setShowResults(true);

    if (calculatedScore >= 70) {
      setCompletedExercises(prev => new Set(Array.from(prev).concat(currentExercise.id)));
      if (onComplete) {
        onComplete(currentExercise.id, calculatedScore);
      }
    }
  };

  const resetExercise = () => {
    setUserAnswers({});
    setShowResults(false);
    setScore(null);
    setShowTranscript(false);
    stopAudio();
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
    if (score >= 70) return '#34d399';
    if (score >= 50) return '#fbbf24';
    return '#ff6b6b';
  };

  const renderQuestion = (question: any, index: number) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <FormControl component="fieldset" key={question.id} sx={{ width: '100%', mb: 3 }}>
            <FormLabel 
              component="legend" 
              sx={{ 
                color: 'white', 
                fontWeight: 600, 
                mb: 2,
                '&.Mui-focused': { color: 'white' }
              }}
            >
              {index + 1}. {question.question}
            </FormLabel>
            <RadioGroup
              value={userAnswers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              {question.options?.map((option: string, optionIndex: number) => (
                <FormControlLabel
                  key={optionIndex}
                  value={option}
                  control={
                    <Radio 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-checked': { color: '#06d6a0' }
                      }} 
                    />
                  }
                  label={option}
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    '& .MuiFormControlLabel-label': { fontSize: '0.95rem' }
                  }}
                />
              ))}
            </RadioGroup>
            
            {showResults && (
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity={userAnswers[question.id] === question.correctAnswer ? "success" : "error"}
                  sx={{
                    backgroundColor: userAnswers[question.id] === question.correctAnswer 
                      ? 'rgba(6, 214, 160, 0.1)'
                      : 'rgba(255, 107, 107, 0.1)',
                    color: 'white',
                    '& .MuiAlert-icon': {
                      color: userAnswers[question.id] === question.correctAnswer ? '#06d6a0' : '#ff6b6b'
                    }
                  }}
                >
                  {question.explanation}
                </Alert>
              </Box>
            )}
          </FormControl>
        );

      case 'fill-blank':
        return (
          <Box key={question.id} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
              {index + 1}. Complete the sentence:
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
              {question.question}
            </Typography>
            <TextField
              fullWidth
              value={userAnswers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Fill in the blanks..."
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
                '& .MuiOutlinedInput-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
            
            {showResults && (
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity="info"
                  sx={{
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: 'white',
                    '& .MuiAlert-icon': { color: '#6366f1' }
                  }}
                >
                  Correct answer: {question.correctAnswer}
                  {question.explanation && <br />}{question.explanation}
                </Alert>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (!speechSupported) {
    return (
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
      }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <VolumeUpIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            👂 Listening Practice Unavailable
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Your browser doesn't support speech synthesis. Please try using Chrome, Firefox, or Edge.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
            👂 {currentExercise.title}
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

        {/* Context */}
        <Typography variant="body2" sx={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontStyle: 'italic', 
          textAlign: 'center',
          mb: 3,
          p: 2,
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          Context: {currentExercise.context}
        </Typography>

        {/* Audio Controls */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2, 
          mb: 4,
          p: 3,
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <Button
            variant="contained"
            onClick={playAudio}
            startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
            sx={{
              borderRadius: '20px',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              background: isPlaying 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)'
                : 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
              '&:hover': {
                background: isPlaying 
                  ? 'linear-gradient(135deg, #ff5252 0%, #f44336 100%)'
                  : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </Button>

          {/* Audio Controls */}
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Speed Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
              <SpeedIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Speed
              </Typography>
              <Slider
                value={playbackRate}
                onChange={(_, value) => setPlaybackRate(value as number)}
                min={0.5}
                max={2.0}
                step={0.1}
                sx={{ 
                  width: 60,
                  color: '#06d6a0',
                  '& .MuiSlider-thumb': { width: 16, height: 16 }
                }}
              />
              <Typography variant="caption" sx={{ color: 'white', minWidth: 25 }}>
                {playbackRate}x
              </Typography>
            </Box>

            {/* Volume Control */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
              <VolumeDownIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 20 }} />
              <Slider
                value={volume}
                onChange={(_, value) => setVolume(value as number)}
                min={0}
                max={1}
                step={0.1}
                sx={{ 
                  width: 60,
                  color: '#6366f1',
                  '& .MuiSlider-thumb': { width: 16, height: 16 }
                }}
              />
              <VolumeUpIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 20 }} />
            </Box>
          </Box>
        </Box>

        {/* Vocabulary Helper */}
        {currentExercise.vocabulary && (
          <Box sx={{ mb: 3 }}>
            <Button
              onClick={() => setShowVocabulary(!showVocabulary)}
              startIcon={showVocabulary ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textTransform: 'none',
              }}
            >
              📚 Vocabulary Help
            </Button>
            
            <Collapse in={showVocabulary}>
              <List sx={{ pl: 2 }}>
                {currentExercise.vocabulary.map((word, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <LightbulbIcon sx={{ color: '#fbbf24', fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={word}
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
            </Collapse>
          </Box>
        )}

        {/* Questions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
            Answer the questions:
          </Typography>
          
          {currentExercise.questions.map((question, index) => 
            renderQuestion(question, index)
          )}
          
          {!showResults && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={checkAnswers}
                disabled={Object.keys(userAnswers).length < currentExercise.questions.length}
                sx={{
                  borderRadius: '12px',
                  px: 4,
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
                Check Answers
              </Button>
            </Box>
          )}
        </Box>

        {/* Results */}
        {showResults && score !== null && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ 
              color: getScoreColor(score), 
              fontWeight: 700, 
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
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: `linear-gradient(90deg, ${getScoreColor(score)} 0%, ${getScoreColor(score)}88 100%)`,
                },
              }}
            />
            
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
          
          <Button
            onClick={resetExercise}
            startIcon={<ReplayIcon />}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Reset
          </Button>

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

        {/* Progress */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
            Completed: {completedExercises.size} / {exercises.length} exercises
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
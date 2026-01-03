import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  LinearProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Create as CreateIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Lightbulb as LightbulbIcon,
  Assessment as AssessmentIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import writingPromptsData from '../data/b2-writing-prompts.json';

interface WritingPrompt {
  id: string;
  type: string;
  title: string;
  prompt: string;
  wordCount: { min: number; max: number };
  timeMinutes: number;
  tips: string[];
  keywords: string[];
}

interface SavedEssay {
  id: string;
  promptId: string;
  content: string;
  wordCount: number;
  date: string;
}

const B2WritingPractice: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [essay, setEssay] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [savedEssays, setSavedEssays] = useState<SavedEssay[]>([]);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const prompts: WritingPrompt[] = writingPromptsData;

  useEffect(() => {
    // Load saved essays from localStorage
    const saved = localStorage.getItem('savedB2Essays');
    if (saved) {
      setSavedEssays(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const handleStartWriting = (prompt: WritingPrompt) => {
    setSelectedPrompt(prompt);
    setEssay('');
    setTimeRemaining(prompt.timeMinutes * 60);
    setIsTimerRunning(false);
    setShowTips(true);
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setShowTips(false);
  };

  const handleSaveEssay = () => {
    if (!selectedPrompt || !essay.trim()) return;

    const newEssay: SavedEssay = {
      id: Date.now().toString(),
      promptId: selectedPrompt.id,
      content: essay,
      wordCount: essay.trim().split(/\s+/).length,
      date: new Date().toISOString()
    };

    const updated = [...savedEssays, newEssay];
    setSavedEssays(updated);
    localStorage.setItem('savedB2Essays', JSON.stringify(updated));
    alert('Essay saved successfully!');
  };

  const handleGetFeedback = () => {
    if (!essay.trim()) return;

    const wordCount = essay.trim().split(/\s+/).length;
    const targetMin = selectedPrompt?.wordCount.min || 150;
    const targetMax = selectedPrompt?.wordCount.max || 220;

    // Simple feedback (in a real app, this would use AI)
    const feedbackData = {
      wordCount: {
        actual: wordCount,
        target: `${targetMin}-${targetMax}`,
        status: wordCount >= targetMin && wordCount <= targetMax ? 'good' : 'needs improvement'
      },
      structure: {
        hasIntroduction: essay.toLowerCase().includes('einleitung') || essay.split('\n\n').length >= 2,
        hasConclusion: essay.toLowerCase().includes('zusammenfassend') || essay.toLowerCase().includes('abschließend'),
        paragraphs: essay.split('\n\n').length
      },
      vocabulary: {
        usesConnectors: /einerseits|andererseits|jedoch|trotzdem|außerdem|zunächst/.test(essay.toLowerCase()),
        usesFormalLanguage: /sehr geehrte|mit freundlichen grüßen|ich möchte|würde/.test(essay.toLowerCase())
      },
      suggestions: [
        wordCount < targetMin ? `Schreiben Sie noch ${targetMin - wordCount} Wörter mehr` : null,
        wordCount > targetMax ? `Kürzen Sie um ${wordCount - targetMax} Wörter` : null,
        !essay.toLowerCase().includes('sehr geehrte') && selectedPrompt?.type === 'formal-letter'
          ? 'Verwenden Sie eine formelle Anrede' : null,
        essay.split('\n\n').length < 3 ? 'Strukturieren Sie Ihren Text in Absätze' : null
      ].filter(Boolean)
    };

    setFeedback(feedbackData);
    setFeedbackDialogOpen(true);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordCount = () => {
    if (!essay.trim()) return 0;
    return essay.trim().split(/\s+/).length;
  };

  const getProgressPercentage = () => {
    if (!selectedPrompt) return 0;
    const wordCount = getWordCount();
    const target = selectedPrompt.wordCount.max;
    return Math.min((wordCount / target) * 100, 100);
  };

  const getProgressColor = () => {
    if (!selectedPrompt) return '#6366f1';
    const wordCount = getWordCount();
    const min = selectedPrompt.wordCount.min;
    const max = selectedPrompt.wordCount.max;

    if (wordCount < min) return '#f59e0b';
    if (wordCount > max) return '#ef4444';
    return '#06d6a0';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{
        textAlign: 'center',
        mb: 4,
        p: 4,
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            fontWeight: 800,
            mb: 1,
            background: 'linear-gradient(45deg, #fff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ✍️ B2 Writing Practice
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Master formal letters, essays, and blog posts
        </Typography>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' },
        gap: 3
      }}>
        {/* Left: Writing Prompts */}
        <Box>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px'
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                📝 Writing Prompts
              </Typography>

              <Box sx={{ mb: 2 }}>
                {['opinion-essay', 'formal-letter', 'blog-post', 'report'].map(type => (
                  <Chip
                    key={type}
                    label={type.replace('-', ' ').toUpperCase()}
                    sx={{
                      mr: 1,
                      mb: 1,
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                {prompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    onClick={() => handleStartWriting(prompt)}
                    sx={{
                      mb: 2,
                      cursor: 'pointer',
                      background: selectedPrompt?.id === prompt.id
                        ? 'rgba(6, 214, 160, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedPrompt?.id === prompt.id
                        ? '2px solid #06d6a0'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: 'rgba(6, 214, 160, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent>
                      <Chip
                        label={prompt.type.replace('-', ' ')}
                        size="small"
                        sx={{
                          background: '#6366f1',
                          color: 'white',
                          mb: 1,
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                        {prompt.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        {prompt.prompt.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<TimerIcon />}
                          label={`${prompt.timeMinutes} min`}
                          size="small"
                          sx={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                        />
                        <Chip
                          label={`${prompt.wordCount.min}-${prompt.wordCount.max} words`}
                          size="small"
                          sx={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right: Writing Area */}
        <Box>
          {selectedPrompt ? (
            <>
              {/* Prompt Details */}
              <Card sx={{
                mb: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                        {selectedPrompt.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        {selectedPrompt.prompt}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 2 }}>
                      {!isTimerRunning ? (
                        <Button
                          variant="contained"
                          startIcon={<TimerIcon />}
                          onClick={handleStartTimer}
                          sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            borderRadius: '12px'
                          }}
                        >
                          Start Timer
                        </Button>
                      ) : (
                        <Chip
                          icon={<TimerIcon />}
                          label={formatTime(timeRemaining)}
                          sx={{
                            background: timeRemaining < 300 ? '#ef4444' : '#06d6a0',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            padding: '20px 12px'
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Tips */}
                  {showTips && (
                    <Alert
                      severity="info"
                      icon={<LightbulbIcon />}
                      sx={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'white',
                        border: '1px solid #6366f1',
                        borderRadius: '12px',
                        mt: 2
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        💡 Tipps:
                      </Typography>
                      <List dense>
                        {selectedPrompt.tips.map((tip, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircleIcon sx={{ color: '#6366f1', fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={tip}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Writing Editor */}
              <Card sx={{
                mb: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px'
              }}>
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Your Essay
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip
                        label={`${getWordCount()} / ${selectedPrompt.wordCount.min}-${selectedPrompt.wordCount.max} words`}
                        sx={{
                          background: getProgressColor(),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveEssay}
                        disabled={!essay.trim()}
                        sx={{
                          borderColor: '#06d6a0',
                          color: '#06d6a0',
                          '&:hover': { borderColor: '#34d399', background: 'rgba(6, 214, 160, 0.1)' }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={handleGetFeedback}
                        disabled={!essay.trim()}
                        sx={{
                          background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
                          borderRadius: '12px'
                        }}
                      >
                        Get Feedback
                      </Button>
                    </Box>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage()}
                    sx={{
                      mb: 2,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()}88 100%)`,
                      },
                    }}
                  />

                  <TextField
                    multiline
                    rows={18}
                    fullWidth
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    placeholder="Start writing your essay here..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        fontSize: '1.05rem',
                        lineHeight: 1.8,
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#06d6a0',
                        },
                      },
                    }}
                  />

                  {/* Keywords */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                      📌 Suggested keywords:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedPrompt.keywords.map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          size="small"
                          sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </>
          ) : (
            <Paper sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px'
            }}>
              <CreateIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
              <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                Select a writing prompt to begin
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Choose from essays, formal letters, blog posts, or reports
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="md"
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
        <DialogTitle sx={{ color: 'white', textAlign: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 48, color: '#06d6a0', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Writing Feedback
          </Typography>
        </DialogTitle>
        <DialogContent>
          {feedback && (
            <Box>
              {/* Word Count */}
              <Card sx={{
                mb: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    📊 Word Count
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Your essay: <strong>{feedback.wordCount.actual} words</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Target: {feedback.wordCount.target} words
                  </Typography>
                  <Chip
                    label={feedback.wordCount.status}
                    sx={{
                      mt: 1,
                      background: feedback.wordCount.status === 'good' ? '#06d6a0' : '#f59e0b',
                      color: 'white'
                    }}
                  />
                </CardContent>
              </Card>

              {/* Suggestions */}
              {feedback.suggestions.length > 0 && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: 'white',
                    border: '1px solid #f59e0b',
                    borderRadius: '12px'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    💡 Verbesserungsvorschläge:
                  </Typography>
                  <List dense>
                    {feedback.suggestions.map((suggestion: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText primary={suggestion} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}

              {/* Positive Feedback */}
              <Alert
                severity="success"
                sx={{
                  background: 'rgba(6, 214, 160, 0.1)',
                  color: 'white',
                  border: '1px solid #06d6a0',
                  borderRadius: '12px'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ✅ Gut gemacht:
                </Typography>
                <List dense>
                  {feedback.vocabulary.usesConnectors && (
                    <ListItem>
                      <ListItemText primary="Sie verwenden Konnektoren" />
                    </ListItem>
                  )}
                  {feedback.vocabulary.usesFormalLanguage && (
                    <ListItem>
                      <ListItemText primary="Formelle Sprache wird verwendet" />
                    </ListItem>
                  )}
                  {feedback.structure.paragraphs >= 3 && (
                    <ListItem>
                      <ListItemText primary="Gute Struktur mit mehreren Absätzen" />
                    </ListItem>
                  )}
                </List>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setFeedbackDialogOpen(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
              borderRadius: '12px'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default B2WritingPractice;

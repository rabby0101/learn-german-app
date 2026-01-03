import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Alert,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import readingTextsData from '../data/b2-reading-texts.json';

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: number | boolean;
  explanation: string;
}

interface ReadingText {
  id: string;
  title: string;
  difficulty: string;
  theme: string;
  wordCount: number;
  text: string;
  questions: Question[];
}

const B2ReadingPractice: React.FC = () => {
  const [selectedText, setSelectedText] = useState<ReadingText | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<number | null>(null);

  const texts: ReadingText[] = readingTextsData;

  const handleTextSelect = (text: ReadingText) => {
    setSelectedText(text);
    setAnswers({});
    setShowResults(false);
    setStartTime(Date.now());
    setCompletionTime(null);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    if (startTime) {
      const timeInSeconds = Math.floor((Date.now() - startTime) / 1000);
      setCompletionTime(timeInSeconds);
    }
  };

  const getScore = () => {
    if (!selectedText) return 0;
    let correct = 0;
    selectedText.questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (q.type === 'multiple-choice') {
        if (userAnswer === q.correctAnswer) correct++;
      } else if (q.type === 'true-false') {
        if (userAnswer === (q.correctAnswer ? 'true' : 'false')) correct++;
      }
    });
    return Math.round((correct / selectedText.questions.length) * 100);
  };

  const isAnswerCorrect = (question: Question): boolean => {
    const userAnswer = answers[question.id];
    if (question.type === 'multiple-choice') {
      return userAnswer === question.correctAnswer;
    } else if (question.type === 'true-false') {
      return userAnswer === (question.correctAnswer ? 'true' : 'false');
    }
    return false;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          📖 B2 Reading Comprehension
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Practice with authentic B2-level texts
        </Typography>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' },
        gap: 3
      }}>
        {/* Left: Text Selection */}
        <Box>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px'
          }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                📚 Reading Texts
              </Typography>

              {texts.map((text) => (
                <Card
                  key={text.id}
                  onClick={() => handleTextSelect(text)}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    background: selectedText?.id === text.id
                      ? 'rgba(6, 214, 160, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedText?.id === text.id
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
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={text.difficulty}
                        size="small"
                        sx={{ background: '#6366f1', color: 'white', fontWeight: 600 }}
                      />
                      <Chip
                        label={text.theme}
                        size="small"
                        sx={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      {text.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${text.wordCount} words`}
                        size="small"
                        sx={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                      />
                      <Chip
                        label={`${text.questions.length} questions`}
                        size="small"
                        sx={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Box>

        {/* Right: Text and Questions */}
        <Box>
          {selectedText ? (
            <>
              {/* Results Summary */}
              {showResults && (
                <Alert
                  severity={getScore() >= 80 ? 'success' : getScore() >= 60 ? 'info' : 'warning'}
                  icon={<AssessmentIcon />}
                  sx={{
                    mb: 3,
                    background: getScore() >= 80
                      ? 'rgba(6, 214, 160, 0.1)'
                      : getScore() >= 60
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                    color: 'white',
                    border: `1px solid ${getScore() >= 80 ? '#06d6a0' : getScore() >= 60 ? '#6366f1' : '#f59e0b'}`,
                    borderRadius: '16px'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Your Score: {getScore()}%
                      </Typography>
                      <Typography variant="body2">
                        {getScore() >= 80 ? '🎉 Excellent work!' :
                         getScore() >= 60 ? '👍 Good job! Keep practicing.' :
                         '💪 You can do better. Review the text again.'}
                      </Typography>
                    </Box>
                    {completionTime && (
                      <Chip
                        icon={<TimerIcon />}
                        label={`Time: ${formatTime(completionTime)}`}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                </Alert>
              )}

              {/* Reading Text */}
              <Card sx={{
                mb: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px'
              }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                      {selectedText.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        label={selectedText.theme}
                        sx={{ background: '#6366f1', color: 'white' }}
                      />
                      <Chip
                        label={`${selectedText.wordCount} words`}
                        sx={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                      />
                      <Chip
                        label={selectedText.difficulty}
                        sx={{ background: '#06d6a0', color: 'white' }}
                      />
                    </Box>
                  </Box>

                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px'
                  }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        lineHeight: 2,
                        fontSize: '1.05rem',
                        textAlign: 'justify',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {selectedText.text}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px'
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                    ❓ Questions
                  </Typography>

                  {selectedText.questions.map((question, qIndex) => (
                    <Card key={question.id} sx={{
                      mb: 3,
                      background: showResults
                        ? isAnswerCorrect(question)
                          ? 'rgba(6, 214, 160, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: showResults
                        ? `1px solid ${isAnswerCorrect(question) ? '#06d6a0' : '#ef4444'}`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ color: '#6366f1', mr: 1 }}>
                            {qIndex + 1}.
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'white', flex: 1 }}>
                            {question.question}
                          </Typography>
                          {showResults && (
                            isAnswerCorrect(question)
                              ? <CheckCircleIcon sx={{ color: '#06d6a0', ml: 1 }} />
                              : <CancelIcon sx={{ color: '#ef4444', ml: 1 }} />
                          )}
                        </Box>

                        {question.type === 'multiple-choice' && question.options && (
                          <FormControl component="fieldset" fullWidth disabled={showResults}>
                            <RadioGroup
                              value={answers[question.id] ?? ''}
                              onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                            >
                              {question.options.map((option, optIndex) => (
                                <FormControlLabel
                                  key={optIndex}
                                  value={optIndex}
                                  control={<Radio sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                                  label={option}
                                  sx={{
                                    color: showResults
                                      ? optIndex === question.correctAnswer
                                        ? '#06d6a0'
                                        : answers[question.id] === optIndex
                                          ? '#ef4444'
                                          : 'rgba(255, 255, 255, 0.9)'
                                      : 'rgba(255, 255, 255, 0.9)',
                                    mb: 1,
                                    p: 1,
                                    borderRadius: '8px',
                                    background: showResults && optIndex === question.correctAnswer
                                      ? 'rgba(6, 214, 160, 0.1)'
                                      : 'transparent',
                                    fontWeight: showResults && optIndex === question.correctAnswer ? 600 : 400
                                  }}
                                />
                              ))}
                            </RadioGroup>
                          </FormControl>
                        )}

                        {question.type === 'true-false' && (
                          <FormControl component="fieldset" fullWidth disabled={showResults}>
                            <RadioGroup
                              value={answers[question.id] ?? ''}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            >
                              <FormControlLabel
                                value="true"
                                control={<Radio sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                                label="True / Richtig"
                                sx={{
                                  color: showResults
                                    ? question.correctAnswer === true
                                      ? '#06d6a0'
                                      : answers[question.id] === 'true'
                                        ? '#ef4444'
                                        : 'rgba(255, 255, 255, 0.9)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                  mb: 1,
                                  p: 1,
                                  borderRadius: '8px',
                                  background: showResults && question.correctAnswer === true
                                    ? 'rgba(6, 214, 160, 0.1)'
                                    : 'transparent',
                                  fontWeight: showResults && question.correctAnswer === true ? 600 : 400
                                }}
                              />
                              <FormControlLabel
                                value="false"
                                control={<Radio sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                                label="False / Falsch"
                                sx={{
                                  color: showResults
                                    ? question.correctAnswer === false
                                      ? '#06d6a0'
                                      : answers[question.id] === 'false'
                                        ? '#ef4444'
                                        : 'rgba(255, 255, 255, 0.9)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                  p: 1,
                                  borderRadius: '8px',
                                  background: showResults && question.correctAnswer === false
                                    ? 'rgba(6, 214, 160, 0.1)'
                                    : 'transparent',
                                  fontWeight: showResults && question.correctAnswer === false ? 600 : 400
                                }}
                              />
                            </RadioGroup>
                          </FormControl>
                        )}

                        {showResults && (
                          <Alert
                            severity="info"
                            sx={{
                              mt: 2,
                              background: 'rgba(99, 102, 241, 0.1)',
                              color: 'white',
                              border: '1px solid #6366f1',
                              borderRadius: '8px'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              📝 Explanation:
                            </Typography>
                            <Typography variant="body2">
                              {question.explanation}
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Submit Button */}
                  {!showResults && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length !== selectedText.questions.length}
                        startIcon={<CheckCircleIcon />}
                        sx={{
                          borderRadius: '16px',
                          px: 4,
                          py: 1.5,
                          background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                          },
                          '&:disabled': {
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      >
                        Submit Answers
                      </Button>
                      {Object.keys(answers).length !== selectedText.questions.length && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                          Answer all questions to submit ({Object.keys(answers).length}/{selectedText.questions.length})
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Try Again Button */}
                  {showResults && (
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => {
                          setAnswers({});
                          setShowResults(false);
                          setStartTime(Date.now());
                          setCompletionTime(null);
                        }}
                        sx={{
                          borderRadius: '16px',
                          px: 4,
                          py: 1.5,
                          borderColor: '#6366f1',
                          color: '#6366f1',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#8b5cf6',
                            background: 'rgba(99, 102, 241, 0.1)'
                          }
                        }}
                      >
                        Try Again
                      </Button>
                    </Box>
                  )}
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
              <ArticleIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
              <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                Select a reading text to begin
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Choose from various B2-level texts covering different themes
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default B2ReadingPractice;

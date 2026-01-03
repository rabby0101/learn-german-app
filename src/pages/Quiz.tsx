
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import quiz from '../quiz.json';
import { deepseekApi, QuizQuestion } from '../services/deepseekApi';

const Quiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [usingGeneratedQuiz, setUsingGeneratedQuiz] = useState(false);

  const currentQuizData: any[] = usingGeneratedQuiz ? generatedQuestions : quiz;

  const handleAnswerClick = (option: string) => {
    setSelectedAnswer(option);
    const correctAnswer = usingGeneratedQuiz 
      ? currentQuizData[currentQuestion].options[currentQuizData[currentQuestion].correctAnswer]
      : currentQuizData[currentQuestion].answer;
    
    if (option === correctAnswer) {
      setFeedback('correct');
      setScore(score + 1);
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < currentQuizData.length) {
      setCurrentQuestion(nextQuestion);
      setFeedback(null);
      setSelectedAnswer(null);
    } else {
      setShowScore(true);
    }
  };

  const getButtonColor = (option: string) => {
    if (selectedAnswer === null) return 'primary';
    const correctAnswer = usingGeneratedQuiz 
      ? currentQuizData[currentQuestion].options[currentQuizData[currentQuestion].correctAnswer]
      : currentQuizData[currentQuestion].answer;
    
    if (option === correctAnswer) return 'success';
    if (option === selectedAnswer && option !== correctAnswer) return 'error';
    return 'primary';
  };

  const handleGenerateQuiz = async () => {
    if (!customTopic.trim()) return;
    
    setGenerating(true);
    try {
      const questions = await deepseekApi.generateQuizQuestions(customTopic, 20);
      setGeneratedQuestions(questions);
      setUsingGeneratedQuiz(true);
      setCurrentQuestion(0);
      setScore(0);
      setShowScore(false);
      setFeedback(null);
      setSelectedAnswer(null);
      setCustomTopic('');
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      alert(`Failed to generate quiz: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSwitchToOriginalQuiz = () => {
    setUsingGeneratedQuiz(false);
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setFeedback(null);
    setSelectedAnswer(null);
  };

  return (
    <Container sx={{ mt: 4, backgroundColor: 'background.default', p: 3, borderRadius: 2 }}>
      <Typography variant="h1" gutterBottom>
        Quiz {usingGeneratedQuiz && <Typography component="span" variant="body1" color="primary.main">(AI Generated)</Typography>}
      </Typography>
      
      {!showScore && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Generate Custom Quiz - 20 Questions (e.g., 'German Articles')"
              variant="outlined"
              fullWidth
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateQuiz()}
            />
            <Button
              variant="contained"
              onClick={handleGenerateQuiz}
              disabled={generating || !customTopic.trim()}
              sx={{ minWidth: 120 }}
            >
              {generating ? <CircularProgress size={24} /> : 'Generate'}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={usingGeneratedQuiz ? "outlined" : "contained"}
              onClick={handleSwitchToOriginalQuiz}
              size="small"
            >
              Original Quiz
            </Button>
            {generatedQuestions.length > 0 && (
              <Button
                variant={usingGeneratedQuiz ? "contained" : "outlined"}
                onClick={() => {
                  setUsingGeneratedQuiz(true);
                  setCurrentQuestion(0);
                  setScore(0);
                  setShowScore(false);
                  setFeedback(null);
                  setSelectedAnswer(null);
                }}
                size="small"
              >
                AI Generated Quiz
              </Button>
            )}
          </Box>
        </Box>
      )}
      {showScore ? (
        <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="h4">
            You scored {score} out of {currentQuizData.length}
          </Typography>
          <Button variant="contained" onClick={() => {
            setCurrentQuestion(0);
            setScore(0);
            setShowScore(false);
            setFeedback(null);
            setSelectedAnswer(null);
          }} sx={{ mt: 2 }}>
            Restart Quiz
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="h5" gutterBottom>
            Question {currentQuestion + 1} of {currentQuizData.length}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {currentQuizData[currentQuestion].question}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {currentQuizData[currentQuestion].options.map((option: string, index: number) => (
              <Button
                key={index}
                variant="contained"
                color={getButtonColor(option)}
                sx={{ m: 1, transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                onClick={() => handleAnswerClick(option)}
                disabled={selectedAnswer !== null}
              >
                {option}
              </Button>
            ))}
          </Box>
          {feedback && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ color: feedback === 'correct' ? 'success.main' : 'error.main' }}>
                {feedback === 'correct' ? 'Correct!' : 'Incorrect!'}
              </Typography>
              {usingGeneratedQuiz && currentQuizData[currentQuestion].explanation && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {currentQuizData[currentQuestion].explanation}
                </Typography>
              )}
            </Box>
          )}
          {selectedAnswer !== null && (
            <Button variant="contained" onClick={handleNextQuestion} sx={{ mt: 2 }}>
              Next Question
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Quiz;

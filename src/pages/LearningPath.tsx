import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  Quiz as QuizIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
  LearningPathService, 
  LearningPath, 
  LearningUnit, 
  Exercise 
} from '../services/learningPathService';

const LearningPathPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recommendedPath, setRecommendedPath] = useState<LearningPath | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [unitExercises, setUnitExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPaths, setExpandedPaths] = useState<{ [key: string]: boolean }>({});
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    if (currentUser) {
      loadLearningPaths();
    }
  }, [currentUser]);

  const loadLearningPaths = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const [paths, recommended] = await Promise.all([
        LearningPathService.getUserLearningPaths(currentUser.id),
        LearningPathService.getRecommendedPath(currentUser.id, currentUser.progress.currentLevel)
      ]);

      setLearningPaths(paths);
      setRecommendedPath(recommended);

      // Auto-expand the recommended path
      if (recommended) {
        setExpandedPaths({ [recommended.id]: true });
      }
    } catch (error) {
      console.error('Failed to load learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePathExpand = (pathId: string) => {
    setExpandedPaths(prev => ({
      ...prev,
      [pathId]: !prev[pathId]
    }));
  };

  const handleStartUnit = async (pathId: string, unit: LearningUnit) => {
    if (!unit.unlocked) {
      alert('Complete the prerequisite units first!');
      return;
    }

    try {
      const exercises = await LearningPathService.getUnitExercises(pathId, unit.id, currentUser?.id);
      setSelectedUnit(unit);
      setUnitExercises(exercises);
      setCurrentExerciseIndex(0);
      setExerciseDialogOpen(true);
    } catch (error) {
      console.error('Failed to load unit exercises:', error);
    }
  };

  const handleExerciseSubmit = async (answer: string) => {
    if (!selectedUnit || !currentUser) return;

    try {
      const result = await LearningPathService.completeExercise(
        currentUser.id,
        unitExercises[currentExerciseIndex].id,
        answer
      );

      if (result.correct) {
        if (currentExerciseIndex < unitExercises.length - 1) {
          setCurrentExerciseIndex(prev => prev + 1);
        } else {
          // Unit completed
          await LearningPathService.updateUnitProgress(
            currentUser.id,
            recommendedPath?.id || '',
            selectedUnit.id,
            100
          );
          setExerciseDialogOpen(false);
          loadLearningPaths(); // Refresh to show updated progress
        }
      } else {
        alert(result.explanation || 'Incorrect answer. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit exercise:', error);
    }
  };

  const getCEFRColor = (level: string): string => {
    const levelInfo = LearningPathService.getCEFRLevelInfo(level as any);
    return levelInfo.color;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!currentUser) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Please log in to access your personalized learning path
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2, color: '#06d6a0' }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Loading your learning path...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header Section */}
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
          🗺️ Your Learning Journey
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
          Structured curriculum to guide you from beginner to fluency
        </Typography>
        
        {recommendedPath && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`Recommended: ${recommendedPath.name}`}
              sx={{
                background: getCEFRColor(recommendedPath.cefrLevel),
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                px: 1
              }}
            />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Progress: {recommendedPath.completedUnits}/{recommendedPath.totalUnits} units
            </Typography>
          </Box>
        )}
      </Box>

      {/* Learning Paths */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {learningPaths.map((path) => (
          <Box key={path.id}>
            <Card sx={{ 
              background: path.id === recommendedPath?.id 
                ? 'linear-gradient(135deg, rgba(6, 214, 160, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: path.id === recommendedPath?.id 
                ? '2px solid rgba(6, 214, 160, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
            }}>
              <CardContent>
                {/* Path Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={path.cefrLevel}
                      sx={{
                        background: getCEFRColor(path.cefrLevel),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                      {path.name}
                    </Typography>
                    {path.id === recommendedPath?.id && (
                      <Chip label="Recommended" size="small" sx={{ 
                        background: '#06d6a0', 
                        color: 'white',
                        fontWeight: 600
                      }} />
                    )}
                  </Box>
                  
                  <IconButton 
                    onClick={() => handlePathExpand(path.id)}
                    sx={{ color: 'white' }}
                  >
                    {expandedPaths[path.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                  {path.description}
                </Typography>

                {/* Progress Overview */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, 
                  gap: 2, 
                  mb: 2 
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                      {path.completedUnits}/{path.totalUnits}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Units Completed
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                      {path.estimatedWeeks}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Estimated Weeks
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                      {Math.round((path.completedUnits / path.totalUnits) * 100)}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Overall Progress
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                      {Math.round((path.skills.vocabulary + path.skills.grammar) / 2)}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      Skill Average
                    </Typography>
                  </Box>
                </Box>

                {/* Overall Progress Bar */}
                <Box sx={{ mb: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(path.completedUnits / path.totalUnits) * 100}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        background: `linear-gradient(90deg, ${getCEFRColor(path.cefrLevel)} 0%, ${getCEFRColor(path.cefrLevel)}88 100%)`,
                      },
                    }}
                  />
                </Box>

                {/* Units List */}
                <Collapse in={expandedPaths[path.id]}>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                      📚 Learning Units
                    </Typography>
                    
                    <Stepper orientation="vertical">
                      {path.units.map((unit, index) => (
                        <Step key={unit.id} active={!unit.isCompleted} completed={unit.isCompleted}>
                          <StepLabel
                            StepIconComponent={() => (
                              <Box sx={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: unit.isCompleted 
                                  ? '#06d6a0' 
                                  : unit.unlocked 
                                    ? 'rgba(6, 214, 160, 0.3)' 
                                    : 'rgba(255, 255, 255, 0.2)',
                                border: unit.unlocked ? '2px solid #06d6a0' : '2px solid rgba(255, 255, 255, 0.3)'
                              }}>
                                {unit.isCompleted ? (
                                  <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                                ) : unit.unlocked ? (
                                  <PlayIcon sx={{ fontSize: 16, color: '#06d6a0' }} />
                                ) : (
                                  <LockIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                                )}
                              </Box>
                            )}
                            sx={{ 
                              '& .MuiStepLabel-label': { 
                                color: unit.unlocked ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                fontWeight: unit.unlocked ? 600 : 400
                              } 
                            }}
                          >
                            {unit.title}
                          </StepLabel>
                          
                          <StepContent>
                            <Card sx={{ 
                              background: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(5px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              mb: 2
                            }}>
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                                  {unit.description}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                  <Chip 
                                    icon={<TimerIcon />}
                                    label={formatTime(unit.estimatedTimeMinutes)}
                                    size="small"
                                    sx={{ 
                                      background: 'rgba(255, 255, 255, 0.1)', 
                                      color: 'white' 
                                    }}
                                  />
                                  <Chip 
                                    icon={<SchoolIcon />}
                                    label={`${unit.vocabularyWords.length} words`}
                                    size="small"
                                    sx={{ 
                                      background: 'rgba(255, 255, 255, 0.1)', 
                                      color: 'white' 
                                    }}
                                  />
                                  <Chip 
                                    icon={<BrainIcon />}
                                    label={`${unit.grammarTopics.length} topics`}
                                    size="small"
                                    sx={{ 
                                      background: 'rgba(255, 255, 255, 0.1)', 
                                      color: 'white' 
                                    }}
                                  />
                                  <Chip 
                                    icon={<QuizIcon />}
                                    label={`${unit.exercises.length} exercises`}
                                    size="small"
                                    sx={{ 
                                      background: 'rgba(255, 255, 255, 0.1)', 
                                      color: 'white' 
                                    }}
                                  />
                                </Box>

                                {unit.progress > 0 && (
                                  <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Progress
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#06d6a0', fontWeight: 600 }}>
                                        {unit.progress}%
                                      </Typography>
                                    </Box>
                                    <LinearProgress
                                      variant="determinate"
                                      value={unit.progress}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 3,
                                          background: 'linear-gradient(90deg, #06d6a0 0%, #34d399 100%)',
                                        },
                                      }}
                                    />
                                  </Box>
                                )}

                                <Button
                                  variant="contained"
                                  onClick={() => handleStartUnit(path.id, unit)}
                                  disabled={!unit.unlocked}
                                  startIcon={unit.isCompleted ? <CheckIcon /> : <PlayIcon />}
                                  sx={{
                                    borderRadius: '12px',
                                    background: unit.isCompleted 
                                      ? 'rgba(6, 214, 160, 0.3)'
                                      : unit.unlocked 
                                        ? 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    color: unit.unlocked ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                    '&:hover': unit.unlocked ? {
                                      background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                    } : {},
                                    '&:disabled': {
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      color: 'rgba(255, 255, 255, 0.3)',
                                    }
                                  }}
                                >
                                  {unit.isCompleted ? 'Review' : unit.unlocked ? 'Start Unit' : 'Locked'}
                                </Button>
                              </CardContent>
                            </Card>
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Exercise Dialog */}
      <Dialog
        open={exerciseDialogOpen}
        onClose={() => setExerciseDialogOpen(false)}
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
        {selectedUnit && unitExercises.length > 0 && (
          <>
            <DialogTitle sx={{ color: 'white', textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {selectedUnit.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                Exercise {currentExerciseIndex + 1} of {unitExercises.length}
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ px: 4 }}>
              {unitExercises[currentExerciseIndex] && (
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
                    {unitExercises[currentExerciseIndex].question}
                  </Typography>

                  {unitExercises[currentExerciseIndex].type === 'multiple-choice' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {unitExercises[currentExerciseIndex].options?.map((option, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          onClick={() => handleExerciseSubmit(option)}
                          sx={{
                            borderRadius: '12px',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            p: 2,
                            '&:hover': {
                              borderColor: '#06d6a0',
                              background: 'rgba(6, 214, 160, 0.1)',
                            }
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={((currentExerciseIndex + 1) / unitExercises.length) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #06d6a0 0%, #34d399 100%)',
                    },
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 4, pb: 4 }}>
              <Button
                onClick={() => setExerciseDialogOpen(false)}
                sx={{
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                variant="outlined"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default LearningPathPage;
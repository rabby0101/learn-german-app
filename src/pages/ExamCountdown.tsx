import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface StudyGoal {
  id: string;
  section: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary' | 'grammar';
  task: string;
  completed: boolean;
}

interface DailyPlan {
  day: number;
  goals: StudyGoal[];
}

const ExamCountdown: React.FC = () => {
  const [examDate, setExamDate] = useState<Dayjs | null>(() => {
    const saved = localStorage.getItem('b2ExamDate');
    return saved ? dayjs(saved) : null;
  });

  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [readinessScore, setReadinessScore] = useState(45);

  useEffect(() => {
    if (examDate) {
      const now = dayjs();
      const days = examDate.diff(now, 'day');
      setDaysRemaining(days > 0 ? days : 0);
      localStorage.setItem('b2ExamDate', examDate.toISOString());

      if (days > 0) {
        generateStudyPlan(days);
      }
    }
  }, [examDate]);

  const generateStudyPlan = (days: number) => {
    const plan: DailyPlan[] = [];
    const sections = ['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'];

    for (let i = 0; i < Math.min(days, 30); i++) {
      const dayGoals: StudyGoal[] = [];

      // Rotate through sections
      const primarySection = sections[i % sections.length];
      const secondarySection = sections[(i + 1) % sections.length];

      // Add 3-5 daily goals
      if (primarySection === 'reading') {
        dayGoals.push({
          id: `${i}-1`,
          section: 'reading',
          task: 'Complete 1 B2 reading comprehension text (400-600 words)',
          completed: false
        });
      } else if (primarySection === 'listening') {
        dayGoals.push({
          id: `${i}-1`,
          section: 'listening',
          task: 'Listen to 2 B2-level audio exercises',
          completed: false
        });
      } else if (primarySection === 'writing') {
        dayGoals.push({
          id: `${i}-1`,
          section: 'writing',
          task: 'Write 1 essay or formal letter (180-220 words)',
          completed: false
        });
      } else if (primarySection === 'speaking') {
        dayGoals.push({
          id: `${i}-1`,
          section: 'speaking',
          task: 'Practice speaking for 15 minutes (presentation + discussion)',
          completed: false
        });
      } else if (primarySection === 'vocabulary') {
        dayGoals.push({
          id: `${i}-1`,
          section: 'vocabulary',
          task: 'Learn 20 new B2 vocabulary words',
          completed: false
        });
      } else if (primarySection === 'grammar') {
        dayGoals.push({
          id: `${i}-1`,
          section: 'grammar',
          task: 'Review 2 B2 grammar topics with exercises',
          completed: false
        });
      }

      // Add secondary task
      dayGoals.push({
        id: `${i}-2`,
        section: secondarySection as any,
        task: `Quick review: ${secondarySection}`,
        completed: false
      });

      // Add general task
      dayGoals.push({
        id: `${i}-3`,
        section: 'vocabulary',
        task: 'Review 10 previously learned words',
        completed: false
      });

      plan.push({ day: i + 1, goals: dayGoals });
    }

    setDailyPlan(plan);

    // Load completed goals from localStorage
    const savedProgress = localStorage.getItem('studyPlanProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setDailyPlan(progress);
    }
  };

  const handleGoalToggle = (dayIndex: number, goalId: string) => {
    const updatedPlan = [...dailyPlan];
    const goal = updatedPlan[dayIndex].goals.find(g => g.id === goalId);
    if (goal) {
      goal.completed = !goal.completed;
      setDailyPlan(updatedPlan);
      localStorage.setItem('studyPlanProgress', JSON.stringify(updatedPlan));

      // Update readiness score
      const totalGoals = updatedPlan.reduce((sum, day) => sum + day.goals.length, 0);
      const completedGoals = updatedPlan.reduce(
        (sum, day) => sum + day.goals.filter(g => g.completed).length,
        0
      );
      const newScore = Math.round((completedGoals / totalGoals) * 100);
      setReadinessScore(newScore);
    }
  };

  const getSectionColor = (section: string) => {
    const colors: { [key: string]: string } = {
      reading: '#6366f1',
      listening: '#22c55e',
      writing: '#f59e0b',
      speaking: '#ef4444',
      vocabulary: '#06d6a0',
      grammar: '#8b5cf6'
    };
    return colors[section] || '#94a3b8';
  };

  const getSectionIcon = (section: string) => {
    const icons: { [key: string]: string } = {
      reading: '📖',
      listening: '🎧',
      writing: '✍️',
      speaking: '🗣️',
      vocabulary: '📚',
      grammar: '📝'
    };
    return icons[section] || '📌';
  };

  const getMotivationalMessage = () => {
    if (daysRemaining > 60) return "Du hast viel Zeit! Nutze sie weise. 🌟";
    if (daysRemaining > 30) return "Gute Vorbereitung ist der Schlüssel zum Erfolg! 💪";
    if (daysRemaining > 14) return "Konzentriere dich auf deine Schwächen! 🎯";
    if (daysRemaining > 7) return "Die Endphase hat begonnen. Bleib fokussiert! 🔥";
    if (daysRemaining > 3) return "Letzte Woche! Zeit für intensive Wiederholung! ⚡";
    if (daysRemaining > 0) return "Fast geschafft! Bleib ruhig und selbstbewusst! 🍀";
    return "Viel Erfolg bei deiner Prüfung! 🎓";
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
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
            📅 Exam Countdown & Study Planner
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Plan your B2 exam preparation journey
          </Typography>
        </Box>

        {/* Exam Date Selector */}
        <Card sx={{
          mb: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px'
        }}>
          <CardContent>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
              📆 Set Your Exam Date
            </Typography>
            <DatePicker
              label="B2 Exam Date"
              value={examDate}
              onChange={(newValue) => setExamDate(newValue)}
              minDate={dayjs()}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          </CardContent>
        </Card>

        {examDate && daysRemaining > 0 && (
          <>
            {/* Countdown Display */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 3
            }}>
              <Card sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <CardContent>
                  <CalendarIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                  <Typography variant="h2" sx={{ color: 'white', fontWeight: 800 }}>
                    {daysRemaining}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Days Until Exam
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{
                background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <CardContent>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                  <Typography variant="h2" sx={{ color: 'white', fontWeight: 800 }}>
                    {readinessScore}%
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    B2 Readiness
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <CardContent>
                  <FlagIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                  <Typography variant="h2" sx={{ color: 'white', fontWeight: 800 }}>
                    {dailyPlan.filter(day => day.goals.every(g => g.completed)).length}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Days Completed
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Motivational Message */}
            <Alert
              severity="info"
              icon={<LightbulbIcon />}
              sx={{
                mb: 3,
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'white',
                border: '1px solid #6366f1',
                borderRadius: '16px'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {getMotivationalMessage()}
              </Typography>
            </Alert>

            {/* Study Plan */}
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  📋 Your Study Plan
                </Typography>

                {/* Day Selector */}
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {dailyPlan.slice(0, 14).map((day, index) => (
                    <Button
                      key={index}
                      variant={currentDayIndex === index ? 'contained' : 'outlined'}
                      onClick={() => setCurrentDayIndex(index)}
                      sx={{
                        minWidth: 60,
                        borderRadius: '12px',
                        borderColor: day.goals.every(g => g.completed) ? '#06d6a0' : 'rgba(255, 255, 255, 0.3)',
                        background: currentDayIndex === index
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : day.goals.every(g => g.completed)
                            ? 'rgba(6, 214, 160, 0.2)'
                            : 'transparent',
                        color: 'white',
                        '&:hover': {
                          background: currentDayIndex === index
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      Day {day.day}
                    </Button>
                  ))}
                </Box>

                {/* Current Day Plan */}
                {dailyPlan[currentDayIndex] && (
                  <Box>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ScheduleIcon sx={{ color: '#06d6a0' }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        Day {dailyPlan[currentDayIndex].day} Goals
                      </Typography>
                      <Chip
                        label={`${dailyPlan[currentDayIndex].goals.filter(g => g.completed).length}/${dailyPlan[currentDayIndex].goals.length} completed`}
                        sx={{
                          background: '#06d6a0',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={(dailyPlan[currentDayIndex].goals.filter(g => g.completed).length /
                              dailyPlan[currentDayIndex].goals.length) * 100}
                      sx={{
                        mb: 2,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          background: 'linear-gradient(90deg, #06d6a0 0%, #34d399 100%)',
                        },
                      }}
                    />

                    <List>
                      {dailyPlan[currentDayIndex].goals.map((goal) => (
                        <ListItem
                          key={goal.id}
                          onClick={() => handleGoalToggle(currentDayIndex, goal.id)}
                          sx={{
                            mb: 1,
                            borderRadius: '12px',
                            background: goal.completed
                              ? 'rgba(6, 214, 160, 0.2)'
                              : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${goal.completed ? '#06d6a0' : 'rgba(255, 255, 255, 0.1)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                              background: goal.completed
                                ? 'rgba(6, 214, 160, 0.3)'
                                : 'rgba(255, 255, 255, 0.1)',
                            }
                          }}
                        >
                          <ListItemIcon>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: getSectionColor(goal.section),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem'
                              }}
                            >
                              {getSectionIcon(goal.section)}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={goal.task}
                            secondary={goal.section.toUpperCase()}
                            primaryTypographyProps={{
                              sx: {
                                color: 'white',
                                textDecoration: goal.completed ? 'line-through' : 'none',
                                fontWeight: 500
                              }
                            }}
                            secondaryTypographyProps={{
                              sx: {
                                color: getSectionColor(goal.section),
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }
                            }}
                          />
                          {goal.completed && (
                            <CheckCircleIcon sx={{ color: '#06d6a0', ml: 2 }} />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {(!examDate || daysRemaining === 0) && (
          <Alert
            severity="warning"
            sx={{
              background: 'rgba(245, 158, 11, 0.1)',
              color: 'white',
              border: '1px solid #f59e0b',
              borderRadius: '16px'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {!examDate
                ? "Set your exam date to start your personalized study plan!"
                : "Your exam is today or has passed. Set a new exam date to continue studying."
              }
            </Typography>
          </Alert>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default ExamCountdown;

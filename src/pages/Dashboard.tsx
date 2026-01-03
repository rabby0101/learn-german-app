import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  Speed as SpeedIcon,
  Psychology as BrainIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
  ProgressTrackingService, 
  LearningAnalytics, 
  DailyProgress, 
  WeeklyStats, 
  Achievement 
} from '../services/progressTrackingService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const [analyticsData, dailyData, weeklyData, achievementsData] = await Promise.all([
        ProgressTrackingService.getLearningAnalytics(currentUser.id),
        ProgressTrackingService.getDailyProgress(currentUser.id),
        ProgressTrackingService.getWeeklyStats(currentUser.id),
        ProgressTrackingService.getAchievementProgress(currentUser.id)
      ]);

      setAnalytics(analyticsData);
      setDailyProgress(dailyData);
      setWeeklyStats(weeklyData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCEFRColor = (level: string): string => {
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

  if (!currentUser) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Please log in to view your dashboard
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
            Loading your learning dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
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
          📊 Learning Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
          Welcome back, {currentUser.name}!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Chip
            label={analytics?.currentCEFRLevel || 'A1'}
            sx={{
              background: getCEFRColor(analytics?.currentCEFRLevel || 'A1'),
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
              px: 1
            }}
          />
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            🔥 {currentUser.progress.currentStreak} day streak
          </Typography>
          <IconButton onClick={loadDashboardData} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)} 
          centered
          textColor="inherit"
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              '&.Mui-selected': {
                color: 'white',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#06d6a0',
              height: 3,
              borderRadius: '3px',
            },
          }}
        >
          <Tab label="📈 Overview" />
          <Tab label="📊 Analytics" />
          <Tab label="🏆 Achievements" />
          <Tab label="📅 Progress History" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Key Statistics Cards */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: { md: '1 1 65%' } }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '16px'
                }}>
                  <CardContent>
                    <SchoolIcon sx={{ fontSize: '2rem', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {analytics?.masteredWords || 0}
                    </Typography>
                    <Typography variant="body2">Words Mastered</Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '16px'
                }}>
                  <CardContent>
                    <TimerIcon sx={{ fontSize: '2rem', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatTime(currentUser.progress.totalStudyTime)}
                    </Typography>
                    <Typography variant="body2">Study Time</Typography>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '16px'
                }}>
                  <CardContent>
                    <BrainIcon sx={{ fontSize: '2rem', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {currentUser.progress.grammarTopicsCompleted}
                    </Typography>
                    <Typography variant="body2">Grammar Topics</Typography>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '16px'
                }}>
                  <CardContent>
                    <SpeedIcon sx={{ fontSize: '2rem', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {analytics?.learningVelocity || 0}
                    </Typography>
                    <Typography variant="body2">Words/Week</Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Progress to Next Level */}
              <Card sx={{ 
                mt: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    🎯 Progress to Next Level
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {analytics?.currentCEFRLevel} → {analytics?.currentCEFRLevel === 'C2' ? 'C2' : 
                        ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(analytics?.currentCEFRLevel || 'A1') + 1]}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#06d6a0', fontWeight: 600 }}>
                      {analytics?.nextLevelProgress || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={analytics?.nextLevelProgress || 0}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        background: 'linear-gradient(90deg, #06d6a0 0%, #34d399 100%)',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </Box>

            {/* Today's Progress */}
            <Box sx={{ flex: { md: '1 1 35%' } }}>
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                height: 'fit-content'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    📅 Today's Progress
                  </Typography>
                  
                  {dailyProgress ? (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Study Time
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                          {formatTime(dailyProgress.studyTimeMinutes)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Words Studied
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                          {dailyProgress.wordsStudied}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Exercises Completed
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                          {dailyProgress.exercisesCompleted}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', py: 3 }}>
                      No study session today yet.<br />
                      Start learning to see your progress!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Learning Analytics */}
          <Box sx={{ flex: { md: '1 1 65%' } }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                  🧠 Learning Analytics
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                      Retention Rate
                    </Typography>
                    <CircularProgress
                      variant="determinate"
                      value={analytics?.averageRetentionRate || 0}
                      size={80}
                      sx={{
                        color: '#06d6a0',
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700, mt: 1 }}>
                      {analytics?.averageRetentionRate || 0}%
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                      Strongest Skills
                    </Typography>
                    {analytics?.strongestSkills.map((skill, index) => (
                      <Chip
                        key={skill}
                        label={skill.charAt(0).toUpperCase() + skill.slice(1)}
                        sx={{
                          mr: 1,
                          mb: 1,
                          background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
                          color: 'white',
                        }}
                      />
                    ))}
                    
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 2, mb: 1 }}>
                      Areas to Improve
                    </Typography>
                    {analytics?.weakestSkills.map((skill, index) => (
                      <Chip
                        key={skill}
                        label={skill.charAt(0).toUpperCase() + skill.slice(1)}
                        sx={{
                          mr: 1,
                          mb: 1,
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Fluency Projection */}
          <Box sx={{ flex: { md: '1 1 35%' } }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  🚀 Fluency Projection
                </Typography>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Projected B2 Fluency
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700, mt: 1 }}>
                    {analytics?.projectedFluencyDate ? 
                      new Date(analytics.projectedFluencyDate).toLocaleDateString() : 
                      'Keep learning!'
                    }
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 2 }}>
                    At your current pace of {analytics?.learningVelocity || 0} words/week
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Achievements Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {achievements.map((achievement) => (
            <Card key={achievement.id} sx={{ 
              background: achievement.dateUnlocked 
                ? 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: achievement.dateUnlocked 
                ? '1px solid rgba(6, 214, 160, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              opacity: achievement.dateUnlocked ? 1 : 0.7
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  {achievement.icon}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: achievement.dateUnlocked ? 'white' : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 700,
                    mb: 1 
                  }}
                >
                  {achievement.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: achievement.dateUnlocked ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)',
                    mb: 2
                  }}
                >
                  {achievement.description}
                </Typography>
                
                {!achievement.dateUnlocked && achievement.maxProgress && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={((achievement.progress || 0) / achievement.maxProgress) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #06d6a0 0%, #34d399 100%)',
                        },
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1, display: 'block' }}
                    >
                      {achievement.progress || 0} / {achievement.maxProgress}
                    </Typography>
                  </Box>
                )}
                
                {achievement.dateUnlocked && (
                  <Typography 
                    variant="caption" 
                    sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    Unlocked: {new Date(achievement.dateUnlocked).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* Progress History Tab */}
      <TabPanel value={activeTab} index={3}>
        <Card sx={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px'
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
              📈 Weekly Progress
            </Typography>
            
            {weeklyStats && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Study Time
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                    {formatTime(weeklyStats.totalStudyTime)}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Words Learned
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                    {weeklyStats.wordsLearned}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Days Studied
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                    {weeklyStats.daysStudied} / 7
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Avg Daily Time
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                    {formatTime(weeklyStats.averageDailyTime)}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>
    </Container>
  );
};

export default Dashboard;
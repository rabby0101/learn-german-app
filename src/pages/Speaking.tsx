import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SpeakingPractice from '../components/SpeakingPractice';
import TopicBasedSpeakingPractice from '../components/TopicBasedSpeakingPractice';

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
      id={`speaking-tabpanel-${index}`}
      aria-labelledby={`speaking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Speaking: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [userProgress, setUserProgress] = useState({
    pronunciationScore: 0,
    conversationLevel: 'A1',
    completedExercises: 0,
    totalSpeakingTime: 0
  });

  useEffect(() => {
    // Load user's speaking progress
    if (currentUser) {
      // In a real app, you'd fetch this from your database
      setUserProgress({
        pronunciationScore: Math.floor(Math.random() * 40) + 60,
        conversationLevel: currentUser.progress.currentLevel,
        completedExercises: Math.floor(Math.random() * 25),
        totalSpeakingTime: Math.floor(Math.random() * 120) + 30
      });
    }
  }, [currentUser]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleExerciseComplete = (exerciseId: string, score: number) => {
    console.log(`Exercise ${exerciseId} completed with score: ${score}`);
    // Update user progress
    setUserProgress(prev => ({
      ...prev,
      completedExercises: prev.completedExercises + 1,
      pronunciationScore: Math.round((prev.pronunciationScore + score) / 2)
    }));
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Filter exercises by difficulty and type
  const getExercisesByLevel = (level: string) => {
    // Use the default exercises from SpeakingPractice component
    const allExercises = [
      // B1 Level Exercises
      {
        id: 'b1-1',
        type: 'conversation' as const,
        german: 'Ich hätte gerne ein Vorstellungsgespräch für die ausgeschriebene Stelle.',
        english: 'I would like to have a job interview for the advertised position.',
        phonetic: 'ikh HET-te GAIR-ne eyn for-SHTEL-loongs-ge-shpreyh fuer dee OUSE-ge-shree-be-ne SHTEL-le',
        difficulty: 'B1' as const,
        context: 'Job application scenario',
        tips: ['Use subjunctive "hätte" for polite requests', 'Practice the compound word "Vorstellungsgespräch"']
      },
      {
        id: 'b1-2',
        type: 'pronunciation' as const,
        german: 'Obwohl das Wetter schlecht war, sind wir trotzdem spazieren gegangen.',
        english: 'Although the weather was bad, we still went for a walk.',
        phonetic: 'ob-VOHL das VET-ter shlekht var, zint veer TROTTS-dem shpa-TSEE-ren ge-GANG-en',
        difficulty: 'B1' as const,
        context: 'Complex sentence with subordinate clause',
        tips: ['Practice the "obwohl" conjunction clearly', 'Note the verb position in subordinate clauses']
      },
      // B2 Level Exercises  
      {
        id: 'b2-1',
        type: 'pronunciation' as const,
        german: 'Die zunehmende Digitalisierung hat sowohl Vor- als auch Nachteile für die Gesellschaft.',
        english: 'The increasing digitization has both advantages and disadvantages for society.',
        phonetic: 'dee tsoo-NAY-men-de di-gi-ta-li-ZEE-roong hat zo-VOHL for- als owkh NAHKH-tay-le fuer dee ge-ZEL-shaft',
        difficulty: 'B2' as const,
        context: 'Academic discussion about technology',
        tips: ['Master the difficult "zunehmende" pronunciation', 'Practice "sowohl...als auch" construction']
      },
      {
        id: 'b2-2',
        type: 'conversation' as const,
        german: 'Es wäre durchaus denkbar, dass sich die Situation in den nächsten Jahren grundlegend ändern wird.',
        english: 'It would be quite conceivable that the situation will fundamentally change in the next few years.',
        phonetic: 'es VAY-re DOORH-ows DENK-bar, das zikh dee zi-too-ah-TSION in dayn NEYH-sten YAH-ren GROONT-lay-gent EN-dern veert',
        difficulty: 'B2' as const,
        context: 'Expressing possibility and speculation',
        tips: ['Practice subjunctive "wäre" clearly', 'Focus on "durchaus" as an intensifier']
      },
      // C1 Level Exercises
      {
        id: 'c1-1',
        type: 'pronunciation' as const,
        german: 'Die Implementierung nachhaltiger Technologien erfordert erhebliche Investitionen in Forschung und Entwicklung.',
        english: 'The implementation of sustainable technologies requires considerable investments in research and development.',
        phonetic: 'dee im-ple-men-TEE-roong NAHKH-hal-ti-ger tekh-no-lo-GHEE-en er-FOR-dert er-HAYP-li-khe in-ves-ti-TSIO-nen in FOR-shoong oont ent-VIK-loong',
        difficulty: 'C1' as const,
        context: 'Technical and scientific discussion',
        tips: ['Perfect the technical term "Implementierung"', 'Practice the flow of "nachhaltiger Technologien"']
      },
      {
        id: 'c1-2',
        type: 'conversation' as const,
        german: 'Ungeachtet der kritischen Einwände verschiedener Interessensgruppen wird das Projekt voraussichtlich wie geplant umgesetzt.',
        english: 'Regardless of the critical objections from various interest groups, the project will presumably be implemented as planned.',
        phonetic: 'OON-ge-akh-tet dair KREE-ti-shen EYN-ven-de fer-SHEE-de-ner in-ter-ES-ens-groo-pen veert das pro-YEKT for-OWS-zikh-tlikh vee ge-PLAHNT OOM-ge-zetzt',
        difficulty: 'C1' as const,
        context: 'Complex project management discussion',
        tips: ['Master "ungeachtet" as sophisticated vocabulary', 'Practice "Interessensgruppen" compound']
      }
    ];
    
    return allExercises.filter(ex => ex.difficulty === level);
  };

  const pronunciationExercises = getExercisesByLevel(selectedTab === 0 ? 'B1' : selectedTab === 1 ? 'B2' : 'C1').filter(ex => ex.type === 'pronunciation');
  const conversationExercises = getExercisesByLevel(selectedTab === 0 ? 'B1' : selectedTab === 1 ? 'B2' : 'C1').filter(ex => ex.type === 'conversation');

  if (!currentUser) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Please log in to access speaking practice
        </Typography>
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
          🎤 Speaking Practice
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
          Improve your German pronunciation and conversation skills
        </Typography>

        {/* Progress Overview */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, 
          gap: 2,
          mt: 3
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 700 }}>
              {userProgress.pronunciationScore}%
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Pronunciation Score
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
              {userProgress.conversationLevel}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Speaking Level
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#fbbf24', fontWeight: 700 }}>
              {userProgress.completedExercises}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Exercises Done
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              {formatTime(userProgress.totalSpeakingTime)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Practice Time
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Practice Tabs */}
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        mb: 3
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: '#06d6a0',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#06d6a0',
              },
            }}
          >
            <Tab 
              icon={<BrainIcon />} 
              label="AI Generated" 
              iconPosition="start"
            />
            <Tab 
              icon={<MicIcon />} 
              label="B1 Level" 
              iconPosition="start"
            />
            <Tab 
              icon={<VolumeUpIcon />} 
              label="B2 Level" 
              iconPosition="start"
            />
            <Tab 
              icon={<BrainIcon />} 
              label="C1 Advanced" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ px: 3 }}>
            <TopicBasedSpeakingPractice />
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
              🎯 B1 Level Speaking Practice
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, textAlign: 'center' }}>
              Intermediate conversations, job interviews, and complex sentences with subordinate clauses
            </Typography>
            <SpeakingPractice 
              exercises={getExercisesByLevel('B1')} 
              onComplete={handleExerciseComplete}
            />
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
              🎯 B2 Level Speaking Practice
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, textAlign: 'center' }}>
              Advanced academic discussions, business language, and complex subjunctive constructions
            </Typography>
            <SpeakingPractice 
              exercises={getExercisesByLevel('B2')} 
              onComplete={handleExerciseComplete}
            />
          </Box>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
              🎯 C1 Advanced Speaking Practice
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, textAlign: 'center' }}>
              Professional and academic German with sophisticated vocabulary and complex grammar structures
            </Typography>
            <SpeakingPractice 
              exercises={getExercisesByLevel('C1')} 
              onComplete={handleExerciseComplete}
            />
          </Box>
        </TabPanel>
      </Card>

      {/* Tips Card */}
      <Alert 
        severity="info"
        sx={{ 
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          color: 'white',
          border: '1px solid #6366f1',
          borderRadius: '16px',
          '& .MuiAlert-icon': {
            color: '#6366f1'
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          💡 Speaking Tips
        </Typography>
        <Typography variant="body2">
          • Practice a little every day rather than long sessions
          <br />
          • Don't worry about making mistakes - they help you learn
          <br />
          • Record yourself and compare with native speakers
          <br />
          • Focus on rhythm and intonation, not just individual sounds
        </Typography>
      </Alert>
    </Container>
  );
};

export default Speaking;
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import FloatingChat from './components/FloatingChat';
import theme from './theme/theme';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';

// Lazy load all pages for code splitting
const Vocabulary = React.lazy(() => import('./pages/Vocabulary'));
const Grammar = React.lazy(() => import('./pages/Grammar'));
const Quiz = React.lazy(() => import('./pages/Quiz'));
const Reading = React.lazy(() => import('./pages/Reading'));
const Writing = React.lazy(() => import('./pages/Writing'));
const Listening = React.lazy(() => import('./pages/Listening'));
const DailyGoals = React.lazy(() => import('./pages/DailyGoals'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LearningPath = React.lazy(() => import('./pages/LearningPath'));
const Speaking = React.lazy(() => import('./pages/Speaking'));
const TTSTest = React.lazy(() => import('./components/TTSTest'));
const ModelTestLevel = React.lazy(() => import('./pages/ModelTestLevel'));
const B1ReadingModelTest = React.lazy(() => import('./pages/B1ReadingModelTest'));
const B2ReadingPractice = React.lazy(() => import('./pages/B2ReadingPractice'));
const B2WritingPractice = React.lazy(() => import('./pages/B2WritingPractice'));

function App() {
  // Apply performance optimizations
  usePerformanceOptimization();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: '#fafafa',
          }}
        >
          <Router>
            <Header />
            <Box
              component="main"
              sx={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: { xs: '16px', sm: '24px', md: '32px' },
              }}
            >
              {/* Suspense boundary for lazy loaded routes */}
              <Suspense fallback={<LoadingSpinner message="Loading..." />}>
                <Routes>
                  {/* Learn Routes */}
                  <Route path="/" element={<Vocabulary />} />
                  <Route path="/grammar" element={<Grammar />} />

                  {/* Practice Routes */}
                  <Route path="/reading" element={<Reading />} />
                  <Route path="/writing" element={<Writing />} />
                  <Route path="/listening" element={<Listening />} />
                  <Route path="/speaking" element={<Speaking />} />
                  <Route path="/quiz" element={<Quiz />} />

                  {/* Progress Routes */}
                  <Route path="/goals" element={<DailyGoals />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/learning-path" element={<LearningPath />} />

                  {/* Model Test Routes */}
                  <Route path="/model-test/a1/*" element={<ModelTestLevel level="A1" />} />
                  <Route path="/model-test/a2/*" element={<ModelTestLevel level="A2" />} />
                  <Route path="/model-test/b1" element={<ModelTestLevel level="B1" />} />
                  <Route path="/model-test/b1/reading" element={<B1ReadingModelTest />} />
                  <Route path="/model-test/b2" element={<ModelTestLevel level="B2" />} />
                  <Route path="/model-test/b2/reading" element={<B2ReadingPractice />} />
                  <Route path="/model-test/b2/writing" element={<B2WritingPractice />} />
                  <Route path="/model-test/c1/*" element={<ModelTestLevel level="C1" />} />
                  <Route path="/model-test/c2/*" element={<ModelTestLevel level="C2" />} />

                  {/* Utility Routes */}
                  <Route path="/tts-test" element={<TTSTest />} />
                </Routes>
              </Suspense>
            </Box>

            {/* Floating AI Chat - appears on all pages */}
            <FloatingChat />
          </Router>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
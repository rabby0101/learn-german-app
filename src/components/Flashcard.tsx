import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import TranslateIcon from '@mui/icons-material/Translate';
import PronunciationButton from './PronunciationButton';
import CompactPronunciationButton from './CompactPronunciationButton';
import { deepseekApi } from '../services/deepseekApi';
import { styled, keyframes } from '@mui/material/styles';

const sparkle = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1) rotate(180deg); opacity: 1; }
  100% { transform: scale(0) rotate(360deg); opacity: 0; }
`;

const FlashcardContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '600px',
  height: '400px',
  perspective: '1000px',
  position: 'relative',
}));

const FlashcardInner = styled(Box)<{ isflipped: string }>(({ isflipped }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  transformStyle: 'preserve-3d',
  transform: isflipped === 'true' ? 'rotateY(180deg)' : 'rotateY(0deg)',
  cursor: 'pointer',
  willChange: 'transform',
}));

const FlashcardSide = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  MozBackfaceVisibility: 'hidden',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
  overflow: 'hidden',
}));

const FlashcardBack = styled(FlashcardSide)(({ theme }) => ({
  transform: 'rotateY(180deg)',
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
}));

const SparkleIcon = styled(StarIcon)<{ delay: number }>(({ delay }) => ({
  position: 'absolute',
  animation: `${sparkle} 2s infinite`,
  animationDelay: `${delay}s`,
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
}));

interface FlashcardProps {
  german: string;
  english: string;
  example: string;
  isMastered: boolean;
  onMastered: (germanWord: string) => void;
  onTranslationUpdate?: (german: string, english: string, example: string) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
  german,
  english: initialEnglish,
  example: initialExample,
  isMastered,
  onMastered,
  onTranslationUpdate
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [justMastered, setJustMastered] = useState(false);
  const [english, setEnglish] = useState(initialEnglish);
  const [example, setExample] = useState(initialExample);
  const [isTranslating, setIsTranslating] = useState(false);

  // Check if translation is missing (empty or just chapter info)
  const needsTranslation = !english || english.startsWith('[B2]') || english === '';
  const needsExample = !example || example.includes(' - Kapitel') || example === '';

  useEffect(() => {
    setEnglish(initialEnglish);
    setExample(initialExample);
  }, [initialEnglish, initialExample, german]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMasteredClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Flashcard: Master button clicked for "${german}"`);
    onMastered(german);
    setJustMastered(true);
    setTimeout(() => setJustMastered(false), 2000);
  };

  const handleTranslateClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsTranslating(true);

    try {
      const result = await deepseekApi.translateWord(german);
      setEnglish(result.english);
      setExample(result.example);

      // Notify parent of the translation update
      if (onTranslationUpdate) {
        onTranslationUpdate(german, result.english, result.example);
      }
    } catch (error) {
      console.error('Failed to translate:', error);
      alert('Failed to translate. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePronunciationClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  useEffect(() => {
    if (isMastered && !justMastered) {
      setJustMastered(true);
      setTimeout(() => setJustMastered(false), 2000);
    }
  }, [isMastered, justMastered]);

  return (
    <FlashcardContainer>
      <FlashcardInner isflipped={isFlipped.toString()} onClick={handleFlip}>
        {/* Front Side (German) */}
        <FlashcardSide>
          {justMastered && (
            <>
              <SparkleIcon delay={0} sx={{ top: '10%', left: '15%', color: '#FFD700', fontSize: '2rem' }} />
              <SparkleIcon delay={0.2} sx={{ top: '20%', right: '20%', color: '#FFA500', fontSize: '1.5rem' }} />
              <SparkleIcon delay={0.4} sx={{ bottom: '25%', left: '25%', color: '#FFD700', fontSize: '1.8rem' }} />
              <SparkleIcon delay={0.6} sx={{ bottom: '15%', right: '15%', color: '#FFA500', fontSize: '2.2rem' }} />
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', mb: 1 }}>
            <Chip
              label="German"
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box onClick={handlePronunciationClick}>
                <PronunciationButton text={german} />
              </Box>

              <Button
                onClick={handleMasteredClick}
                startIcon={isMastered ? <CheckCircleIcon /> : <StarIcon />}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: isMastered ? '#22c55e' : '#f59e0b',
                  color: isMastered ? 'white' : '#1a1a2e',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 1.5,
                  '&:hover': {
                    backgroundColor: isMastered ? '#16a34a' : '#d97706',
                  },
                }}
              >
                {isMastered ? 'Mastered' : 'Master'}
              </Button>
            </Box>
          </Box>

          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'white',
                mb: 1,
                letterSpacing: '0.3px',
                fontSize: { xs: '1.8rem', md: '2.2rem' },
              }}
            >
              {german}
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 2,
          }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
              }}
            >
              Click to flip
            </Typography>
          </Box>
        </FlashcardSide>

        {/* Back Side (English + Example) */}
        <FlashcardBack>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', mb: 1 }}>
            <Chip
              label="English"
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500,
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {(needsTranslation || needsExample) && (
                <Button
                  onClick={handleTranslateClick}
                  disabled={isTranslating}
                  startIcon={isTranslating ? <CircularProgress size={14} color="inherit" /> : <TranslateIcon />}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                  }}
                >
                  {isTranslating ? 'Translating...' : 'AI Translate'}
                </Button>
              )}

              <Box onClick={handlePronunciationClick}>
                <PronunciationButton text={english} />
              </Box>
            </Box>
          </Box>

          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            gap: 2,
          }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.3px',
                textAlign: 'center',
                lineHeight: 1.2,
                fontSize: { xs: '1.5rem', md: '1.8rem' },
              }}
            >
              {needsTranslation ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
                    Translation not available
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Click "AI Translate" to get translation
                  </Typography>
                </Box>
              ) : english}
            </Typography>

            {example && !needsExample && (
              <Box sx={{
                width: '100%',
                maxWidth: '500px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                p: 2,
                position: 'relative',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    Example
                  </Typography>

                  <Box onClick={handlePronunciationClick}>
                    <CompactPronunciationButton text={example} />
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'white',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontStyle: 'italic',
                    lineHeight: 1.3,
                  }}
                >
                  "{example}"
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
              }}
            >
              Click to flip back
            </Typography>
          </Box>
        </FlashcardBack>
      </FlashcardInner>
    </FlashcardContainer>
  );
};

export default Flashcard;
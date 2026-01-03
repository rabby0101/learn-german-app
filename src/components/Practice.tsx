
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CompactPronunciationButton from './CompactPronunciationButton';
import { deepseekApi, GrammarExample } from '../services/deepseekApi';
import { VocabularyExtractionService } from '../services/vocabularyExtractionService';

interface PracticeProps {
  rule: {
    title: string;
    description?: string;
    explanation?: string;
  };
  themes?: string;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const Practice: React.FC<PracticeProps> = ({ rule, themes }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [practiceExamples, setPracticeExamples] = useState<GrammarExample[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const examples = await deepseekApi.generateGrammarExamples(rule.title, 3, themes || '');
      setPracticeExamples(examples);
      
      // Extract vocabulary from practice examples in background (only German sentences)
      const germanSentences = examples.map(example => example.german);
      VocabularyExtractionService.extractAndSaveVocabulary(germanSentences, 'grammar-generated');
      
    } catch (error: any) {
      console.error("Error fetching practice questions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPracticeExamples([]);
    setError(null);
  };

  return (
    <div>
      <Button onClick={handleOpen}>Practice</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          ...style,
          width: { xs: '90%', sm: 600 },
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
          background: 'rgba(30, 30, 50, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 3, color: 'white' }}>
            Practice Examples for {rule.title}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress sx={{ color: '#06d6a0' }} />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ color: '#ff6b6b' }}>{error}</Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {practiceExamples.map((example, index) => (
                <Box 
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    mb: 3,
                    p: 3,
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        flex: 1,
                        fontWeight: 600,
                      }}
                    >
                      <strong>{index + 1}.</strong> 🇩🇪 {example.german}
                    </Typography>
                    <CompactPronunciationButton text={example.german} />
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.95rem',
                      ml: 3,
                      fontStyle: 'italic',
                    }}
                  >
                    🇺🇸 {example.english}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Practice;

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { TTSService } from '../services/ttsService';

const TTSTest: React.FC = () => {
  const [testText, setTestText] = useState('Hallo, wie geht es Ihnen?');
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTTS = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setError(null);
    
    try {
      await TTSService.speak(testText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS test failed');
    } finally {
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const testDifferentVoice = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setError(null);
    
    try {
      await TTSService.speakWithVoice(testText, 'de-DE-Neural2-H');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice test failed');
    } finally {
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Google Cloud TTS Test
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={3}
        value={testText}
        onChange={(e) => setTestText(e.target.value)}
        label="German text to speak"
        variant="outlined"
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={testTTS}
          disabled={isPlaying}
          startIcon={<VolumeUpIcon />}
          sx={{ mr: 1 }}
        >
          Test Default Voice (Chirp-HD-F)
        </Button>
        
        <Button
          variant="outlined"
          onClick={testDifferentVoice}
          disabled={isPlaying}
          startIcon={<VolumeUpIcon />}
        >
          Test Male Voice (Neural2-H)
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="body2" color="text.secondary">
        Available German voices:
      </Typography>
      <ul>
        {TTSService.getAvailableVoices().map((voice) => (
          <li key={voice.name}>
            <Typography variant="body2">
              {voice.displayName} - {voice.name}
            </Typography>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default TTSTest;
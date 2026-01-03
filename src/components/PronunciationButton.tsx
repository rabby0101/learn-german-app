
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { TTSService } from '../services/ttsService';

interface PronunciationButtonProps {
  text: string;
  context?: string;
}

const PronunciationButton: React.FC<PronunciationButtonProps> = ({ text, context }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const speakText = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await TTSService.speak(text, undefined, 1.0, context || 'pronunciation');
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      // Reset playing state after a delay
      setTimeout(() => setIsPlaying(false), 1000);
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={speakText}
      startIcon={<VolumeUpIcon />}
      size="small"
      sx={{ ml: 1 }}
    >
      Listen
    </Button>
  );
};

export default PronunciationButton;

import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { TTSService } from '../services/ttsService';

interface CompactPronunciationButtonProps {
  text: string;
  context?: string;
}

const CompactPronunciationButton: React.FC<CompactPronunciationButtonProps> = ({ text, context }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const speakText = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await TTSService.speak(text, undefined, 1.0, context || 'pronunciation');
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setTimeout(() => setIsPlaying(false), 1000);
    }
  };

  return (
    <IconButton
      onClick={speakText}
      size="small"
      sx={{
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
          transform: 'scale(1.05)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      <VolumeUpIcon fontSize="small" />
    </IconButton>
  );
};

export default CompactPronunciationButton;
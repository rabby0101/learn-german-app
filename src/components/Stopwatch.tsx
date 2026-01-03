import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface StopwatchProps {
  onTimeUpdate?: (seconds: number) => void;
}

const Stopwatch: React.FC<StopwatchProps> = ({ onTimeUpdate }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          color: '#1a1a2e',
          fontWeight: 600,
          mb: 2,
        }}
      >
        Study Timer
      </Typography>

      <Typography
        variant="h3"
        sx={{
          color: isRunning ? '#10b981' : '#1a1a2e',
          fontWeight: 700,
          fontFamily: 'monospace',
          mb: 3,
          transition: 'color 0.3s ease',
        }}
      >
        {formatTime(time)}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {!isRunning ? (
          <Button
            variant="contained"
            onClick={handleStart}
            size="small"
            sx={{
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            Start
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handlePause}
            size="small"
            sx={{
              backgroundColor: '#f59e0b',
              '&:hover': {
                backgroundColor: '#d97706',
              },
            }}
          >
            Pause
          </Button>
        )}

        <Button
          variant="outlined"
          onClick={handleReset}
          size="small"
          sx={{
            borderColor: '#e5e7eb',
            color: '#374151',
            '&:hover': {
              borderColor: '#d1d5db',
              backgroundColor: '#f9fafb',
            },
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default Stopwatch;
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError('');
    setName('');
    setPassword('');
  };

  const handleClose = () => {
    setName('');
    setPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let success = false;
      
      if (activeTab === 0) { // Login
        success = await login({ name: name.trim(), password });
        if (!success) {
          setError('Invalid name or password');
        }
      } else { // Signup
        if (password.length < 4) {
          setError('Password must be at least 4 characters long');
          setLoading(false);
          return;
        }
        
        await signup(name.trim(), password);
        success = true;
      }

      if (success) {
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          textAlign: 'center',
          color: 'white',
          pb: 1
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #fff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Welcome to German Learning
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            mt: 1
          }}
        >
          Your journey to German fluency starts here
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            centered
            textColor="inherit"
            indicatorColor="primary"
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
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              color: '#ff6b6b',
              '& .MuiAlert-icon': {
                color: '#ff6b6b',
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Your Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            placeholder={activeTab === 0 ? "Enter your name" : "Choose a name"}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#06d6a0',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.8)',
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            placeholder={activeTab === 0 ? "Enter your password" : "Choose a password (min. 4 characters)"}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#06d6a0',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.8)',
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              },
            }}
          />

          {activeTab === 1 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                display: 'block',
                mb: 2,
                textAlign: 'center'
              }}
            >
              📝 Note: Your account will be stored locally on this device only
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderRadius: '12px',
            px: 3,
            py: 1,
            color: 'rgba(255, 255, 255, 0.8)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !password.trim()}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1,
            background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
            boxShadow: '0 4px 20px rgba(6, 214, 160, 0.4)',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 25px rgba(6, 214, 160, 0.6)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {loading ? 'Please wait...' : activeTab === 0 ? 'Login' : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
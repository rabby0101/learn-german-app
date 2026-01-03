import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../services/userDatabase';

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfile({ open, onClose }: UserProfileProps) {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (currentUser) {
      setEditForm({
        learningPreferences: { ...currentUser.learningPreferences }
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setError('');
    if (!editMode) {
      setEditForm({
        learningPreferences: { ...currentUser.learningPreferences }
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.learningPreferences) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateUserProfile(editForm);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    if (!editForm.learningPreferences) return;

    const currentAreas = editForm.learningPreferences.focusAreas || [];
    let newAreas;

    if (checked) {
      newAreas = [...currentAreas, area as any];
    } else {
      newAreas = currentAreas.filter(a => a !== area);
    }

    setEditForm({
      ...editForm,
      learningPreferences: {
        ...editForm.learningPreferences,
        focusAreas: newAreas
      }
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getAvatarInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
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

  const skillAreas = [
    { key: 'vocabulary', label: '📚 Vocabulary', description: 'Word learning and retention' },
    { key: 'grammar', label: '📖 Grammar', description: 'Language structure and rules' },
    { key: 'speaking', label: '🗣️ Speaking', description: 'Pronunciation and conversation' },
    { key: 'listening', label: '👂 Listening', description: 'Audio comprehension' },
    { key: 'reading', label: '👁️ Reading', description: 'Text comprehension' },
    { key: 'writing', label: '✍️ Writing', description: 'Text composition' }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
            👤 User Profile
          </Typography>
          <Button
            onClick={editMode ? handleSaveProfile : handleEditToggle}
            startIcon={editMode ? <StarIcon /> : <EditIcon />}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              background: editMode 
                ? 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '&:hover': {
                background: editMode 
                  ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                  : 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            {editMode ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#ff6b6b' }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* User Info Card */}
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    mr: 3,
                  }}
                >
                  {getAvatarInitial(currentUser.name)}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                    {currentUser.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip
                      label={currentUser.progress.currentLevel}
                      sx={{
                        background: getCEFRColor(currentUser.progress.currentLevel),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      🔥 {currentUser.progress.currentStreak} day streak
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Member since {new Date(currentUser.dateCreated).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {/* Progress Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                    {currentUser.progress.vocabularyMastered}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Words Mastered
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                    {currentUser.progress.grammarTopicsCompleted}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Grammar Topics
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                    {formatTime(currentUser.progress.totalStudyTime)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Study Time
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 700 }}>
                    {currentUser.progress.longestStreak}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Best Streak
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                ⚙️ Learning Preferences
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Difficulty Level
                  </InputLabel>
                  <Select
                    value={editMode ? editForm.learningPreferences?.difficulty : currentUser.learningPreferences.difficulty}
                    onChange={(e) => editMode && setEditForm({
                      ...editForm,
                      learningPreferences: {
                        ...editForm.learningPreferences!,
                        difficulty: e.target.value as any
                      }
                    })}
                    disabled={!editMode}
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'rgba(255, 255, 255, 0.8)',
                      },
                    }}
                  >
                    <MenuItem value="beginner">🟢 Beginner</MenuItem>
                    <MenuItem value="intermediate">🟡 Intermediate</MenuItem>
                    <MenuItem value="advanced">🔴 Advanced</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Daily Goal (words)"
                  type="number"
                  fullWidth
                  value={editMode ? editForm.learningPreferences?.dailyGoal : currentUser.learningPreferences.dailyGoal}
                  onChange={(e) => editMode && setEditForm({
                    ...editForm,
                    learningPreferences: {
                      ...editForm.learningPreferences!,
                      dailyGoal: parseInt(e.target.value) || 0
                    }
                  })}
                  disabled={!editMode}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.8)' },
                    '& .MuiOutlinedInput-input': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                  Focus Areas
                </Typography>
                <FormGroup row>
                  {skillAreas.map((skill) => (
                    <FormControlLabel
                      key={skill.key}
                      control={
                        <Checkbox
                          checked={editMode 
                            ? editForm.learningPreferences?.focusAreas?.includes(skill.key as any) ?? false
                            : currentUser.learningPreferences.focusAreas.includes(skill.key as any)
                          }
                          onChange={(e) => editMode && handleFocusAreaChange(skill.key, e.target.checked)}
                          disabled={!editMode}
                          sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            '&.Mui-checked': { color: '#06d6a0' },
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {skill.label}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            </CardContent>
          </Card>

          {/* Skill Levels */}
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                📊 Skill Levels
              </Typography>
              
              {skillAreas.map((skill) => {
                const level = currentUser.statistics.skillLevels[skill.key as keyof typeof currentUser.statistics.skillLevels];
                return (
                  <Box key={skill.key} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {skill.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#06d6a0', fontWeight: 600 }}>
                        {level}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={level}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #06d6a0 0%, #34d399 100%)',
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={logout}
          color="error"
          sx={{
            borderRadius: '12px',
            px: 3,
            color: '#ff6b6b',
            borderColor: 'rgba(255, 107, 107, 0.5)',
            '&:hover': {
              borderColor: '#ff6b6b',
              background: 'rgba(255, 107, 107, 0.1)',
            },
          }}
          variant="outlined"
        >
          Logout
        </Button>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '12px',
            px: 3,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            },
          }}
          variant="contained"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
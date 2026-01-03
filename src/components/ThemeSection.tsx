import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Theme {
  id: string;
  name: string;
  color: string;
  isPredefined: boolean;
}

interface ThemeSectionProps {
  selectedThemes: Theme[];
  onThemeToggle: (theme: Theme) => void;
  onThemeCreate: (name: string, color: string) => void;
  onThemeDelete: (themeId: string) => void;
}

const PREDEFINED_THEMES: Theme[] = [
  { id: 'household', name: 'Household', color: '#ef4444', isPredefined: true },
  { id: 'animals', name: 'Animals', color: '#14b8a6', isPredefined: true },
  { id: 'food', name: 'Food & Drinks', color: '#3b82f6', isPredefined: true },
  { id: 'travel', name: 'Travel', color: '#22c55e', isPredefined: true },
  { id: 'business', name: 'Business', color: '#f59e0b', isPredefined: true },
  { id: 'emotions', name: 'Emotions', color: '#a855f7', isPredefined: true },
  { id: 'weather', name: 'Weather', color: '#06b6d4', isPredefined: true },
  { id: 'clothing', name: 'Clothing', color: '#f97316', isPredefined: true },
  { id: 'technology', name: 'Technology', color: '#8b5cf6', isPredefined: true },
  { id: 'sports', name: 'Sports', color: '#ec4899', isPredefined: true },
];

const THEME_COLORS = [
  '#ef4444', '#14b8a6', '#3b82f6', '#22c55e', '#f59e0b',
  '#a855f7', '#06b6d4', '#f97316', '#8b5cf6', '#ec4899',
  '#10b981', '#6366f1', '#eab308', '#84cc16', '#64748b'
];

const ThemeSection: React.FC<ThemeSectionProps> = ({
  selectedThemes,
  onThemeToggle,
  onThemeCreate,
  onThemeDelete,
}) => {
  const [allThemes, setAllThemes] = useState<Theme[]>(PREDEFINED_THEMES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);

  const handleCreateTheme = () => {
    if (newThemeName.trim()) {
      const newTheme: Theme = {
        id: `custom-${Date.now()}`,
        name: newThemeName.trim(),
        color: selectedColor,
        isPredefined: false,
      };

      setAllThemes([...allThemes, newTheme]);
      onThemeCreate(newTheme.name, newTheme.color);
      setNewThemeName('');
      setDialogOpen(false);
    }
  };

  const handleDeleteTheme = (theme: Theme) => {
    if (!theme.isPredefined) {
      setAllThemes(allThemes.filter(t => t.id !== theme.id));
      onThemeDelete(theme.id);
    }
  };

  const isThemeSelected = (theme: Theme) => {
    return selectedThemes.some(selected => selected.id === theme.id);
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: 'none',
        height: 'fit-content',
        maxHeight: '600px',
        overflow: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: '#1a1a2e',
            fontWeight: 600,
          }}
        >
          Themes
        </Typography>
        <IconButton
          onClick={() => setDialogOpen(true)}
          size="small"
          sx={{
            color: '#6b7280',
            '&:hover': {
              backgroundColor: '#f3f4f6',
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {allThemes.map((theme) => (
          <Chip
            key={theme.id}
            label={theme.name}
            onClick={() => onThemeToggle(theme)}
            onDelete={!theme.isPredefined ? () => handleDeleteTheme(theme) : undefined}
            deleteIcon={!theme.isPredefined ? <DeleteIcon fontSize="small" /> : undefined}
            size="small"
            sx={{
              backgroundColor: isThemeSelected(theme) ? theme.color : '#f3f4f6',
              color: isThemeSelected(theme) ? '#ffffff' : '#374151',
              border: `1px solid ${isThemeSelected(theme) ? theme.color : '#e5e7eb'}`,
              fontWeight: 500,
              fontSize: '0.75rem',
              '&:hover': {
                backgroundColor: isThemeSelected(theme) ? theme.color : '#e5e7eb',
              },
              transition: 'all 0.15s ease',
              cursor: 'pointer',
              '& .MuiChip-deleteIcon': {
                color: isThemeSelected(theme) ? 'rgba(255, 255, 255, 0.8)' : '#9ca3af',
                fontSize: '1rem',
                '&:hover': {
                  color: isThemeSelected(theme) ? '#ffffff' : '#6b7280',
                },
              },
            }}
          />
        ))}
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: '#9ca3af',
          mt: 2,
          display: 'block',
        }}
      >
        Selected themes will influence vocabulary generation
      </Typography>

      {/* Create Theme Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>
          Create New Theme
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Theme Name"
            fullWidth
            variant="outlined"
            size="small"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
          />

          <Typography sx={{ color: '#6b7280', mt: 2, mb: 1, fontSize: '0.875rem' }}>
            Choose Color:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {THEME_COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => setSelectedColor(color)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: selectedColor === color ? '2px solid #1a1a2e' : '2px solid transparent',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTheme}
            variant="contained"
            sx={{
              backgroundColor: selectedColor,
              '&:hover': {
                backgroundColor: selectedColor,
                opacity: 0.9,
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ThemeSection;

import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
}

interface DailyGoalsData {
  date: string;
  goals: DailyGoal[];
}

const DailyGoals: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [newGoalText, setNewGoalText] = useState('');
  const [allGoalsData, setAllGoalsData] = useState<DailyGoalsData[]>(() => {
    const savedGoals = localStorage.getItem('dailyGoals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });

  const currentDayGoals = allGoalsData.find(
    (data) => data.date === selectedDate?.format('YYYY-MM-DD')
  );

  useEffect(() => {
    localStorage.setItem('dailyGoals', JSON.stringify(allGoalsData));
  }, [allGoalsData]);

  const handleAddGoal = () => {
    if (newGoalText.trim() !== '' && selectedDate) {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const newGoal: DailyGoal = {
        id: Date.now().toString(),
        text: newGoalText.trim(),
        completed: false,
      };

      setAllGoalsData((prevData) => {
        const existingDayIndex = prevData.findIndex((data) => data.date === dateString);
        if (existingDayIndex > -1) {
          const updatedData = [...prevData];
          updatedData[existingDayIndex].goals.push(newGoal);
          return updatedData;
        } else {
          return [...prevData, { date: dateString, goals: [newGoal] }];
        }
      });
      setNewGoalText('');
    }
  };

  const handleToggleComplete = (goalId: string) => {
    if (!selectedDate) return;
    const dateString = selectedDate.format('YYYY-MM-DD');

    setAllGoalsData((prevData) =>
      prevData.map((data) =>
        data.date === dateString
          ? {
              ...data,
              goals: data.goals.map((goal) =>
                goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
              ),
            }
          : data
      )
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!selectedDate) return;
    const dateString = selectedDate.format('YYYY-MM-DD');

    setAllGoalsData((prevData) =>
      prevData.map((data) =>
        data.date === dateString
          ? {
              ...data,
              goals: data.goals.filter((goal) => goal.id !== goalId),
            }
          : data
      )
    );
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h1" gutterBottom>
        Daily Goals
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          sx={{ mb: 3, width: '100%' }}
        />
      </LocalizationProvider>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="New Goal"
          variant="outlined"
          fullWidth
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddGoal();
            }
          }}
        />
        <Button variant="contained" onClick={handleAddGoal} startIcon={<AddIcon />}>
          Add Goal
        </Button>
      </Box>

      <Box>
        <Typography variant="h2" gutterBottom>
          Goals for {selectedDate?.format('YYYY-MM-DD')}
        </Typography>
        {currentDayGoals && currentDayGoals.goals.length > 0 ? (
          currentDayGoals.goals.map((goal) => (
            <Box key={goal.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={goal.completed}
                    onChange={() => handleToggleComplete(goal.id)}
                  />
                }
                label={
                  <Typography
                    sx={{
                      textDecoration: goal.completed ? 'line-through' : 'none',
                      color: goal.completed ? 'text.secondary' : 'inherit',
                    }}
                  >
                    {goal.text}
                  </Typography>
                }
              />
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteGoal(goal.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))
        ) : (
          <Typography variant="body1">No goals set for this date.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default DailyGoals;

import React, { useState } from 'react';
import Container from '@mui/material/Container';
import ReadingPractice from '../components/ReadingPractice';

const Reading: React.FC = () => {
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => {
      const saved = localStorage.getItem('completedReadingExercises');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
  );

  const handleComplete = (exerciseId: string, score: number) => {
    if (score >= 70) {
      const newCompleted = new Set(Array.from(completedExercises).concat(exerciseId));
      setCompletedExercises(newCompleted);
      localStorage.setItem('completedReadingExercises', JSON.stringify(Array.from(newCompleted)));
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <ReadingPractice 
        onComplete={handleComplete}
        completedExercises={completedExercises}
      />
    </Container>
  );
};

export default Reading;
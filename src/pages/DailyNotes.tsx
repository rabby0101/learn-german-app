
import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface DailyNote {
  date: string;
  content: string;
}

const DailyNotes: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [noteContent, setNoteContent] = useState('');
  const [allNotes, setAllNotes] = useState<DailyNote[]>(() => {
    const savedNotes = localStorage.getItem('dailyNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.format('YYYY-MM-DD');
      const currentNote = allNotes.find(note => note.date === dateString);
      setNoteContent(currentNote ? currentNote.content : '');
    }
  }, [selectedDate, allNotes]);

  useEffect(() => {
    localStorage.setItem('dailyNotes', JSON.stringify(allNotes));
  }, [allNotes]);

  const handleSaveNote = () => {
    if (selectedDate && noteContent.trim() !== '') {
      const dateString = selectedDate.format('YYYY-MM-DD');
      setAllNotes(prevNotes => {
        const existingNoteIndex = prevNotes.findIndex(note => note.date === dateString);
        if (existingNoteIndex > -1) {
          const updatedNotes = [...prevNotes];
          updatedNotes[existingNoteIndex].content = noteContent;
          return updatedNotes;
        } else {
          return [...prevNotes, { date: dateString, content: noteContent }];
        }
      });
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h1" gutterBottom>
        Daily Notes
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          sx={{ mb: 3, width: '100%' }}
        />
      </LocalizationProvider>
      <TextField
        label="Your Notes"
        multiline
        rows={6}
        fullWidth
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSaveNote}>
        Save Note
      </Button>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h2" gutterBottom>
          All Notes
        </Typography>
        {allNotes.length === 0 ? (
          <Typography variant="body1">No notes saved yet.</Typography>
        ) : (
          allNotes.sort((a, b) => b.date.localeCompare(a.date)).map((note, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <Typography variant="subtitle1" fontWeight="bold">{note.date}</Typography>
              <Typography variant="body2">{note.content}</Typography>
            </Box>
          ))
        )}
      </Box>
    </Container>
  );
};

export default DailyNotes;

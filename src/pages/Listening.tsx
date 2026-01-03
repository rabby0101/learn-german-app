import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import HeadphonesIcon from '@mui/icons-material/Headphones';

const Listening: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HeadphonesIcon sx={{ fontSize: 40, color: '#10b981' }} />
                Listening Practice
            </Typography>

            <Paper sx={{ p: 4, mt: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    🎧 Coming Soon
                </Typography>
                <Typography color="text.secondary">
                    Improve your German listening comprehension with audio exercises, dictation practice, and real-world conversations.
                </Typography>
            </Paper>
        </Box>
    );
};

export default Listening;

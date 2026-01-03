import React from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import EditIcon from '@mui/icons-material/Edit';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ModelTestLevelProps {
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    color: string;
    available: boolean;
}

const ModelTestLevel: React.FC<ModelTestLevelProps> = ({ level }) => {
    const location = useLocation();
    const basePath = `/model-test/${level.toLowerCase()}`;

    const sections: Section[] = [
        {
            id: 'reading',
            title: 'Reading',
            icon: <MenuBookIcon sx={{ fontSize: 48 }} />,
            description: 'Test your reading comprehension with authentic German texts and questions.',
            color: '#3b82f6',
            available: level === 'B1' || level === 'B2',
        },
        {
            id: 'listening',
            title: 'Listening',
            icon: <HeadphonesIcon sx={{ fontSize: 48 }} />,
            description: 'Practice understanding spoken German in various contexts and accents.',
            color: '#8b5cf6',
            available: false,
        },
        {
            id: 'writing',
            title: 'Writing',
            icon: <EditIcon sx={{ fontSize: 48 }} />,
            description: 'Compose texts following official exam formats and guidelines.',
            color: '#10b981',
            available: level === 'B2',
        },
        {
            id: 'speaking',
            title: 'Speaking',
            icon: <RecordVoiceOverIcon sx={{ fontSize: 48 }} />,
            description: 'Prepare for the oral examination with practice scenarios.',
            color: '#f59e0b',
            available: false,
        },
    ];

    const getLevelColor = (lvl: string): string => {
        const colors: Record<string, string> = {
            A1: '#22c55e',
            A2: '#84cc16',
            B1: '#eab308',
            B2: '#f97316',
            C1: '#ef4444',
            C2: '#dc2626',
        };
        return colors[lvl] || '#6b7280';
    };

    // Check if we're at a sub-route (reading, listening, etc.)
    const isSubRoute = location.pathname !== basePath && location.pathname !== `${basePath}/`;

    if (isSubRoute) {
        // Let nested routes handle rendering
        return (
            <Routes>
                <Route path="reading" element={<ReadingTest level={level} />} />
                <Route path="writing" element={<WritingTest level={level} />} />
                <Route path="listening" element={<ListeningTest level={level} />} />
                <Route path="speaking" element={<SpeakingTest level={level} />} />
            </Routes>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box
                    sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        backgroundColor: getLevelColor(level),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                    }}
                >
                    {level}
                </Box>
                <Typography variant="h4" component="h1" fontWeight={600}>
                    Model Test
                </Typography>
            </Box>

            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
                Practice for your {level} German exam with authentic test materials. Select a section below to begin.
            </Typography>

            <Grid container spacing={3}>
                {sections.map((section) => (
                    <Grid key={section.id} size={{ xs: 12, sm: 6 }}>
                        <Paper
                            component={section.available ? Link : 'div'}
                            to={section.available ? `${basePath}/${section.id}` : undefined}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.2s ease',
                                cursor: section.available ? 'pointer' : 'default',
                                opacity: section.available ? 1 : 0.6,
                                '&:hover': section.available
                                    ? {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    }
                                    : {},
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <Box sx={{ color: section.color }}>{section.icon}</Box>
                                {section.available && (
                                    <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                                )}
                            </Box>
                            <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
                                {section.title}
                            </Typography>
                            <Typography color="text.secondary" variant="body2" sx={{ mt: 1, flexGrow: 1 }}>
                                {section.description}
                            </Typography>
                            {!section.available && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 2,
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 1,
                                        backgroundColor: '#f1f5f9',
                                        color: '#64748b',
                                        alignSelf: 'flex-start',
                                    }}
                                >
                                    Coming Soon
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

// Placeholder components for sub-routes
const ReadingTest: React.FC<{ level: string }> = ({ level }) => {
    // For B1 and B2, we'll redirect to existing components via App.tsx
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">{level} Reading Test</Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }}>
                Loading reading test...
            </Typography>
        </Box>
    );
};

const WritingTest: React.FC<{ level: string }> = ({ level }) => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4">{level} Writing Test</Typography>
        <Paper sx={{ p: 4, mt: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                ✍️ Coming Soon
            </Typography>
            <Typography color="text.secondary">
                {level} writing test materials are being prepared.
            </Typography>
        </Paper>
    </Box>
);

const ListeningTest: React.FC<{ level: string }> = ({ level }) => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4">{level} Listening Test</Typography>
        <Paper sx={{ p: 4, mt: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                🎧 Coming Soon
            </Typography>
            <Typography color="text.secondary">
                {level} listening test materials are being prepared.
            </Typography>
        </Paper>
    </Box>
);

const SpeakingTest: React.FC<{ level: string }> = ({ level }) => (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4">{level} Speaking Test</Typography>
        <Paper sx={{ p: 4, mt: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                🎤 Coming Soon
            </Typography>
            <Typography color="text.secondary">
                {level} speaking test materials are being prepared.
            </Typography>
        </Paper>
    </Box>
);

export default ModelTestLevel;

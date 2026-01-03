import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Chip,
    Alert,
    LinearProgress,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Timer as TimerIcon,
    Lightbulb as LightbulbIcon,
    Assessment as AssessmentIcon,
    ErrorOutline as ErrorIcon,
    AutoFixHigh as AutoFixIcon,
    CompareArrows as CompareIcon,
    Close as CloseIcon,
    Spellcheck as SpellcheckIcon
} from '@mui/icons-material';
import { deepseekApi, WritingFeedback } from '../services/deepseekApi';
import writingPromptsData from '../data/writing-prompts.json';

interface WritingPrompt {
    id: string;
    type: string;
    level: string;
    title: string;
    prompt: string;
    wordCount: { min: number; max: number };
    timeMinutes: number;
    tips: string[];
    keywords: string[];
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

const Writing: React.FC = () => {
    const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
    const [essay, setEssay] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [feedbackTab, setFeedbackTab] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    const prompts: WritingPrompt[] = writingPromptsData as WritingPrompt[];

    const filteredPrompts = useMemo(() => {
        return prompts.filter(p => {
            const levelMatch = selectedLevel === 'all' || p.level === selectedLevel;
            const typeMatch = selectedType === 'all' || p.type === selectedType;
            return levelMatch && typeMatch;
        });
    }, [prompts, selectedLevel, selectedType]);

    const uniqueTypes = useMemo(() =>
        Array.from(new Set(prompts.map(p => p.type))),
        [prompts]
    );

    const uniqueLevels = useMemo(() =>
        Array.from(new Set(prompts.map(p => p.level))).sort(),
        [prompts]
    );

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeRemaining]);

    const handleStartWriting = (prompt: WritingPrompt) => {
        setSelectedPrompt(prompt);
        setEssay('');
        setTimeRemaining(prompt.timeMinutes * 60);
        setIsTimerRunning(false);
        setFeedback(null);
    };

    const handleStartTimer = () => {
        setIsTimerRunning(true);
    };

    const handlePauseTimer = () => {
        setIsTimerRunning(false);
    };

    const handleGetFeedback = async () => {
        if (!essay.trim() || !selectedPrompt) return;

        setIsAnalyzing(true);
        try {
            const result = await deepseekApi.analyzeWriting(
                essay,
                selectedPrompt.type as any,
                selectedPrompt.level as any
            );
            setFeedback(result);
            setFeedbackDialogOpen(true);
        } catch (error) {
            console.error('Error getting feedback:', error);
            alert('Fehler bei der Analyse. Bitte versuchen Sie es erneut.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getWordCount = () => {
        if (!essay.trim()) return 0;
        return essay.trim().split(/\s+/).length;
    };

    const getCharCount = () => essay.length;

    const getSentenceCount = () => {
        if (!essay.trim()) return 0;
        return essay.split(/[.!?]+/).filter(s => s.trim()).length;
    };

    const getProgressPercentage = () => {
        if (!selectedPrompt) return 0;
        const wordCount = getWordCount();
        const target = selectedPrompt.wordCount.max;
        return Math.min((wordCount / target) * 100, 100);
    };

    const getProgressColor = () => {
        if (!selectedPrompt) return '#6366f1';
        const wordCount = getWordCount();
        const min = selectedPrompt.wordCount.min;
        const max = selectedPrompt.wordCount.max;

        if (wordCount < min) return '#f59e0b';
        if (wordCount > max) return '#ef4444';
        return '#10b981';
    };

    const getLevelColor = (level: string): string => {
        const colors: Record<string, string> = {
            A1: '#22c55e',
            A2: '#84cc16',
            B1: '#eab308',
            B2: '#f97316',
            C1: '#ef4444',
            C2: '#dc2626',
        };
        return colors[level] || '#6b7280';
    };

    const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'email': '📧 E-Mail',
            'essay': '📝 Aufsatz',
            'report': '📊 Bericht',
            'story': '📖 Geschichte',
            'informal-letter': '✉️ Informeller Brief',
            'formal-letter': '📜 Formeller Brief'
        };
        return labels[type] || type;
    };

    const getScoreColor = (score: number): string => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EditIcon sx={{ fontSize: 40, color: '#10b981' }} />
                    Writing Practice
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Verbessern Sie Ihre Schreibfähigkeiten mit KI-gestütztem Feedback
                </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Niveau
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                            label="Alle"
                            size="small"
                            onClick={() => setSelectedLevel('all')}
                            sx={{
                                backgroundColor: selectedLevel === 'all' ? '#10b981' : 'transparent',
                                color: selectedLevel === 'all' ? 'white' : 'inherit',
                                border: '1px solid #e2e8f0'
                            }}
                        />
                        {uniqueLevels.map(level => (
                            <Chip
                                key={level}
                                label={level}
                                size="small"
                                onClick={() => setSelectedLevel(level)}
                                sx={{
                                    backgroundColor: selectedLevel === level ? getLevelColor(level) : 'transparent',
                                    color: selectedLevel === level ? 'white' : 'inherit',
                                    border: '1px solid #e2e8f0'
                                }}
                            />
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Typ
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                            label="Alle"
                            size="small"
                            onClick={() => setSelectedType('all')}
                            sx={{
                                backgroundColor: selectedType === 'all' ? '#6366f1' : 'transparent',
                                color: selectedType === 'all' ? 'white' : 'inherit',
                                border: '1px solid #e2e8f0'
                            }}
                        />
                        {uniqueTypes.map(type => (
                            <Chip
                                key={type}
                                label={getTypeLabel(type)}
                                size="small"
                                onClick={() => setSelectedType(type)}
                                sx={{
                                    backgroundColor: selectedType === type ? '#6366f1' : 'transparent',
                                    color: selectedType === type ? 'white' : 'inherit',
                                    border: '1px solid #e2e8f0'
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '350px 1fr' }, gap: 3 }}>
                {/* Left: Writing Prompts */}
                <Box>
                    <Paper sx={{ p: 2, borderRadius: 3, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            📝 Schreibaufgaben ({filteredPrompts.length})
                        </Typography>

                        {filteredPrompts.map((prompt) => (
                            <Card
                                key={prompt.id}
                                onClick={() => handleStartWriting(prompt)}
                                sx={{
                                    mb: 2,
                                    cursor: 'pointer',
                                    border: selectedPrompt?.id === prompt.id ? '2px solid #10b981' : '1px solid #e2e8f0',
                                    borderRadius: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: '#10b981',
                                        transform: 'translateY(-2px)',
                                        boxShadow: 2
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <Chip
                                            label={prompt.level}
                                            size="small"
                                            sx={{ backgroundColor: getLevelColor(prompt.level), color: 'white', fontWeight: 600 }}
                                        />
                                        <Chip
                                            label={getTypeLabel(prompt.type)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                                        {prompt.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {prompt.prompt.substring(0, 80)}...
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <Chip
                                            icon={<TimerIcon sx={{ fontSize: 14 }} />}
                                            label={`${prompt.timeMinutes} Min`}
                                            size="small"
                                            sx={{ fontSize: '0.7rem' }}
                                        />
                                        <Chip
                                            label={`${prompt.wordCount.min}-${prompt.wordCount.max} Wörter`}
                                            size="small"
                                            sx={{ fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Box>

                {/* Right: Writing Area */}
                <Box>
                    {selectedPrompt ? (
                        <>
                            {/* Prompt Details */}
                            <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <Chip label={selectedPrompt.level} size="small" sx={{ backgroundColor: getLevelColor(selectedPrompt.level), color: 'white' }} />
                                            <Chip label={getTypeLabel(selectedPrompt.type)} size="small" variant="outlined" />
                                        </Box>
                                        <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                                            {selectedPrompt.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {selectedPrompt.prompt}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                        {!isTimerRunning ? (
                                            <Button
                                                variant="contained"
                                                startIcon={<TimerIcon />}
                                                onClick={handleStartTimer}
                                                sx={{ backgroundColor: '#6366f1', borderRadius: 2 }}
                                            >
                                                Timer starten
                                            </Button>
                                        ) : (
                                            <Chip
                                                icon={<TimerIcon />}
                                                label={formatTime(timeRemaining)}
                                                onClick={handlePauseTimer}
                                                sx={{
                                                    backgroundColor: timeRemaining < 300 ? '#ef4444' : '#10b981',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '1.1rem',
                                                    padding: '20px 12px',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {/* Tips */}
                                <Alert severity="info" icon={<LightbulbIcon />} sx={{ borderRadius: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                                        💡 Tipps:
                                    </Typography>
                                    <List dense sx={{ py: 0 }}>
                                        {selectedPrompt.tips.map((tip, index) => (
                                            <ListItem key={index} sx={{ py: 0.25 }}>
                                                <ListItemIcon sx={{ minWidth: 24 }}>
                                                    <CheckCircleIcon sx={{ color: '#6366f1', fontSize: 16 }} />
                                                </ListItemIcon>
                                                <ListItemText primary={tip} primaryTypographyProps={{ variant: 'body2' }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Alert>

                                {/* Keywords */}
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        📌 Nützliche Wörter:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {selectedPrompt.keywords.map((keyword, index) => (
                                            <Chip key={index} label={keyword} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Writing Editor */}
                            <Paper sx={{ p: 3, borderRadius: 3 }}>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                    <Typography variant="h6" fontWeight={600}>
                                        ✍️ Ihr Text
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Chip
                                            label={`${getWordCount()} / ${selectedPrompt.wordCount.min}-${selectedPrompt.wordCount.max} Wörter`}
                                            sx={{ backgroundColor: getProgressColor(), color: 'white', fontWeight: 600 }}
                                        />
                                        <Button
                                            variant="contained"
                                            startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <SpellcheckIcon />}
                                            onClick={handleGetFeedback}
                                            disabled={!essay.trim() || isAnalyzing}
                                            sx={{ backgroundColor: '#10b981', borderRadius: 2, '&:hover': { backgroundColor: '#059669' } }}
                                        >
                                            {isAnalyzing ? 'Analysiere...' : 'AI Feedback'}
                                        </Button>
                                    </Box>
                                </Box>

                                <LinearProgress
                                    variant="determinate"
                                    value={getProgressPercentage()}
                                    sx={{
                                        mb: 2,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: '#e2e8f0',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 3,
                                            backgroundColor: getProgressColor(),
                                        },
                                    }}
                                />

                                <TextField
                                    multiline
                                    rows={16}
                                    fullWidth
                                    value={essay}
                                    onChange={(e) => setEssay(e.target.value)}
                                    placeholder="Schreiben Sie hier Ihren Text..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            fontSize: '1.05rem',
                                            lineHeight: 1.8,
                                            fontFamily: '"Georgia", serif',
                                        },
                                    }}
                                />

                                {/* Stats */}
                                <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        📝 {getWordCount()} Wörter
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        🔤 {getCharCount()} Zeichen
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        📄 {getSentenceCount()} Sätze
                                    </Typography>
                                </Box>
                            </Paper>
                        </>
                    ) : (
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                            <EditIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
                            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                                Wählen Sie eine Schreibaufgabe
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Wählen Sie links eine Aufgabe aus, um zu beginnen
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </Box>

            {/* AI Feedback Dialog */}
            <Dialog
                open={feedbackDialogOpen}
                onClose={() => setFeedbackDialogOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AssessmentIcon sx={{ color: '#10b981', fontSize: 32 }} />
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                KI-Feedback
                            </Typography>
                            {feedback && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Gesamtbewertung:
                                    </Typography>
                                    <Chip
                                        label={`${feedback.overallScore}/100`}
                                        size="small"
                                        sx={{ backgroundColor: getScoreColor(feedback.overallScore), color: 'white', fontWeight: 700 }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <IconButton onClick={() => setFeedbackDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Tabs value={feedbackTab} onChange={(_, v) => setFeedbackTab(v)} sx={{ px: 3 }}>
                    <Tab icon={<ErrorIcon />} label="Fehler" iconPosition="start" />
                    <Tab icon={<AutoFixIcon />} label="Verbesserungen" iconPosition="start" />
                    <Tab icon={<CompareIcon />} label="Verbesserte Version" iconPosition="start" />
                </Tabs>

                <DialogContent dividers>
                    {feedback && (
                        <>
                            <TabPanel value={feedbackTab} index={0}>
                                {/* Grammar Errors */}
                                {feedback.grammarErrors.length > 0 ? (
                                    <List>
                                        {feedback.grammarErrors.map((error, index) => (
                                            <Paper key={index} sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid #fecaca' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Chip
                                                        label={error.type === 'spelling' ? '🔤 Rechtschreibung' : error.type === 'grammar' ? '📝 Grammatik' : '⏸️ Zeichensetzung'}
                                                        size="small"
                                                        sx={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                    <Typography sx={{ textDecoration: 'line-through', color: '#ef4444', fontWeight: 500 }}>
                                                        {error.original}
                                                    </Typography>
                                                    <Typography sx={{ color: '#6b7280' }}>→</Typography>
                                                    <Typography sx={{ color: '#10b981', fontWeight: 600 }}>
                                                        {error.correction}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    💡 {error.explanation}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </List>
                                ) : (
                                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                                        🎉 Keine Grammatikfehler gefunden! Ausgezeichnete Arbeit!
                                    </Alert>
                                )}
                            </TabPanel>

                            <TabPanel value={feedbackTab} index={1}>
                                {/* Vocabulary Feedback */}
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#f0fdf4' }}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                        📚 Wortschatz (Niveau: {feedback.vocabularyFeedback.level})
                                    </Typography>
                                    {feedback.vocabularyFeedback.goodPhrases.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                ✅ Gut verwendete Ausdrücke:
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {feedback.vocabularyFeedback.goodPhrases.map((phrase, i) => (
                                                    <Chip key={i} label={phrase} size="small" sx={{ backgroundColor: '#dcfce7' }} />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    {feedback.vocabularyFeedback.suggestions.length > 0 && (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                💡 Vorschläge:
                                            </Typography>
                                            <List dense>
                                                {feedback.vocabularyFeedback.suggestions.map((s, i) => (
                                                    <ListItem key={i} sx={{ py: 0.25 }}>
                                                        <ListItemText primary={s} primaryTypographyProps={{ variant: 'body2' }} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Paper>

                                {/* Structure Feedback */}
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#eff6ff' }}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                        🏗️ Struktur
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                                        <Chip
                                            label={feedback.structureFeedback.hasIntroduction ? '✅ Einleitung' : '❌ Keine Einleitung'}
                                            size="small"
                                            sx={{ backgroundColor: feedback.structureFeedback.hasIntroduction ? '#dcfce7' : '#fee2e2' }}
                                        />
                                        <Chip
                                            label={feedback.structureFeedback.hasConclusion ? '✅ Schluss' : '❌ Kein Schluss'}
                                            size="small"
                                            sx={{ backgroundColor: feedback.structureFeedback.hasConclusion ? '#dcfce7' : '#fee2e2' }}
                                        />
                                        <Chip
                                            label={`📄 ${feedback.structureFeedback.paragraphCount} Absätze`}
                                            size="small"
                                        />
                                    </Box>
                                    {feedback.structureFeedback.suggestions.length > 0 && (
                                        <List dense>
                                            {feedback.structureFeedback.suggestions.map((s, i) => (
                                                <ListItem key={i} sx={{ py: 0.25 }}>
                                                    <ListItemText primary={`💡 ${s}`} primaryTypographyProps={{ variant: 'body2' }} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Paper>

                                {/* Coherence Feedback */}
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#faf5ff' }}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                        🔗 Kohärenz
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                                        <Chip
                                            label={feedback.coherenceFeedback.usesConnectors ? '✅ Verwendet Konnektoren' : '❌ Mehr Konnektoren'}
                                            size="small"
                                            sx={{ backgroundColor: feedback.coherenceFeedback.usesConnectors ? '#dcfce7' : '#fee2e2' }}
                                        />
                                        <Chip
                                            label={feedback.coherenceFeedback.logicalFlow ? '✅ Logischer Aufbau' : '❌ Verbesserung nötig'}
                                            size="small"
                                            sx={{ backgroundColor: feedback.coherenceFeedback.logicalFlow ? '#dcfce7' : '#fee2e2' }}
                                        />
                                    </Box>
                                    {feedback.coherenceFeedback.suggestions.length > 0 && (
                                        <List dense>
                                            {feedback.coherenceFeedback.suggestions.map((s, i) => (
                                                <ListItem key={i} sx={{ py: 0.25 }}>
                                                    <ListItemText primary={`💡 ${s}`} primaryTypographyProps={{ variant: 'body2' }} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Paper>

                                {/* Tips */}
                                <Paper sx={{ p: 2, borderRadius: 2, backgroundColor: '#fefce8' }}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                        🎯 Tipps zur Verbesserung
                                    </Typography>
                                    <List dense>
                                        {feedback.tips.map((tip, i) => (
                                            <ListItem key={i} sx={{ py: 0.25 }}>
                                                <ListItemIcon sx={{ minWidth: 28 }}>
                                                    <LightbulbIcon sx={{ color: '#eab308', fontSize: 18 }} />
                                                </ListItemIcon>
                                                <ListItemText primary={tip} primaryTypographyProps={{ variant: 'body2' }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </TabPanel>

                            <TabPanel value={feedbackTab} index={2}>
                                {/* Improved Version */}
                                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                    Hier sehen Sie eine verbesserte Version Ihres Textes. Vergleichen Sie sie mit Ihrem Original, um zu lernen.
                                </Alert>
                                <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                        ✨ Verbesserte Version:
                                    </Typography>
                                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontFamily: '"Georgia", serif' }}>
                                        {feedback.improvedVersion}
                                    </Typography>
                                </Paper>
                            </TabPanel>
                        </>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setFeedbackDialogOpen(false)}
                        variant="contained"
                        sx={{ backgroundColor: '#10b981', borderRadius: 2 }}
                    >
                        Schließen
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Writing;

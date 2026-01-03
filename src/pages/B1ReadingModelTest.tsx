import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Chip,
    Alert,
    LinearProgress,
    Paper,
    Tabs,
    Tab,
    Select,
    MenuItem,
    InputLabel,
    FormLabel
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Timer as TimerIcon,
    PlayArrow as PlayArrowIcon,
    Assessment as AssessmentIcon,
    NavigateNext as NextIcon,
    NavigateBefore as PrevIcon
} from '@mui/icons-material';
import examData from '../data/b1-reading-model-test.json';

interface Question {
    id: string;
    number: number;
    type: string;
    question?: string;
    situation?: string;
    personName?: string;
    options?: string[];
    correctAnswer: number | boolean | string;
    explanation: string;
}

interface Part {
    id: string;
    partNumber: number;
    title: string;
    instructions: string;
    timeLimit: number;
    text?: string;
    texts?: { id: string; title: string; content: string }[];
    context?: string;
    situations?: { id: string; number: number; text: string }[];
    advertisements?: { id: string; title: string; content: string }[];
    opinions?: { id: string; number: number; author: string; text: string }[];
    questions: Question[];
}

const B1ReadingModelTest: React.FC = () => {
    const [examStarted, setExamStarted] = useState(false);
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [showResults, setShowResults] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(examData.examInfo.totalTime * 60);
    const [timerActive, setTimerActive] = useState(false);

    const textColor = '#1e293b';
    const secondaryTextColor = '#475569';
    const cardBg = '#ffffff';
    const accentColor = '#6366f1';
    const successColor = '#10b981';

    const parts: Part[] = examData.parts;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeRemaining]);

    const startExam = () => {
        setExamStarted(true);
        setTimerActive(true);
    };

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = () => {
        setShowResults(true);
        setTimerActive(false);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTotalQuestions = () => {
        return parts.reduce((sum, part) => sum + part.questions.length, 0);
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).length;
    };

    const getScore = () => {
        let correct = 0;
        parts.forEach(part => {
            part.questions.forEach(q => {
                const userAnswer = answers[q.id];
                if (q.type === 'true-false' || q.type === 'yes-no') {
                    const correctBool = q.correctAnswer === true;
                    if (userAnswer === (correctBool ? 'true' : 'false')) correct++;
                } else if (q.type === 'multiple-choice') {
                    if (userAnswer === q.correctAnswer) correct++;
                } else if (q.type === 'matching') {
                    if (userAnswer === q.correctAnswer) correct++;
                }
            });
        });
        return Math.round((correct / getTotalQuestions()) * 100);
    };

    const isAnswerCorrect = (question: Question): boolean => {
        const userAnswer = answers[question.id];
        if (question.type === 'true-false' || question.type === 'yes-no') {
            const correctBool = question.correctAnswer === true;
            return userAnswer === (correctBool ? 'true' : 'false');
        } else if (question.type === 'multiple-choice') {
            return userAnswer === question.correctAnswer;
        } else if (question.type === 'matching') {
            return userAnswer === question.correctAnswer;
        }
        return false;
    };

    const renderQuestion = (question: Question, part: Part) => {
        const userAnswer = answers[question.id];

        return (
            <Card
                key={question.id}
                sx={{
                    mb: 3,
                    background: showResults
                        ? isAnswerCorrect(question)
                            ? 'rgba(16, 185, 129, 0.05)'
                            : 'rgba(239, 68, 68, 0.05)'
                        : cardBg,
                    border: showResults
                        ? `1px solid ${isAnswerCorrect(question) ? successColor : '#ef4444'}`
                        : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Chip
                            label={question.number}
                            size="small"
                            sx={{ background: accentColor, color: 'white', mr: 2, fontWeight: 700 }}
                        />
                        <Typography variant="h6" sx={{ color: textColor, flex: 1, fontWeight: 600 }}>
                            {question.question || question.situation}
                        </Typography>
                        {showResults && (
                            isAnswerCorrect(question)
                                ? <CheckCircleIcon sx={{ color: successColor, ml: 1 }} />
                                : <CancelIcon sx={{ color: '#ef4444', ml: 1 }} />
                        )}
                    </Box>

                    {/* True/False or Yes/No Questions */}
                    {(question.type === 'true-false' || question.type === 'yes-no') && (
                        <FormControl component="fieldset" fullWidth disabled={showResults}>
                            <RadioGroup
                                value={userAnswer ?? ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                row
                            >
                                <FormControlLabel
                                    value="true"
                                    control={<Radio sx={{ color: 'rgba(0, 0, 0, 0.4)' }} />}
                                    label={question.type === 'yes-no' ? 'Ja' : 'Richtig'}
                                    sx={{
                                        color: showResults
                                            ? question.correctAnswer === true
                                                ? successColor
                                                : userAnswer === 'true'
                                                    ? '#ef4444'
                                                    : textColor
                                            : textColor,
                                        mr: 4,
                                        p: 1,
                                        borderRadius: '8px',
                                        background: showResults && question.correctAnswer === true
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'transparent',
                                        fontWeight: showResults && question.correctAnswer === true ? 600 : 400
                                    }}
                                />
                                <FormControlLabel
                                    value="false"
                                    control={<Radio sx={{ color: 'rgba(0, 0, 0, 0.4)' }} />}
                                    label={question.type === 'yes-no' ? 'Nein' : 'Falsch'}
                                    sx={{
                                        color: showResults
                                            ? question.correctAnswer === false
                                                ? successColor
                                                : userAnswer === 'false'
                                                    ? '#ef4444'
                                                    : textColor
                                            : textColor,
                                        p: 1,
                                        borderRadius: '8px',
                                        background: showResults && question.correctAnswer === false
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'transparent',
                                        fontWeight: showResults && question.correctAnswer === false ? 600 : 400
                                    }}
                                />
                            </RadioGroup>
                        </FormControl>
                    )}

                    {/* Multiple Choice Questions */}
                    {question.type === 'multiple-choice' && question.options && (
                        <FormControl component="fieldset" fullWidth disabled={showResults}>
                            <RadioGroup
                                value={userAnswer ?? ''}
                                onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                            >
                                {question.options.map((option, optIndex) => (
                                    <FormControlLabel
                                        key={optIndex}
                                        value={optIndex}
                                        control={<Radio sx={{ color: 'rgba(0, 0, 0, 0.4)' }} />}
                                        label={option}
                                        sx={{
                                            color: showResults
                                                ? optIndex === question.correctAnswer
                                                    ? successColor
                                                    : userAnswer === optIndex
                                                        ? '#ef4444'
                                                        : textColor
                                                : textColor,
                                            mb: 1,
                                            p: 1,
                                            borderRadius: '8px',
                                            background: showResults && optIndex === question.correctAnswer
                                                ? 'rgba(16, 185, 129, 0.1)'
                                                : 'transparent',
                                            fontWeight: showResults && optIndex === question.correctAnswer ? 600 : 400
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    )}

                    {/* Matching Questions */}
                    {question.type === 'matching' && part.advertisements && (
                        <FormControl fullWidth disabled={showResults}>
                            <InputLabel sx={{ color: secondaryTextColor }}>Anzeige wählen</InputLabel>
                            <Select
                                value={userAnswer ?? ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                label="Anzeige wählen"
                                sx={{
                                    color: textColor,
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: showResults
                                            ? isAnswerCorrect(question) ? successColor : '#ef4444'
                                            : 'rgba(0, 0, 0, 0.2)'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0, 0, 0, 0.4)'
                                    },
                                    '.MuiSvgIcon-root': { color: secondaryTextColor }
                                }}
                            >
                                <MenuItem value="0">0 - Keine passende Anzeige</MenuItem>
                                {part.advertisements.map((ad) => (
                                    <MenuItem key={ad.id} value={ad.id}>
                                        {ad.id} - {ad.title}
                                    </MenuItem>
                                ))}
                            </Select>
                            {showResults && (
                                <Typography variant="caption" sx={{ mt: 1, color: successColor, fontWeight: 600 }}>
                                    Richtige Antwort: {question.correctAnswer === '0' ? '0 - Keine passende Anzeige' :
                                        `${question.correctAnswer} - ${part.advertisements.find(a => a.id === question.correctAnswer)?.title}`}
                                </Typography>
                            )}
                        </FormControl>
                    )}

                    {/* Explanation */}
                    {showResults && (
                        <Alert
                            severity="info"
                            sx={{
                                mt: 2,
                                background: 'rgba(99, 102, 241, 0.05)',
                                color: textColor,
                                border: `1px solid ${accentColor}`,
                                borderRadius: '8px'
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: accentColor }}>
                                📝 Erklärung:
                            </Typography>
                            <Typography variant="body2">
                                {question.explanation}
                            </Typography>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        );
    };

    const renderPart = (part: Part) => {
        return (
            <Box key={part.id}>
                {/* Part Header */}
                <Card sx={{
                    mb: 3,
                    background: 'rgba(99, 102, 241, 0.04)',
                    border: `1px solid rgba(99, 102, 241, 0.2)`,
                    borderRadius: '16px',
                    boxShadow: 'none'
                }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ color: accentColor, fontWeight: 700, mb: 1 }}>
                            {part.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: textColor, mb: 2 }}>
                            {part.instructions}
                        </Typography>
                        <Chip
                            icon={<TimerIcon style={{ color: accentColor }} />}
                            label={`Empfohlene Zeit: ${part.timeLimit} Minuten`}
                            sx={{ background: 'rgba(99, 102, 241, 0.1)', color: accentColor, fontWeight: 600 }}
                        />
                    </CardContent>
                </Card>

                {/* Context if available */}
                {part.context && (
                    <Alert severity="info" sx={{
                        mb: 3,
                        background: 'rgba(99, 102, 241, 0.05)',
                        color: textColor,
                        border: `1px solid ${accentColor}`,
                        borderRadius: '12px'
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{part.context}</Typography>
                    </Alert>
                )}

                {/* Reading Text (Teil 1 & 5) */}
                {part.text && (
                    <Card sx={{
                        mb: 3,
                        background: cardBg,
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                    }}>
                        <CardContent>
                            <Paper sx={{
                                p: 3,
                                background: 'rgba(0, 0, 0, 0.01)',
                                border: '1px solid rgba(0, 0, 0, 0.03)',
                                borderRadius: '12px',
                                boxShadow: 'none'
                            }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: textColor,
                                        lineHeight: 2,
                                        fontSize: '1.05rem',
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {part.text}
                                </Typography>
                            </Paper>
                        </CardContent>
                    </Card>
                )}

                {/* Multiple Texts (Teil 2) */}
                {part.texts && part.texts.map((text) => (
                    <Card key={text.id} sx={{
                        mb: 3,
                        background: cardBg,
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: successColor, fontWeight: 700, mb: 2 }}>
                                📰 {text.title}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: textColor,
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre-line'
                                }}
                            >
                                {text.content}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}

                {/* Advertisements (Teil 3) */}
                {part.advertisements && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, mb: 2 }}>📋 Anzeigen:</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                            {part.advertisements.map((ad) => (
                                <Card key={ad.id} sx={{
                                    background: cardBg,
                                    border: '1px solid rgba(0, 0, 0, 0.08)',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                                }}>
                                    <CardContent>
                                        <Chip
                                            label={ad.id}
                                            size="small"
                                            sx={{ background: '#f59e0b', color: 'white', fontWeight: 700, mb: 1 }}
                                        />
                                        <Typography variant="subtitle1" sx={{ color: successColor, fontWeight: 700, mb: 1 }}>
                                            {ad.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: secondaryTextColor, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                            {ad.content}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Opinions (Teil 4) */}
                {part.opinions && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, mb: 2 }}>💬 Leserbriefe:</Typography>
                        {part.opinions.map((opinion) => (
                            <Card key={opinion.id} sx={{
                                mb: 2,
                                background: cardBg,
                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                            }}>
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 700, mb: 1 }}>
                                        {opinion.author}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.7 }}>
                                        {opinion.text}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                {/* Questions */}
                <Typography variant="h5" sx={{ color: textColor, fontWeight: 700, mb: 3, mt: 4 }}>
                    ❓ Aufgaben
                </Typography>
                {part.questions.map((question) => renderQuestion(question, part))}
            </Box>
        );
    };

    // Start Screen
    if (!examStarted) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Card sx={{
                    background: cardBg,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '24px',
                    textAlign: 'center',
                    p: 6,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
                }}>
                    <Typography
                        variant="h2"
                        sx={{
                            color: textColor,
                            fontWeight: 800,
                            mb: 2,
                            background: `linear-gradient(135deg, ${textColor} 0%, ${secondaryTextColor} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        📖 B1 Lesen - Modelltest
                    </Typography>
                    <Typography variant="h5" sx={{ color: secondaryTextColor, mb: 4, fontWeight: 500 }}>
                        Offizieller Übungstest nach Goethe-Institut / ÖSD Format
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                        <Card sx={{ p: 3, background: 'rgba(99, 102, 241, 0.05)', border: `1px solid ${accentColor}`, borderRadius: '16px', boxShadow: 'none' }}>
                            <Typography variant="h3" sx={{ color: accentColor, fontWeight: 800 }}>5</Typography>
                            <Typography variant="body1" sx={{ color: textColor, fontWeight: 600 }}>Teile</Typography>
                        </Card>
                        <Card sx={{ p: 3, background: 'rgba(16, 185, 129, 0.05)', border: `1px solid ${successColor}`, borderRadius: '16px', boxShadow: 'none' }}>
                            <Typography variant="h3" sx={{ color: successColor, fontWeight: 800 }}>{getTotalQuestions()}</Typography>
                            <Typography variant="body1" sx={{ color: textColor, fontWeight: 600 }}>Aufgaben</Typography>
                        </Card>
                        <Card sx={{ p: 3, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid #f59e0b', borderRadius: '16px', boxShadow: 'none' }}>
                            <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 800 }}>{examData.examInfo.totalTime}</Typography>
                            <Typography variant="body1" sx={{ color: textColor, fontWeight: 600 }}>Minuten</Typography>
                        </Card>
                    </Box>

                    <Alert severity="info" sx={{
                        mb: 4,
                        background: 'rgba(99, 102, 241, 0.05)',
                        color: textColor,
                        border: `1px solid ${accentColor}`,
                        borderRadius: '12px',
                        textAlign: 'left'
                    }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, mb: 1, color: accentColor }}>📋 Prüfungsübersicht:</Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                            • Teil 1: Blog lesen (Richtig/Falsch) - 6 Aufgaben<br />
                            • Teil 2: Pressetexte (Multiple Choice) - 6 Aufgaben<br />
                            • Teil 3: Anzeigen zuordnen (Matching) - 7 Aufgaben<br />
                            • Teil 4: Meinungen verstehen (Ja/Nein) - 7 Aufgaben<br />
                            • Teil 5: Hausordnung (Multiple Choice) - 4 Aufgaben
                        </Typography>
                    </Alert>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={startExam}
                        startIcon={<PlayArrowIcon />}
                        sx={{
                            borderRadius: '16px',
                            px: 6,
                            py: 2,
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                transform: 'scale(1.02)'
                            }
                        }}
                    >
                        Prüfung starten
                    </Button>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            {/* Header with Timer and Progress */}
            <Box sx={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                p: 2,
                mb: 3,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h5" sx={{ color: textColor, fontWeight: 800 }}>
                        📖 B1 Lesen - Modelltest
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            icon={<TimerIcon style={{ color: 'white' }} />}
                            label={formatTime(timeRemaining)}
                            sx={{
                                background: timeRemaining < 300 ? '#ef4444' : successColor,
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '1rem',
                                px: 1
                            }}
                        />
                        <Chip
                            label={`${getAnsweredCount()}/${getTotalQuestions()} beantwortet`}
                            sx={{ background: 'rgba(99, 102, 241, 0.1)', color: accentColor, fontWeight: 700 }}
                        />
                    </Box>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={(getAnsweredCount() / getTotalQuestions()) * 100}
                    sx={{
                        mt: 2,
                        height: 8,
                        borderRadius: 4,
                        background: 'rgba(0, 0, 0, 0.05)',
                        '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${successColor}, ${accentColor})`
                        }
                    }}
                />
            </Box>

            {/* Results Summary */}
            {showResults && (
                <Alert
                    severity={getScore() >= 60 ? 'success' : 'warning'}
                    icon={<AssessmentIcon />}
                    sx={{
                        mb: 3,
                        background: getScore() >= 60 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                        color: textColor,
                        border: `1px solid ${getScore() >= 60 ? successColor : '#f59e0b'}`,
                        borderRadius: '16px'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: getScore() >= 60 ? successColor : '#f59e0b' }}>
                                Ergebnis: {getScore()}%
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {getScore() >= 60
                                    ? '🎉 Bestanden! Du hast die B1-Schwelle erreicht.'
                                    : '💪 Nicht bestanden. Du brauchst mindestens 60% zum Bestehen.'}
                            </Typography>
                        </Box>
                        <Chip
                            label={getScore() >= 60 ? 'BESTANDEN' : 'NICHT BESTANDEN'}
                            sx={{
                                background: getScore() >= 60 ? successColor : '#ef4444',
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '1rem'
                            }}
                        />
                    </Box>
                </Alert>
            )}

            {/* Part Tabs */}
            <Box sx={{ mb: 3 }}>
                <Tabs
                    value={currentPartIndex}
                    onChange={(_, newValue) => setCurrentPartIndex(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            color: secondaryTextColor,
                            fontWeight: 700,
                            '&.Mui-selected': { color: successColor }
                        },
                        '& .MuiTabs-indicator': { background: successColor }
                    }}
                >
                    {parts.map((part, index) => (
                        <Tab key={part.id} label={`Teil ${part.partNumber}`} />
                    ))}
                </Tabs>
            </Box>

            {/* Current Part Content */}
            <Card sx={{
                background: cardBg,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    {renderPart(parts[currentPartIndex])}
                </CardContent>
            </Card>

            {/* Navigation and Submit */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<PrevIcon />}
                    disabled={currentPartIndex === 0}
                    onClick={() => setCurrentPartIndex(prev => prev - 1)}
                    sx={{
                        borderColor: accentColor,
                        color: accentColor,
                        borderRadius: '12px',
                        px: 3,
                        borderWidth: '2px',
                        fontWeight: 700,
                        '&:hover': { borderWidth: '2px', borderColor: '#8b5cf6', background: 'rgba(99, 102, 241, 0.05)' }
                    }}
                >
                    Vorheriger Teil
                </Button>

                {currentPartIndex === parts.length - 1 && !showResults ? (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        startIcon={<CheckCircleIcon />}
                        sx={{
                            borderRadius: '12px',
                            px: 4,
                            background: `linear-gradient(135deg, ${successColor} 0%, #34d399 100%)`,
                            fontWeight: 700,
                            '&:hover': { background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' }
                        }}
                    >
                        Prüfung abgeben
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        endIcon={<NextIcon />}
                        disabled={currentPartIndex === parts.length - 1}
                        onClick={() => setCurrentPartIndex(prev => prev + 1)}
                        sx={{
                            borderColor: accentColor,
                            color: accentColor,
                            borderRadius: '12px',
                            px: 3,
                            borderWidth: '2px',
                            fontWeight: 700,
                            '&:hover': { borderWidth: '2px', borderColor: '#8b5cf6', background: 'rgba(99, 102, 241, 0.05)' }
                        }}
                    >
                        Nächster Teil
                    </Button>
                )}
            </Box>

            {/* Try Again Button */}
            {showResults && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => {
                            setAnswers({});
                            setShowResults(false);
                            setCurrentPartIndex(0);
                            setTimeRemaining(examData.examInfo.totalTime * 60);
                            setTimerActive(true);
                        }}
                        sx={{
                            borderRadius: '16px',
                            px: 4,
                            py: 1.5,
                            borderColor: accentColor,
                            color: accentColor,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            borderWidth: '2px',
                            '&:hover': {
                                borderWidth: '2px',
                                borderColor: '#8b5cf6',
                                background: 'rgba(99, 102, 241, 0.05)'
                            }
                        }}
                    >
                        Nochmal versuchen
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default B1ReadingModelTest;

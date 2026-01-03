import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    IconButton,
    Typography,
    TextField,
    Paper,
    CircularProgress,
    Fade,
    Slide,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { deepseekApi } from '../services/deepseekApi';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const FloatingChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hallo! 👋 I\'m your German learning assistant. Ask me anything about German vocabulary, grammar, translations, or study tips!',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build conversation history (excluding the welcome message and current)
            const history = messages
                .filter((_, index) => index > 0) // Skip welcome message
                .map(msg => ({ role: msg.role, content: msg.content }));

            const response = await deepseekApi.chat(userMessage.content, history);

            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessage = (content: string) => {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px;">$1</code>');
    };

    return (
        <>
            {/* Floating Button */}
            <Fade in={!isOpen}>
                <IconButton
                    onClick={() => setIsOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 56,
                        height: 56,
                        backgroundColor: '#10b981',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                        zIndex: 1000,
                        '&:hover': {
                            backgroundColor: '#059669',
                            transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    <ChatIcon />
                </IconButton>
            </Fade>

            {/* Chat Window */}
            <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: { xs: 'calc(100% - 48px)', sm: 380 },
                        maxWidth: 380,
                        height: { xs: 'calc(100vh - 100px)', sm: 520 },
                        maxHeight: 520,
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        zIndex: 1001,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            py: 1.5,
                            backgroundColor: '#1a1a2e',
                            color: 'white',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <SmartToyIcon fontSize="small" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                German Assistant
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setIsOpen(false)}
                            size="small"
                            sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            backgroundColor: '#f9fafb',
                        }}
                    >
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <Box
                                    sx={{
                                        maxWidth: '85%',
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: message.role === 'user'
                                            ? '16px 16px 4px 16px'
                                            : '16px 16px 16px 4px',
                                        backgroundColor: message.role === 'user' ? '#10b981' : '#ffffff',
                                        color: message.role === 'user' ? 'white' : '#1a1a2e',
                                        border: message.role === 'user' ? 'none' : '1px solid #e5e7eb',
                                        boxShadow: message.role === 'user'
                                            ? 'none'
                                            : '0 1px 3px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            lineHeight: 1.5,
                                            fontSize: '0.875rem',
                                            '& code': { fontSize: '0.8rem' },
                                        }}
                                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                    />
                                </Box>
                            </Box>
                        ))}

                        {isLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Box
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: '16px 16px 16px 4px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <CircularProgress size={16} sx={{ color: '#10b981' }} />
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Thinking...
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 2,
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    fontSize: '0.875rem',
                                },
                            }}
                        />
                        <IconButton
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            sx={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#059669',
                                },
                                '&:disabled': {
                                    backgroundColor: '#e5e7eb',
                                    color: '#9ca3af',
                                },
                            }}
                        >
                            <SendIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>
            </Slide>
        </>
    );
};

export default FloatingChat;

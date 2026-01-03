import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Loading...',
    fullScreen = true
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: fullScreen ? '60vh' : '200px',
                gap: 2,
            }}
        >
            <CircularProgress
                size={32}
                thickness={3}
                sx={{
                    color: '#1a1a2e',
                }}
            />
            <Typography
                variant="body2"
                sx={{
                    color: '#6b7280',
                    fontWeight: 500,
                }}
            >
                {message}
            </Typography>
        </Box>
    );
};

export default React.memo(LoadingSpinner);

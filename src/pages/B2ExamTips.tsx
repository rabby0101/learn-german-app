import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  School as SchoolIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import examTipsData from '../data/b2-exam-tips.json';

const B2ExamTips: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>('general');

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box sx={{
        textAlign: 'center',
        mb: 4,
        p: 4,
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            fontWeight: 800,
            mb: 1,
            background: 'linear-gradient(45deg, #fff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          💡 B2 Exam Tips & Strategies
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Everything you need to know to ace your B2 German exam
        </Typography>
      </Box>

      {/* General Tips */}
      <Accordion
        expanded={expanded === 'general'}
        onChange={handleChange('general')}
        sx={{
          mb: 2,
          borderRadius: '16px !important',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SchoolIcon sx={{ color: '#06d6a0' }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              {examTipsData.general.title}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2
          }}>
            {examTipsData.general.tips.map((tip, index) => (
              <Card key={index} sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h4" sx={{ mb: 1 }}>{tip.icon}</Typography>
                  <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 600, mb: 1 }}>
                    {tip.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {tip.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Reading Section */}
      <Accordion
        expanded={expanded === 'reading'}
        onChange={handleChange('reading')}
        sx={{
          mb: 2,
          borderRadius: '16px !important',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="h3">📖</Typography>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                {examTipsData.reading.title}
              </Typography>
              <Chip
                icon={<TimerIcon />}
                label={examTipsData.reading.duration}
                size="small"
                sx={{ mt: 1, background: 'rgba(99, 102, 241, 0.3)', color: 'white' }}
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            {examTipsData.reading.parts.map((part, index) => (
              <Card key={index} sx={{
                mb: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 600, mb: 1 }}>
                    {part.part}: {part.description}
                  </Typography>
                  <List dense>
                    {part.tips.map((tip, tipIndex) => (
                      <ListItem key={tipIndex}>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: '#06d6a0', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Alert
            severity="info"
            icon={<LightbulbIcon />}
            sx={{
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'white',
              border: '1px solid #6366f1',
              borderRadius: '12px'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Strategien für den Erfolg:
            </Typography>
            <List dense>
              {examTipsData.reading.strategies.map((strategy, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#6366f1', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary={strategy} />
                </ListItem>
              ))}
            </List>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Listening Section */}
      <Accordion
        expanded={expanded === 'listening'}
        onChange={handleChange('listening')}
        sx={{
          mb: 2,
          borderRadius: '16px !important',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="h3">🎧</Typography>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                {examTipsData.listening.title}
              </Typography>
              <Chip
                icon={<TimerIcon />}
                label={examTipsData.listening.duration}
                size="small"
                sx={{ mt: 1, background: 'rgba(34, 197, 94, 0.3)', color: 'white' }}
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            {examTipsData.listening.parts.map((part, index) => (
              <Card key={index} sx={{
                mb: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#22c55e', fontWeight: 600, mb: 1 }}>
                    {part.part}: {part.description}
                  </Typography>
                  <List dense>
                    {part.tips.map((tip, tipIndex) => (
                      <ListItem key={tipIndex}>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: '#06d6a0', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Alert
            severity="success"
            icon={<LightbulbIcon />}
            sx={{
              background: 'rgba(34, 197, 94, 0.1)',
              color: 'white',
              border: '1px solid #22c55e',
              borderRadius: '12px'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Strategien für den Erfolg:
            </Typography>
            <List dense>
              {examTipsData.listening.strategies.map((strategy, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary={strategy} />
                </ListItem>
              ))}
            </List>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Writing Section */}
      <Accordion
        expanded={expanded === 'writing'}
        onChange={handleChange('writing')}
        sx={{
          mb: 2,
          borderRadius: '16px !important',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="h3">✍️</Typography>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                {examTipsData.writing.title}
              </Typography>
              <Chip
                icon={<TimerIcon />}
                label={examTipsData.writing.duration}
                size="small"
                sx={{ mt: 1, background: 'rgba(245, 158, 11, 0.3)', color: 'white' }}
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            {examTipsData.writing.parts.map((part, index) => (
              <Card key={index} sx={{
                mb: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 600, mb: 1 }}>
                    {part.part}: {part.description}
                  </Typography>
                  <List dense>
                    {part.tips.map((tip, tipIndex) => (
                      <ListItem key={tipIndex}>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: '#06d6a0', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
            mb: 2
          }}>
            <Card sx={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 600, mb: 2 }}>
                  Formelle Phrasen
                </Typography>
                <List dense>
                  {examTipsData.writing.commonPhrases.formal.map((phrase, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`"${phrase}"`}
                        primaryTypographyProps={{
                          sx: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontStyle: 'italic'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            <Card sx={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 600, mb: 2 }}>
                  Meinungsäußerungen
                </Typography>
                <List dense>
                  {examTipsData.writing.commonPhrases.opinion.map((phrase, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`"${phrase}"`}
                        primaryTypographyProps={{
                          sx: {
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontStyle: 'italic'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>

          <Alert
            severity="warning"
            icon={<LightbulbIcon />}
            sx={{
              background: 'rgba(245, 158, 11, 0.1)',
              color: 'white',
              border: '1px solid #f59e0b',
              borderRadius: '12px'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Strategien für den Erfolg:
            </Typography>
            <List dense>
              {examTipsData.writing.strategies.map((strategy, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary={strategy} />
                </ListItem>
              ))}
            </List>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Speaking Section */}
      <Accordion
        expanded={expanded === 'speaking'}
        onChange={handleChange('speaking')}
        sx={{
          mb: 2,
          borderRadius: '16px !important',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="h3">🗣️</Typography>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                {examTipsData.speaking.title}
              </Typography>
              <Chip
                icon={<TimerIcon />}
                label={examTipsData.speaking.duration}
                size="small"
                sx={{ mt: 1, background: 'rgba(239, 68, 68, 0.3)', color: 'white' }}
              />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            {examTipsData.speaking.parts.map((part, index) => (
              <Card key={index} sx={{
                mb: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 600, mb: 1 }}>
                    {part.part}: {part.description}
                  </Typography>
                  <List dense>
                    {part.tips.map((tip, tipIndex) => (
                      <ListItem key={tipIndex}>
                        <ListItemIcon>
                          <CheckCircleIcon sx={{ color: '#06d6a0', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Card sx={{
            mb: 2,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 600, mb: 2 }}>
                Nützliche Redemittel
              </Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 1
              }}>
                {examTipsData.speaking.usefulPhrases.map((phrase, index) => (
                  <Chip
                    key={index}
                    label={`"${phrase}"`}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontStyle: 'italic'
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Alert
            severity="error"
            icon={<LightbulbIcon />}
            sx={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'white',
              border: '1px solid #ef4444',
              borderRadius: '12px'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Strategien für den Erfolg:
            </Typography>
            <List dense>
              {examTipsData.speaking.strategies.map((strategy, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary={strategy} />
                </ListItem>
              ))}
            </List>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Common Mistakes */}
      <Accordion
        expanded={expanded === 'mistakes'}
        onChange={handleChange('mistakes')}
        sx={{
          mb: 2,
          borderRadius: '16px !important',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WarningIcon sx={{ color: '#ff6b6b' }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              {examTipsData.commonMistakes.title}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2
          }}>
            {examTipsData.commonMistakes.mistakes.map((mistake, index) => (
              <Card key={index} sx={{
                background: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '12px',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ color: '#ff6b6b', fontWeight: 600, mb: 1 }}>
                    ❌ {mistake.error}
                  </Typography>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 107, 107, 0.2)' }} />
                  <Typography variant="subtitle2" sx={{ color: '#06d6a0', fontWeight: 600, mb: 0.5 }}>
                    ✅ Lösung:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {mistake.solution}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Exam Day */}
      <Accordion
        expanded={expanded === 'examDay'}
        onChange={handleChange('examDay')}
        sx={{
          mb: 2,
          borderRadius: '16px !important',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3">📋</Typography>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              {examTipsData.examDay.title}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3
          }}>
            <Card sx={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 600, mb: 2 }}>
                  Checkliste
                </Typography>
                <List>
                  {examTipsData.examDay.checklist.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Typography variant="h6">{item.icon}</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={item.item}
                        primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            <Card sx={{
              background: 'rgba(6, 214, 160, 0.1)',
              border: '1px solid rgba(6, 214, 160, 0.3)',
              borderRadius: '12px'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#06d6a0', fontWeight: 600, mb: 2 }}>
                  Die richtige Einstellung
                </Typography>
                <List>
                  {examTipsData.examDay.mindset.map((tip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon sx={{ color: '#06d6a0' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={tip}
                        primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Final Encouragement */}
      <Alert
        severity="success"
        sx={{
          mt: 3,
          background: 'linear-gradient(135deg, rgba(6, 214, 160, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)',
          color: 'white',
          border: '1px solid #06d6a0',
          borderRadius: '16px'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          🎯 Du schaffst das!
        </Typography>
        <Typography variant="body1">
          Mit guter Vorbereitung, regelmäßigem Üben und der richtigen Strategie wirst du die B2-Prüfung erfolgreich bestehen.
          Glaube an dich selbst und nutze diese App, um dich optimal vorzubereiten. Viel Erfolg! 🍀
        </Typography>
      </Alert>
    </Container>
  );
};

export default B2ExamTips;

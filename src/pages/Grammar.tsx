import React, { useState, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import grammar from '../grammar.json';
import Practice from '../components/Practice';
import ThemeSection, { Theme } from '../components/ThemeSection';
import CompactPronunciationButton from '../components/CompactPronunciationButton';
import WritingPractice from '../components/WritingPractice';
import SpeakingPractice from '../components/SpeakingPractice';
import ListeningPractice from '../components/ListeningPractice';
import { deepseekApi, GrammarRule, GrammarExample } from '../services/deepseekApi';
import { VocabularyExtractionService } from '../services/vocabularyExtractionService';
import { savedContentService, SavedGrammarRule } from '../services/savedContentService';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Grammar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [generatedRules, setGeneratedRules] = useState<GrammarRule[]>([]);
  const [generating, setGenerating] = useState(false);
  const [enhancedExamples, setEnhancedExamples] = useState<{ [key: string]: GrammarExample[] }>({});
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [savedRules, setSavedRules] = useState<SavedGrammarRule[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; imported: number; errors: string[] } | null>(null);

  const allGrammarRules = useMemo(() => {
    let combinedRules = [
      ...grammar.map(rule => ({
        ...rule,
        examples: rule.example ? [rule.example] : [],
        description: rule.explanation, // Map explanation to description for consistency
        difficulty: 'intermediate' as const // Set default difficulty for original rules
      })),
      ...generatedRules
    ];

    // Add saved rules if showSaved is enabled
    if (showSaved) {
      combinedRules = [
        ...savedRules.map(rule => ({
          ...rule,
          saved: true
        })),
        ...combinedRules
      ];
    }

    return combinedRules;
  }, [generatedRules, savedRules, showSaved]);

  const filteredGrammar = useMemo(() => {
    if (!searchTerm) {
      return allGrammarRules;
    }
    return allGrammarRules.filter(
      (rule) =>
        rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allGrammarRules]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleThemeToggle = (theme: Theme) => {
    setSelectedThemes(prev => {
      const isSelected = prev.some(selected => selected.id === theme.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== theme.id);
      } else {
        return [...prev, theme];
      }
    });
  };

  const handleThemeCreate = (name: string, color: string) => {
    console.log('New theme created:', name, color);
  };

  const handleThemeDelete = (themeId: string) => {
    setSelectedThemes(prev => prev.filter(theme => theme.id !== themeId));
    console.log('Theme deleted:', themeId);
  };

  const handleGenerateGrammarRule = async () => {
    if (!customTopic.trim()) return;

    setGenerating(true);
    try {
      const themeNames = selectedThemes.map(theme => theme.name).join(', ');
      const newRule = await deepseekApi.generateGrammarRule(customTopic, themeNames);
      setGeneratedRules(prev => [...prev, newRule]);
      setCustomTopic('');

      // Extract vocabulary from new rule examples in background
      if (newRule.examples && newRule.examples.length > 0) {
        VocabularyExtractionService.extractAndSaveVocabulary(newRule.examples, 'grammar-generated');
      }

    } catch (error: any) {
      console.error("Error generating grammar rule:", error);
      alert(`Failed to generate grammar rule: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleEnhanceExamples = async (topic: string) => {
    if (enhancedExamples[topic]) return; // Already enhanced

    try {
      const themeNames = selectedThemes.map(theme => theme.name).join(', ');
      const newExamples = await deepseekApi.generateGrammarExamples(topic, 5, themeNames);
      setEnhancedExamples(prev => ({ ...prev, [topic]: newExamples }));

      // Extract vocabulary from new examples in background (only German sentences)
      const germanSentences = newExamples.map(example => example.german);
      VocabularyExtractionService.extractAndSaveVocabulary(germanSentences, 'grammar-generated');

    } catch (error: any) {
      console.error("Error enhancing examples:", error);
      alert(`Failed to enhance examples: ${error.message}`);
    }
  };

  const loadSavedRules = () => {
    setSavedRules(savedContentService.getSavedGrammarRules());
  };

  const handleSaveRule = (rule: GrammarRule) => {
    try {
      const themeNames = selectedThemes.map(theme => theme.name);
      savedContentService.saveGrammarRule({
        title: rule.title,
        description: rule.description || '',
        examples: rule.examples || [],
        difficulty: rule.difficulty || 'intermediate',
        themes: themeNames
      });
      loadSavedRules();
      alert(`Grammar rule "${rule.title}" has been saved!`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteSavedRule = (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this saved rule?')) {
      savedContentService.deleteSavedGrammarRule(ruleId);
      loadSavedRules();
    }
  };

  const handleExportSaved = () => {
    const content = savedContentService.exportSavedContent();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `german-grammar-saved-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importContent.trim()) {
      alert('Please paste the JSON content to import');
      return;
    }

    const result = savedContentService.importSavedContent(importContent);
    setImportResult(result);

    if (result.success && result.imported > 0) {
      loadSavedRules();
      setTimeout(() => {
        setImportDialogOpen(false);
        setImportContent('');
        setImportResult(null);
      }, 3000);
    }
  };

  // Load saved rules on component mount
  React.useEffect(() => {
    loadSavedRules();
  }, []);

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#1a1a2e',
            fontWeight: 700,
            mb: 1,
          }}
        >
          German Grammar
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            maxWidth: '600px',
          }}
        >
          Master German grammar with interactive rules, examples, and AI-powered explanations
        </Typography>
      </Box>

      {/* Search and Generate Section */}
      <Box sx={{
        mb: 4,
        p: 3,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
      }}>
        <TextField
          label="Search Grammar Topics"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ mb: 2 }}
        />

        <Box sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}>
          <TextField
            label="Generate Custom Grammar Rule"
            placeholder="e.g., 'German Modal Verbs', 'Adjective Declension'"
            variant="outlined"
            fullWidth
            size="small"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerateGrammarRule()}
          />
          <Button
            variant="contained"
            onClick={handleGenerateGrammarRule}
            disabled={generating || !customTopic.trim()}
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              minWidth: { xs: 'auto', sm: 140 },
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </Box>

        {/* Saved Content Controls */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          mt: 2,
        }}>
          <Button
            variant={showSaved ? "contained" : "outlined"}
            onClick={() => setShowSaved(!showSaved)}
            startIcon={<BookmarkIcon />}
            size="small"
            sx={{
              backgroundColor: showSaved ? '#10b981' : 'transparent',
              borderColor: '#e5e7eb',
              color: showSaved ? '#fff' : '#374151',
              '&:hover': {
                backgroundColor: showSaved ? '#059669' : '#f9fafb',
                borderColor: '#d1d5db',
              },
            }}
          >
            {showSaved ? 'Hide' : 'Show'} Saved ({savedRules.length})
          </Button>

          <Button
            variant="outlined"
            onClick={handleExportSaved}
            disabled={savedRules.length === 0}
            startIcon={<DownloadIcon />}
            size="small"
            sx={{
              borderColor: '#e5e7eb',
              color: '#374151',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#d1d5db',
              },
            }}
          >
            Export
          </Button>

          <Button
            variant="outlined"
            onClick={() => setImportDialogOpen(true)}
            startIcon={<UploadIcon />}
            size="small"
            sx={{
              borderColor: '#e5e7eb',
              color: '#374151',
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#d1d5db',
              },
            }}
          >
            Import
          </Button>
        </Box>
      </Box>
      {/* Main Content - Two Column Layout */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          alignItems: 'flex-start',
          '@media (max-width: 960px)': {
            flexDirection: 'column',
          },
        }}
      >
        {/* Left Column - Grammar Rules (65% width) */}
        <Box sx={{ flex: '1 1 65%', minWidth: 0 }}>
          {filteredGrammar.length > 0 ? (
            filteredGrammar.map((rule, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.15s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <Accordion
                  sx={{
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon sx={{ color: '#6b7280' }} />
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            rule.difficulty === 'beginner' ? '#22c55e' :
                              rule.difficulty === 'intermediate' ? '#f59e0b' :
                                '#ef4444',
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#1a1a2e',
                          fontWeight: 600,
                          flex: 1,
                          fontSize: '1rem',
                        }}
                      >
                        {rule.title}
                      </Typography>

                      {/* Save/Delete Button */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {(rule as any).saved ? (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedRule((rule as any).id);
                            }}
                            sx={{
                              color: '#ef4444',
                              background: 'rgba(239, 68, 68, 0.2)',
                              '&:hover': {
                                background: 'rgba(239, 68, 68, 0.3)',
                              },
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        ) : savedContentService.isSaved(rule.title) ? (
                          <IconButton disabled sx={{ color: 'rgba(255, 255, 255, 0.5)' }} size="small">
                            <BookmarkIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveRule(rule);
                            }}
                            sx={{
                              color: '#06d6a0',
                              background: 'rgba(6, 214, 160, 0.2)',
                              '&:hover': {
                                background: 'rgba(6, 214, 160, 0.3)',
                              },
                            }}
                            size="small"
                          >
                            <BookmarkBorderIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      {rule.difficulty && (
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${rule.difficulty === 'beginner' ? 'rgba(34, 197, 94, 0.2)' :
                              rule.difficulty === 'intermediate' ? 'rgba(245, 158, 11, 0.2)' :
                                'rgba(239, 68, 68, 0.2)'
                              })`,
                            border: `1px solid ${rule.difficulty === 'beginner' ? 'rgba(34, 197, 94, 0.3)' :
                              rule.difficulty === 'intermediate' ? 'rgba(245, 158, 11, 0.3)' :
                                'rgba(239, 68, 68, 0.3)'
                              }`,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            {rule.difficulty === 'beginner' ? '🟢 Beginner' :
                              rule.difficulty === 'intermediate' ? '🟡 Intermediate' :
                                '🔴 Advanced'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: 3, pb: 3 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#374151',
                        lineHeight: 1.7,
                        mb: 3,
                      }}
                    >
                      {rule.description}
                    </Typography>

                    <Box sx={{
                      p: 2,
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      mb: 3,
                    }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: '#1a1a2e',
                          fontWeight: 600,
                          mb: 1.5,
                        }}
                      >
                        Examples
                      </Typography>

                      {rule.examples?.map((example, exIndex) => (
                        <Box
                          key={exIndex}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 1.5,
                            p: 1.5,
                            borderRadius: '6px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#10b981',
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#374151',
                              fontStyle: 'italic',
                              flex: 1,
                            }}
                          >
                            {example}
                          </Typography>
                          <CompactPronunciationButton text={example} />
                        </Box>
                      ))}

                      {enhancedExamples[rule.title] && enhancedExamples[rule.title].map((example, exIndex) => (
                        <Box
                          key={`enhanced-${exIndex}`}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            mb: 2,
                            p: 2,
                            borderRadius: '12px',
                            background: 'rgba(6, 214, 160, 0.1)',
                            border: '1px solid rgba(6, 214, 160, 0.2)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #06d6a0, #34d399)',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#06d6a0',
                                fontStyle: 'italic',
                                fontSize: '1rem',
                                flex: 1,
                                fontWeight: 600,
                              }}
                            >
                              🇩🇪 {example.german}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'rgba(6, 214, 160, 0.8)',
                                fontSize: '0.75rem',
                                mr: 1,
                              }}
                            >
                              🤖 AI Generated
                            </Typography>
                            <CompactPronunciationButton text={example.german} />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(6, 214, 160, 0.9)',
                              fontSize: '0.95rem',
                              ml: 3,
                              fontStyle: 'italic',
                            }}
                          >
                            🇺🇸 {example.english}
                          </Typography>
                        </Box>
                      ))}

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEnhanceExamples(rule.title)}
                        disabled={!!enhancedExamples[rule.title]}
                        startIcon={enhancedExamples[rule.title] ? <span>✨</span> : <span>🔍</span>}
                        sx={{
                          mt: 2,
                          borderRadius: '12px',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          background: enhancedExamples[rule.title]
                            ? 'rgba(6, 214, 160, 0.2)'
                            : 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            background: enhancedExamples[rule.title]
                              ? 'rgba(6, 214, 160, 0.3)'
                              : 'rgba(255, 255, 255, 0.2)',
                          },
                          '&:disabled': {
                            borderColor: 'rgba(6, 214, 160, 0.4)',
                            color: '#06d6a0',
                          },
                        }}
                      >
                        {enhancedExamples[rule.title] ? 'Examples Enhanced!' : 'Get More Examples'}
                      </Button>
                    </Box>

                    <Practice
                      rule={rule}
                      themes={selectedThemes.map(theme => theme.name).join(', ')}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))
          ) : (
            <Box sx={{
              textAlign: 'center',
              p: 4,
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
            }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: '#374151',
                  mb: 1,
                }}
              >
                No grammar rules found
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#6b7280',
                }}
              >
                Try a different search term or generate a custom grammar rule above
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Column - Theme Selection (35% width) */}
        <Box sx={{ flex: '1 1 35%', minWidth: 0 }}>
          <ThemeSection
            selectedThemes={selectedThemes}
            onThemeToggle={handleThemeToggle}
            onThemeCreate={handleThemeCreate}
            onThemeDelete={handleThemeDelete}
          />
        </Box>
      </Box>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Import Saved Grammar Rules
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#6b7280', mb: 2 }}>
            Paste the JSON content of your previously exported grammar rules:
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={importContent}
            onChange={(e) => setImportContent(e.target.value)}
            placeholder='Paste your JSON content here...'
            sx={{ mb: 2 }}
          />
          {importResult && (
            <Alert
              severity={importResult.success ? "success" : "error"}
            >
              {importResult.success ? (
                <>
                  Successfully imported {importResult.imported} grammar rules!
                  {importResult.errors.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">Issues:</Typography>
                      <ul style={{ margin: '4px 0' }}>
                        {importResult.errors.map((error, i) => (
                          <li key={i}><Typography variant="body2">{error}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  Import failed. Errors:
                  <ul style={{ margin: '4px 0' }}>
                    {importResult.errors.map((error, i) => (
                      <li key={i}><Typography variant="body2">{error}</Typography></li>
                    ))}
                  </ul>
                </>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setImportDialogOpen(false);
              setImportContent('');
              setImportResult(null);
            }}
            sx={{ color: '#6b7280' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImportSubmit}
            variant="contained"
            disabled={!importContent.trim()}
            sx={{
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Grammar;
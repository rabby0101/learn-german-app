import React, { useState, useMemo, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Flashcard from '../components/Flashcard';
import ThemeSection, { Theme } from '../components/ThemeSection';
import Stopwatch from '../components/Stopwatch';
import { deepseekApi } from '../services/deepseekApi';
import { vocabularyDB, VocabularyDBWord } from '../services/vocabularyDatabase';
import vocabulary from '../vocabulary.json';
import aspekteB2Vocabulary from '../data/aspekte-b2-vocabulary.json';

const Vocabulary: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyDBWord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [generating, setGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [dbInitialized, setDbInitialized] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<VocabularyDBWord[]>([]);
  const [shuffling, setShuffling] = useState(false);
  const [showMasteredOnly, setShowMasteredOnly] = useState(false);
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>([]);
  const [importing, setImporting] = useState(false);

  // Initialize database and load vocabulary
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setLoading(true);
        console.log('Initializing vocabulary database...');

        // Initialize database
        await vocabularyDB.initialize();
        console.log('Database initialization completed, setting dbInitialized to true');
        setDbInitialized(true);

        // Check if database is empty and populate with initial vocabulary
        const wordCount = await vocabularyDB.getTotalWordCount();
        if (wordCount === 0) {
          console.log('Database is empty, adding initial vocabulary...');
          await vocabularyDB.addWords(vocabulary, 'initial');
        }

        // Load random vocabulary words for display
        await loadVocabularyWords();
        await updateCounts();

      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  const loadVocabularyWords = async () => {
    try {
      const words = await vocabularyDB.getWeightedRandomWords(25, 5); // 5% mastered words
      setVocabularyWords(words);
      setCurrentCardIndex(0);
      console.log(`Loaded ${words.length} vocabulary words for display`);
    } catch (error) {
      console.error('Failed to load vocabulary words:', error);
    }
  };

  const updateCounts = async () => {
    try {
      const total = await vocabularyDB.getTotalWordCount();
      const mastered = await vocabularyDB.getMasteredWordCount();
      console.log(`Total words: ${total}, Mastered: ${mastered}`);
      setTotalWords(total);
      setMasteredCount(mastered);
    } catch (error) {
      console.error('Failed to update counts:', error);
    }
  };

  const filteredVocabulary = useMemo(() => {
    if (!searchTerm) {
      return vocabularyWords;
    }
    return searchResults;
  }, [searchTerm, vocabularyWords, searchResults]);

  const handleNext = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % filteredVocabulary.length);
  };

  const handlePrevious = () => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex === 0 ? filteredVocabulary.length - 1 : prevIndex - 1
    );
  };

  const handleShuffle = async () => {
    try {
      setShuffling(true);
      console.log('🔀 Starting new session with fresh vocabulary...');
      if (showMasteredOnly) {
        const words = await vocabularyDB.getMasteredWords();
        setVocabularyWords(words);
        setCurrentCardIndex(0);
      } else {
        await loadVocabularyWords(); // Load new random 25 words
      }
      setSearchTerm(''); // Clear search term on shuffle
      console.log('✨ New session started! Fresh vocabulary loaded.');
    } catch (error) {
      console.error('Failed to start new session:', error);
      alert('Failed to load new vocabulary. Please try again.');
    } finally {
      setShuffling(false);
    }
  };

  const handleToggleMastered = async () => {
    try {
      setShuffling(true);
      const newShowMastered = !showMasteredOnly;
      setShowMasteredOnly(newShowMastered);

      if (newShowMastered) {
        const words = await vocabularyDB.getMasteredWords();
        setVocabularyWords(words);
        setCurrentCardIndex(0);
        console.log('Switched to mastered vocabulary view');
      } else {
        await loadVocabularyWords();
        console.log('Switched to regular vocabulary view');
      }

      setSearchTerm(''); // Clear search when switching views
      setCurrentCardIndex(0);
    } catch (error) {
      console.error('Failed to toggle mastered view:', error);
    } finally {
      setShuffling(false);
    }
  };

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchTerm(query);
    setCurrentCardIndex(0);

    if (query.trim() && dbInitialized) {
      try {
        const results = await vocabularyDB.searchWords(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to search words:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleMastered = async (germanWord: string) => {
    console.log(`handleMastered called: dbInitialized = ${dbInitialized}, loading = ${loading}`);
    if (!dbInitialized) {
      console.warn('Database not yet initialized, cannot master word');
      alert('Please wait for the database to finish initializing...');
      return;
    }

    try {
      console.log(`Attempting to master word: "${germanWord}"`);
      await vocabularyDB.updateWordMasteredStatus(germanWord, true);
      console.log(`Successfully updated database for: "${germanWord}"`);

      await updateCounts();
      console.log('Updated counts after mastering word');

      // Update the displayed word's mastered status
      setVocabularyWords(prev =>
        prev.map(word =>
          word.german === germanWord
            ? { ...word, isMastered: true }
            : word
        )
      );
      setSearchResults(prev =>
        prev.map(word =>
          word.german === germanWord
            ? { ...word, isMastered: true }
            : word
        )
      );
      console.log('Updated local state for mastered word');
    } catch (error) {
      console.error('Failed to update mastered status:', error);
    }
  };

  const handleGenerateMoreWords = async () => {
    if (!dbInitialized) {
      alert('Database is still initializing. Please wait a moment.');
      return;
    }

    setGenerating(true);
    try {
      // Generate 20 new words using Deepseek API with selected themes
      const themeNames = selectedThemes.map(theme => theme.name).join(', ');
      const newWords = await deepseekApi.generateVocabulary(20, difficulty, themeNames);

      // Add words to database (duplicates will be automatically filtered)
      const addedCount = await vocabularyDB.addWords(newWords, 'ai-generated');

      if (addedCount > 0) {
        // Refresh the displayed vocabulary and counts
        await loadVocabularyWords();
        await updateCounts();
        alert(`Successfully added ${addedCount} new words to your vocabulary! ${20 - addedCount} duplicates were skipped.`);
      } else {
        alert('All generated words were already in your vocabulary. Try a different difficulty level.');
      }

      console.log(`Generated ${newWords.length} words, added ${addedCount} new unique words`);
    } catch (error: any) {
      console.error("Error generating more words:", error);

      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.message.includes('GitHub access token is not configured')) {
        errorMessage = 'Please set your REACT_APP_GITHUB_ACCESS_TOKEN in your environment variables.';
      } else if (error.message.includes('HTTP 401')) {
        errorMessage = 'Authentication failed: Please check your GitHub access token.';
      } else if (error.message.includes('HTTP 403')) {
        errorMessage = 'Access denied: Please ensure your token has the correct permissions.';
      } else if (error.message.includes('HTTP 429')) {
        errorMessage = 'Rate limit exceeded: Please wait a moment before trying again.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network error: Please check your internet connection and try again.';
      }

      alert(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleImportAspekteB2 = async () => {
    if (!dbInitialized) {
      alert('Database is still initializing. Please wait a moment.');
      return;
    }

    setImporting(true);
    try {
      // Convert Aspekte B2 vocabulary to the required format
      const wordsToImport = aspekteB2Vocabulary.map((word: any) => ({
        german: word.german,
        english: word.english || `[B2] ${word.chapter || 'Aspekte Neu B2'}`,
        example: word.example || `${word.german} - ${word.chapter || 'Aspekte Neu B2'}`
      }));

      // Add words to database (duplicates will be automatically filtered)
      const addedCount = await vocabularyDB.addWords(wordsToImport, 'initial');

      if (addedCount > 0) {
        // Refresh the displayed vocabulary and counts
        await loadVocabularyWords();
        await updateCounts();
        alert(`Successfully imported ${addedCount} words from Aspekte Neu B2! ${wordsToImport.length - addedCount} duplicates were skipped.`);
      } else {
        alert('All words from Aspekte Neu B2 were already in your vocabulary.');
      }

      console.log(`Imported ${addedCount} new unique words from Aspekte Neu B2`);
    } catch (error: any) {
      console.error('Error importing Aspekte B2 vocabulary:', error);
      alert('Failed to import vocabulary. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  // Theme handlers
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
    // Theme creation is handled within the ThemeSection component
    console.log('New theme created:', name, color);
  };

  const handleThemeDelete = (themeId: string) => {
    setSelectedThemes(prev => prev.filter(theme => theme.id !== themeId));
    console.log('Theme deleted:', themeId);
  };

  // Handle translation updates from AI
  const handleTranslationUpdate = async (german: string, english: string, example: string) => {
    try {
      // Update the word in the database
      await vocabularyDB.updateWord(german, { german, english, example });

      // Update local state for displayed words
      setVocabularyWords(prev =>
        prev.map(word =>
          word.german === german
            ? { ...word, english, example }
            : word
        )
      );
      setSearchResults(prev =>
        prev.map(word =>
          word.german === german
            ? { ...word, english, example }
            : word
        )
      );
      console.log(`Saved translation for "${german}"`);
    } catch (error) {
      console.error('Failed to save translation:', error);
    }
  };

  const progress = totalWords > 0 ? (masteredCount / totalWords) * 100 : 0;

  // Show loading screen while database initializes
  if (loading || !dbInitialized) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2, color: '#1a1a2e' }} />
          <Typography variant="h6" sx={{ color: '#1a1a2e' }}>
            Initializing Vocabulary Database...
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Setting up your personalized learning experience
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 2 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#1a1a2e', fontWeight: 700, mb: 1 }}>
          Vocabulary
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Build your German vocabulary with flashcards and AI-powered learning
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 4,
        p: 3,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
      }}>
        <TextField
          label="Search Vocabulary"
          variant="outlined"
          fullWidth
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={difficulty}
            label="Difficulty"
            onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Main Content - Two Column Layout with Box and Flexbox */}
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
        {/* Left Column - Flashcards (60% width) */}
        <Box sx={{ flex: '1 1 60%', minWidth: 0 }}>
          <Box sx={{ mb: 2 }}>
            {filteredVocabulary.length > 0 ? (
              searchTerm ? (
                filteredVocabulary.map((word, index) => (
                  <Flashcard
                    key={index}
                    german={word.german}
                    english={word.english}
                    example={word.example}
                    isMastered={word.isMastered}
                    onMastered={handleMastered}
                    onTranslationUpdate={handleTranslationUpdate}
                  />
                ))
              ) : (
                <Flashcard
                  german={filteredVocabulary[currentCardIndex].german}
                  english={filteredVocabulary[currentCardIndex].english}
                  example={filteredVocabulary[currentCardIndex].example}
                  isMastered={filteredVocabulary[currentCardIndex].isMastered}
                  onMastered={handleMastered}
                  onTranslationUpdate={handleTranslationUpdate}
                />
              )
            ) : (
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                No vocabulary found matching your search.
              </Typography>
            )}
          </Box>

          {!searchTerm && filteredVocabulary.length > 0 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              mb: 4,
              flexWrap: 'wrap',
            }}>
              <Button
                variant="contained"
                onClick={handlePrevious}
                size="small"
                sx={{ backgroundColor: '#1a1a2e' }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                size="small"
                sx={{ backgroundColor: '#1a1a2e' }}
              >
                Next
              </Button>
              <Button
                variant="outlined"
                onClick={handleShuffle}
                disabled={shuffling}
                size="small"
                sx={{ borderColor: '#e5e7eb', color: '#374151' }}
              >
                {shuffling ? 'Loading...' : 'New Session'}
              </Button>
              <Button
                variant={showMasteredOnly ? "contained" : "outlined"}
                onClick={handleToggleMastered}
                disabled={shuffling}
                size="small"
                sx={{
                  backgroundColor: showMasteredOnly ? '#f59e0b' : 'transparent',
                  borderColor: showMasteredOnly ? '#f59e0b' : '#e5e7eb',
                  color: showMasteredOnly ? '#fff' : '#374151',
                  '&:hover': {
                    backgroundColor: showMasteredOnly ? '#d97706' : '#f9fafb',
                  },
                }}
              >
                {showMasteredOnly ? `Mastered (${masteredCount})` : 'Review Mastered'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleGenerateMoreWords}
                disabled={generating}
                size="small"
                sx={{
                  borderColor: '#10b981',
                  color: '#10b981',
                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.08)' }
                }}
              >
                {generating ? 'Generating...' : 'Generate 20 Words'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleImportAspekteB2}
                disabled={importing}
                size="small"
                sx={{ borderColor: '#e5e7eb', color: '#374151' }}
              >
                {importing ? 'Importing...' : 'Import Aspekte B2'}
              </Button>
            </Box>
          )}
        </Box>

        {/* Right Column - Stopwatch and Themes (40% width) */}
        <Box sx={{ flex: '1 1 40%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Stopwatch />
          <ThemeSection
            selectedThemes={selectedThemes}
            onThemeToggle={handleThemeToggle}
            onThemeCreate={handleThemeCreate}
            onThemeDelete={handleThemeDelete}
          />
        </Box>
      </Box>

      {/* Progress Section */}
      <Box sx={{
        mt: 4,
        p: 3,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#1a1a2e', fontWeight: 600 }}>
            Progress Tracker
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#10b981', fontWeight: 600 }}>
            {masteredCount} / {totalWords}
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e5e7eb',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: '#10b981',
              },
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
          {masteredCount === 0
            ? "Start your journey! Master your first word"
            : masteredCount === totalWords
              ? "Congratulations! You've mastered all words!"
              : `Keep going! ${totalWords - masteredCount} words left to master`
          }
        </Typography>
      </Box>
    </Container>
  );
};

export default Vocabulary;
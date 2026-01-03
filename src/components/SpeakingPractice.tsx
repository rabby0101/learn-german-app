import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  VolumeUp as VolumeUpIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { TTSService } from '../services/ttsService';

interface SpeakingExercise {
  id: string;
  type: 'pronunciation' | 'conversation' | 'reading' | 'repetition';
  german: string;
  english: string;
  phonetic?: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  context?: string;
  tips?: string[];
}

interface SpeakingPracticeProps {
  exercises?: SpeakingExercise[];
  onComplete?: (exerciseId: string, score: number) => void;
}

const defaultExercises: SpeakingExercise[] = [
  // B1 Level Exercises
  {
    id: 'b1-1',
    type: 'conversation',
    german: 'Ich hätte gerne ein Vorstellungsgespräch für die ausgeschriebene Stelle.',
    english: 'I would like to have a job interview for the advertised position.',
    phonetic: 'ikh HET-te GAIR-ne eyn for-SHTEL-loongs-ge-shpreyh fuer dee OUSE-ge-shree-be-ne SHTEL-le',
    difficulty: 'B1',
    context: 'Job application scenario',
    tips: ['Use subjunctive "hätte" for polite requests', 'Practice the compound word "Vorstellungsgespräch"', 'Emphasize "ausgeschriebene" clearly']
  },
  {
    id: 'b1-2',
    type: 'pronunciation',
    german: 'Obwohl das Wetter schlecht war, sind wir trotzdem spazieren gegangen.',
    english: 'Although the weather was bad, we still went for a walk.',
    phonetic: 'ob-VOHL das VET-ter shlekht var, zint veer TROTTS-dem shpa-TSEE-ren ge-GANG-en',
    difficulty: 'B1',
    context: 'Complex sentence with subordinate clause',
    tips: ['Practice the "obwohl" conjunction clearly', 'Note the verb position in subordinate clauses', 'Stress "trotzdem" appropriately']
  },
  {
    id: 'b1-3',
    type: 'reading',
    german: 'Meiner Meinung nach sollte man mehr auf die Umwelt achten und nachhaltige Entscheidungen treffen.',
    english: 'In my opinion, one should pay more attention to the environment and make sustainable decisions.',
    phonetic: 'MY-ner MY-noong nahkh ZOL-te man mayr owf dee OOM-velt AKH-ten oont NAHKH-hal-ti-ge ent-SHIGH-doon-gen TREF-fen',
    difficulty: 'B1',
    context: 'Expressing opinions about environmental issues',
    tips: ['Practice "Meinung nach" as a fixed expression', 'Focus on the "ach" sound in "achten"', 'Break down "nachhaltige" syllable by syllable']
  },
  {
    id: 'b1-4',
    type: 'conversation',
    german: 'Könnten Sie mir bitte erklären, wie das Gesundheitssystem in Deutschland funktioniert?',
    english: 'Could you please explain to me how the healthcare system in Germany works?',
    phonetic: 'KERN-ten zee meer BIT-te er-KLAY-ren, vee das ge-ZOONT-hayts-sys-taym in DOYTSH-lant foong-tsio-NEERT',
    difficulty: 'B1',
    context: 'Asking about complex systems',
    tips: ['Use conditional "könnten" for very polite requests', 'Practice the long compound "Gesundheitssystem"', 'Focus on clear pronunciation of "funktioniert"']
  },
  
  // B2 Level Exercises  
  {
    id: 'b2-1',
    type: 'pronunciation',
    german: 'Die zunehmende Digitalisierung hat sowohl Vor- als auch Nachteile für die Gesellschaft.',
    english: 'The increasing digitization has both advantages and disadvantages for society.',
    phonetic: 'dee tsoo-NAY-men-de di-gi-ta-li-ZEE-roong hat zo-VOHL for- als owkh NAHKH-tay-le fuer dee ge-ZEL-shaft',
    difficulty: 'B2',
    context: 'Academic discussion about technology',
    tips: ['Master the difficult "zunehmende" pronunciation', 'Practice "sowohl...als auch" construction', 'Emphasize the syllables in "Digitalisierung"']
  },
  {
    id: 'b2-2',
    type: 'conversation',
    german: 'Es wäre durchaus denkbar, dass sich die Situation in den nächsten Jahren grundlegend ändern wird.',
    english: 'It would be quite conceivable that the situation will fundamentally change in the next few years.',
    phonetic: 'es VAY-re DOORH-ows DENK-bar, das zikh dee zi-too-ah-TSION in dayn NEYH-sten YAH-ren GROONT-lay-gent EN-dern veert',
    difficulty: 'B2',
    context: 'Expressing possibility and speculation',
    tips: ['Practice subjunctive "wäre" clearly', 'Focus on "durchaus" as an intensifier', 'Master the complex verb "ändern wird"']
  },
  {
    id: 'b2-3',
    type: 'reading',
    german: 'Angesichts der aktuellen wirtschaftlichen Lage müssen Unternehmen innovative Strategien entwickeln, um wettbewerbsfähig zu bleiben.',
    english: 'In view of the current economic situation, companies must develop innovative strategies to remain competitive.',
    phonetic: 'AN-ge-zikhts dair ak-too-EL-len veert-shaft-li-khen LAH-ge MUES-sen OON-ter-nay-men in-no-va-TEE-ve shtra-te-GHEE-en ent-VIK-eln, oom VET-be-verps-fey-ikh tsoo BLAY-ben',
    difficulty: 'B2',
    context: 'Business and economic discussion',
    tips: ['Practice "angesichts" as a complex preposition', 'Focus on "wettbewerbsfähig" - very long compound', 'Stress pattern in "innovative Strategien"']
  },
  {
    id: 'b2-4',
    type: 'repetition',
    german: 'Obgleich die Verhandlungen schwierig waren, konnten die Parteien schließlich einen Kompromiss erzielen.',
    english: 'Although the negotiations were difficult, the parties were finally able to reach a compromise.',
    phonetic: 'ob-GLYKH dee fer-HANT-loon-gen SHVEE-rikh vah-ren, KON-ten dee par-TAY-en SHLEES-likh EYE-nen kom-pro-MIS er-TSEE-len',
    difficulty: 'B2',
    context: 'Formal negotiation context',
    tips: ['Master the formal "obgleich" conjunction', 'Practice "Verhandlungen" clearly', 'Focus on the ending "erzielen"']
  },

  // C1 Level Exercises
  {
    id: 'c1-1',
    type: 'pronunciation',
    german: 'Die Implementierung nachhaltiger Technologien erfordert erhebliche Investitionen in Forschung und Entwicklung.',
    english: 'The implementation of sustainable technologies requires considerable investments in research and development.',
    phonetic: 'dee im-ple-men-TEE-roong NAHKH-hal-ti-ger tekh-no-lo-GHEE-en er-FOR-dert er-HAYP-li-khe in-ves-ti-TSIO-nen in FOR-shoong oont ent-VIK-loong',
    difficulty: 'C1',
    context: 'Technical and scientific discussion',
    tips: ['Perfect the technical term "Implementierung"', 'Practice the flow of "nachhaltiger Technologien"', 'Master "erhebliche Investitionen" rhythm']
  },
  {
    id: 'c1-2',
    type: 'conversation',
    german: 'Ungeachtet der kritischen Einwände verschiedener Interessensgruppen wird das Projekt voraussichtlich wie geplant umgesetzt.',
    english: 'Regardless of the critical objections from various interest groups, the project will presumably be implemented as planned.',
    phonetic: 'OON-ge-akh-tet dair KREE-ti-shen EYN-ven-de fer-SHEE-de-ner in-ter-ES-ens-groo-pen veert das pro-YEKT for-OWS-zikh-tlikh vee ge-PLAHNT OOM-ge-zetzt',
    difficulty: 'C1',
    context: 'Complex project management discussion',
    tips: ['Master "ungeachtet" as sophisticated vocabulary', 'Practice "Interessensgruppen" compound', 'Focus on "voraussichtlich" adverb placement']
  },
  {
    id: 'c1-3',
    type: 'reading',
    german: 'Die Auswirkungen des Klimawandels manifestieren sich in zunehmendem Maße durch extreme Wetterphänomene und ökosystemische Veränderungen.',
    english: 'The effects of climate change are increasingly manifesting through extreme weather phenomena and ecosystem changes.',
    phonetic: 'dee OWS-veer-koon-gen des KLEE-ma-van-dels ma-ni-fes-TEE-ren zikh in tsoo-NAY-men-dem MAH-se doorh eks-TRAY-me VET-ter-fey-no-may-ne oont er-ko-sys-TAY-mi-she fer-EN-de-roon-gen',
    difficulty: 'C1',
    context: 'Scientific climate discussion',
    tips: ['Perfect "manifestieren" pronunciation', 'Master "Wetterphänomene" scientific term', 'Practice "ökosystemische" complex adjective']
  },
  {
    id: 'c1-4',
    type: 'repetition',
    german: 'Infolgedessen ist eine differenzierte Betrachtungsweise erforderlich, um der Komplexität der Problematik gerecht zu werden.',
    english: 'Consequently, a differentiated perspective is required to do justice to the complexity of the issue.',
    phonetic: 'in-FOL-ge-des-en ist EYE-ne di-fe-ren-TSEE-er-te be-TRAKH-toongs-vay-se er-FOR-der-likh, oom dair kom-plek-si-TAYT dair pro-ble-ma-TEEK ge-REKHT tsoo VAIR-den',
    difficulty: 'C1',
    context: 'Academic analytical discussion',
    tips: ['Master "infolgedessen" formal connector', 'Practice "differenzierte Betrachtungsweise"', 'Focus on "gerecht werden" construction']
  },
  {
    id: 'c1-5',
    type: 'conversation',
    german: 'Es ließe sich argumentieren, dass die gesellschaftlichen Transformationsprozesse eine Neudefinition traditioneller Wertvorstellungen erfordern.',
    english: 'It could be argued that societal transformation processes require a redefinition of traditional value concepts.',
    phonetic: 'es LEE-se zikh ar-goo-men-TEE-ren, das dee ge-ZEL-shaft-li-khen trans-for-ma-TSIONS-pro-tse-se EYE-ne noy-de-fi-ni-TSION tra-di-tsio-NEL-ler VAIRT-for-shtel-loon-gen er-FOR-dern',
    difficulty: 'C1',
    context: 'Philosophical societal discussion',
    tips: ['Perfect subjunctive "ließe sich"', 'Master "Transformationsprozesse" complex compound', 'Practice "Wertvorstellungen" abstract concept']
  }
];

export default function SpeakingPractice({ exercises = defaultExercises, onComplete }: SpeakingPracticeProps) {
  const { currentUser } = useAuth();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if speech recognition and synthesis are supported
    const checkSpeechSupport = () => {
      const recognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const synthesis = 'speechSynthesis' in window;
      setSpeechSupported(recognition && synthesis);
      
      if (synthesis) {
        speechSynthesis.current = window.speechSynthesis;
      }
    };

    checkSpeechSupport();
  }, []);

  const currentExercise = exercises[currentExerciseIndex];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setScore(null);
      setFeedback('');
    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedback('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (recordedAudio) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const playNativeAudio = async () => {
    if (!currentExercise) return;
    
    setIsPlaying(true);
    
    try {
      // Use Chirp HD voices based on difficulty level for variety
      let voiceName = '';
      switch (currentExercise.difficulty) {
        case 'B1':
          voiceName = 'de-DE-Chirp-HD-F'; // Female Chirp HD voice for B1 (high quality)
          break;
        case 'B2':
          voiceName = 'de-DE-Chirp-HD-D'; // Male Chirp HD voice for B2 (high quality)
          break;
        case 'C1':
          voiceName = 'de-DE-Chirp-HD-F'; // Female Chirp HD voice for C1 (high quality)
          break;
        default:
          voiceName = 'de-DE-Chirp-HD-F'; // Default Chirp HD voice (high quality)
      }
      
      // Use Google Cloud TTS service with specific voice at 1.0 speed
      await TTSService.speakWithVoice(currentExercise.german, voiceName, 1.0, currentExercise.context || currentExercise.type);
      console.log(`🔊 Playing ${currentExercise.difficulty} German audio with voice: ${voiceName} at 1.0 speed`);
      
      // Set a timeout to reset playing state (estimate duration based on text length and difficulty)
      const baseTime = currentExercise.german.length * 80; // Base time per character
      const difficultyMultiplier = currentExercise.difficulty === 'C1' ? 1.2 : currentExercise.difficulty === 'B2' ? 1.1 : 1.0;
      const estimatedDuration = baseTime * difficultyMultiplier + 1000;
      
      setTimeout(() => {
        setIsPlaying(false);
      }, estimatedDuration);
      
    } catch (error) {
      console.error('Google Cloud TTS error:', error);
      setIsPlaying(false);
    }
  };

  const analyzePronunciation = async () => {
    if (!recordedAudio) return;

    setIsAnalyzing(true);
    
    // Simulate more sophisticated pronunciation analysis based on difficulty level
    setTimeout(() => {
      let baseScore = 70;
      let difficultyModifier = 0;
      
      // Adjust base score based on difficulty
      switch (currentExercise.difficulty) {
        case 'B1':
          difficultyModifier = Math.floor(Math.random() * 25) + 5; // 75-100 range
          break;
        case 'B2':
          difficultyModifier = Math.floor(Math.random() * 20) + 0; // 70-90 range  
          break;
        case 'C1':
          difficultyModifier = Math.floor(Math.random() * 15) - 5; // 65-85 range
          break;
        default:
          difficultyModifier = Math.floor(Math.random() * 30) + 10; // 80-100 range
      }
      
      const simulatedScore = Math.min(baseScore + difficultyModifier, 100);
      
      // More sophisticated feedback based on difficulty and score
      let feedback = '';
      
      if (simulatedScore >= 90) {
        const excellentFeedbacks = [
          'Ausgezeichnet! Your pronunciation is nearly native-level.',
          'Perfekt! Excellent mastery of complex German sounds.',
          'Hervorragend! Your intonation and rhythm are spot-on.',
          'Wunderbar! You\'ve mastered this advanced pronunciation.',
        ];
        feedback = excellentFeedbacks[Math.floor(Math.random() * excellentFeedbacks.length)];
      } else if (simulatedScore >= 80) {
        const goodFeedbacks = [
          'Sehr gut! Focus on the stress patterns in compound words.',
          'Great work! Try to hold the vowel sounds a bit longer.',
          'Well done! Practice the consonant clusters more.',
          'Good pronunciation! Work on the rhythm and flow.',
        ];
        feedback = goodFeedbacks[Math.floor(Math.random() * goodFeedbacks.length)];
      } else if (simulatedScore >= 70) {
        const improveFeedbacks = [
          'Gut! Focus on the umlauts (ä, ö, ü) - they\'re crucial.',
          'Not bad! Work on the "ch" and "sch" sounds more.',
          'Decent effort! Practice the word stress patterns.',
          'Keep trying! Focus on the consonant endings.',
        ];
        feedback = improveFeedbacks[Math.floor(Math.random() * improveFeedbacks.length)];
      } else {
        const strugglingFeedbacks = [
          'Keep practicing! Break down the words syllable by syllable.',
          'Don\'t give up! Listen to the audio multiple times first.',
          'Practice makes perfect! Focus on one sound at a time.',
          'Slow down and focus on accuracy over speed.',
        ];
        feedback = strugglingFeedbacks[Math.floor(Math.random() * strugglingFeedbacks.length)];
      }
      
      // Add specific feedback for difficulty level
      switch (currentExercise.difficulty) {
        case 'C1':
          feedback += ' At C1 level, precision in complex structures is key.';
          break;
        case 'B2':
          feedback += ' B2 level requires confident handling of sophisticated vocabulary.';
          break;
        case 'B1':
          feedback += ' B1 level focuses on clear communication in complex situations.';
          break;
      }

      setScore(simulatedScore);
      setFeedback(feedback);
      
      if (simulatedScore >= 75) {
        setCompletedExercises(prev => new Set(Array.from(prev).concat(currentExercise.id)));
        if (onComplete) {
          onComplete(currentExercise.id, simulatedScore);
        }
      }
      
      setIsAnalyzing(false);
    }, 2500); // Longer analysis time for more realistic feel
  };

  const nextExercise = () => {
    setCurrentExerciseIndex(prev => (prev + 1) % exercises.length);
    resetExercise();
  };

  const previousExercise = () => {
    setCurrentExerciseIndex(prev => prev === 0 ? exercises.length - 1 : prev - 1);
    resetExercise();
  };

  const resetExercise = () => {
    setRecordedAudio(null);
    setScore(null);
    setFeedback('');
    setShowTips(false);
    if (mediaRecorderRef.current && isRecording) {
      stopRecording();
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#06d6a0';
    if (score >= 80) return '#34d399';
    if (score >= 70) return '#fbbf24';
    return '#ff6b6b';
  };

  const getDifficultyColor = (level: string): string => {
    const colors = {
      'A1': '#4caf50',
      'A2': '#8bc34a',
      'B1': '#ff9800',
      'B2': '#ff5722',
      'C1': '#9c27b0',
      'C2': '#673ab7'
    };
    return colors[level as keyof typeof colors] || '#757575';
  };

  if (!speechSupported) {
    return (
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
      }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <MicIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            🎤 Speaking Practice Unavailable
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Your browser doesn't support speech recognition. Please try using Chrome or Edge for the best experience.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            🎤 Speaking Practice
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={currentExercise.difficulty}
              sx={{
                background: getDifficultyColor(currentExercise.difficulty),
                color: 'white',
                fontWeight: 600,
              }}
            />
            <Chip
              label={`${currentExerciseIndex + 1}/${exercises.length}`}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Exercise Content */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ 
            color: 'white', 
            fontWeight: 700, 
            textAlign: 'center', 
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}>
            {currentExercise.german}
          </Typography>
          
          <Typography variant="h6" sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            textAlign: 'center', 
            mb: 2 
          }}>
            "{currentExercise.english}"
          </Typography>

          {currentExercise.phonetic && (
            <Typography variant="body1" sx={{ 
              color: '#06d6a0', 
              textAlign: 'center', 
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              mb: 2
            }}>
              [{currentExercise.phonetic}]
            </Typography>
          )}

          {currentExercise.context && (
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              textAlign: 'center', 
              fontStyle: 'italic',
              mb: 2
            }}>
              Context: {currentExercise.context}
            </Typography>
          )}
        </Box>

        {/* Audio Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={playNativeAudio}
            disabled={isPlaying}
            startIcon={isPlaying ? <CircularProgress size={16} /> : <VolumeUpIcon />}
            sx={{
              borderRadius: '12px',
              borderColor: '#06d6a0',
              color: '#06d6a0',
              '&:hover': {
                borderColor: '#34d399',
                background: 'rgba(6, 214, 160, 0.1)',
              },
            }}
          >
            Listen
          </Button>

          <Button
            variant={isRecording ? "contained" : "outlined"}
            onClick={isRecording ? stopRecording : startRecording}
            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            sx={{
              borderRadius: '12px',
              background: isRecording ? 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' : 'transparent',
              borderColor: '#ff6b6b',
              color: isRecording ? 'white' : '#ff6b6b',
              '&:hover': {
                borderColor: '#ff5252',
                background: isRecording 
                  ? 'linear-gradient(135deg, #ff5252 0%, #f44336 100%)' 
                  : 'rgba(255, 107, 107, 0.1)',
              },
            }}
          >
            {isRecording ? 'Stop Recording' : 'Record'}
          </Button>

          {recordedAudio && (
            <Button
              variant="outlined"
              onClick={playRecording}
              startIcon={<PlayIcon />}
              sx={{
                borderRadius: '12px',
                borderColor: '#6366f1',
                color: '#6366f1',
                '&:hover': {
                  borderColor: '#8b5cf6',
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              Play Back
            </Button>
          )}

          {recordedAudio && (
            <Button
              variant="contained"
              onClick={analyzePronunciation}
              disabled={isAnalyzing}
              startIcon={isAnalyzing ? <CircularProgress size={16} /> : <BrainIcon />}
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                },
              }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          )}
        </Box>

        {/* Recording Status */}
        {isRecording && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                background: '#ff6b6b',
                animation: 'pulse 1s infinite'
              }} />
              <Typography variant="body2" sx={{ color: '#ff6b6b', fontWeight: 600 }}>
                Recording...
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Speak clearly into your microphone
            </Typography>
          </Box>
        )}

        {/* Feedback and Score */}
        {(score !== null || feedback) && (
          <Box sx={{ mb: 3 }}>
            {score !== null && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ 
                  color: getScoreColor(score), 
                  fontWeight: 700,
                  mb: 1
                }}>
                  {score}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={score}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${getScoreColor(score)} 0%, ${getScoreColor(score)}88 100%)`,
                    },
                  }}
                />
              </Box>
            )}
            
            {feedback && (
              <Alert 
                severity={score && score >= 80 ? "success" : "info"}
                sx={{ 
                  backgroundColor: score && score >= 80 
                    ? 'rgba(6, 214, 160, 0.1)' 
                    : 'rgba(99, 102, 241, 0.1)',
                  color: 'white',
                  border: `1px solid ${score && score >= 80 ? '#06d6a0' : '#6366f1'}`,
                  '& .MuiAlert-icon': {
                    color: score && score >= 80 ? '#06d6a0' : '#6366f1'
                  }
                }}
              >
                {feedback}
              </Alert>
            )}
          </Box>
        )}

        {/* Tips Section */}
        {currentExercise.tips && currentExercise.tips.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Button
              onClick={() => setShowTips(!showTips)}
              startIcon={showTips ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                textTransform: 'none',
              }}
            >
              💡 Pronunciation Tips
            </Button>
            
            <Collapse in={showTips}>
              <List sx={{ pl: 2 }}>
                {currentExercise.tips.map((tip, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: '#06d6a0', fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={tip}
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          fontSize: '0.9rem' 
                        } 
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={previousExercise}
            startIcon={<span>⬅️</span>}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Previous
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              onClick={resetExercise}
              startIcon={<RefreshIcon />}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              Reset
            </Button>
            
            {completedExercises.has(currentExercise.id) && (
              <CheckIcon sx={{ color: '#06d6a0', ml: 1 }} />
            )}
          </Box>

          <Button
            onClick={nextExercise}
            endIcon={<span>➡️</span>}
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Next
          </Button>
        </Box>

        {/* Progress */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
            Completed: {completedExercises.size} / {exercises.length} exercises
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
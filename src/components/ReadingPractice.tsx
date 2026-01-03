import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Switch,
  FormGroup,
  Autocomplete,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Lightbulb as LightbulbIcon,
  Timer as TimerIcon,
  MenuBook as BookOpenIcon,
  AutoAwesome as AIIcon,
  Add as AddIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { deepseekApi } from '../services/deepseekApi';

interface ReadingQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-gaps' | 'sentence-completion' | 'matching' | 'word-order';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  textWithGaps?: string; // For fill-gaps questions
  pairs?: { left: string; right: string }[]; // For matching questions
  scrambledWords?: string[]; // For word-order questions
}

interface ReadingExercise {
  id: string;
  title: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  text: string;
  vocabulary?: { word: string; meaning: string; }[];
  questions: ReadingQuestion[];
  estimatedTime: number; // in minutes
}

interface ReadingPracticeProps {
  onComplete?: (exerciseId: string, score: number) => void;
  completedExercises?: Set<string>;
}

const ReadingPractice: React.FC<ReadingPracticeProps> = ({ 
  onComplete, 
  completedExercises = new Set() 
}) => {
  const [selectedExercise, setSelectedExercise] = useState<ReadingExercise | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [matchingAnswers, setMatchingAnswers] = useState<{ [key: string]: string }>({});
  const [draggedWords, setDraggedWords] = useState<string[]>([]);
  const [dynamicExercises, setDynamicExercises] = useState<ReadingExercise[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomGenerator, setShowCustomGenerator] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('B1');
  const [selectedTextLength, setSelectedTextLength] = useState<'short' | 'medium' | 'long'>('medium');

  // Predefined topics for selection
  const predefinedTopics = [
    'German traditions and festivals',
    'Life in German cities',
    'German technology and innovation', 
    'German sports and recreation',
    'German literature and arts',
    'German work culture',
    'German transportation system',
    'German healthcare system',
    'German media and entertainment',
    'German family life',
    'German food and cuisine',
    'German history and landmarks',
    'German education system',
    'Environmental protection in Germany',
    'German business and economy',
    'German politics and government',
    'German music and festivals',
    'German travel and tourism',
    'German science and research',
    'German social customs'
  ];

  // Sample reading exercises with diverse question types
  const exercises: ReadingExercise[] = [
    {
      id: 'reading-1',
      title: 'Ein Tag in der Stadt',
      difficulty: 'A1',
      topic: 'Daily Life',
      estimatedTime: 10,
      text: `Lisa wohnt in München. Jeden Morgen geht sie zur Arbeit. Sie arbeitet in einem Büro in der Stadtmitte. Um acht Uhr beginnt sie zu arbeiten. In der Mittagspause geht sie oft in ein Café. Sie trinkt Kaffee und isst ein Sandwich. Am Nachmittag kauft sie manchmal im Supermarkt ein. Am Abend kocht sie zu Hause und sieht fern.`,
      vocabulary: [
        { word: 'wohnt', meaning: 'lives' },
        { word: 'Arbeit', meaning: 'work' },
        { word: 'Büro', meaning: 'office' },
        { word: 'Stadtmitte', meaning: 'city center' },
        { word: 'Mittagspause', meaning: 'lunch break' },
        { word: 'manchmal', meaning: 'sometimes' },
        { word: 'einkaufen', meaning: 'to shop' }
      ],
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Wo wohnt Lisa?',
          options: ['Berlin', 'Hamburg', 'München', 'Köln'],
          correctAnswer: 'München',
          explanation: 'Im ersten Satz steht: "Lisa wohnt in München."'
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          question: 'Wann beginnt Lisa zu arbeiten?',
          options: ['Um sieben Uhr', 'Um acht Uhr', 'Um neun Uhr', 'Um zehn Uhr'],
          correctAnswer: 'Um acht Uhr',
          explanation: 'Der Text sagt: "Um acht Uhr beginnt sie zu arbeiten."'
        },
        {
          id: 'q3',
          type: 'true-false',
          question: 'Lisa trinkt in der Mittagspause Tee.',
          correctAnswer: 'false',
          explanation: 'Lisa trinkt Kaffee, nicht Tee.'
        },
        {
          id: 'q4',
          type: 'fill-gaps',
          question: 'Fill in the gaps:',
          textWithGaps: 'Lisa wohnt in ____. Sie arbeitet in einem ____ in der Stadtmitte. In der Mittagspause trinkt sie ____.',
          correctAnswer: ['München', 'Büro', 'Kaffee'],
          explanation: 'Die Antworten finden sich direkt im Text.'
        },
        {
          id: 'q5',
          type: 'matching',
          question: 'Match the German words with their English meanings:',
          pairs: [
            { left: 'wohnt', right: 'lives' },
            { left: 'Arbeit', right: 'work' },
            { left: 'manchmal', right: 'sometimes' },
            { left: 'einkaufen', right: 'to shop' }
          ],
          correctAnswer: ['wohnt-lives', 'Arbeit-work', 'manchmal-sometimes', 'einkaufen-to shop'],
          explanation: 'These are common vocabulary words from the text.'
        },
        {
          id: 'q6',
          type: 'true-false',
          question: 'Lisa arbeitet am Abend.',
          correctAnswer: 'false',
          explanation: 'Lisa arbeitet um acht Uhr morgens bis nachmittags, nicht am Abend.'
        },
        {
          id: 'q7',
          type: 'multiple-choice',
          question: 'Was isst Lisa in der Mittagspause?',
          options: ['Pizza', 'Sandwich', 'Salat', 'Suppe'],
          correctAnswer: 'Sandwich',
          explanation: 'Der Text sagt: "Sie trinkt Kaffee und isst ein Sandwich."'
        },
        {
          id: 'q8',
          type: 'short-answer',
          question: 'Wo ist Lisas Büro?',
          correctAnswer: 'in der Stadtmitte',
          explanation: 'Der Text erwähnt: "Sie arbeitet in einem Büro in der Stadtmitte."'
        },
        {
          id: 'q9',
          type: 'fill-gaps',
          question: 'Complete this sentence:',
          textWithGaps: 'Am Nachmittag kauft sie manchmal im ____ ein.',
          correctAnswer: ['Supermarkt'],
          explanation: 'Lisa kauft im Supermarkt ein.'
        },
        {
          id: 'q10',
          type: 'word-order',
          question: 'Put these words in correct order:',
          scrambledWords: ['Lisa', 'wohnt', 'in', 'München'],
          correctAnswer: ['Lisa', 'wohnt', 'in', 'München'],
          explanation: 'The correct sentence is: "Lisa wohnt in München."'
        }
      ]
    },
    {
      id: 'reading-2',
      title: 'Das deutsche Schulsystem',
      difficulty: 'B1',
      topic: 'Education',
      estimatedTime: 15,
      text: `Das deutsche Schulsystem ist in mehrere Stufen unterteilt. Kinder besuchen zunächst die Grundschule von der ersten bis zur vierten Klasse. Danach wechseln sie auf eine weiterführende Schule. Es gibt verschiedene Schultypen: das Gymnasium, die Realschule und die Hauptschule. Das Gymnasium dauert bis zur zwölften oder dreizehnten Klasse und bereitet auf das Studium vor. Die Realschule endet nach der zehnten Klasse und bietet eine mittlere Reife. Die Hauptschule ist der kürzeste Bildungsweg und endet bereits nach der neunten Klasse. Viele Schüler machen nach der Schule eine Ausbildung in einem Betrieb.`,
      vocabulary: [
        { word: 'unterteilt', meaning: 'divided' },
        { word: 'zunächst', meaning: 'first' },
        { word: 'weiterführende Schule', meaning: 'secondary school' },
        { word: 'bereitet vor', meaning: 'prepares' },
        { word: 'mittlere Reife', meaning: 'intermediate school certificate' },
        { word: 'Bildungsweg', meaning: 'educational path' },
        { word: 'Ausbildung', meaning: 'apprenticeship' },
        { word: 'Betrieb', meaning: 'company' }
      ],
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Wie lange dauert die Grundschule?',
          options: ['3 Jahre', '4 Jahre', '5 Jahre', '6 Jahre'],
          correctAnswer: '4 Jahre',
          explanation: 'Die Grundschule dauert von der ersten bis zur vierten Klasse.'
        },
        {
          id: 'q2',
          type: 'true-false',
          question: 'Das Gymnasium bereitet auf das Studium vor.',
          correctAnswer: 'true',
          explanation: 'Der Text sagt explizit, dass das Gymnasium "auf das Studium vor[bereitet]".'
        },
        {
          id: 'q3',
          type: 'sentence-completion',
          question: 'Complete this sentence from the text:',
          options: ['Die Hauptschule endet bereits nach der _____ Klasse.', 'Das Gymnasium bereitet auf das _____ vor.', 'Viele Schüler machen nach der Schule eine _____ in einem Betrieb.'],
          correctAnswer: ['neunten', 'Studium', 'Ausbildung'],
          explanation: 'These completions are found directly in the text.'
        },
        {
          id: 'q4',
          type: 'word-order',
          question: 'Put these words in the correct order to form a sentence from the text:',
          scrambledWords: ['Kinder', 'besuchen', 'zunächst', 'die', 'Grundschule'],
          correctAnswer: ['Kinder', 'besuchen', 'zunächst', 'die', 'Grundschule'],
          explanation: 'The correct sentence is: "Kinder besuchen zunächst die Grundschule."'
        },
        {
          id: 'q5',
          type: 'multiple-choice',
          question: 'Welche Schule dauert am längsten?',
          options: ['Grundschule', 'Hauptschule', 'Realschule', 'Gymnasium'],
          correctAnswer: 'Gymnasium',
          explanation: 'Das Gymnasium dauert bis zur zwölften oder dreizehnten Klasse.'
        },
        {
          id: 'q6',
          type: 'fill-gaps',
          question: 'Complete the text about German schools:',
          textWithGaps: 'Die ____ endet nach der zehnten Klasse und bietet eine mittlere ____. Viele Schüler machen nach der Schule eine ____ in einem Betrieb.',
          correctAnswer: ['Realschule', 'Reife', 'Ausbildung'],
          explanation: 'Diese Informationen beschreiben die Realschule und berufliche Ausbildung.'
        },
        {
          id: 'q7',
          type: 'matching',
          question: 'Match the school types with their characteristics:',
          pairs: [
            { left: 'Grundschule', right: '1st to 4th grade' },
            { left: 'Hauptschule', right: 'ends after 9th grade' },
            { left: 'Realschule', right: 'ends after 10th grade' },
            { left: 'Gymnasium', right: 'prepares for university' }
          ],
          correctAnswer: ['Grundschule-1st to 4th grade', 'Hauptschule-ends after 9th grade', 'Realschule-ends after 10th grade', 'Gymnasium-prepares for university'],
          explanation: 'These are the main characteristics of each school type.'
        },
        {
          id: 'q8',
          type: 'true-false',
          question: 'Alle Schüler gehen nach der Grundschule auf dieselbe Schule.',
          correctAnswer: 'false',
          explanation: 'Es gibt verschiedene Schultypen: Gymnasium, Realschule und Hauptschule.'
        },
        {
          id: 'q9',
          type: 'short-answer',
          question: 'Was ist der kürzeste Bildungsweg?',
          correctAnswer: 'Hauptschule',
          explanation: 'Die Hauptschule ist der kürzeste Bildungsweg und endet nach der neunten Klasse.'
        },
        {
          id: 'q10',
          type: 'sentence-completion',
          question: 'Complete these sentences:',
          options: ['Das deutsche Schulsystem ist in mehrere _____ unterteilt.', 'Nach der Schule machen viele eine _____ in einem Betrieb.'],
          correctAnswer: ['Stufen', 'Ausbildung'],
          explanation: 'The school system has multiple levels, and many do apprenticeships after school.'
        }
      ]
    },
    {
      id: 'reading-3',
      title: 'Umweltschutz in Deutschland',
      difficulty: 'B2',
      topic: 'Environment',
      estimatedTime: 20,
      text: `Deutschland gilt als Vorreiter im Umweltschutz und in der nachhaltigen Entwicklung. Die Mülltrennung ist hier besonders ausgeprägt: Bürger sortieren ihren Abfall in verschiedene Kategorien wie Papier, Glas, Kunststoff und Biomüll. Das Pfandsystem für Flaschen und Dosen hat sich als sehr erfolgreich erwiesen und trägt zur Reduzierung von Verpackungsabfällen bei. Erneuerbare Energien spielen eine immer wichtigere Rolle in der deutschen Energiepolitik. Wind- und Solarenergie haben in den letzten Jahren stark zugenommen. Die Energiewende, der Übergang von fossilen Brennstoffen zu erneuerbaren Energien, ist ein zentrales Thema der deutschen Politik. Viele Deutsche fahren auch mit dem Fahrrad zur Arbeit oder nutzen öffentliche Verkehrsmittel, um die Umweltbelastung zu reduzieren.`,
      vocabulary: [
        { word: 'Vorreiter', meaning: 'pioneer' },
        { word: 'nachhaltige Entwicklung', meaning: 'sustainable development' },
        { word: 'ausgeprägt', meaning: 'pronounced/distinct' },
        { word: 'Pfandsystem', meaning: 'deposit system' },
        { word: 'erwiesen', meaning: 'proven' },
        { word: 'Verpackungsabfälle', meaning: 'packaging waste' },
        { word: 'Energiewende', meaning: 'energy transition' },
        { word: 'fossile Brennstoffe', meaning: 'fossil fuels' },
        { word: 'Umweltbelastung', meaning: 'environmental burden' }
      ],
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Welche Beziehung zwischen individuellen Handlungen und Umweltpolitik wird im Text impliziert?',
          options: [
            'Individuelle Handlungen sind völlig unabhängig von politischen Entscheidungen',
            'Bürgerverhalten und staatliche Politik verstärken sich gegenseitig im Umweltschutz',
            'Nur politische Maßnahmen sind wirklich relevant für den Umweltschutz',
            'Individuen handeln nur aus gesetzlichem Zwang, nicht aus Überzeugung'
          ],
          correctAnswer: 'Bürgerverhalten und staatliche Politik verstärken sich gegenseitig im Umweltschutz',
          explanation: 'Der Text zeigt sowohl staatliche Systeme (Pfandsystem, Energiewende) als auch individuelles Engagement (Mülltrennung, Fahrradfahren), was auf eine komplementäre Beziehung hindeutet.'
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          question: 'Warum erwähnt der Text verschiedene konkrete Beispiele (Mülltrennung, Pfandsystem, Energiewende)?',
          options: [
            'Um eine vollständige Liste aller Umweltmaßnahmen zu präsentieren',
            'Um die Vielschichtigkeit und Systematik des deutschen Umweltschutzes zu illustrieren',
            'Um zu zeigen, dass Deutschland perfekt ist',
            'Um andere Länder zu kritisieren'
          ],
          correctAnswer: 'Um die Vielschichtigkeit und Systematik des deutschen Umweltschutzes zu illustrieren',
          explanation: 'Die Beispiele decken verschiedene Bereiche ab (Abfall, Energie, Transport) und zeigen einen umfassenden systematischen Ansatz.'
        },
        {
          id: 'q3',
          type: 'multiple-choice',
          question: 'Was lässt sich über die kulturelle Einstellung der Deutschen zum Umweltschutz ableiten?',
          options: [
            'Umweltschutz wird nur widerwillig aus gesetzlicher Pflicht praktiziert',
            'Umweltbewusstsein ist tief in der Alltagskultur verankert und wird aktiv gelebt',
            'Nur die Regierung kümmert sich um Umweltschutz',
            'Deutsche interessieren sich nur für erneuerbare Energien'
          ],
          correctAnswer: 'Umweltbewusstsein ist tief in der Alltagskultur verankert und wird aktiv gelebt',
          explanation: 'Die Beschreibung alltäglicher Praktiken (Mülltrennung, Fahrradfahren) zeigt, dass Umweltschutz in das tägliche Leben integriert ist.'
        },
        {
          id: 'q4',
          type: 'multiple-choice',
          question: 'Welche Funktion hat das Pfandsystem im Kontext des Textes?',
          options: [
            'Es ist nur ein Beispiel für finanzielle Anreize',
            'Es zeigt, wie ökonomische Mechanismen Umweltziele unterstützen können',
            'Es beweist, dass Umweltschutz teuer ist',
            'Es ist das einzige wirksame Umweltschutzinstrument'
          ],
          correctAnswer: 'Es zeigt, wie ökonomische Mechanismen Umweltziele unterstützen können',
          explanation: 'Das Pfandsystem verbindet wirtschaftliche Anreize mit Umweltzielen und demonstriert einen pragmatischen Ansatz.'
        },
        {
          id: 'q5',
          type: 'multiple-choice',
          question: 'Was impliziert die Erwähnung der "Energiewende" als "zentrales Thema der deutschen Politik"?',
          options: [
            'Es ist eine temporäre politische Modeerscheinung',
            'Umweltschutz hat strategische Priorität in der nationalen Agenda',
            'Nur Politiker interessieren sich für erneuerbare Energien',
            'Die Energiewende ist bereits vollständig abgeschlossen'
          ],
          correctAnswer: 'Umweltschutz hat strategische Priorität in der nationalen Agenda',
          explanation: 'Die Bezeichnung als "zentrales Thema" deutet auf hohe politische Relevanz und langfristige strategische Bedeutung hin.'
        },
        {
          id: 'q6',
          type: 'matching',
          question: 'Match the German environmental terms with their English meanings:',
          pairs: [
            { left: 'Mülltrennung', right: 'waste separation' },
            { left: 'erneuerbare Energien', right: 'renewable energies' },
            { left: 'Umweltbelastung', right: 'environmental burden' },
            { left: 'nachhaltige Entwicklung', right: 'sustainable development' }
          ],
          correctAnswer: ['Mülltrennung-waste separation', 'erneuerbare Energien-renewable energies', 'Umweltbelastung-environmental burden', 'nachhaltige Entwicklung-sustainable development'],
          explanation: 'These are important environmental vocabulary terms.'
        },
        {
          id: 'q7',
          type: 'multiple-choice',
          question: 'Wie stellt der Text das Verhältnis zwischen Tradition und Fortschritt dar?',
          options: [
            'Deutschland hält an veralteten Methoden fest',
            'Der Text zeigt keine Verbindung zwischen beiden',
            'Etablierte Praktiken (Mülltrennung) koexistieren mit Innovation (erneuerbare Energien)',
            'Nur neue Technologien werden als wichtig dargestellt'
          ],
          correctAnswer: 'Etablierte Praktiken (Mülltrennung) koexistieren mit Innovation (erneuerbare Energien)',
          explanation: 'Der Text präsentiert sowohl bewährte Systeme als auch neue Entwicklungen als Teil eines integrierten Ansatzes.'
        },
        {
          id: 'q8',
          type: 'short-answer',
          question: 'Welche übergeordnete Botschaft vermittelt der Text über Deutschlands Rolle im internationalen Kontext?',
          correctAnswer: 'Vorreiter',
          explanation: 'Deutschland wird als "Vorreiter" dargestellt, was eine führende und beispielgebende Rolle impliziert.'
        },
        {
          id: 'q9',
          type: 'multiple-choice',
          question: 'Was lässt sich über die Effektivität des deutschen Ansatzes aus dem Text schließen?',
          options: [
            'Der Text kritisiert den Ansatz als ineffektiv',
            'Die Beispiele deuten auf einen funktionierenden, mehrdimensionalen Ansatz hin',
            'Es wird keine Bewertung der Effektivität vorgenommen',
            'Nur das Pfandsystem funktioniert, alles andere nicht'
          ],
          correctAnswer: 'Die Beispiele deuten auf einen funktionierenden, mehrdimensionalen Ansatz hin',
          explanation: 'Begriffe wie "sehr erfolgreich", "stark zugenommen" und die Darstellung als "Vorreiter" deuten auf Effektivität hin.'
        },
        {
          id: 'q10',
          type: 'fill-gaps',
          question: 'Complete the text about German environmental policy:',
          textWithGaps: 'Die _____ ist ein zentrales Thema der deutschen Politik. Es ist der Übergang von _____ Brennstoffen zu _____ Energien.',
          correctAnswer: ['Energiewende', 'fossilen', 'erneuerbaren'],
          explanation: 'This describes the energy transition policy in Germany.'
        }
      ]
    },
    {
      id: 'reading-4',
      title: 'Deutsche Küche und Essgewohnheiten',
      difficulty: 'A2',
      topic: 'Food & Culture',
      estimatedTime: 12,
      text: `Die deutsche Küche ist sehr vielfältig und regional unterschiedlich. Im Norden isst man gerne Fisch, besonders Herring und Lachs. In Bayern sind Weißwurst, Brezeln und Bier sehr beliebt. Die Deutschen trinken viel Kaffee, oft mit Kuchen am Nachmittag. Das nennt man "Kaffee und Kuchen". Zum Frühstück essen viele Deutsche Brot mit Butter, Marmelade oder Wurst. Das Mittagessen ist traditionell die Hauptmahlzeit des Tages. Viele Restaurants bieten ein günstiges Mittagsmenü an. Am Abend essen die Deutschen oft kalt: Brot, Käse, Wurst und Salat. Das heißt "Abendbrot".`,
      vocabulary: [
        { word: 'vielfältig', meaning: 'diverse' },
        { word: 'regional', meaning: 'regional' },
        { word: 'unterschiedlich', meaning: 'different' },
        { word: 'beliebt', meaning: 'popular' },
        { word: 'Hauptmahlzeit', meaning: 'main meal' },
        { word: 'günstig', meaning: 'affordable' },
        { word: 'anbieten', meaning: 'to offer' }
      ],
      questions: [
        {
          id: 'q1',
          type: 'fill-gaps',
          question: 'Complete the text about German food:',
          textWithGaps: 'Im Norden isst man gerne ____. In Bayern sind ____ sehr beliebt. Das Mittagessen ist traditionell die ____ des Tages.',
          correctAnswer: ['Fisch', 'Weißwurst', 'Hauptmahlzeit'],
          explanation: 'Diese Informationen stehen direkt im Text.'
        },
        {
          id: 'q2',
          type: 'true-false',
          question: 'Die Deutschen trinken am Nachmittag oft Kaffee mit Kuchen.',
          correctAnswer: 'true',
          explanation: 'Der Text erwähnt "Kaffee und Kuchen" am Nachmittag.'
        },
        {
          id: 'q3',
          type: 'multiple-choice',
          question: 'Was heißt "Abendbrot"?',
          options: ['Warmes Abendessen', 'Kaltes Abendessen', 'Frühstück', 'Mittagessen'],
          correctAnswer: 'Kaltes Abendessen',
          explanation: 'Abendbrot besteht aus Brot, Käse, Wurst und Salat - also kalte Speisen.'
        },
        {
          id: 'q4',
          type: 'fill-gaps',
          question: 'Complete the text about German eating habits:',
          textWithGaps: 'Die deutsche Küche ist sehr ____ und regional ____. In Bayern sind ____, Brezeln und Bier sehr beliebt.',
          correctAnswer: ['vielfältig', 'unterschiedlich', 'Weißwurst'],
          explanation: 'Diese Wörter beschreiben die Vielfalt der deutschen Küche.'
        },
        {
          id: 'q5',
          type: 'matching',
          question: 'Match the German food terms with their meanings:',
          pairs: [
            { left: 'Hauptmahlzeit', right: 'main meal' },
            { left: 'Abendbrot', right: 'cold evening meal' },
            { left: 'vielfältig', right: 'diverse' },
            { left: 'günstig', right: 'affordable' }
          ],
          correctAnswer: ['Hauptmahlzeit-main meal', 'Abendbrot-cold evening meal', 'vielfältig-diverse', 'günstig-affordable'],
          explanation: 'These are key food and dining vocabulary terms.'
        },
        {
          id: 'q6',
          type: 'true-false',
          question: 'Das Frühstück ist traditionell die Hauptmahlzeit in Deutschland.',
          correctAnswer: 'false',
          explanation: 'Das Mittagessen ist traditionell die Hauptmahlzeit des Tages.'
        },
        {
          id: 'q7',
          type: 'word-order',
          question: 'Put these meal times in order from earliest to latest:',
          scrambledWords: ['Abendbrot', 'Frühstück', 'Kaffee und Kuchen', 'Mittagessen'],
          correctAnswer: ['Frühstück', 'Mittagessen', 'Kaffee und Kuchen', 'Abendbrot'],
          explanation: 'This is the typical German daily meal schedule.'
        },
        {
          id: 'q8',
          type: 'multiple-choice',
          question: 'Was trinken die Deutschen oft am Nachmittag?',
          options: ['Tee', 'Bier', 'Kaffee', 'Wasser'],
          correctAnswer: 'Kaffee',
          explanation: 'Die Deutschen trinken am Nachmittag oft "Kaffee und Kuchen".'
        },
        {
          id: 'q9',
          type: 'short-answer',
          question: 'Welche Fische isst man gerne im Norden Deutschlands?',
          correctAnswer: 'Herring und Lachs',
          explanation: 'Der Text nennt speziell "Herring und Lachs" als beliebte Fische im Norden.'
        },
        {
          id: 'q10',
          type: 'sentence-completion',
          question: 'Complete these statements about German dining:',
          options: ['Viele Restaurants bieten ein günstiges _____ an.', 'Zum Frühstück essen viele Deutsche _____ mit Butter.'],
          correctAnswer: ['Mittagsmenü', 'Brot'],
          explanation: 'Restaurants offer lunch menus, and bread is a breakfast staple.'
        }
      ]
    },
    {
      id: 'reading-5',
      title: 'Die deutsche Geschichte: Die Berliner Mauer',
      difficulty: 'C1',
      topic: 'History',
      estimatedTime: 25,
      text: `Nach dem Zweiten Weltkrieg wurde Deutschland in vier Besatzungszonen aufgeteilt: amerikanisch, britisch, französisch und sowjetisch. Berlin, obwohl mitten in der sowjetischen Zone gelegen, wurde ebenfalls in vier Sektoren unterteilt. Die wachsenden Spannungen zwischen den westlichen Alliierten und der Sowjetunion führten 1949 zur Gründung zweier deutscher Staaten: der Bundesrepublik Deutschland im Westen und der Deutschen Demokratischen Republik im Osten. West-Berlin blieb eine Insel der Freiheit im sozialistischen Ostdeutschland. Millionen von Ostdeutschen flohen in den Westen, was die DDR-Regierung dazu veranlasste, am 13. August 1961 mit dem Bau der Berliner Mauer zu beginnen. Diese Mauer trennte Familien und Freunde für fast drei Jahrzehnte. Der Fall der Mauer am 9. November 1989 war ein historischer Moment, der zur deutschen Wiedervereinigung am 3. Oktober 1990 führte.`,
      vocabulary: [
        { word: 'Besatzungszone', meaning: 'occupation zone' },
        { word: 'aufteilen', meaning: 'to divide' },
        { word: 'Spannungen', meaning: 'tensions' },
        { word: 'Alliierte', meaning: 'Allies' },
        { word: 'Gründung', meaning: 'founding' },
        { word: 'veranlassen', meaning: 'to prompt/cause' },
        { word: 'trennen', meaning: 'to separate' },
        { word: 'Jahrzehnt', meaning: 'decade' },
        { word: 'Wiedervereinigung', meaning: 'reunification' }
      ],
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Welche tiefere Bedeutung trägt die Metapher "Insel der Freiheit" für West-Berlin im historischen Kontext?',
          options: [
            'West-Berlin war geographisch von Wasser umgeben',
            'Es symbolisiert die paradoxe Isolation eines freien Systems innerhalb eines autoritären Umfelds',
            'Es bedeutet, dass West-Berlin unabhängig von Deutschland war',
            'Die Metapher beschreibt nur die touristische Attraktivität'
          ],
          correctAnswer: 'Es symbolisiert die paradoxe Isolation eines freien Systems innerhalb eines autoritären Umfelds',
          explanation: 'Die Metapher verdeutlicht den Widerspruch: West-Berlin war demokratisch und frei, aber geographisch isoliert und umschlossen vom sozialistischen Einflussbereich - eine Freiheitsinsel im sozialistischen "Meer".'
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          question: 'Was impliziert der Text über die Motivation der DDR-Regierung zum Mauerbau?',
          options: [
            'Reine militärische Verteidigungsabsicht gegen westliche Angriffe',
            'Ein verzweifelter Versuch, die Delegitimierung durch Massenflucht zu stoppen',
            'Ausschließlich auf Befehl der Sowjetunion ohne eigene Motive',
            'Um die Wirtschaft Ostdeutschlands zu schützen'
          ],
          correctAnswer: 'Ein verzweifelter Versuch, die Delegitimierung durch Massenflucht zu stoppen',
          explanation: 'Der Text verbindet kausal die "Millionen von Ostdeutschen [die] flohen" mit dem Mauerbau - die massive Abwanderung stellte die Legitimität des DDR-Systems infrage und zwang die Regierung zu drastischen Maßnahmen.'
        },
        {
          id: 'q3',
          type: 'multiple-choice',
          question: 'Wie charakterisiert der Text die Entwicklung vom geteilten Deutschland zur Wiedervereinigung?',
          options: [
            'Als plötzlichen, unvorhersehbaren Bruch ohne Vorgeschichte',
            'Als logische Konsequenz unvermeidlicher ökonomischer Gesetze',
            'Als Prozess, in dem sich aufgestaute Spannungen schließlich entluden',
            'Als ausschließlich von außen erzwungene Veränderung'
          ],
          correctAnswer: 'Als Prozess, in dem sich aufgestaute Spannungen schließlich entluden',
          explanation: 'Der Text beschreibt "wachsende Spannungen", jahrzehntelange Trennung und massenhafte Fluchtbewegungen - all dies deutet auf einen Druckaufbau hin, der sich im Mauerfall entlud.'
        },
        {
          id: 'q4',
          type: 'multiple-choice',
          question: 'Welche Perspektive auf die deutsche Teilung nimmt der Text ein?',
          options: [
            'Eine primär geopolitische Analyse der Großmachtpolitik',
            'Eine ausschließlich ökonomische Betrachtung',
            'Eine Synthese aus geopolitischen Strukturen und menschlichen Konsequenzen',
            'Eine rein chronologische Aufzählung ohne analytische Perspektive'
          ],
          correctAnswer: 'Eine Synthese aus geopolitischen Strukturen und menschlichen Konsequenzen',
          explanation: 'Der Text verbindet systematische Faktoren (Besatzungszonen, Spannungen zwischen Alliierten) mit menschlichen Auswirkungen (getrennte Familien, Flucht) zu einem ganzheitlichen Bild.'
        },
        {
          id: 'q5',
          type: 'multiple-choice',
          question: 'Was sagt die Formulierung "veranlasste... zu beginnen" über das historische Agency der DDR-Regierung aus?',
          options: [
            'Die DDR handelte völlig autonom und selbstbestimmt',
            'Die DDR reagierte unter Zwang auf eine Situation, die ihre Existenz bedrohte',
            'Die Sowjetunion traf alle Entscheidungen',
            'Der Westen zwang die DDR zum Mauerbau'
          ],
          correctAnswer: 'Die DDR reagierte unter Zwang auf eine Situation, die ihre Existenz bedrohte',
          explanation: '"Veranlasste" impliziert reaktives Handeln unter Druck - die DDR wurde durch die Massenflucht zu einer Maßnahme gezwungen, die ihre Schwäche offenbarte statt Stärke zu demonstrieren.'
        },
        {
          id: 'q6',
          type: 'multiple-choice',
          question: 'Welche symbolische Bedeutung hat der zeitliche Abstand zwischen Mauerfall und Wiedervereinigung (11 Monate)?',
          options: [
            'Er war bedeutungslos, nur administrative Verzögerung',
            'Er zeigt die Komplexität der Zusammenführung zweier unterschiedlicher Systeme',
            'Er beweist Unwillen zur Wiedervereinigung',
            'Er war nur durch sowjetische Blockade verursacht'
          ],
          correctAnswer: 'Er zeigt die Komplexität der Zusammenführung zweier unterschiedlicher Systeme',
          explanation: 'Die Zeitspanne zwischen der emotionalen Euphorie des Mauerfalls und der formalen Wiedervereinigung deutet auf komplexe rechtliche, politische und praktische Herausforderungen bei der Integration hin.'
        },
        {
          id: 'q7',
          type: 'multiple-choice',
          question: 'Was impliziert die Darstellung der Mauer als etwas, das "Familien und Freunde trennte"?',
          options: [
            'Es war nur ein bauliches Hindernis',
            'Die ideologische Teilung durchschnitt organisch gewachsene soziale Strukturen',
            'Familien hatten sich bereits vor dem Mauerbau getrennt',
            'Die Trennung war freiwillig'
          ],
          correctAnswer: 'Die ideologische Teilung durchschnitt organisch gewachsene soziale Strukturen',
          explanation: 'Die Betonung persönlicher Beziehungen unterstreicht die Willkürlichkeit und Brutalität einer politischen Grenze, die natürliche menschliche Bindungen zerriss.'
        },
        {
          id: 'q8',
          type: 'multiple-choice',
          question: 'Wie kontextualisiert der Text die Berliner Mauer im größeren Kalten-Krieg-Narrativ?',
          options: [
            'Als isoliertes deutsches Phänomen ohne internationale Bedeutung',
            'Als physische Manifestation der globalen ideologischen Konfrontation',
            'Als militärisches Verteidigungsbauwerk',
            'Als wirtschaftliche Grenze'
          ],
          correctAnswer: 'Als physische Manifestation der globalen ideologischen Konfrontation',
          explanation: 'Die Mauer wird aus den "Spannungen zwischen den westlichen Alliierten und der Sowjetunion" hergeleitet - sie war lokaler Ausdruck eines weltweiten Systemkonflikts.'
        },
        {
          id: 'q9',
          type: 'matching',
          question: 'Match the historical terms with their meanings:',
          pairs: [
            { left: 'Besatzungszone', right: 'occupation zone' },
            { left: 'Alliierte', right: 'Allies' },
            { left: 'Wiedervereinigung', right: 'reunification' },
            { left: 'Jahrzehnt', right: 'decade' }
          ],
          correctAnswer: ['Besatzungszone-occupation zone', 'Alliierte-Allies', 'Wiedervereinigung-reunification', 'Jahrzehnt-decade'],
          explanation: 'These are key historical vocabulary terms.'
        },
        {
          id: 'q10',
          type: 'multiple-choice',
          question: 'Welche Erzählperspektive nimmt der Text bezüglich der historischen Kausalität ein?',
          options: [
            'Monokausal: Ein einzelner Faktor erklärt alles',
            'Multikausal: Verschiedene Faktoren (geopolitisch, ökonomisch, sozial) bedingten sich gegenseitig',
            'Zufällig: Ereignisse passierten ohne erkennbare Ursachen',
            'Deterministisch: Alles war unvermeidlich'
          ],
          correctAnswer: 'Multikausal: Verschiedene Faktoren (geopolitisch, ökonomisch, sozial) bedingten sich gegenseitig',
          explanation: 'Der Text webt Besatzungspolitik, ideologische Spannungen, Bevölkerungsbewegungen und politische Reaktionen zu einem komplexen Ursachengeflecht zusammen.'
        }
      ]
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedExercise && startTime && !showResults) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedExercise, startTime, showResults]);

  const generateCustomExercise = async () => {
    console.log('generateCustomExercise called');
    console.log('API Key configured:', !!process.env.REACT_APP_DEEPSEEK_API_KEY);
    console.log('Selected topic:', selectedTopic);
    console.log('Custom topic:', customTopic);
    console.log('Selected difficulty:', selectedDifficulty);
    console.log('Selected text length:', selectedTextLength);

    // Check if API key is configured
    if (!process.env.REACT_APP_DEEPSEEK_API_KEY) {
      console.error('API key not configured');
      alert('DeepSeek API key is not configured. Please set REACT_APP_DEEPSEEK_API_KEY in your environment variables.');
      return;
    }

    // Determine the final topic to use
    const finalTopic = selectedTopic === 'custom' ? customTopic : selectedTopic;
    console.log('Final topic to use:', finalTopic);
    
    if (!finalTopic.trim()) {
      console.error('No topic provided');
      alert('Please select a topic or enter a custom topic.');
      return;
    }

    setIsGenerating(true);
    setShowCustomGenerator(false);
    
    try {
      console.log('Calling deepseekApi.generateReadingExercise with:', {
        topic: finalTopic,
        difficulty: selectedDifficulty,
        textLength: selectedTextLength
      });

      const generatedExercise = await deepseekApi.generateReadingExercise(
        finalTopic,
        selectedDifficulty,
        selectedTextLength
      );
      
      console.log('Generated exercise:', generatedExercise);
      
      // Convert API response to component format
      const newExercise: ReadingExercise = {
        id: generatedExercise.id,
        title: generatedExercise.title,
        difficulty: generatedExercise.difficulty,
        topic: finalTopic,
        text: generatedExercise.text,
        vocabulary: generatedExercise.vocabulary,
        questions: generatedExercise.questions,
        estimatedTime: generatedExercise.estimatedTime
      };

      console.log('Converted exercise:', newExercise);
      setDynamicExercises(prev => [...prev, newExercise]);
      handleExerciseSelect(newExercise);
      console.log('Exercise added and selected successfully');
    } catch (error) {
      console.error('Failed to generate custom exercise:', error);
      alert(`Failed to generate exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomExercise = async () => {
    // Check if API key is configured by looking at environment variable
    if (!process.env.REACT_APP_DEEPSEEK_API_KEY) {
      alert('DeepSeek API key is not configured. Please set REACT_APP_DEEPSEEK_API_KEY in your environment variables.');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate random parameters
      const difficulties: Array<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'> = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const textLengths: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long'];
      
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const randomTextLength = textLengths[Math.floor(Math.random() * textLengths.length)];

      const generatedExercise = await deepseekApi.generateReadingExercise('', randomDifficulty, randomTextLength);
      
      // Convert API response to component format
      const newExercise: ReadingExercise = {
        id: generatedExercise.id,
        title: generatedExercise.title,
        difficulty: generatedExercise.difficulty,
        topic: generatedExercise.topic,
        text: generatedExercise.text,
        vocabulary: generatedExercise.vocabulary,
        questions: generatedExercise.questions,
        estimatedTime: generatedExercise.estimatedTime
      };

      setDynamicExercises(prev => [...prev, newExercise]);
      handleExerciseSelect(newExercise);
    } catch (error) {
      console.error('Failed to generate exercise:', error);
      alert('Failed to generate exercise. Please check your API configuration and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const allExercises = [...exercises, ...dynamicExercises];

  const handleExerciseSelect = (exercise: ReadingExercise) => {
    setSelectedExercise(exercise);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setShowHints(false);
    setStartTime(new Date());
    setElapsedTime(0);
    setMatchingAnswers({});
    setDraggedWords([]);
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (selectedExercise && currentQuestionIndex < selectedExercise.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAnswers = () => {
    if (!selectedExercise) return;

    let correctAnswers = 0;
    selectedExercise.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;
      
      if (question.type === 'short-answer') {
        const userStr = typeof userAnswer === 'string' ? userAnswer.toLowerCase().trim() : '';
        const correctStr = typeof correctAnswer === 'string' ? correctAnswer.toLowerCase().trim() : '';
        if (userStr && correctStr.includes(userStr)) {
          correctAnswers++;
        }
      } else if (question.type === 'fill-gaps' || question.type === 'sentence-completion') {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const userAnswers = userAnswer.map(a => a.toLowerCase().trim());
          const correctAnswers_local = correctAnswer.map(a => a.toLowerCase().trim());
          let matches = 0;
          correctAnswers_local.forEach((correct, index) => {
            if (userAnswers[index] && correct.includes(userAnswers[index])) {
              matches++;
            }
          });
          if (matches === correctAnswers_local.length) {
            correctAnswers++;
          }
        }
      } else if (question.type === 'matching') {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const userSet = new Set(userAnswer);
          const correctSet = new Set(correctAnswer);
          if (userSet.size === correctSet.size && Array.from(userSet).every(x => correctSet.has(x))) {
            correctAnswers++;
          }
        }
      } else if (question.type === 'word-order') {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)) {
            correctAnswers++;
          }
        }
      } else {
        const userStr = typeof userAnswer === 'string' ? userAnswer.toLowerCase().trim() : '';
        const correctStr = typeof correctAnswer === 'string' ? correctAnswer.toLowerCase().trim() : '';
        if (userStr === correctStr) {
          correctAnswers++;
        }
      }
    });

    const calculatedScore = Math.round((correctAnswers / selectedExercise.questions.length) * 100);
    setScore(calculatedScore);
    setShowResults(true);

    if (calculatedScore >= 70) {
      if (onComplete) {
        onComplete(selectedExercise.id, calculatedScore);
      }
    }
  };

  const resetExercise = () => {
    setSelectedExercise(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setShowHints(false);
    setStartTime(null);
    setElapsedTime(0);
    setMatchingAnswers({});
    setDraggedWords([]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'A1': '#4caf50',
      'A2': '#8bc34a', 
      'B1': '#ff9800',
      'B2': '#f44336',
      'C1': '#9c27b0',
      'C2': '#3f51b5'
    };
    return colors[difficulty as keyof typeof colors] || '#757575';
  };

  const highlightText = (text: string) => {
    if (!highlightMode) return text;
    
    const vocabulary = selectedExercise?.vocabulary || [];
    let highlightedText = text;
    
    vocabulary.forEach(({ word }) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<mark style="background-color: #ffeb3b; padding: 1px 3px; border-radius: 3px;">${word}</mark>`);
    });
    
    return highlightedText;
  };

  return (
    <Box>
      {/* Main Content */}
      {!selectedExercise && (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <BookOpenIcon sx={{ fontSize: 40, mr: 2, color: '#1976d2' }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              Reading Practice
            </Typography>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Improve your German reading comprehension with interactive texts and questions.
          </Typography>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<TuneIcon />}
              onClick={() => {
                console.log('Create Custom Exercise button clicked');
                console.log('Current showCustomGenerator state:', showCustomGenerator);
                setShowCustomGenerator(true);
                console.log('setShowCustomGenerator(true) called');
              }}
              disabled={isGenerating}
              sx={{ 
                background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #05c294 0%, #2ec486 100%)' }
              }}
            >
              Create Custom Exercise
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<AIIcon />}
              onClick={generateRandomExercise}
              disabled={isGenerating}
              sx={{ 
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': { 
                  borderColor: '#5a6fd8',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            >
              {isGenerating ? 'Generating...' : 'Random AI Exercise'}
            </Button>
            
            {!process.env.REACT_APP_DEEPSEEK_API_KEY && (
              <Alert severity="info" sx={{ flex: 1 }}>
                Set REACT_APP_DEEPSEEK_API_KEY environment variable to enable AI exercise generation
              </Alert>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {allExercises.map((exercise) => (
              <Card 
                key={exercise.id}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
                  },
                  border: completedExercises.has(exercise.id) ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  position: 'relative'
                }}
                onClick={() => handleExerciseSelect(exercise)}
              >
                {completedExercises.has(exercise.id) && (
                  <CheckIcon 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      color: '#4caf50',
                      fontSize: 30
                    }} 
                  />
                )}
                
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip 
                      label={exercise.difficulty}
                      size="small"
                      sx={{ 
                        backgroundColor: getDifficultyColor(exercise.difficulty),
                        color: 'white',
                        fontWeight: 'bold',
                        mr: 1
                      }}
                    />
                    <Chip 
                      label={exercise.topic}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    {exercise.id.startsWith('generated-') && (
                      <Chip 
                        label="AI Generated"
                        size="small"
                        icon={<AIIcon sx={{ fontSize: 14 }} />}
                        sx={{ 
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          mr: 1
                        }}
                      />
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                      <TimerIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {exercise.estimatedTime} min
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {exercise.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {exercise.text.substring(0, 120)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {exercise.questions.length} questions
                    </Typography>
                    <Button variant="contained" size="small">
                      Start Reading
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Results View */}
      {selectedExercise && showResults && (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h4" sx={{ mb: 3, color: score >= 70 ? '#4caf50' : '#f44336' }}>
            {score >= 70 ? '🎉 Excellent!' : '📚 Keep Practicing!'}
          </Typography>
          
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
            {score}%
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
            Time taken: {formatTime(elapsedTime)}
          </Typography>

          <LinearProgress 
            variant="determinate" 
            value={score} 
            sx={{ 
              mb: 4, 
              height: 10, 
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                backgroundColor: score >= 70 ? '#4caf50' : '#f44336'
              }
            }} 
          />

          <Alert severity={score >= 70 ? "success" : "info"} sx={{ mb: 3, textAlign: 'left' }}>
            {score >= 70 
              ? "Great job! You've mastered this reading exercise."
              : "Good effort! Review the text and try again to improve your comprehension."
            }
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={resetExercise}>
              Choose Another Text
            </Button>
            <Button variant="contained" onClick={() => handleExerciseSelect(selectedExercise)}>
              Try Again
            </Button>
          </Box>
        </Card>
        </Box>
      )}

      {/* Exercise View */}
      {selectedExercise && !showResults && (() => {
        const currentQuestion = selectedExercise.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / selectedExercise.questions.length) * 100;
        
        return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {selectedExercise.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={selectedExercise.difficulty}
              size="small"
              sx={{ 
                backgroundColor: getDifficultyColor(selectedExercise.difficulty),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            <Chip label={selectedExercise.topic} size="small" variant="outlined" />
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <TimerIcon sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2">{formatTime(elapsedTime)}</Typography>
            </Box>
          </Box>
        </Box>
        <Button variant="outlined" onClick={resetExercise}>
          Back to List
        </Button>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            Question {currentQuestionIndex + 1} of {selectedExercise.questions.length}
          </Typography>
          <Typography variant="body2">{Math.round(progress)}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Reading Text */}
        <Card sx={{ p: 3, height: 'fit-content' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Reading Text</Typography>
            <Box>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showVocabulary}
                      onChange={(e) => setShowVocabulary(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Vocabulary"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={highlightMode}
                      onChange={(e) => setHighlightMode(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Highlights"
                />
              </FormGroup>
            </Box>
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.8, 
              fontSize: '1.1rem',
              mb: showVocabulary ? 3 : 0
            }}
            dangerouslySetInnerHTML={{ __html: highlightText(selectedExercise.text) }}
          />

          <Collapse in={showVocabulary}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Vocabulary</Typography>
            <List dense>
              {selectedExercise.vocabulary?.map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mr: 2 }}>
                          {item.word}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.meaning}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Card>

        {/* Question */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {currentQuestion.question}
          </Typography>

          {currentQuestion.type === 'multiple-choice' && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options?.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {currentQuestion.type === 'true-false' && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              >
                <FormControlLabel value="true" control={<Radio />} label="Wahr (True)" />
                <FormControlLabel value="false" control={<Radio />} label="Falsch (False)" />
              </RadioGroup>
            </FormControl>
          )}

          {currentQuestion.type === 'short-answer' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Type your answer here..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            />
          )}

          {currentQuestion.type === 'fill-gaps' && currentQuestion.textWithGaps && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                Fill in the gaps below:
              </Typography>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  {currentQuestion.textWithGaps.split('____').map((part, index, arr) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < arr.length - 1 && (
                        <TextField
                          variant="outlined"
                          size="small"
                          sx={{ mx: 1, minWidth: '120px' }}
                          placeholder={`Gap ${index + 1}`}
                          value={(answers[currentQuestion.id] as string[])?.[index] || ''}
                          onChange={(e) => {
                            const newAnswers = [...((answers[currentQuestion.id] as string[]) || [])];
                            newAnswers[index] = e.target.value;
                            handleAnswerChange(currentQuestion.id, newAnswers);
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </Typography>
              </Paper>
            </Box>
          )}

          {currentQuestion.type === 'sentence-completion' && currentQuestion.options && (
            <Box>
              {currentQuestion.options.map((sentence, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {sentence.replace('_____', '______')}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Complete the sentence..."
                    value={(answers[currentQuestion.id] as string[])?.[index] || ''}
                    onChange={(e) => {
                      const newAnswers = [...((answers[currentQuestion.id] as string[]) || [])];
                      newAnswers[index] = e.target.value;
                      handleAnswerChange(currentQuestion.id, newAnswers);
                    }}
                    sx={{ mb: 1 }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {currentQuestion.type === 'matching' && currentQuestion.pairs && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Match the German words with their English meanings:
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    German
                  </Typography>
                  {currentQuestion.pairs.map((pair, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 1, backgroundColor: '#e3f2fd' }}>
                      <Typography variant="body2">{pair.left}</Typography>
                    </Paper>
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    English
                  </Typography>
                  {currentQuestion.pairs.map((pair, index) => (
                    <Autocomplete
                      key={index}
                      options={currentQuestion.pairs?.map(p => p.right) || []}
                      value={matchingAnswers[pair.left] || null}
                      onChange={(event, newValue) => {
                        setMatchingAnswers(prev => ({
                          ...prev,
                          [pair.left]: newValue || ''
                        }));
                        
                        // Update main answers
                        const matches = Object.entries({ ...matchingAnswers, [pair.left]: newValue || '' })
                          .map(([german, english]) => `${german}-${english}`);
                        handleAnswerChange(currentQuestion.id, matches);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Select meaning..."
                          sx={{ mb: 1 }}
                        />
                      )}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {currentQuestion.type === 'word-order' && currentQuestion.scrambledWords && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Drag and drop the words to form the correct sentence:
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Available words:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {currentQuestion.scrambledWords
                    .filter(word => !draggedWords.includes(word))
                    .map((word, index) => (
                      <Chip
                        key={index}
                        label={word}
                        onClick={() => {
                          const newDraggedWords = [...draggedWords, word];
                          setDraggedWords(newDraggedWords);
                          handleAnswerChange(currentQuestion.id, newDraggedWords);
                        }}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#e0e0e0' }
                        }}
                      />
                    ))}
                </Stack>
              </Box>

              <Box sx={{ minHeight: '60px', border: '2px dashed #ccc', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Your sentence:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {draggedWords.map((word, index) => (
                    <Chip
                      key={index}
                      label={word}
                      onDelete={() => {
                        const newDraggedWords = draggedWords.filter((_, i) => i !== index);
                        setDraggedWords(newDraggedWords);
                        handleAnswerChange(currentQuestion.id, newDraggedWords);
                      }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            </Box>
          )}

          {showHints && currentQuestion.explanation && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Hint:</strong> {currentQuestion.explanation}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Button
              startIcon={<LightbulbIcon />}
              onClick={() => setShowHints(!showHints)}
              size="small"
            >
              {showHints ? 'Hide Hint' : 'Show Hint'}
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outlined"
                size="small"
              >
                Previous
              </Button>
              
              {currentQuestionIndex < selectedExercise.questions.length - 1 ? (
                <Button 
                  onClick={handleNextQuestion}
                  variant="contained"
                  size="small"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmitAnswers}
                  variant="contained"
                  color="success"
                  size="small"
                >
                  Submit Answers
                </Button>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
        );
      })()}

      {/* Custom Exercise Generation Modal - Outside main container */}
      <Dialog
        open={showCustomGenerator}
        onClose={() => {
          console.log('Modal close button clicked');
          setShowCustomGenerator(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TuneIcon />
          Create Custom Reading Exercise
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {/* Topic Selection */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                📚 Select Topic
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Choose a topic</InputLabel>
                <Select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  label="Choose a topic"
                >
                  {predefinedTopics.map((topic) => (
                    <MenuItem key={topic} value={topic}>
                      {topic}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AddIcon fontSize="small" />
                      Custom Topic
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {selectedTopic === 'custom' && (
                <TextField
                  fullWidth
                  label="Enter your custom topic"
                  placeholder="e.g., German renewable energy, Berlin nightlife, German automotive industry..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            {/* Difficulty Selection */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                🎯 Difficulty Level
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Select difficulty</InputLabel>
                <Select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')}
                  label="Select difficulty"
                >
                  <MenuItem value="A1">A1 - Beginner (Basic phrases and vocabulary)</MenuItem>
                  <MenuItem value="A2">A2 - Elementary (Simple texts about familiar topics)</MenuItem>
                  <MenuItem value="B1">B1 - Intermediate (Complex sentences and tenses)</MenuItem>
                  <MenuItem value="B2">B2 - Upper-Intermediate (Abstract concepts and advanced grammar)</MenuItem>
                  <MenuItem value="C1">C1 - Advanced (Sophisticated vocabulary and complex structures)</MenuItem>
                  <MenuItem value="C2">C2 - Proficiency (Nuanced language and idiomatic expressions)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Text Length Selection */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                📏 Text Length
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Select text length</InputLabel>
                <Select
                  value={selectedTextLength}
                  onChange={(e) => setSelectedTextLength(e.target.value as 'short' | 'medium' | 'long')}
                  label="Select text length"
                >
                  <MenuItem value="short">Short (150-200 words, ~8-10 min)</MenuItem>
                  <MenuItem value="medium">Medium (250-350 words, ~12-15 min)</MenuItem>
                  <MenuItem value="long">Long (400-500 words, ~18-25 min)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Preview Information */}
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                📋 Exercise Preview:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Topic:</strong> {selectedTopic === 'custom' ? (customTopic || 'Enter custom topic above') : (selectedTopic || 'Select a topic above')}
                </Typography>
                <Typography variant="body2">
                  <strong>Level:</strong> {selectedDifficulty}
                </Typography>
                <Typography variant="body2">
                  <strong>Length:</strong> {selectedTextLength} ({
                    selectedTextLength === 'short' ? '150-200 words' :
                    selectedTextLength === 'medium' ? '250-350 words' : '400-500 words'
                  })
                </Typography>
                <Typography variant="body2">
                  <strong>Questions:</strong> 10 mixed question types (multiple choice, fill-gaps, matching, etc.)
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowCustomGenerator(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={generateCustomExercise}
            variant="contained"
            startIcon={<AIIcon />}
            disabled={isGenerating || (!selectedTopic || (selectedTopic === 'custom' && !customTopic.trim()))}
            sx={{ 
              background: 'linear-gradient(135deg, #06d6a0 0%, #34d399 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #05c294 0%, #2ec486 100%)' }
            }}
          >
            {isGenerating ? 'Generating Exercise...' : 'Generate Exercise'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReadingPractice;
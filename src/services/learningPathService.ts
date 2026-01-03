export interface LearningUnit {
  id: string;
  title: string;
  description: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing';
  prerequisites: string[]; // IDs of units that must be completed first
  estimatedTimeMinutes: number;
  vocabularyWords: string[]; // German words to be learned
  grammarTopics: string[];
  exercises: Exercise[];
  isCompleted: boolean;
  progress: number; // 0-100
  unlocked: boolean;
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'translation' | 'speaking' | 'listening' | 'writing';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  audioUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  totalUnits: number;
  completedUnits: number;
  estimatedWeeks: number;
  units: LearningUnit[];
  skills: {
    vocabulary: number; // 0-100
    grammar: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
}

export class LearningPathService {
  private static readonly LEARNING_PATHS: Omit<LearningPath, 'completedUnits' | 'skills'>[] = [
    {
      id: 'a1_beginner',
      name: 'German A1 - Complete Beginner',
      description: 'Start your German journey! Learn basic greetings, numbers, and everyday phrases.',
      cefrLevel: 'A1',
      totalUnits: 12,
      estimatedWeeks: 6,
      units: [
        {
          id: 'a1_greetings',
          title: 'Greetings and Introductions',
          description: 'Learn how to greet people and introduce yourself in German',
          cefrLevel: 'A1',
          category: 'vocabulary',
          prerequisites: [],
          estimatedTimeMinutes: 30,
          vocabularyWords: ['Hallo', 'Guten Morgen', 'Auf Wiedersehen', 'Wie heißen Sie?', 'Ich heiße', 'Danke', 'Bitte'],
          grammarTopics: ['Personal Pronouns', 'Present Tense of "sein" (to be)'],
          exercises: [
            {
              id: 'greet_1',
              type: 'multiple-choice',
              question: 'How do you say "Good morning" in German?',
              options: ['Guten Tag', 'Guten Morgen', 'Gute Nacht', 'Auf Wiedersehen'],
              correctAnswer: 'Guten Morgen',
              difficulty: 'easy'
            },
            {
              id: 'greet_2',
              type: 'translation',
              question: 'Translate: "My name is Anna"',
              correctAnswer: 'Ich heiße Anna',
              difficulty: 'medium'
            }
          ],
          isCompleted: false,
          progress: 0,
          unlocked: true
        },
        {
          id: 'a1_numbers',
          title: 'Numbers 1-100',
          description: 'Master German numbers from 1 to 100',
          cefrLevel: 'A1',
          category: 'vocabulary',
          prerequisites: ['a1_greetings'],
          estimatedTimeMinutes: 45,
          vocabularyWords: ['eins', 'zwei', 'drei', 'vier', 'fünf', 'zehn', 'zwanzig', 'hundert'],
          grammarTopics: ['Number Formation Rules'],
          exercises: [
            {
              id: 'num_1',
              type: 'multiple-choice',
              question: 'What is "15" in German?',
              options: ['fünfzehn', 'vierzehn', 'sechzehn', 'dreizehn'],
              correctAnswer: 'fünfzehn',
              difficulty: 'medium'
            }
          ],
          isCompleted: false,
          progress: 0,
          unlocked: false
        },
        {
          id: 'a1_family',
          title: 'Family Members',
          description: 'Learn vocabulary related to family relationships',
          cefrLevel: 'A1',
          category: 'vocabulary',
          prerequisites: ['a1_greetings'],
          estimatedTimeMinutes: 40,
          vocabularyWords: ['Familie', 'Mutter', 'Vater', 'Bruder', 'Schwester', 'Großmutter', 'Großvater'],
          grammarTopics: ['Possessive Pronouns (mein, dein)'],
          exercises: [],
          isCompleted: false,
          progress: 0,
          unlocked: false
        }
      ]
    },
    {
      id: 'a2_elementary',
      name: 'German A2 - Elementary',
      description: 'Build on your basics with more complex grammar and expanded vocabulary.',
      cefrLevel: 'A2',
      totalUnits: 15,
      estimatedWeeks: 8,
      units: [
        {
          id: 'a2_past_tense',
          title: 'Past Tense (Perfekt)',
          description: 'Learn to talk about past events using the perfect tense',
          cefrLevel: 'A2',
          category: 'grammar',
          prerequisites: ['a1_greetings', 'a1_numbers'],
          estimatedTimeMinutes: 60,
          vocabularyWords: ['haben', 'sein', 'gemacht', 'gesagt', 'gegangen', 'gekommen'],
          grammarTopics: ['Perfect Tense Formation', 'Auxiliary Verbs haben/sein'],
          exercises: [],
          isCompleted: false,
          progress: 0,
          unlocked: false
        }
      ]
    },
    {
      id: 'b1_intermediate',
      name: 'German B1 - Intermediate',
      description: 'Develop fluency with complex grammar and practical communication skills.',
      cefrLevel: 'B1',
      totalUnits: 18,
      estimatedWeeks: 12,
      units: [
        {
          id: 'b1_subjunctive',
          title: 'Subjunctive Mood (Konjunktiv II)',
          description: 'Express hypothetical situations and polite requests',
          cefrLevel: 'B1',
          category: 'grammar',
          prerequisites: ['a2_past_tense'],
          estimatedTimeMinutes: 75,
          vocabularyWords: ['würde', 'könnte', 'sollte', 'hätte', 'wäre'],
          grammarTopics: ['Konjunktiv II Formation', 'Conditional Sentences'],
          exercises: [],
          isCompleted: false,
          progress: 0,
          unlocked: false
        }
      ]
    }
  ];

  static async getUserLearningPaths(userId: string): Promise<LearningPath[]> {
    // Get user progress and determine available paths
    // For now, return all paths with progress calculated
    
    return this.LEARNING_PATHS.map(path => {
      // Calculate completed units and skills (simplified for demo)
      const completedUnits = Math.floor(Math.random() * path.totalUnits); // Mock data
      
      return {
        ...path,
        completedUnits,
        skills: {
          vocabulary: Math.min(completedUnits * 8, 100),
          grammar: Math.min(completedUnits * 6, 100),
          speaking: Math.min(completedUnits * 5, 100),
          listening: Math.min(completedUnits * 5, 100),
          reading: Math.min(completedUnits * 7, 100),
          writing: Math.min(completedUnits * 4, 100)
        }
      };
    });
  }

  static async getRecommendedPath(userId: string, userLevel?: string): Promise<LearningPath | null> {
    const paths = await this.getUserLearningPaths(userId);
    
    // If user level is specified, find the appropriate path
    if (userLevel) {
      const path = paths.find(p => p.cefrLevel === userLevel);
      return path || null;
    }

    // Otherwise, recommend based on progress (simplified logic)
    return paths.find(p => p.completedUnits < p.totalUnits) || paths[0];
  }

  static async getLearningUnit(pathId: string, unitId: string): Promise<LearningUnit | null> {
    const path = this.LEARNING_PATHS.find(p => p.id === pathId);
    if (!path) return null;

    const unit = path.units.find(u => u.id === unitId);
    return unit || null;
  }

  static async updateUnitProgress(userId: string, pathId: string, unitId: string, progress: number): Promise<void> {
    // In a real implementation, this would update the database
    console.log(`Updated unit ${unitId} in path ${pathId} for user ${userId}: ${progress}%`);
    
    // Unlock next units if this one is completed
    if (progress >= 100) {
      await this.unlockNextUnits(userId, pathId, unitId);
    }
  }

  private static async unlockNextUnits(userId: string, pathId: string, completedUnitId: string): Promise<void> {
    const path = this.LEARNING_PATHS.find(p => p.id === pathId);
    if (!path) return;

    // Find units that have the completed unit as a prerequisite
    const unitsToUnlock = path.units.filter(unit => 
      unit.prerequisites.includes(completedUnitId) && !unit.unlocked
    );

    for (const unit of unitsToUnlock) {
      // Check if all prerequisites are completed
      const allPrereqsCompleted = unit.prerequisites.every(prereqId => {
        const prereqUnit = path.units.find(u => u.id === prereqId);
        return prereqUnit?.isCompleted;
      });

      if (allPrereqsCompleted) {
        unit.unlocked = true;
        console.log(`Unlocked unit: ${unit.title}`);
      }
    }
  }

  static async getNextRecommendedUnit(userId: string, currentLevel?: string): Promise<LearningUnit | null> {
    const recommendedPath = await this.getRecommendedPath(userId, currentLevel);
    if (!recommendedPath) return null;

    // Find the first unlocked, incomplete unit
    const nextUnit = recommendedPath.units.find(unit => 
      unit.unlocked && !unit.isCompleted
    );

    return nextUnit || null;
  }

  static async generatePersonalizedExercises(userId: string, unitId: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<Exercise[]> {
    // This would integrate with the AI service to generate personalized exercises
    // For now, return mock exercises
    
    return [
      {
        id: 'pers_1',
        type: 'multiple-choice',
        question: 'Choose the correct article for "Haus" (house):',
        options: ['der', 'die', 'das'],
        correctAnswer: 'das',
        explanation: '"Haus" is neuter, so it takes "das"',
        difficulty
      },
      {
        id: 'pers_2',
        type: 'translation',
        question: 'Translate: "I am learning German"',
        correctAnswer: 'Ich lerne Deutsch',
        difficulty
      }
    ];
  }

  static async getUnitExercises(pathId: string, unitId: string, userId?: string): Promise<Exercise[]> {
    const unit = await this.getLearningUnit(pathId, unitId);
    if (!unit) return [];

    // Return unit exercises, potentially personalized for the user
    return unit.exercises;
  }

  static async completeExercise(userId: string, exerciseId: string, userAnswer: string): Promise<{
    correct: boolean;
    explanation?: string;
    nextExercise?: Exercise;
  }> {
    // Mock implementation - in reality, this would check the answer and update progress
    const correct = Math.random() > 0.3; // 70% success rate for demo
    
    return {
      correct,
      explanation: correct ? 'Well done!' : 'Try again. Remember the grammar rule.',
      nextExercise: undefined // Could return a follow-up exercise
    };
  }

  static getCEFRLevelInfo(level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') {
    const levelInfo = {
      'A1': {
        name: 'Beginner',
        description: 'Can understand and use familiar everyday expressions and very basic phrases.',
        vocabularyTarget: 500,
        color: '#4caf50'
      },
      'A2': {
        name: 'Elementary',
        description: 'Can communicate in simple and routine tasks requiring a direct exchange of information.',
        vocabularyTarget: 1000,
        color: '#8bc34a'
      },
      'B1': {
        name: 'Intermediate',
        description: 'Can deal with most situations likely to arise whilst travelling in German-speaking areas.',
        vocabularyTarget: 2000,
        color: '#ff9800'
      },
      'B2': {
        name: 'Upper Intermediate',
        description: 'Can interact with a degree of fluency and spontaneity with native speakers.',
        vocabularyTarget: 4000,
        color: '#ff5722'
      },
      'C1': {
        name: 'Advanced',
        description: 'Can express ideas fluently and spontaneously without much obvious searching for expressions.',
        vocabularyTarget: 8000,
        color: '#9c27b0'
      },
      'C2': {
        name: 'Proficient',
        description: 'Can understand virtually everything heard or read with ease.',
        vocabularyTarget: 15000,
        color: '#673ab7'
      }
    };

    return levelInfo[level];
  }

  static async getSkillAssessment(userId: string): Promise<{
    recommendedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  }> {
    // This would be a comprehensive skill assessment
    // For now, return mock data
    
    return {
      recommendedLevel: 'A2',
      strengths: ['Vocabulary recognition', 'Basic grammar'],
      weaknesses: ['Speaking fluency', 'Complex grammar'],
      suggestions: [
        'Practice speaking with native speakers',
        'Focus on subjunctive mood exercises',
        'Expand vocabulary in professional contexts'
      ]
    };
  }
}
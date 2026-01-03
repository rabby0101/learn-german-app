import { userDB, User, Session } from './userDatabase';
import { vocabularyDB, VocabularyDBWord } from './vocabularyDatabase';

export interface DailyProgress {
  date: string;
  wordsStudied: number;
  wordsLearned: number;
  grammarTopicsReviewed: number;
  studyTimeMinutes: number;
  exercisesCompleted: number;
  skillsImproved: string[];
  streakDay: number;
}

export interface WeeklyStats {
  weekStart: string;
  totalStudyTime: number;
  wordsLearned: number;
  grammarTopicsCompleted: number;
  averageDailyTime: number;
  daysStudied: number;
  skillProgress: {
    vocabulary: number;
    grammar: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
}

export interface LearningAnalytics {
  totalWords: number;
  masteredWords: number;
  wordsInProgress: number;
  averageRetentionRate: number;
  mostDifficultTopics: string[];
  strongestSkills: string[];
  weakestSkills: string[];
  learningVelocity: number; // words per week
  projectedFluencyDate: string;
  currentCEFRLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  nextLevelProgress: number; // percentage to next level
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  dateUnlocked?: string;
  progress?: number;
  maxProgress?: number;
}

export class ProgressTrackingService {
  private static readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_word',
      title: 'First Steps',
      description: 'Master your first German word',
      icon: '🌟',
      condition: 'mastered_words >= 1',
      maxProgress: 1
    },
    {
      id: 'vocab_beginner',
      title: 'Vocabulary Beginner',
      description: 'Master 50 German words',
      icon: '📚',
      condition: 'mastered_words >= 50',
      maxProgress: 50
    },
    {
      id: 'vocab_intermediate',
      title: 'Vocabulary Intermediate',
      description: 'Master 200 German words',
      icon: '📖',
      condition: 'mastered_words >= 200',
      maxProgress: 200
    },
    {
      id: 'vocab_advanced',
      title: 'Vocabulary Advanced',
      description: 'Master 500 German words',
      icon: '🏆',
      condition: 'mastered_words >= 500',
      maxProgress: 500
    },
    {
      id: 'streak_week',
      title: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: '🔥',
      condition: 'current_streak >= 7',
      maxProgress: 7
    },
    {
      id: 'streak_month',
      title: 'Month Master',
      description: 'Study for 30 consecutive days',
      icon: '💪',
      condition: 'current_streak >= 30',
      maxProgress: 30
    },
    {
      id: 'grammar_explorer',
      title: 'Grammar Explorer',
      description: 'Complete 10 grammar topics',
      icon: '⚗️',
      condition: 'grammar_topics >= 10',
      maxProgress: 10
    },
    {
      id: 'speed_learner',
      title: 'Speed Learner',
      description: 'Learn 20 words in a single day',
      icon: '⚡',
      condition: 'words_learned_today >= 20',
      maxProgress: 20
    },
    {
      id: 'dedicated_learner',
      title: 'Dedicated Learner',
      description: 'Study for 100 total hours',
      icon: '🎯',
      condition: 'total_study_hours >= 100',
      maxProgress: 100
    },
    {
      id: 'fluency_seeker',
      title: 'Fluency Seeker',
      description: 'Reach B2 level proficiency',
      icon: '🚀',
      condition: 'cefr_level >= B2',
      maxProgress: 1
    }
  ];

  static async trackSession(userId: string, sessionData: {
    startTime: string;
    endTime: string;
    wordsStudied: number;
    grammarTopicsReviewed: number;
    exercisesCompleted: number;
    skillsImproved: string[];
  }): Promise<void> {
    try {
      // Log the session
      const session: Session = {
        userId,
        ...sessionData
      };
      await userDB.logSession(session);

      // Update user progress and statistics
      await this.updateUserProgress(userId, sessionData);
      
      // Check for new achievements
      await this.checkAndUnlockAchievements(userId);

      console.log('Session tracked successfully');
    } catch (error) {
      console.error('Failed to track session:', error);
      throw error;
    }
  }

  private static async updateUserProgress(userId: string, sessionData: any): Promise<void> {
    const user = await userDB.getUserById(userId);
    if (!user) throw new Error('User not found');

    const sessionDuration = new Date(sessionData.endTime).getTime() - new Date(sessionData.startTime).getTime();
    const sessionMinutes = Math.round(sessionDuration / (1000 * 60));

    // Get vocabulary stats
    const userWords = await vocabularyDB.getUserWords(userId);
    const masteredWords = userWords.filter(w => w.isMastered).length;

    // Update progress
    const progressUpdate = {
      vocabularyMastered: masteredWords,
      grammarTopicsCompleted: user.progress.grammarTopicsCompleted + sessionData.grammarTopicsReviewed,
      totalStudyTime: user.progress.totalStudyTime + sessionMinutes
    };

    // Update streak
    await userDB.checkAndUpdateStreak(userId);

    await userDB.updateUserProgress(userId, progressUpdate);

    // Update statistics
    const totalSessions = user.statistics.totalSessions + 1;
    const newAverageSessionTime = (user.statistics.averageSessionTime * user.statistics.totalSessions + sessionMinutes) / totalSessions;

    const statsUpdate = {
      totalSessions,
      totalWordsLearned: masteredWords,
      averageSessionTime: newAverageSessionTime,
      skillLevels: this.calculateSkillLevels(user, masteredWords, sessionData)
    };

    await userDB.updateUserStatistics(userId, statsUpdate);
  }

  private static calculateSkillLevels(user: User, masteredWords: number, sessionData: any): User['statistics']['skillLevels'] {
    const currentLevels = user.statistics.skillLevels;
    const skillImprovement = 0.5; // Base improvement per session

    const newLevels = { ...currentLevels };

    // Vocabulary skill based on mastered words
    newLevels.vocabulary = Math.min(Math.floor(masteredWords / 5), 100); // 1 point per 5 words

    // Grammar skill based on topics completed
    newLevels.grammar = Math.min(user.progress.grammarTopicsCompleted * 2, 100);

    // Improve skills based on session activities
    sessionData.skillsImproved.forEach((skill: string) => {
      if (skill in newLevels) {
        newLevels[skill as keyof typeof newLevels] = Math.min(
          newLevels[skill as keyof typeof newLevels] + skillImprovement,
          100
        );
      }
    });

    return newLevels;
  }

  static async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const user = await userDB.getUserById(userId);
    if (!user) throw new Error('User not found');

    const userWords = await vocabularyDB.getUserWords(userId);
    const masteredWords = userWords.filter(w => w.isMastered).length;
    const totalStudyHours = Math.floor(user.progress.totalStudyTime / 60);

    const newAchievements: Achievement[] = [];

    for (const achievement of this.ACHIEVEMENTS) {
      if (user.achievements.includes(achievement.id)) continue;

      let unlocked = false;

      // Check conditions
      switch (achievement.id) {
        case 'first_word':
          unlocked = masteredWords >= 1;
          break;
        case 'vocab_beginner':
          unlocked = masteredWords >= 50;
          break;
        case 'vocab_intermediate':
          unlocked = masteredWords >= 200;
          break;
        case 'vocab_advanced':
          unlocked = masteredWords >= 500;
          break;
        case 'streak_week':
          unlocked = user.progress.currentStreak >= 7;
          break;
        case 'streak_month':
          unlocked = user.progress.currentStreak >= 30;
          break;
        case 'grammar_explorer':
          unlocked = user.progress.grammarTopicsCompleted >= 10;
          break;
        case 'dedicated_learner':
          unlocked = totalStudyHours >= 100;
          break;
        case 'fluency_seeker':
          unlocked = this.getCEFRLevel(masteredWords) >= 4; // B2 = 4
          break;
      }

      if (unlocked) {
        const unlockedAchievement = {
          ...achievement,
          dateUnlocked: new Date().toISOString()
        };
        newAchievements.push(unlockedAchievement);
        
        // Update user achievements
        user.achievements.push(achievement.id);
      }
    }

    if (newAchievements.length > 0) {
      await userDB.updateUser(user);
    }

    return newAchievements;
  }

  private static getCEFRLevel(masteredWords: number): number {
    if (masteredWords < 50) return 0; // A1
    if (masteredWords < 150) return 1; // A2
    if (masteredWords < 300) return 2; // B1
    if (masteredWords < 500) return 3; // B2
    if (masteredWords < 750) return 4; // C1
    return 5; // C2
  }

  static async getLearningAnalytics(userId: string): Promise<LearningAnalytics> {
    const user = await userDB.getUserById(userId);
    if (!user) throw new Error('User not found');

    const userWords = await vocabularyDB.getUserWords(userId);
    const masteredWords = userWords.filter(w => w.isMastered);
    const inProgressWords = userWords.filter(w => !w.isMastered && w.timesReviewed > 0);

    const sessions = await userDB.getUserSessions(userId, 30); // Last 30 sessions
    const recentSessions = sessions.filter(s => 
      new Date(s.startTime).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // Last 30 days
    );

    // Calculate retention rate
    const totalReviews = userWords.reduce((sum, word) => sum + word.timesReviewed, 0);
    const averageRetentionRate = totalReviews > 0 ? (masteredWords.length / totalReviews) * 100 : 0;

    // Calculate learning velocity (words per week)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMasteredWords = masteredWords.filter(w => 
      w.masteredDate && new Date(w.masteredDate) >= thirtyDaysAgo
    );
    const learningVelocity = (recentMasteredWords.length / 30) * 7; // words per week

    // Determine current CEFR level
    const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
    const currentLevelIndex = this.getCEFRLevel(masteredWords.length);
    const currentCEFRLevel = cefrLevels[currentLevelIndex];

    // Calculate progress to next level
    const levelThresholds = [50, 150, 300, 500, 750, 1000];
    const nextThreshold = levelThresholds[currentLevelIndex] || 1000;
    const prevThreshold = currentLevelIndex > 0 ? levelThresholds[currentLevelIndex - 1] : 0;
    const nextLevelProgress = ((masteredWords.length - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

    // Projected fluency date (B2 level)
    const wordsToB2 = Math.max(0, 500 - masteredWords.length);
    const weeksToB2 = learningVelocity > 0 ? wordsToB2 / learningVelocity : Infinity;
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + (weeksToB2 * 7));

    // Analyze strongest and weakest skills
    const skillLevels = user.statistics.skillLevels;
    const sortedSkills = Object.entries(skillLevels).sort(([,a], [,b]) => b - a);
    const strongestSkills = sortedSkills.slice(0, 2).map(([skill]) => skill);
    const weakestSkills = sortedSkills.slice(-2).map(([skill]) => skill);

    return {
      totalWords: userWords.length,
      masteredWords: masteredWords.length,
      wordsInProgress: inProgressWords.length,
      averageRetentionRate: Math.round(averageRetentionRate),
      mostDifficultTopics: [], // TODO: Implement based on grammar performance
      strongestSkills,
      weakestSkills,
      learningVelocity: Math.round(learningVelocity * 10) / 10,
      projectedFluencyDate: projectedDate.toISOString(),
      currentCEFRLevel,
      nextLevelProgress: Math.min(Math.round(nextLevelProgress), 100)
    };
  }

  static async getDailyProgress(userId: string, date?: string): Promise<DailyProgress | null> {
    const targetDate = date || new Date().toDateString();
    const user = await userDB.getUserById(userId);
    if (!user) return null;

    const sessions = await userDB.getUserSessions(userId);
    const daySessions = sessions.filter(session => 
      new Date(session.startTime).toDateString() === targetDate
    );

    if (daySessions.length === 0) return null;

    const totalStudyTime = daySessions.reduce((sum, session) => {
      const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      return sum + Math.round(duration / (1000 * 60));
    }, 0);

    return {
      date: targetDate,
      wordsStudied: daySessions.reduce((sum, s) => sum + s.wordsStudied, 0),
      wordsLearned: daySessions.reduce((sum, s) => sum + s.wordsStudied, 0), // Simplified
      grammarTopicsReviewed: daySessions.reduce((sum, s) => sum + s.grammarTopicsReviewed, 0),
      studyTimeMinutes: totalStudyTime,
      exercisesCompleted: daySessions.reduce((sum, s) => sum + s.exercisesCompleted, 0),
      skillsImproved: Array.from(new Set(daySessions.flatMap(s => s.skillsImproved))),
      streakDay: user.progress.currentStreak
    };
  }

  static async getWeeklyStats(userId: string, weekStart?: string): Promise<WeeklyStats> {
    const user = await userDB.getUserById(userId);
    if (!user) throw new Error('User not found');

    const startDate = weekStart ? new Date(weekStart) : this.getWeekStart(new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const sessions = await userDB.getUserSessions(userId);
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate < endDate;
    });

    const totalStudyTime = weekSessions.reduce((sum, session) => {
      const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      return sum + Math.round(duration / (1000 * 60));
    }, 0);

    const daysStudied = new Set(weekSessions.map(s => new Date(s.startTime).toDateString())).size;

    return {
      weekStart: startDate.toISOString(),
      totalStudyTime,
      wordsLearned: weekSessions.reduce((sum, s) => sum + s.wordsStudied, 0),
      grammarTopicsCompleted: weekSessions.reduce((sum, s) => sum + s.grammarTopicsReviewed, 0),
      averageDailyTime: daysStudied > 0 ? Math.round(totalStudyTime / daysStudied) : 0,
      daysStudied,
      skillProgress: user.statistics.skillLevels
    };
  }

  private static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  static async getAchievementProgress(userId: string): Promise<Achievement[]> {
    const user = await userDB.getUserById(userId);
    if (!user) throw new Error('User not found');

    const userWords = await vocabularyDB.getUserWords(userId);
    const masteredWords = userWords.filter(w => w.isMastered).length;
    const totalStudyHours = Math.floor(user.progress.totalStudyTime / 60);

    return this.ACHIEVEMENTS.map(achievement => {
      const isUnlocked = user.achievements.includes(achievement.id);
      let progress = 0;

      if (!isUnlocked && achievement.maxProgress) {
        switch (achievement.id) {
          case 'first_word':
          case 'vocab_beginner':
          case 'vocab_intermediate':
          case 'vocab_advanced':
            progress = Math.min(masteredWords, achievement.maxProgress);
            break;
          case 'streak_week':
          case 'streak_month':
            progress = Math.min(user.progress.currentStreak, achievement.maxProgress);
            break;
          case 'grammar_explorer':
            progress = Math.min(user.progress.grammarTopicsCompleted, achievement.maxProgress);
            break;
          case 'dedicated_learner':
            progress = Math.min(totalStudyHours, achievement.maxProgress);
            break;
        }
      }

      return {
        ...achievement,
        progress: isUnlocked ? achievement.maxProgress : progress,
        dateUnlocked: isUnlocked ? user.achievements.find(a => a === achievement.id) ? new Date().toISOString() : undefined : undefined
      };
    });
  }
}
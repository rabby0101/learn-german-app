export interface User {
  id: string;
  name: string;
  passwordHash: string;
  dateCreated: string;
  lastLogin: string;
  learningPreferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    dailyGoal: number;
    preferredStudyTime: number; // minutes per session
    focusAreas: ('vocabulary' | 'grammar' | 'speaking' | 'listening' | 'reading' | 'writing')[];
  };
  progress: {
    currentLevel: string; // A1, A2, B1, B2, C1, C2
    vocabularyMastered: number;
    grammarTopicsCompleted: number;
    totalStudyTime: number; // in minutes
    longestStreak: number;
    currentStreak: number;
    lastStudyDate: string;
  };
  achievements: string[];
  statistics: {
    totalSessions: number;
    totalWordsLearned: number;
    averageSessionTime: number;
    weeklyProgress: { week: string; wordsLearned: number; studyTime: number; }[];
    skillLevels: {
      vocabulary: number; // 0-100
      grammar: number; // 0-100
      speaking: number; // 0-100
      listening: number; // 0-100
      reading: number; // 0-100
      writing: number; // 0-100
    };
  };
}

export interface LoginCredentials {
  name: string;
  password: string;
}

export interface Session {
  userId: string;
  startTime: string;
  endTime: string;
  wordsStudied: number;
  grammarTopicsReviewed: number;
  exercisesCompleted: number;
  skillsImproved: string[];
}

class UserDatabase {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'LearnGermanUserDB';
  private readonly version = 1;
  private readonly userStoreName = 'users';
  private readonly sessionStoreName = 'sessions';
  private readonly progressStoreName = 'progress';
  
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open user database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('User database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create users store
        if (!db.objectStoreNames.contains(this.userStoreName)) {
          const userStore = db.createObjectStore(this.userStoreName, { 
            keyPath: 'id' 
          });
          userStore.createIndex('name', 'name', { unique: true });
          console.log('Users store created');
        }

        // Create sessions store
        if (!db.objectStoreNames.contains(this.sessionStoreName)) {
          const sessionStore = db.createObjectStore(this.sessionStoreName, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          sessionStore.createIndex('userId', 'userId', { unique: false });
          sessionStore.createIndex('startTime', 'startTime', { unique: false });
          console.log('Sessions store created');
        }

        // Create daily progress store
        if (!db.objectStoreNames.contains(this.progressStoreName)) {
          const progressStore = db.createObjectStore(this.progressStoreName, { 
            keyPath: ['userId', 'date'] 
          });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('date', 'date', { unique: false });
          console.log('Progress store created');
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    if (!this.db) {
      throw new Error('User database not initialized');
    }
    return this.db;
  }

  private hashPassword(password: string): string {
    // Simple hash function for demo - in production, use proper crypto
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  }

  async createUser(name: string, password: string): Promise<User> {
    const db = await this.ensureDB();
    
    // Check if user already exists
    const existingUser = await this.getUserByName(name);
    if (existingUser) {
      throw new Error('User already exists with this name');
    }

    const user: User = {
      id: this.generateUserId(),
      name: name.trim(),
      passwordHash: this.hashPassword(password),
      dateCreated: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      learningPreferences: {
        difficulty: 'beginner',
        dailyGoal: 20, // 20 words per day
        preferredStudyTime: 15, // 15 minutes per session
        focusAreas: ['vocabulary', 'grammar']
      },
      progress: {
        currentLevel: 'A1',
        vocabularyMastered: 0,
        grammarTopicsCompleted: 0,
        totalStudyTime: 0,
        longestStreak: 0,
        currentStreak: 0,
        lastStudyDate: ''
      },
      achievements: [],
      statistics: {
        totalSessions: 0,
        totalWordsLearned: 0,
        averageSessionTime: 0,
        weeklyProgress: [],
        skillLevels: {
          vocabulary: 0,
          grammar: 0,
          speaking: 0,
          listening: 0,
          reading: 0,
          writing: 0
        }
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.userStoreName], 'readwrite');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.add(user);

      request.onsuccess = () => {
        console.log(`User created: ${name}`);
        resolve(user);
      };

      request.onerror = () => {
        console.error('Failed to create user:', request.error);
        reject(request.error);
      };
    });
  }

  async authenticateUser(credentials: LoginCredentials): Promise<User | null> {
    const user = await this.getUserByName(credentials.name);
    if (!user) {
      return null;
    }

    const hashedPassword = this.hashPassword(credentials.password);
    if (user.passwordHash !== hashedPassword) {
      return null;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await this.updateUser(user);

    return user;
  }

  async getUserByName(name: string): Promise<User | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.userStoreName], 'readonly');
      const store = transaction.objectStore(this.userStoreName);
      const index = store.index('name');
      const request = index.get(name.trim());

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get user by name:', request.error);
        reject(request.error);
      };
    });
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.userStoreName], 'readonly');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get user by ID:', request.error);
        reject(request.error);
      };
    });
  }

  async updateUser(user: User): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.userStoreName], 'readwrite');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.put(user);

      request.onsuccess = () => {
        console.log(`User updated: ${user.name}`);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to update user:', request.error);
        reject(request.error);
      };
    });
  }

  async logSession(session: Session): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.sessionStoreName], 'readwrite');
      const store = transaction.objectStore(this.sessionStoreName);
      const request = store.add(session);

      request.onsuccess = () => {
        console.log('Session logged successfully');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to log session:', request.error);
        reject(request.error);
      };
    });
  }

  async getUserSessions(userId: string, limit: number = 50): Promise<Session[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.sessionStoreName], 'readonly');
      const store = transaction.objectStore(this.sessionStoreName);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const sessions = request.result;
        // Sort by date and limit
        const sortedSessions = sessions
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .slice(0, limit);
        resolve(sortedSessions);
      };

      request.onerror = () => {
        console.error('Failed to get user sessions:', request.error);
        reject(request.error);
      };
    });
  }

  async updateUserProgress(userId: string, progressUpdate: Partial<User['progress']>): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.progress = { ...user.progress, ...progressUpdate };
    await this.updateUser(user);
  }

  async updateUserStatistics(userId: string, statsUpdate: Partial<User['statistics']>): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.statistics = { ...user.statistics, ...statsUpdate };
    await this.updateUser(user);
  }

  async checkAndUpdateStreak(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const today = new Date().toDateString();
    const lastStudyDate = user.progress.lastStudyDate ? new Date(user.progress.lastStudyDate).toDateString() : '';

    if (lastStudyDate === today) {
      // Already studied today, no update needed
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (lastStudyDate === yesterdayString) {
      // Studied yesterday, increment streak
      user.progress.currentStreak += 1;
      user.progress.longestStreak = Math.max(user.progress.longestStreak, user.progress.currentStreak);
    } else {
      // Missed days, reset streak
      user.progress.currentStreak = 1;
    }

    user.progress.lastStudyDate = new Date().toISOString();
    await this.updateUser(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.userStoreName], 'readwrite');
      const store = transaction.objectStore(this.userStoreName);
      const request = store.delete(userId);

      request.onsuccess = () => {
        console.log('User deleted successfully');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete user:', request.error);
        reject(request.error);
      };
    });
  }
}

// Create singleton instance
export const userDB = new UserDatabase();
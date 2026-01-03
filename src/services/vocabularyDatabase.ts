import { VocabularyWord } from './deepseekApi';

interface VocabularyDBWord extends VocabularyWord {
  id?: number;
  dateAdded: string;
  source: 'initial' | 'ai-generated' | 'grammar-generated';
  isMastered: boolean;
  userId?: string; // Optional for backwards compatibility
  masteredDate?: string;
  timesReviewed: number;
  lastReviewedDate: string;
  difficultyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  nextReviewDate?: string; // For spaced repetition
  reviewInterval: number; // Days until next review
}

class VocabularyDatabase {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'LearnGermanDB';
  private readonly version = 1;
  private readonly storeName = 'vocabulary';

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database initialized successfully, connection established');
        console.log('Database instance:', this.db);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create vocabulary store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Create indexes for efficient searching
          store.createIndex('german', 'german', { unique: true });
          store.createIndex('english', 'english', { unique: false });
          store.createIndex('source', 'source', { unique: false });
          store.createIndex('isMastered', 'isMastered', { unique: false });
          store.createIndex('dateAdded', 'dateAdded', { unique: false });
          
          console.log('Database schema created');
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      console.log('Database connection lost, reinitializing...');
      await this.initialize();
    }
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async addWord(word: VocabularyWord, source: 'initial' | 'ai-generated' | 'grammar-generated' = 'ai-generated', userId?: string): Promise<boolean> {
    const db = await this.ensureDB();
    
    // Check if word already exists for this user or globally
    const exists = await this.wordExists(word.german, userId);
    if (exists) {
      console.log(`Word "${word.german}" already exists in database for user ${userId || 'global'}`);
      return false;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const dbWord: VocabularyDBWord = {
        ...word,
        dateAdded: new Date().toISOString(),
        source,
        isMastered: false,
        userId: userId || undefined,
        timesReviewed: 0,
        lastReviewedDate: '',
        difficultyLevel: this.inferDifficultyLevel(word.german),
        reviewInterval: 1, // Start with 1 day
      };

      const request = store.add(dbWord);

      request.onsuccess = () => {
        console.log(`Added word "${word.german}" to database for user ${userId || 'global'}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error('Failed to add word:', request.error);
        reject(request.error);
      };
    });
  }

  private inferDifficultyLevel(german: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
    // Simple heuristic based on word length and common patterns
    if (german.length <= 4) return 'A1';
    if (german.length <= 7) return 'A2';
    if (german.includes('ung') || german.includes('keit') || german.includes('heit')) return 'B2';
    if (german.length > 12) return 'C1';
    return 'B1';
  }

  async addWords(words: VocabularyWord[], source: 'initial' | 'ai-generated' | 'grammar-generated' = 'ai-generated', userId?: string): Promise<number> {
    let addedCount = 0;
    
    for (const word of words) {
      try {
        const wasAdded = await this.addWord(word, source, userId);
        if (wasAdded) addedCount++;
      } catch (error) {
        console.error(`Failed to add word "${word.german}":`, error);
      }
    }
    
    console.log(`Added ${addedCount} out of ${words.length} words to database`);
    return addedCount;
  }

  async wordExists(german: string, userId?: string): Promise<boolean> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const words = request.result as VocabularyDBWord[];
        const exists = words.some(word => {
          if (word.german === german) {
            // If userId is provided, check for user-specific or global words
            if (userId) {
              return word.userId === userId || !word.userId; // User-specific or global
            } else {
              return !word.userId; // Only global words when no user specified
            }
          }
          return false;
        });
        resolve(exists);
      };

      request.onerror = () => {
        console.error('Failed to check word existence:', request.error);
        reject(request.error);
      };
    });
  }

  async getRandomWords(count: number = 25): Promise<VocabularyDBWord[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const allWords = request.result as VocabularyDBWord[];
          
          if (allWords.length === 0) {
            resolve([]);
            return;
          }

          // Shuffle array and take random words
          const shuffled = [...allWords].sort(() => Math.random() - 0.5);
          const randomWords = shuffled.slice(0, Math.min(count, shuffled.length));
          
          console.log(`Retrieved ${randomWords.length} random words from database`);
          resolve(randomWords);
        };

        request.onerror = () => {
          console.error('Failed to get random words:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async getWeightedRandomWords(count: number = 25, masteredPercentage: number = 5): Promise<VocabularyDBWord[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const allWords = request.result as VocabularyDBWord[];
          
          if (allWords.length === 0) {
            resolve([]);
            return;
          }

          // Separate mastered and unmastered words
          const masteredWords = allWords.filter(word => word.isMastered);
          const unmasteredWords = allWords.filter(word => !word.isMastered);
          
          // Calculate how many mastered words to include (5% by default)
          const masteredCount = Math.floor(count * (masteredPercentage / 100));
          const unmasteredCount = count - masteredCount;
          
          // Shuffle both arrays
          const shuffledMastered = [...masteredWords].sort(() => Math.random() - 0.5);
          const shuffledUnmastered = [...unmasteredWords].sort(() => Math.random() - 0.5);
          
          // Select words with the desired distribution
          const selectedMastered = shuffledMastered.slice(0, Math.min(masteredCount, shuffledMastered.length));
          const selectedUnmastered = shuffledUnmastered.slice(0, Math.min(unmasteredCount, shuffledUnmastered.length));
          
          // Combine and shuffle the final selection
          const combinedWords = [...selectedMastered, ...selectedUnmastered];
          const finalSelection = combinedWords.sort(() => Math.random() - 0.5);
          
          console.log(`Retrieved ${finalSelection.length} weighted words: ${selectedMastered.length} mastered (${masteredPercentage}%), ${selectedUnmastered.length} unmastered`);
          resolve(finalSelection);
        };

        request.onerror = () => {
          console.error('Failed to get weighted random words:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async getMasteredWords(): Promise<VocabularyDBWord[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const allWords = request.result as VocabularyDBWord[];
          const masteredWords = allWords.filter(word => word.isMastered === true);
          console.log(`Retrieved ${masteredWords.length} mastered words from database`);
          resolve(masteredWords);
        };

        request.onerror = () => {
          console.error('Failed to get mastered words:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async getUnmasteredWords(): Promise<VocabularyDBWord[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const allWords = request.result as VocabularyDBWord[];
          const unmasteredWords = allWords.filter(word => word.isMastered === false);
          console.log(`Retrieved ${unmasteredWords.length} unmastered words from database`);
          resolve(unmasteredWords);
        };

        request.onerror = () => {
          console.error('Failed to get unmastered words:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAllWords(): Promise<VocabularyDBWord[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to get all words:', request.error);
        reject(request.error);
      };
    });
  }

  async getTotalWordCount(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.count();

        request.onsuccess = () => {
          console.log(`Database total word count: ${request.result}`);
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('Failed to get word count:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async getMasteredWordCount(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const allWords = request.result as VocabularyDBWord[];
          const masteredCount = allWords.filter(word => word.isMastered === true).length;
          console.log(`Database mastered word count: ${masteredCount} out of ${allWords.length} total words`);
          console.log('Sample words:', allWords.slice(0, 3).map(w => ({ german: w.german, isMastered: w.isMastered })));
          resolve(masteredCount);
        };

        request.onerror = () => {
          console.error('Failed to get mastered word count:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateWordMasteredStatus(german: string, isMastered: boolean, userId?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const words = request.result as VocabularyDBWord[];
          let wordToUpdate = null;

          // Find the word for the specific user or global word
          if (userId) {
            wordToUpdate = words.find(w => w.german === german && (w.userId === userId || !w.userId));
          } else {
            wordToUpdate = words.find(w => w.german === german && !w.userId);
          }

          if (wordToUpdate) {
            wordToUpdate.isMastered = isMastered;
            wordToUpdate.timesReviewed = (wordToUpdate.timesReviewed || 0) + 1;
            wordToUpdate.lastReviewedDate = new Date().toISOString();
            
            // Ensure reviewInterval exists with a default value
            if (typeof wordToUpdate.reviewInterval !== 'number' || isNaN(wordToUpdate.reviewInterval)) {
              wordToUpdate.reviewInterval = 1;
            }
            
            if (isMastered) {
              wordToUpdate.masteredDate = new Date().toISOString();
              // Set longer review interval for mastered words
              wordToUpdate.reviewInterval = Math.min(wordToUpdate.reviewInterval * 2, 90); // Max 90 days
            } else {
              // Reset review interval for unmastered words
              wordToUpdate.reviewInterval = Math.max(wordToUpdate.reviewInterval / 2, 1);
            }

            // Calculate next review date
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + wordToUpdate.reviewInterval);
            wordToUpdate.nextReviewDate = nextReview.toISOString();

            const updateRequest = store.put(wordToUpdate);
            
            updateRequest.onsuccess = () => {
              console.log(`Updated mastered status for "${german}": ${isMastered} (User: ${userId || 'global'})`);
              resolve();
            };
            
            updateRequest.onerror = () => {
              console.error('Failed to update word:', updateRequest.error);
              reject(updateRequest.error);
            };
          } else {
            reject(new Error(`Word "${german}" not found for user ${userId || 'global'}`));
          }
        };

        request.onerror = () => {
          console.error('Failed to find word for update:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // New method: Get words that need review based on spaced repetition
  async getWordsForReview(userId?: string, limit: number = 25): Promise<VocabularyDBWord[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const allWords = request.result as VocabularyDBWord[];
        const today = new Date();
        
        // Filter words for the user and due for review
        const userWords = allWords.filter(word => {
          if (userId) {
            return word.userId === userId || (!word.userId && word.source === 'initial');
          } else {
            return !word.userId;
          }
        });

        const wordsForReview = userWords.filter(word => {
          if (!word.nextReviewDate) return true; // Words never reviewed
          return new Date(word.nextReviewDate) <= today;
        });

        // Sort by priority: unmastered first, then by review date
        const sortedWords = wordsForReview.sort((a, b) => {
          if (a.isMastered !== b.isMastered) {
            return a.isMastered ? 1 : -1; // Unmastered words first
          }
          
          const aDate = new Date(a.nextReviewDate || a.dateAdded);
          const bDate = new Date(b.nextReviewDate || b.dateAdded);
          return aDate.getTime() - bDate.getTime();
        });

        resolve(sortedWords.slice(0, limit));
      };

      request.onerror = () => {
        console.error('Failed to get words for review:', request.error);
        reject(request.error);
      };
    });
  }

  // Get user-specific words
  async getUserWords(userId: string): Promise<VocabularyDBWord[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const allWords = request.result as VocabularyDBWord[];
        const userWords = allWords.filter(word => 
          word.userId === userId || (!word.userId && word.source === 'initial')
        );
        resolve(userWords);
      };

      request.onerror = () => {
        console.error('Failed to get user words:', request.error);
        reject(request.error);
      };
    });
  }

  async updateWord(originalGerman: string, updatedWord: VocabularyWord): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.ensureDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('german');
        const request = index.get(originalGerman);

        request.onsuccess = () => {
          const existingWord = request.result;
          if (existingWord) {
            // Update the word while preserving database-specific fields
            const updatedDBWord: VocabularyDBWord = {
              ...existingWord,
              german: updatedWord.german,
              english: updatedWord.english,
              example: updatedWord.example
            };
            
            const updateRequest = store.put(updatedDBWord);
            
            updateRequest.onsuccess = () => {
              console.log(`Updated word "${originalGerman}" to:`, updatedWord);
              resolve();
            };
            
            updateRequest.onerror = () => {
              console.error('Failed to update word:', updateRequest.error);
              reject(updateRequest.error);
            };
          } else {
            reject(new Error(`Word "${originalGerman}" not found`));
          }
        };

        request.onerror = () => {
          console.error('Failed to find word for update:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async searchWords(query: string): Promise<VocabularyDBWord[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const allWords = request.result as VocabularyDBWord[];
        const filtered = allWords.filter(word => 
          word.german.toLowerCase().includes(query.toLowerCase()) ||
          word.english.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      };

      request.onerror = () => {
        console.error('Failed to search words:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllWords(): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Cleared all words from database');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear words:', request.error);
        reject(request.error);
      };
    });
  }
}

// Create singleton instance
export const vocabularyDB = new VocabularyDatabase();

// Export types
export type { VocabularyDBWord };
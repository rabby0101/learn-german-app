import { VocabularyWord } from './deepseekApi';
import { deepseekApi } from './deepseekApi';
import { vocabularyDB } from './vocabularyDatabase';

export class VocabularyExtractionService {
  private static readonly commonWords = new Set([
    // Articles
    'der', 'die', 'das', 'den', 'dem', 'des',
    'ein', 'eine', 'einer', 'einen', 'einem', 'eines',
    // Common prepositions
    'in', 'an', 'auf', 'mit', 'von', 'zu', 'bei', 'nach', 'vor', 'über', 'unter', 'durch', 'für', 'ohne', 'um', 'gegen',
    'am', 'im', 'zum', 'zur', 'vom', 'beim',
    // Common conjunctions
    'und', 'oder', 'aber', 'denn', 'sondern', 'dass', 'wenn', 'weil', 'da', 'obwohl', 'während', 'bevor', 'nachdem',
    'als', 'wie', 'bis', 'seit', 'seitdem',
    // Pronouns
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'mich', 'dich', 'ihn', 'sie', 'es', 'uns', 'euch', 'sie',
    'mir', 'dir', 'ihm', 'ihr', 'ihm', 'uns', 'euch', 'ihnen',
    'mein', 'dein', 'sein', 'ihr', 'unser', 'euer', 'ihr', 'meine', 'deine', 'seine', 'ihre', 'unsere', 'eure',
    'dieser', 'diese', 'dieses', 'jeder', 'jede', 'jedes', 'welcher', 'welche', 'welches',
    // Common verbs (forms)
    'sein', 'haben', 'werden', 'ist', 'sind', 'war', 'waren', 'bin', 'bist', 'war', 'warst',
    'hat', 'haben', 'hatte', 'hatten', 'habe', 'hast', 'hattest',
    'wird', 'werden', 'wurde', 'wurden', 'werde', 'wirst', 'wurde', 'wurdest',
    // Modal verbs
    'kann', 'können', 'konnte', 'konnten', 'muss', 'müssen', 'musste', 'mussten',
    'will', 'wollen', 'wollte', 'wollten', 'soll', 'sollen', 'sollte', 'sollten',
    'darf', 'dürfen', 'durfte', 'durften', 'mag', 'mögen', 'mochte', 'mochten',
    // Common adverbs and particles
    'nicht', 'nur', 'auch', 'noch', 'schon', 'immer', 'nie', 'oft', 'manchmal', 
    'hier', 'da', 'dort', 'heute', 'gestern', 'morgen', 'jetzt', 'dann', 'wieder',
    'sehr', 'mehr', 'weniger', 'ganz', 'halb', 'etwas', 'nichts', 'alles',
    // Numbers and basic quantifiers
    'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
    'erste', 'zweite', 'dritte', 'viele', 'wenige', 'alle', 'keine', 'einige'
  ]);

  private static readonly germanWordPattern = /^[a-zA-ZäöüßÄÖÜ]+$/;
  private static readonly punctuation = /[.,!?;:()""„"''`]/g;
  private static readonly minWordLength = 3;

  /**
   * Extract vocabulary words from an array of German sentences using rule-based approach
   */
  static async extractVocabularyFromSentences(sentences: string[]): Promise<VocabularyWord[]> {
    if (sentences.length === 0) {
      return [];
    }

    try {
      console.log(`Starting rule-based vocabulary extraction from ${sentences.length} sentences...`);
      
      // Extract unique meaningful words from all sentences
      const uniqueWords = this.extractUniqueWords(sentences);
      
      // Convert words to vocabulary format with AI assistance for translations
      const vocabularyWords = await this.convertWordsToVocabulary(uniqueWords, sentences);
      
      // Filter out words that already exist in the database
      const newWords = await this.filterExistingWords(vocabularyWords);
      
      console.log(`Extracted ${vocabularyWords.length} words, ${newWords.length} are new to the database`);
      return newWords;
      
    } catch (error) {
      console.error('Error extracting vocabulary from sentences:', error);
      return [];
    }
  }

  /**
   * Extract unique meaningful words from sentences using rule-based approach
   */
  private static extractUniqueWords(sentences: string[]): Set<string> {
    const words = new Set<string>();
    
    for (const sentence of sentences) {
      // Clean the sentence: remove punctuation and normalize
      const cleanSentence = sentence
        .replace(this.punctuation, ' ')
        .toLowerCase()
        .trim();
      
      // Split into words and filter
      const sentenceWords = cleanSentence.split(/\s+/);
      
      for (const word of sentenceWords) {
        const trimmedWord = word.trim();
        
        // Skip if word doesn't meet criteria
        if (
          trimmedWord.length < this.minWordLength ||
          !this.germanWordPattern.test(trimmedWord) ||
          this.commonWords.has(trimmedWord) ||
          this.isNumber(trimmedWord)
        ) {
          continue;
        }
        
        // Add potentially valuable word
        words.add(trimmedWord);
      }
    }
    
    return words;
  }

  /**
   * Convert extracted words to vocabulary format with AI assistance for translations
   */
  private static async convertWordsToVocabulary(words: Set<string>, sentences: string[]): Promise<VocabularyWord[]> {
    if (words.size === 0) {
      return [];
    }
    
    const wordsArray = Array.from(words).slice(0, 8); // Limit to avoid overwhelming
    const vocabularyWords: VocabularyWord[] = [];
    
    // Group words for batch processing
    const batchSize = 5;
    for (let i = 0; i < wordsArray.length; i += batchSize) {
      const batch = wordsArray.slice(i, i + batchSize);
      
      try {
        const batchResults = await this.translateWordsBatch(batch, sentences);
        vocabularyWords.push(...batchResults);
      } catch (error) {
        console.error('Failed to translate word batch:', error);
        // Continue with other batches
      }
    }
    
    return vocabularyWords;
  }

  /**
   * Translate a batch of words using AI with context from sentences
   */
  private static async translateWordsBatch(words: string[], sentences: string[]): Promise<VocabularyWord[]> {
    const contextSentences = sentences.join(' ');
    
    const messages = [
      {
        role: 'system',
        content: 'You are a German-English dictionary. Provide accurate translations for German words based on their context in the given sentences.'
      },
      {
        role: 'user',
        content: `Given these German sentences for context: "${contextSentences}"

Translate these German words: ${words.join(', ')}

For each word, provide:
1. The original German word
2. The most appropriate English translation based on the context
3. A simple German example sentence using the word

Format as JSON array with objects: {"german": "word", "english": "translation", "example": "sentence"}

Only return words that are meaningful vocabulary (not function words). If a word is too common or not useful for language learning, skip it.`
      }
    ];

    try {
      const response = await deepseekApi['makeRequest'](messages, 0.3);
      return this.parseVocabularyResponse(response);
    } catch (error) {
      console.error('Translation batch failed:', error);
      return [];
    }
  }

  /**
   * Parse the AI response into vocabulary words
   */
  private static parseVocabularyResponse(response: string): VocabularyWord[] {
    try {
      // Handle markdown code blocks
      let jsonContent = response;
      if (response.includes('```json') || response.includes('```')) {
        const jsonStart = response.indexOf('[') !== -1 ? response.indexOf('[') : response.indexOf('{');
        const jsonEnd = response.lastIndexOf(']') !== -1 ? response.lastIndexOf(']') + 1 : response.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonContent = response.substring(jsonStart, jsonEnd);
        }
      }

      // Try to find JSON structure if it's embedded in text
      if (!jsonContent.startsWith('[') && !jsonContent.startsWith('{')) {
        const jsonMatch = jsonContent.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
      }

      const parsed = JSON.parse(jsonContent);
      const words = Array.isArray(parsed) ? parsed : [parsed];

      // Validate and filter the words
      return words.filter(word => 
        word && 
        typeof word === 'object' &&
        word.german && 
        word.english && 
        word.example &&
        typeof word.german === 'string' &&
        typeof word.english === 'string' &&
        typeof word.example === 'string' &&
        word.german.trim().length > 0 &&
        word.english.trim().length > 0 &&
        word.example.trim().length > 0
      ).map(word => ({
        german: word.german.trim(),
        english: word.english.trim(),
        example: word.example.trim()
      }));

    } catch (error) {
      console.error('Failed to parse vocabulary extraction response:', error);
      return [];
    }
  }

  /**
   * Check if a word is a number
   */
  private static isNumber(word: string): boolean {
    return /^\d+$/.test(word) || /^(null|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)$/.test(word);
  }

  /**
   * Filter out words that already exist in the vocabulary database
   */
  private static async filterExistingWords(words: VocabularyWord[]): Promise<VocabularyWord[]> {
    const newWords: VocabularyWord[] = [];
    
    for (const word of words) {
      try {
        const exists = await vocabularyDB.wordExists(word.german);
        if (!exists) {
          newWords.push(word);
        } else {
          console.log(`Skipping existing word: ${word.german}`);
        }
      } catch (error) {
        console.error(`Error checking if word exists: ${word.german}`, error);
        // If we can't check, err on the side of including the word
        newWords.push(word);
      }
    }
    
    return newWords;
  }

  /**
   * Extract and save vocabulary from sentences in the background
   * This is the main public method to be called from components
   */
  static async extractAndSaveVocabulary(sentences: string[], source: 'grammar-generated' | 'ai-generated' = 'grammar-generated'): Promise<void> {
    try {
      // Run extraction asynchronously without blocking the UI
      setTimeout(async () => {
        const extractedWords = await this.extractVocabularyFromSentences(sentences);
        
        if (extractedWords.length > 0) {
          const addedCount = await vocabularyDB.addWords(extractedWords, source as any);
          console.log(`🎯 Background vocabulary extraction completed: ${addedCount} new words added to database`);
        } else {
          console.log('🔍 Background vocabulary extraction: No new vocabulary found');
        }
      }, 100); // Small delay to ensure UI operations complete first
      
    } catch (error) {
      console.error('Background vocabulary extraction failed:', error);
      // Silently fail - don't affect the main UI functionality
    }
  }
}

export const vocabularyExtraction = new VocabularyExtractionService();
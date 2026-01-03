export interface SavedGrammarRule {
  id: string;
  title: string;
  description: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  savedAt: string;
  source: 'deepseek' | 'user';
  themes?: string[];
}

export interface SavedContent {
  grammarRules: SavedGrammarRule[];
}

class SavedContentService {
  private storageKey = 'learn-german-saved-content';

  private getStorageData(): SavedContent {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { grammarRules: [] };
    } catch (error) {
      console.error('Error loading saved content:', error);
      return { grammarRules: [] };
    }
  }

  private saveToStorage(data: SavedContent): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving content:', error);
      throw new Error('Failed to save content to local storage');
    }
  }

  // Grammar Rules
  saveGrammarRule(rule: {
    title: string;
    description: string;
    examples: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    themes?: string[];
  }): SavedGrammarRule {
    const data = this.getStorageData();
    
    // Check if rule already exists
    const existingRule = data.grammarRules.find(r => r.title.toLowerCase() === rule.title.toLowerCase());
    if (existingRule) {
      throw new Error('This grammar rule has already been saved');
    }

    const savedRule: SavedGrammarRule = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: rule.title,
      description: rule.description,
      examples: rule.examples,
      difficulty: rule.difficulty,
      savedAt: new Date().toISOString(),
      source: 'deepseek',
      themes: rule.themes || []
    };

    data.grammarRules.unshift(savedRule); // Add to beginning
    this.saveToStorage(data);
    
    console.log(`Saved grammar rule: ${savedRule.title}`);
    return savedRule;
  }

  getSavedGrammarRules(): SavedGrammarRule[] {
    const data = this.getStorageData();
    return data.grammarRules.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }

  deleteSavedGrammarRule(id: string): void {
    const data = this.getStorageData();
    data.grammarRules = data.grammarRules.filter(rule => rule.id !== id);
    this.saveToStorage(data);
    console.log(`Deleted saved grammar rule with id: ${id}`);
  }

  isSaved(title: string): boolean {
    const data = this.getStorageData();
    return data.grammarRules.some(rule => rule.title.toLowerCase() === title.toLowerCase());
  }

  getSavedCount(): number {
    const data = this.getStorageData();
    return data.grammarRules.length;
  }

  // Export functionality
  exportSavedContent(): string {
    const data = this.getStorageData();
    return JSON.stringify(data, null, 2);
  }

  // Import functionality
  importSavedContent(jsonContent: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const importedData = JSON.parse(jsonContent);
      const currentData = this.getStorageData();
      const errors: string[] = [];
      let imported = 0;

      if (importedData.grammarRules && Array.isArray(importedData.grammarRules)) {
        importedData.grammarRules.forEach((rule: any, index: number) => {
          try {
            // Validate rule structure
            if (!rule.title || !rule.description || !Array.isArray(rule.examples)) {
              errors.push(`Rule ${index + 1}: Invalid structure`);
              return;
            }

            // Check for duplicates
            const exists = currentData.grammarRules.some(existing => 
              existing.title.toLowerCase() === rule.title.toLowerCase()
            );
            
            if (!exists) {
              const newRule: SavedGrammarRule = {
                id: rule.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: rule.title,
                description: rule.description,
                examples: rule.examples,
                difficulty: rule.difficulty || 'intermediate',
                savedAt: rule.savedAt || new Date().toISOString(),
                source: rule.source || 'deepseek',
                themes: rule.themes || []
              };
              currentData.grammarRules.push(newRule);
              imported++;
            } else {
              errors.push(`Rule "${rule.title}": Already exists, skipped`);
            }
          } catch (err) {
            errors.push(`Rule ${index + 1}: ${err}`);
          }
        });
      }

      if (imported > 0) {
        this.saveToStorage(currentData);
      }

      return { success: true, imported, errors };
    } catch (error) {
      return { 
        success: false, 
        imported: 0, 
        errors: [`Failed to parse import file: ${error}`] 
      };
    }
  }

  // Search in saved content
  searchSavedGrammarRules(query: string): SavedGrammarRule[] {
    const data = this.getStorageData();
    const searchTerm = query.toLowerCase();
    
    return data.grammarRules.filter(rule =>
      rule.title.toLowerCase().includes(searchTerm) ||
      rule.description.toLowerCase().includes(searchTerm) ||
      rule.examples.some(example => example.toLowerCase().includes(searchTerm)) ||
      rule.themes?.some(theme => theme.toLowerCase().includes(searchTerm))
    );
  }
}

export const savedContentService = new SavedContentService();
export interface VocabularyWord {
  german: string;
  english: string;
  example: string;
}

export interface GrammarExample {
  german: string;
  english: string;
}

export interface GrammarRule {
  title: string;
  description?: string;
  examples?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  explanation?: string;
  example?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface SpeakingExercise {
  id: string;
  type: 'pronunciation' | 'conversation' | 'reading' | 'repetition';
  german: string;
  english: string;
  phonetic?: string;
  difficulty: 'B1' | 'B2' | 'C1';
  context: string;
  tips: string[];
}

export interface ReadingExercise {
  id: string;
  title: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  text: string;
  vocabulary: { word: string; meaning: string }[];
  questions: {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-gaps' | 'sentence-completion' | 'matching' | 'word-order';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    textWithGaps?: string;
    pairs?: { left: string; right: string }[];
    scrambledWords?: string[];
  }[];
  estimatedTime: number;
}

class DeepSeekApiService {
  // Use proxy in development to avoid CORS issues
  private readonly baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://api.deepseek.com/chat/completions'
    : '/api/deepseek/chat/completions';
  private readonly modelName = 'deepseek-chat';

  private get headers() {
    const token = process.env.REACT_APP_DEEPSEEK_API_KEY;
    if (!token) {
      throw new Error('DeepSeek API key is not configured. Please set REACT_APP_DEEPSEEK_API_KEY in your environment variables.');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private async makeRequest(messages: Array<{ role: string, content: string }>, temperature = 0.7, maxTokens = 2000, retries = 2) {
    console.log('Making request to:', this.baseUrl);
    console.log('Model:', this.modelName);
    console.log('Messages:', messages);

    const requestBody = {
      model: this.modelName,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);

          // If it's a server error and we have retries left, try again
          if (response.status >= 500 && attempt < retries) {
            console.log(`Server error (${response.status}), retrying... (${attempt + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }

          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);

        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from API');
        }

        const content = data.choices[0].message.content.trim();
        console.log('Extracted content from API:', content);
        return content;

      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);

        // If it's a network error and we have retries left, try again
        if ((error instanceof TypeError && error.message.includes('fetch')) && attempt < retries) {
          console.log(`Network error, retrying... (${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }

        // If no retries left or it's not a retryable error, throw
        throw error;
      }
    }
  }

  private parseJsonResponse<T>(content: string): T {
    try {
      let jsonContent = content.trim();

      // Handle markdown code blocks
      if (jsonContent.includes('```json') || jsonContent.includes('```')) {
        // Look for the main JSON structure - prefer objects over arrays for grammar rules
        const objectStart = jsonContent.indexOf('{');
        const arrayStart = jsonContent.indexOf('[');

        let jsonStart = -1;
        let jsonEnd = -1;

        // For grammar rules, we expect objects, so prioritize { over [
        if (objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart)) {
          jsonStart = objectStart;
          jsonEnd = jsonContent.lastIndexOf('}') + 1;
        } else if (arrayStart !== -1) {
          jsonStart = arrayStart;
          jsonEnd = jsonContent.lastIndexOf(']') + 1;
        }

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = jsonContent.substring(jsonStart, jsonEnd);
        }
      }

      // Clean up the content
      jsonContent = jsonContent.trim();

      // Try to find JSON structure if it's embedded in text
      if (!jsonContent.startsWith('[') && !jsonContent.startsWith('{')) {
        // Prefer objects over arrays
        const objectMatch = jsonContent.match(/\{[\s\S]*\}/);
        const arrayMatch = jsonContent.match(/\[[\s\S]*\]/);

        if (objectMatch) {
          jsonContent = objectMatch[0];
        } else if (arrayMatch) {
          jsonContent = arrayMatch[0];
        }
      }

      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      console.log('Raw content:', content);
      throw new Error('Failed to parse API response as JSON');
    }
  }

  async generateVocabulary(count: number = 10, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate', themes: string = ''): Promise<VocabularyWord[]> {
    const difficultyContext = {
      beginner: 'basic everyday words that beginners should learn first',
      intermediate: 'intermediate level words for students who know basic German',
      advanced: 'advanced vocabulary for fluent speakers'
    };

    const messages = [
      {
        role: 'system',
        content: 'You are a German language teacher. Generate German vocabulary words for language learning. Always respond with valid JSON format containing an array of vocabulary objects.'
      },
      {
        role: 'user',
        content: `Generate exactly ${count} German vocabulary words at ${difficulty} level (${difficultyContext[difficulty]})${themes ? ` focusing on these themes: ${themes}` : ''}. Format your response as a JSON array where each object has exactly these properties: 'german', 'english', and 'example'. The example should be a complete German sentence using the word. Avoid common words like Hallo, Danke, Bitte, Guten Morgen, etc.${themes ? ` Make sure the vocabulary relates to the specified themes.` : ''}`
      }
    ];

    const content = await this.makeRequest(messages);
    console.log('Raw API response:', content);

    let words;
    try {
      const response = this.parseJsonResponse<any>(content);

      // Handle different response formats
      if (Array.isArray(response)) {
        words = response;
      } else if (response.vocabulary && Array.isArray(response.vocabulary)) {
        words = response.vocabulary;
      } else if (response.words && Array.isArray(response.words)) {
        words = response.words;
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('API response does not contain a vocabulary array');
      }
    } catch (error) {
      console.error('Failed to parse as JSON, trying alternative parsing:', error);
      // Fallback: try to extract JSON from text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        words = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract valid JSON from response');
      }
    }

    // Ensure words is an array
    if (!Array.isArray(words)) {
      console.error('Response is not an array:', words);
      throw new Error('API response is not an array format');
    }

    // Validate the structure
    const validWords = words.filter(word =>
      word && typeof word === 'object' &&
      word.german && word.english && word.example &&
      typeof word.german === 'string' &&
      typeof word.english === 'string' &&
      typeof word.example === 'string'
    );

    if (validWords.length === 0) {
      throw new Error('No valid vocabulary words found in response');
    }

    console.log(`Successfully parsed ${validWords.length} vocabulary words`);
    return validWords;
  }

  async generateGrammarExamples(topic: string, count: number = 5, themes: string = ''): Promise<GrammarExample[]> {
    const messages = [
      {
        role: 'system',
        content: 'You are a German grammar expert. Generate clear, educational German sentences with English translations that demonstrate specific grammar concepts.'
      },
      {
        role: 'user',
        content: `Generate exactly ${count} German example sentences that clearly demonstrate the grammar topic: "${topic}".${themes ? ` Focus the examples on these themes: ${themes}.` : ''} 

For each example, provide:
1. German sentence that demonstrates the grammar concept
2. English translation of the sentence

Format your response as a JSON array with objects containing: {"german": "German sentence", "english": "English translation"}

Each sentence should be educational and show the grammar concept in action.${themes ? ` Make sure the vocabulary and context relate to the specified themes.` : ''}`
      }
    ];

    const content = await this.makeRequest(messages);
    const examples = this.parseJsonResponse<GrammarExample[]>(content);

    return examples.filter(example =>
      example &&
      typeof example === 'object' &&
      typeof example.german === 'string' &&
      typeof example.english === 'string' &&
      example.german.trim().length > 0 &&
      example.english.trim().length > 0
    );
  }

  async generateGrammarRule(topic: string, themes: string = ''): Promise<GrammarRule> {
    const messages = [
      {
        role: 'system',
        content: 'You are a German grammar expert. Create comprehensive grammar explanations for German language learners.'
      },
      {
        role: 'user',
        content: `Create a comprehensive grammar explanation for the topic: "${topic}".${themes ? ` Focus the examples and context on these themes: ${themes}.` : ''} Format your response as a JSON object with these exact properties: "title" (string), "description" (string explaining the rule), "examples" (array of German sentences), and "difficulty" (one of: "beginner", "intermediate", "advanced").${themes ? ` Make sure the examples use vocabulary and context related to the specified themes.` : ''}`
      }
    ];

    const content = await this.makeRequest(messages);
    console.log('Grammar rule raw content:', content);

    const rule = this.parseJsonResponse<GrammarRule>(content);
    console.log('Parsed grammar rule:', rule);

    // Validate the structure
    if (!rule || typeof rule !== 'object' || !rule.title || !rule.description || !Array.isArray(rule.examples)) {
      console.error('Invalid grammar rule structure:', {
        isObject: typeof rule === 'object',
        hasTitle: !!rule?.title,
        hasDescription: !!rule?.description,
        hasExamples: Array.isArray(rule?.examples),
        actualRule: rule
      });
      throw new Error('Invalid grammar rule format received');
    }

    return rule;
  }

  async generateQuizQuestions(topic: string, count: number = 20): Promise<QuizQuestion[]> {
    const messages = [
      {
        role: 'system',
        content: 'You are a German language quiz creator. Generate multiple choice questions to test German language knowledge.'
      },
      {
        role: 'user',
        content: `Create exactly ${count} multiple choice questions about "${topic}" in German. Format your response as a JSON array where each object has: "question" (the question in German), "options" (array of 4 possible answers), "correctAnswer" (0-3 index of correct option), and "explanation" (brief explanation of why the answer is correct).`
      }
    ];

    const content = await this.makeRequest(messages);
    const questions = this.parseJsonResponse<QuizQuestion[]>(content);

    // Validate the structure
    const validQuestions = questions.filter(q =>
      q.question && Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 && q.correctAnswer < 4
    );

    if (validQuestions.length === 0) {
      throw new Error('No valid quiz questions found in response');
    }

    return validQuestions;
  }

  async enhanceExample(germanSentence: string): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: 'You are a German language expert. Provide enhanced, more detailed example sentences while maintaining grammatical correctness.'
      },
      {
        role: 'user',
        content: `Take this German sentence: "${germanSentence}" and create a more detailed, interesting version that uses the same core vocabulary and grammar. Return only the enhanced German sentence, nothing else.`
      }
    ];

    const content = await this.makeRequest(messages, 0.8);
    return content.replace(/['"]/g, '').trim();
  }

  async translateWord(germanWord: string): Promise<{ english: string; example: string }> {
    const messages = [
      {
        role: 'system',
        content: 'You are a German-English dictionary. Provide accurate translations for German words with example sentences. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: `Translate this German word/phrase to English: "${germanWord}"

Provide:
1. The most accurate English translation
2. A simple German example sentence using this word

Format your response as JSON with exactly these properties:
{"english": "translation", "example": "German sentence using the word"}

Only return the JSON, nothing else.`
      }
    ];

    try {
      const content = await this.makeRequest(messages, 0.3, 500);
      const result = this.parseJsonResponse<{ english: string; example: string }>(content);

      if (!result.english || !result.example) {
        throw new Error('Invalid translation response');
      }

      return result;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Failed to translate "${germanWord}"`);
    }
  }

  async chat(userMessage: string, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []): Promise<string> {
    const systemMessage = {
      role: 'system',
      content: `You are a helpful German language learning assistant. You help users with:
- German vocabulary, grammar, and pronunciation
- Explanations of German words and phrases
- German-English and English-German translations
- Cultural context about German-speaking countries
- Study tips and learning strategies

Keep responses concise and helpful. When providing German text, you can include English translations in parentheses. Use markdown for formatting when helpful.`
    };

    const messages = [
      systemMessage,
      ...conversationHistory.map(msg => ({
        role: msg.role as string,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await this.makeRequest(messages, 0.7, 1000);
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  }

  async generateSpeakingExercises(
    topics: string[],
    difficulty: 'B1' | 'B2' | 'C1' = 'B1',
    count: number = 15
  ): Promise<SpeakingExercise[]> {
    const topicString = topics.join(', ');
    const difficultyContext = {
      'B1': 'intermediate level with complex sentences, job interviews, and everyday situations',
      'B2': 'upper-intermediate level with academic discussions, business language, and sophisticated vocabulary',
      'C1': 'advanced level with professional contexts, complex grammar structures, and abstract concepts'
    };

    const messages = [
      {
        role: 'system',
        content: `You are an expert German language instructor creating speaking practice exercises for ${difficulty} level students. Focus on ${difficultyContext[difficulty]}. Generate exercises that are challenging but appropriate for the level.`
      },
      {
        role: 'user',
        content: `Create exactly ${count} German speaking practice exercises on the following topics: ${topicString}

Requirements:
- Mix of exercise types: pronunciation, conversation, reading, repetition
- ${difficulty} level difficulty (CEFR)
- Include phonetic transcription using English approximations
- Provide realistic context for each exercise
- Add 2-3 practical pronunciation tips per exercise
- Focus on topics: ${topicString}

Return ONLY a valid JSON array with this exact format:
[
  {
    "id": "unique_id",
    "type": "pronunciation|conversation|reading|repetition",
    "german": "German sentence or phrase",
    "english": "English translation",
    "phonetic": "English phonetic approximation",
    "difficulty": "${difficulty}",
    "context": "Realistic context description",
    "tips": ["tip1", "tip2", "tip3"]
  }
]

Make sentences progressively more complex. Ensure variety in topics and exercise types. No explanatory text, just the JSON array.`
      }
    ];

    const content = await this.makeRequest(messages, 0.8, 3000);

    try {
      // Clean the content to ensure it's valid JSON
      const cleanedContent = content
        .replace(/```json\s*/, '')
        .replace(/```\s*$/, '')
        .replace(/^\s*/, '')
        .replace(/\s*$/, '')
        .trim();

      console.log('Raw API response:', cleanedContent);

      const exercises = JSON.parse(cleanedContent);

      if (!Array.isArray(exercises)) {
        throw new Error('Response is not an array');
      }

      // Validate and filter exercises
      const validExercises = exercises
        .filter((ex: any) =>
          ex.german && ex.english && ex.difficulty && ex.context &&
          Array.isArray(ex.tips) && ex.tips.length > 0 &&
          ['pronunciation', 'conversation', 'reading', 'repetition'].includes(ex.type)
        )
        .slice(0, count)
        .map((ex: any, index: number) => ({
          id: ex.id || `${difficulty.toLowerCase()}-${topicString.replace(/\s+/g, '-').toLowerCase()}-${index + 1}`,
          type: ex.type,
          german: ex.german,
          english: ex.english,
          phonetic: ex.phonetic || '',
          difficulty: difficulty,
          context: ex.context,
          tips: ex.tips.slice(0, 3) // Limit to 3 tips
        }));

      if (validExercises.length === 0) {
        throw new Error('No valid speaking exercises found in response');
      }

      console.log(`Generated ${validExercises.length} valid speaking exercises for ${difficulty} level`);
      return validExercises;

    } catch (error) {
      console.error('Error parsing speaking exercises:', error);
      console.log('Content that failed to parse:', content);
      throw new Error(`Failed to generate speaking exercises: ${error}`);
    }
  }

  async generateReadingExercise(
    topic: string = '',
    difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'B1',
    textLength: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<ReadingExercise> {
    const topics = [
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
      'German business and economy'
    ];

    const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)];

    const textLengthGuide = {
      short: '150-200 words',
      medium: '250-350 words',
      long: '400-500 words'
    };

    const difficultyContext = {
      'A1': 'beginner level with simple sentences and basic vocabulary',
      'A2': 'elementary level with familiar topics and present tense',
      'B1': 'intermediate level with complex sentences and past/future tenses',
      'B2': 'upper-intermediate level with abstract concepts and advanced grammar',
      'C1': 'advanced level with sophisticated vocabulary and complex structures',
      'C2': 'proficiency level with nuanced language and idiomatic expressions'
    };

    const questionGuidelines = {
      'A1': 'Questions should test basic comprehension of explicitly stated facts. Use simple vocabulary.',
      'A2': 'Questions should test understanding of familiar topics and simple inferences.',
      'B1': 'Questions should test understanding of main ideas and some implicit information.',
      'B2': 'Questions MUST require inference, critical thinking, and analysis. Ask about author\'s purpose, tone, implicit meanings, cause-effect relationships, and nuances. Avoid simple factual recall. Options should be plausible with subtle differences. Test ability to distinguish main ideas from details, understand implications, and analyze arguments.',
      'C1': 'Questions should test sophisticated analysis, including subtle meanings, complex arguments, and stylistic devices.',
      'C2': 'Questions should test mastery-level comprehension including idiomatic usage, cultural nuances, and complex rhetorical analysis.'
    };

    const messages = [
      {
        role: 'system',
        content: 'You are an expert German language teacher creating reading comprehension exercises. Always respond with valid JSON only, no additional text or markdown.'
      },
      {
        role: 'user',
        content: `Create a German reading comprehension exercise with the following specifications:

Topic: ${selectedTopic}
Difficulty Level: ${difficulty} (${difficultyContext[difficulty]})
Text Length: ${textLengthGuide[textLength]}

Requirements:
1. Write an engaging German text appropriate for ${difficulty} level
2. Include 5-8 relevant vocabulary words with English translations
3. Create exactly 10 questions using various question types
4. Use question types: multiple-choice, true-false, short-answer, fill-gaps, matching, word-order, sentence-completion
5. For fill-gaps: use ____ to mark blanks in textWithGaps field
6. For matching: provide pairs array with left (German) and right (English)
7. For word-order: provide scrambledWords array with correct order as correctAnswer
8. Each question must have clear explanations

CRITICAL - Question Quality for ${difficulty}:
${questionGuidelines[difficulty]}

${difficulty === 'B2' || difficulty === 'C1' || difficulty === 'C2' ? `
For B2+ levels, your questions MUST:
- Require readers to infer information NOT explicitly stated
- Ask about WHY or HOW, not just WHAT
- Test understanding of author's purpose, attitude, or tone
- Require synthesis of information from multiple sentences
- Include distractors that are plausible but require careful analysis to eliminate
- Test cause-effect relationships and implications
- Ask about the main argument vs supporting details
- Avoid questions where the answer is a direct quote from the text

AVOID for B2+:
- Simple fact recall ("Where does X live?", "When did Y happen?")
- True/false questions about explicitly stated facts
- Multiple choice with obviously wrong options
- Questions answered by a single sentence from the text
` : ''}

Return ONLY valid JSON in this exact format:
{
  "title": "Exercise title in German",
  "text": "The complete German reading text",
  "vocabulary": [
    {"word": "German word", "meaning": "English meaning"}
  ],
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "Question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option",
      "explanation": "Explanation text"
    }
  ]
}

Important: Mix question types, ensure educational value, and make content culturally relevant to Germany.`
      }
    ];

    const content = await this.makeRequest(messages, 0.7, 3000);

    try {
      const response = this.parseJsonResponse<any>(content);

      // Validate response structure
      if (!response.title || !response.text || !response.questions) {
        throw new Error('Invalid response structure');
      }

      // Ensure vocabulary exists
      if (!response.vocabulary) {
        response.vocabulary = [];
      }

      // Format and validate questions
      const formattedQuestions = response.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || 'No explanation provided',
        textWithGaps: q.textWithGaps,
        pairs: q.pairs || [],
        scrambledWords: q.scrambledWords || []
      }));

      // Calculate estimated reading time
      const wordCount = response.text.split(' ').length;
      const estimatedTime = Math.max(10, Math.round(wordCount / 20));

      const readingExercise: ReadingExercise = {
        id: `generated-${Date.now()}`,
        title: response.title,
        difficulty: difficulty,
        topic: selectedTopic,
        text: response.text,
        vocabulary: response.vocabulary,
        questions: formattedQuestions,
        estimatedTime: estimatedTime
      };

      console.log(`Generated reading exercise: ${readingExercise.title} (${difficulty})`);
      return readingExercise;

    } catch (error) {
      console.error('Error parsing reading exercise:', error);
      console.log('Content that failed to parse:', content);
      throw new Error(`Failed to generate reading exercise: ${error}`);
    }
  }

  async analyzeWriting(
    text: string,
    exerciseType: 'email' | 'essay' | 'report' | 'story' | 'informal-letter' | 'formal-letter' = 'essay',
    targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'B1'
  ): Promise<WritingFeedback> {
    const exerciseContext = {
      'email': 'a formal or semi-formal email',
      'essay': 'an argumentative or opinion essay',
      'report': 'a structured report with facts and analysis',
      'story': 'a creative narrative story',
      'informal-letter': 'a casual letter to a friend or family member',
      'formal-letter': 'a formal business or official letter'
    };

    const levelExpectations = {
      'A1': 'very simple sentences, basic vocabulary, present tense only',
      'A2': 'simple connected sentences, familiar topics, basic past tense',
      'B1': 'clear connected text, expressing opinions, using connectors',
      'B2': 'clear detailed text, complex arguments, varied vocabulary and grammar',
      'C1': 'sophisticated text, nuanced expression, advanced structures',
      'C2': 'professional quality, idiomatic usage, stylistic precision'
    };

    const messages = [
      {
        role: 'system',
        content: `You are an expert German language teacher and grammar specialist. Analyze German writing with precision and provide constructive, educational feedback. Be thorough but encouraging. Focus on helping the learner improve their German skills at the ${targetLevel} level.`
      },
      {
        role: 'user',
        content: `Analyze this German text written as ${exerciseContext[exerciseType]} at ${targetLevel} level (expected: ${levelExpectations[targetLevel]}):

"""
${text}
"""

Provide a comprehensive analysis in valid JSON format:

{
  "overallScore": <number 0-100>,
  "grammarErrors": [
    {
      "original": "the incorrect phrase or word",
      "correction": "the corrected version",
      "explanation": "clear explanation in English of why this is wrong and the grammar rule",
      "type": "spelling|grammar|punctuation"
    }
  ],
  "vocabularyFeedback": {
    "level": "estimated CEFR level of vocabulary used",
    "suggestions": ["specific vocabulary improvements or alternatives"],
    "goodPhrases": ["well-used phrases or expressions to highlight"]
  },
  "structureFeedback": {
    "hasIntroduction": true/false,
    "hasConclusion": true/false,
    "paragraphCount": <number>,
    "suggestions": ["structural improvements"]
  },
  "coherenceFeedback": {
    "usesConnectors": true/false,
    "logicalFlow": true/false,
    "suggestions": ["specific coherence improvements, e.g. suggest specific German connectors"]
  },
  "improvedVersion": "A corrected and improved version of the entire text in German, showing how it could be written better while maintaining the original meaning",
  "tips": ["3-5 specific, actionable tips for improvement"]
}

Be specific with corrections. For each grammar error, explain the rule clearly. The improved version should be a complete rewrite that serves as a model.
Make sure to return ONLY valid JSON, no additional text.`
      }
    ];

    try {
      const content = await this.makeRequest(messages, 0.3, 3000);
      const feedback = this.parseJsonResponse<WritingFeedback>(content);

      // Validate the response structure
      if (typeof feedback.overallScore !== 'number') {
        feedback.overallScore = 70;
      }
      if (!Array.isArray(feedback.grammarErrors)) {
        feedback.grammarErrors = [];
      }
      if (!feedback.vocabularyFeedback) {
        feedback.vocabularyFeedback = { level: targetLevel, suggestions: [], goodPhrases: [] };
      }
      if (!feedback.structureFeedback) {
        feedback.structureFeedback = { hasIntroduction: true, hasConclusion: true, paragraphCount: 1, suggestions: [] };
      }
      if (!feedback.coherenceFeedback) {
        feedback.coherenceFeedback = { usesConnectors: false, logicalFlow: true, suggestions: [] };
      }
      if (!feedback.improvedVersion) {
        feedback.improvedVersion = text;
      }
      if (!Array.isArray(feedback.tips)) {
        feedback.tips = [];
      }

      console.log(`Analyzed writing: Score ${feedback.overallScore}/100, ${feedback.grammarErrors.length} errors found`);
      return feedback;

    } catch (error) {
      console.error('Error analyzing writing:', error);
      throw new Error(`Failed to analyze writing: ${error}`);
    }
  }
}

export interface WritingFeedback {
  overallScore: number;
  grammarErrors: Array<{
    original: string;
    correction: string;
    explanation: string;
    type: 'spelling' | 'grammar' | 'punctuation';
  }>;
  vocabularyFeedback: {
    level: string;
    suggestions: string[];
    goodPhrases: string[];
  };
  structureFeedback: {
    hasIntroduction: boolean;
    hasConclusion: boolean;
    paragraphCount: number;
    suggestions: string[];
  };
  coherenceFeedback: {
    usesConnectors: boolean;
    logicalFlow: boolean;
    suggestions: string[];
  };
  improvedVersion: string;
  tips: string[];
}

export const deepseekApi = new DeepSeekApiService();
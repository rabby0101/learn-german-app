// Google Cloud Text-to-Speech Service
export class TTSService {
  private static readonly API_BASE_URL = 'https://texttospeech.googleapis.com/v1';
  private static readonly DEFAULT_VOICE = {
    languageCode: 'de-DE',
    name: 'de-DE-Chirp-HD-F', // Chirp HD voice - high quality but no SSML support
    ssmlGender: 'FEMALE'
  };
  
  private static get apiKey(): string | null {
    return process.env.REACT_APP_GOOGLE_TTS_API_KEY || null;
  }

  static async speak(text: string, voice?: any, speakingRate?: number, context?: string): Promise<void> {
    console.log('API Key check:', this.apiKey ? `Found (${this.apiKey.substring(0, 10)}...)` : 'Not found');
    console.log('TTS Input text:', text);
    console.log('TTS Context:', context);
    
    if (!this.apiKey) {
      console.warn('Google Cloud TTS API key not found, falling back to Web Speech API');
      this.fallbackToWebSpeech(text);
      return;
    }

    try {
      // Clean and prepare text for German TTS
      const cleanedText = this.cleanTextForGermanTTS(text);
      console.log('Cleaned text for TTS:', cleanedText);
      
      const selectedVoice = voice || this.DEFAULT_VOICE;
      // Ensure we always use German language code regardless of voice config
      selectedVoice.languageCode = 'de-DE';
      console.log('Selected voice:', selectedVoice);
      
      // Check if voice supports SSML
      const supportsSSML = this.voiceSupportsSSML(selectedVoice.name);
      console.log(`Voice ${selectedVoice.name} supports SSML:`, supportsSSML);
      
      let requestBody;
      
      if (supportsSSML) {
        // Create natural SSML with emotion and proper German pronunciation
        const ssmlText = this.createNaturalSSML(cleanedText, context);
        console.log('Generated SSML:', ssmlText);
        
        requestBody = {
          input: { ssml: ssmlText },
          voice: {
            languageCode: selectedVoice.languageCode,
            name: selectedVoice.name,
            ssmlGender: selectedVoice.ssmlGender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speakingRate || 1.0,
            pitch: this.getContextualPitch(context),
            volumeGainDb: 0.0,
            // Force German audio profile
            effectsProfileId: ['telephony-class-application']
          }
        };
      } else {
        // Fallback to plain text with enhanced audio config
        console.log('Using plain text with enhanced audio config');
        
        requestBody = {
          input: { text: cleanedText },
          voice: {
            languageCode: selectedVoice.languageCode,
            name: selectedVoice.name,
            ssmlGender: selectedVoice.ssmlGender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speakingRate || 1.0,
            pitch: this.getContextualPitch(context),
            volumeGainDb: 2.0, // Slightly louder for clarity
            // Force German audio profile
            effectsProfileId: ['telephony-class-application']
          }
        };
      }

      console.log('TTS Request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${this.API_BASE_URL}/text:synthesize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS API Error Response:', errorText);
        throw new Error(`Google Cloud TTS API error: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received from Google Cloud TTS');
      }

      // Convert base64 audio to blob
      const audioBytes = atob(data.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      await audio.play();

      // Clean up the blob URL after playing
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });

    } catch (error) {
      console.warn('Google Cloud TTS failed, falling back to Web Speech API:', error);
      this.fallbackToWebSpeech(text);
    }
  }

  private static cleanTextForGermanTTS(text: string): string {
    let cleaned = text.trim();
    
    // Remove quotation marks that might confuse language detection
    cleaned = cleaned.replace(/^["']|["']$/g, '');
    
    // Ensure proper German punctuation spacing
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Remove any non-German characters that might trigger wrong language detection
    // Keep umlauts, ß, and standard punctuation
    cleaned = cleaned.replace(/[^\w\säöüÄÖÜß.,!?;:\-()\[\]]/g, '');
    
    // Ensure text doesn't start/end with punctuation that could confuse TTS
    cleaned = cleaned.replace(/^[.,!?;:]+|[.,!?;:]+$/g, '');
    
    return cleaned.trim();
  }

  private static fallbackToWebSpeech(text: string): void {
    if ('speechSynthesis' in window) {
      const cleanedText = this.cleanTextForGermanTTS(text);
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('No TTS options available');
    }
  }

  // Check if voice supports SSML
  private static voiceSupportsSSML(voiceName: string): boolean {
    // Chirp voices don't support SSML, Neural2 and Standard voices do
    const ssmlSupportedVoices = [
      'de-DE-Neural2-A', 'de-DE-Neural2-B', 'de-DE-Neural2-C', 'de-DE-Neural2-D',
      'de-DE-Neural2-F', 'de-DE-Neural2-G',
      'de-DE-Standard-A', 'de-DE-Standard-B', 'de-DE-Standard-C', 'de-DE-Standard-D',
      'de-DE-Standard-E', 'de-DE-Standard-F'
    ];
    
    return ssmlSupportedVoices.includes(voiceName);
  }

  // Get available German voices
  static getAvailableVoices(): any[] {
    return [
      // Default/Recommended voice
      {
        name: 'de-DE-Chirp-HD-F',
        displayName: 'German Female (Chirp HD F) ⭐ Default',
        languageCode: 'de-DE',
        ssmlGender: 'FEMALE',
        type: 'Chirp HD',
        supportsSSML: false
      },
      // SSML-capable voices
      {
        name: 'de-DE-Neural2-G',
        displayName: 'German Female (Neural2 G) ✨',
        languageCode: 'de-DE',
        ssmlGender: 'FEMALE',
        type: 'Neural2',
        supportsSSML: true
      },
      {
        name: 'de-DE-Neural2-B',
        displayName: 'German Male (Neural2 B) ✨',
        languageCode: 'de-DE',
        ssmlGender: 'MALE',
        type: 'Neural2',
        supportsSSML: true
      },
      {
        name: 'de-DE-Neural2-F',
        displayName: 'German Female (Neural2 F) ✨',
        languageCode: 'de-DE',
        ssmlGender: 'FEMALE',
        type: 'Neural2',
        supportsSSML: true
      },
      {
        name: 'de-DE-Neural2-C',
        displayName: 'German Female (Neural2 C) ✨',
        languageCode: 'de-DE',
        ssmlGender: 'FEMALE',
        type: 'Neural2',
        supportsSSML: true
      },
      // High-quality but no SSML support
      {
        name: 'de-DE-Chirp3-HD-Achernar',
        displayName: 'German Female (Chirp3 HD Achernar)',
        languageCode: 'de-DE',
        ssmlGender: 'FEMALE',
        type: 'Chirp3 HD',
        supportsSSML: false
      },
      {
        name: 'de-DE-Chirp3-HD-Achird',
        displayName: 'German Male (Chirp3 HD Achird)',
        languageCode: 'de-DE',
        ssmlGender: 'MALE',
        type: 'Chirp3 HD',
        supportsSSML: false
      },
      {
        name: 'de-DE-Chirp-HD-D',
        displayName: 'German Male (Chirp HD D)',
        languageCode: 'de-DE',
        ssmlGender: 'MALE',
        type: 'Chirp HD',
        supportsSSML: false
      }
    ];
  }

  // Set a different German voice
  static async speakWithVoice(text: string, voiceName: string, speakingRate?: number, context?: string): Promise<void> {
    const voices = this.getAvailableVoices();
    const selectedVoice = voices.find(v => v.name === voiceName);
    
    if (!selectedVoice) {
      console.warn(`Voice ${voiceName} not found, using default voice`);
      return this.speak(text, undefined, speakingRate, context);
    }

    const voiceConfig = {
      languageCode: selectedVoice.languageCode,
      name: selectedVoice.name,
      ssmlGender: selectedVoice.ssmlGender
    };

    return this.speak(text, voiceConfig, speakingRate, context);
  }

  // Create natural SSML with emotion and proper German pronunciation
  private static createNaturalSSML(text: string, context?: string): string {
    // Start with SSML wrapper
    let ssml = '<speak>';
    
    // Add prosody based on context for natural emotion
    const prosody = this.getProsodyForContext(context);
    ssml += `<prosody ${prosody}>`;
    
    // Process the text for better German pronunciation
    let processedText = text;
    
    // Add emphasis and pauses for natural speech patterns
    processedText = this.enhanceGermanPronunciation(processedText, context);
    
    ssml += processedText;
    ssml += '</prosody>';
    ssml += '</speak>';
    
    return ssml;
  }

  // Get prosody settings based on context
  private static getProsodyForContext(context?: string): string {
    const defaultProsody = 'rate="medium" pitch="+0st" volume="medium"';
    
    if (!context) return defaultProsody;
    
    // Context-based prosody for natural emotion
    const contextMap: { [key: string]: string } = {
      'conversation': 'rate="medium" pitch="+2st" volume="medium"',  // Slightly higher, conversational
      'pronunciation': 'rate="slow" pitch="+0st" volume="loud"',     // Clear and deliberate
      'reading': 'rate="medium" pitch="+1st" volume="medium"',       // Natural reading pace
      'repetition': 'rate="slow" pitch="+0st" volume="loud"',        // Clear for repetition
      'question': 'rate="medium" pitch="+3st" volume="medium"',      // Rising intonation
      'formal': 'rate="medium" pitch="-1st" volume="medium"',        // Professional tone
      'casual': 'rate="medium-fast" pitch="+2st" volume="medium"'   // Friendly and casual
    };
    
    // Match context keywords
    const lowerContext = context.toLowerCase();
    for (const [key, prosody] of Object.entries(contextMap)) {
      if (lowerContext.includes(key)) {
        return prosody;
      }
    }
    
    return defaultProsody;
  }

  // Get contextual pitch for natural speech
  private static getContextualPitch(context?: string): number {
    if (!context) return 0.0;
    
    const lowerContext = context.toLowerCase();
    
    // Questions should have rising intonation
    if (lowerContext.includes('question') || lowerContext.includes('?')) {
      return 2.0;
    }
    
    // Formal contexts should be slightly lower
    if (lowerContext.includes('formal') || lowerContext.includes('business') || lowerContext.includes('job')) {
      return -1.0;
    }
    
    // Casual/friendly contexts should be slightly higher
    if (lowerContext.includes('casual') || lowerContext.includes('friendly') || lowerContext.includes('conversation')) {
      return 1.5;
    }
    
    return 0.0;
  }

  // Enhance German pronunciation with SSML markup
  private static enhanceGermanPronunciation(text: string, context?: string): string {
    let enhanced = text;
    
    // Add natural pauses for better phrasing
    enhanced = enhanced.replace(/([.!?])\s+/g, '$1<break time="0.8s"/>');
    enhanced = enhanced.replace(/([,;:])\s+/g, '$1<break time="0.3s"/>');
    
    // Emphasize important German pronunciation patterns
    const germanPatterns = [
      // Emphasize umlauts for clarity
      { pattern: /\b(\w*[äöü]\w*)\b/g, replacement: '<phoneme alphabet="ipa" ph="$1">$1</phoneme>' },
      
      // Add slight emphasis to compound words (common in German)
      { pattern: /\b(\w{10,})\b/g, replacement: '<emphasis level="moderate">$1</emphasis>' },
      
      // Emphasize questions for natural intonation
      { pattern: /([^.!?]*\?)/g, replacement: '<prosody pitch="+20%">$1</prosody>' },
      
      // Add emphasis to modal verbs for natural conversation
      { pattern: /\b(könnte|hätte|würde|sollte|müsste|dürfte)\b/gi, replacement: '<emphasis level="moderate">$1</emphasis>' },
      
      // Emphasize polite expressions
      { pattern: /\b(bitte|danke|entschuldigung|verzeihung)\b/gi, replacement: '<emphasis level="moderate">$1</emphasis>' }
    ];
    
    // Apply patterns selectively based on context
    if (context) {
      const lowerContext = context.toLowerCase();
      
      // For pronunciation practice, add more phonetic guidance
      if (lowerContext.includes('pronunciation')) {
        // Add breaks between syllables for complex words
        enhanced = enhanced.replace(/(\w{8,})/g, (match) => {
          if (match.includes('ung') || match.includes('lich') || match.includes('heit')) {
            return `<prosody rate="slow">${match}</prosody>`;
          }
          return match;
        });
      }
      
      // For conversation practice, make it more natural
      if (lowerContext.includes('conversation')) {
        germanPatterns.forEach(pattern => {
          enhanced = enhanced.replace(pattern.pattern, pattern.replacement);
        });
      }
    }
    
    return enhanced;
  }
}
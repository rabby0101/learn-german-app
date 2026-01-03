const fs = require('fs');
const path = require('path');

// Read the extracted text file
const text = fs.readFileSync('/tmp/vocab.txt', 'utf8');

// Parse vocabulary entries
const lines = text.split('\n');
const vocabulary = [];
let currentChapter = '';
let currentModul = '';

// Regex patterns for different word types
const nounPattern = /^(der|die|das)\s+([A-ZÄÖÜ][a-zäöüß\-]+),?\s*([-\"]?[a-zäöüß\"]*)?/;
const verbPattern = /^([a-zäöüß]+),\s*([a-zäöüß]+),\s*(hat|ist)\s+([a-zäöüß]+)/;
const adjPattern = /^([a-zäöüß]+)\s*\(.*\)/;
const simpleWordPattern = /^([a-zäöüß]+)$/;
const compoundNounPattern = /^(der\/die)\s+([A-ZÄÖÜ][a-zäöüß\-\/]+),?\s*([-\"]?[a-zäöüß\"]*)?/;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and page markers
    if (!line || line.startsWith('Aspekte neu') || line.startsWith('Kapitelwortschatz') || line.startsWith('Seite')) {
        continue;
    }

    // Detect chapter headers
    if (line.startsWith('Kapitel')) {
        currentChapter = line;
        continue;
    }

    // Detect module headers
    if (line.startsWith('Modul') || line.startsWith('Auftakt') || line.startsWith('Porträt') || line.startsWith('Grammatik')) {
        currentModul = line;
        continue;
    }

    // Skip section numbers like "1a", "2b", etc.
    if (/^[0-9]+[a-z]?$/.test(line)) {
        continue;
    }

    // Parse vocabulary entries
    let german = '';
    let wordType = '';

    // Try to match noun pattern (der/die/das)
    let match = line.match(nounPattern);
    if (match) {
        german = line.split('(')[0].trim();
        wordType = 'noun';
    }

    // Try compound noun pattern (der/die)
    if (!german) {
        match = line.match(compoundNounPattern);
        if (match) {
            german = line.split('(')[0].trim();
            wordType = 'noun';
        }
    }

    // Try verb pattern
    if (!german) {
        match = line.match(verbPattern);
        if (match) {
            german = line.split('(')[0].trim();
            wordType = 'verb';
        }
    }

    // Check if line starts with lowercase (adjective, adverb, or verb infinitive)
    if (!german && /^[a-zäöüß]/.test(line)) {
        // Skip if it's a continuation of previous line
        if (!line.includes(')') || line.startsWith('der') || line.startsWith('die') || line.startsWith('das')) {
            german = line.split('(')[0].trim();
            wordType = 'other';
        }
    }

    // If we found a valid entry, add it
    if (german && german.length > 1) {
        // Clean up the German word
        german = german
            .replace(/\s+/g, ' ')
            .replace(/,\s*$/, '')
            .trim();

        // Skip if too short or just punctuation
        if (german.length < 2 || /^[^a-zA-ZäöüÄÖÜß]/.test(german)) {
            continue;
        }

        vocabulary.push({
            german: german,
            english: '', // Will need translation
            example: '',
            chapter: currentChapter,
            module: currentModul,
            wordType: wordType,
            level: 'B2'
        });
    }
}

// Remove duplicates
const uniqueVocab = [];
const seenWords = new Set();

for (const word of vocabulary) {
    const key = word.german.toLowerCase();
    if (!seenWords.has(key)) {
        seenWords.add(key);
        uniqueVocab.push(word);
    }
}

console.log(`Parsed ${uniqueVocab.length} unique vocabulary entries`);

// Save to JSON file
const outputPath = path.join(__dirname, 'src', 'data', 'aspekte-b2-vocabulary.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(uniqueVocab, null, 2));

console.log(`Saved to ${outputPath}`);

// Also create a simpler format for the app
const simpleVocab = uniqueVocab.map(w => ({
    german: w.german,
    english: '', // Will need to be filled in
    example: `${w.german} (${w.chapter})`,
    level: 'B2'
}));

const simpleOutputPath = path.join(__dirname, 'src', 'data', 'aspekte-b2-vocabulary-simple.json');
fs.writeFileSync(simpleOutputPath, JSON.stringify(simpleVocab, null, 2));
console.log(`Saved simple format to ${simpleOutputPath}`);

# Grok 3 Integration Setup Guide

## Overview
Your German learning app now has Grok 3 AI integration for generating vocabulary words, grammar examples, and quiz questions dynamically.

## Setup Instructions

### 1. Get Your GitHub Access Token
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "German Learning App - Grok 3"
4. Select the following permissions:
   - `repo` (Full control of private repositories)
   - `read:user` (Read access to user profile)
5. Click "Generate token"
6. **Important**: Copy the token immediately - you won't see it again!

### 2. Configure Environment Variables
1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```
2. Edit the `.env` file and add your token:
   ```
   REACT_APP_GITHUB_ACCESS_TOKEN=your_github_access_token_here
   ```

### 3. Restart Your Development Server
```bash
npm start
```

## Features Added

### 📚 Vocabulary Page
- **Generate More Words** button with difficulty selection
- Choose between Beginner, Intermediate, and Advanced levels
- Generated words are added to your existing vocabulary collection
- AI-generated words include German word, English translation, and example sentence

### 📖 Grammar Page
- **Generate Grammar Rule** input field
- Enter any grammar topic (e.g., "Past Perfect Tense", "German Articles")
- **Get More Examples** button for each grammar rule
- AI generates 5 additional example sentences for better understanding
- New grammar rules include comprehensive explanations and multiple examples

### 🧠 Quiz Page
- **Generate Custom Quiz** functionality
- Enter any topic to create a personalized 5-question quiz
- Switch between Original Quiz and AI Generated Quiz
- AI-generated questions include explanations for correct answers
- Multiple choice format with immediate feedback

## API Endpoint
The integration uses GitHub Models API:
- **Endpoint**: `https://models.github.ai/inference/chat/completions`
- **Model**: `xai/grok-3`
- **Authentication**: GitHub Personal Access Token

## Error Handling
The app includes comprehensive error handling for:
- Network connectivity issues
- Authentication problems
- Rate limiting
- Invalid API responses
- JSON parsing errors

## Usage Tips
1. **Vocabulary Generation**: Start with "beginner" difficulty and gradually increase
2. **Grammar Topics**: Be specific (e.g., "Dative Case" instead of just "Cases")
3. **Quiz Topics**: Use focused topics like "German Articles" or "Past Tense Verbs"
4. **Rate Limits**: If you see rate limit errors, wait a few minutes before trying again

## Troubleshooting

### Common Issues
1. **"Authentication failed"**: Check your GitHub token is correct and has proper permissions
2. **"Access denied"**: Ensure your token has `repo` access
3. **"Rate limit exceeded"**: Wait a few minutes and try again
4. **Network errors**: Check your internet connection

### Token Permissions Required
Your GitHub token needs access to:
- GitHub Models (provided through `repo` permission)
- API access for Grok 3 model

## Security Notes
- Never commit your `.env` file to git (it's already in `.gitignore`)
- Keep your GitHub token secure and don't share it
- Rotate your token periodically for security
- The token is only sent to GitHub's official API endpoints

## Cost Information
- GitHub Models provides free access to Grok 3 with rate limits
- No additional costs for basic usage
- Check GitHub's pricing page for current rate limits and pricing

Enjoy your enhanced German learning experience with AI-powered content generation! 🚀
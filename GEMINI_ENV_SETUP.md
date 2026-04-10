# Environment Variables Setup for Gemini Live

## Add these to your .env.local file:

```bash
# Gemini API Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Voice Configuration (optional overrides)
NEXT_PUBLIC_GEMINI_LIVE_ENABLED=true
NEXT_PUBLIC_VOICE_MODEL=tts-1  # Keep OpenAI TTS or switch to Gemini
NEXT_PUBLIC_STT_MODEL=whisper-1  # Keep Whisper or switch to Gemini

# Session Configuration
GEMINI_CONTEXT_CACHE_TTL=3600  # 1 hour context memory
GEMINI_MAX_SESSION_DURATION=1800  # 30 minutes max session
```

## Getting Your Gemini API Key:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file
4. The key should start with `AI...`

## Current Status:

✅ **Gemini SDK Installed**: `@google/generative-ai 0.24.1`  
⚠️ **Need API Key**: Add to environment variables  
🔄 **Ready to Test**: Once API key is configured  

## Quick Test Command:

```bash
# Create .env.local first with your API key, then:
pnpm run dev

# Test Gemini Live in browser:
# http://localhost:3000/playground/grade1?subject=math&gemini_live=true
```
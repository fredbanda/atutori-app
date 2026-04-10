# 🔑 Missing API Keys - Voice Setup Required!

## 🚨 **Problem Found: Missing OpenAI API Key**

Your voice isn't working because you need to add the **OpenAI API key** for Text-to-Speech.

## ✅ **Quick Fix - Add These to Your .env.local:**

Create or update `c:\Users\PC\Desktop\business-apps\atutori\.env.local` with:

```bash
# Copy everything from sample.env.txt, PLUS add these:

# Required for Voice (TTS/STT)
OPENAI_API_KEY=sk-your-openai-key-here

# Required for Gemini Live AI Tutor
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key-here

# Optional: Anthropic (you already use this for lesson generation)
ANTHROPIC_API_KEY=your-anthropic-key-here
```

## 🔑 **Where to Get API Keys:**

### **1. OpenAI API Key (Required for Voice)**
1. Go to: https://platform.openai.com/api-keys
2. Create new key
3. Copy the key (starts with `sk-`)
4. Add to .env.local as `OPENAI_API_KEY=sk-...`

### **2. Gemini API Key (Required for Gemini Live)**
1. Go to: https://aistudio.google.com/app/apikey  
2. Create new key
3. Copy the key (starts with `AI...`)
4. Add to .env.local as `NEXT_PUBLIC_GEMINI_API_KEY=AI...`

## ⚡ **Complete .env.local File Example:**

```bash
# Database (copy from sample.env.txt)
DATABASE_URL=postgresql://neondb_owner:npg_74RYKXbotnUy@ep-blue-band-ammmq68g-pooler.c-5.us-east-1.aws.neon.tech/eatutori_db?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_74RYKXbotnUy@ep-blue-band-ammmq68g.c-5.us-east-1.aws.neon.tech/eatutori_db?sslmode=require&channel_binding=require

# Redis (copy from sample.env.txt)  
KV_REST_API_URL=https://vital-hawk-67999.upstash.io
KV_URL=rediss://default:gQAAAAAAAQmfAAIncDFhZWQwNTcwODk1ZTA0Yjc3YTc5NDcyYmE1MWNiZWI1N3AxNjc5OTk@vital-hawk-67999.upstash.io:6379
REDIS_URL=rediss://default:gQAAAAAAAQmfAAIncDFhZWQwNTcwODk1ZTA0Yjc3YTc5NDcyYmE1MWNiZWI1N3AxNjc5OTk@vital-hawk-67999.upstash.io:6379
KV_REST_API_READ_ONLY_TOKEN=ggAAAAAAAQmfAAIgcDEVbaWCWVtY8V6b-9jbXGnS7fKRux49WRHoP0qbxF9RWw
KV_REST_API_TOKEN=gQAAAAAAAQmfAAIncDFhZWQwNTcwODk1ZTA0Yjc3YTc5NDcyYmE1MWNiZWI1N3AxNjc5OTk

# Auth (copy from sample.env.txt)
BETTER_AUTH_SECRET=SFP75Lk3nYsPMauFZeRWBTtRjn9uu015
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ADD THESE FOR VOICE:
OPENAI_API_KEY=sk-your-openai-key-here
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# VOICE PROVIDER (optional - defaults to "gemini")
VOICE_PROVIDER=gemini  # Use "openai" for OpenAI-only, "gemini" for enhanced
```

## 🚀 **After Adding Keys:**

1. **Restart your dev server:**
   ```bash
   pnpm run dev
   ```

2. **Test voice functionality:**
   - Go to: http://localhost:3000/playground/primary-early/lesson/math
   - Look for voice indicators in lesson
   - Click speaker button to hear audio

## 🎯 **Expected Results:**

### **With OpenAI Key:**
- ✅ Voice buttons appear
- ✅ Audio plays when clicking speaker icon
- ✅ Standard voice mode works

### **With Gemini Key:**  
- ✅ Purple "Gemini Live AI Tutor Active" banner
- ✅ Real-time conversation mode
- ✅ Microphone-based interaction

### **Without Keys:**
- ❌ No voice buttons
- ❌ Silent lessons
- ❌ Text-only mode

## 💡 **Pro Tips:**

1. **Free Tiers Available:** Both OpenAI and Google offer free API credits
2. **Cost Estimation:** Voice for Grade 1 lessons costs ~$0.01-0.05 per lesson
3. **Development Mode:** Start with OpenAI key, add Gemini later
4. **Security:** .env.local is gitignored - your keys are safe

## 🔧 **Quick Setup Commands:**

```bash
# 1. Create .env.local file
cp sample.env.txt .env.local

# 2. Edit .env.local and add the API keys above

# 3. Restart server
pnpm run dev

# 4. Test voice
# Visit: http://localhost:3000/playground/primary-early/lesson/math
```

**That's it! Voice should work immediately after adding the OpenAI API key.** 🎉
# 🎤 Voice Not Working? Troubleshooting Guide

## 🚨 **Most Common Issue: Browser Autoplay Policy**

Modern browsers **block audio by default** until user interaction. Here's what to do:

### ✅ **Quick Fix:**
1. **Click ANYWHERE on the page first** (any button, lesson content, etc.)
2. **Then click the voice button** (🔊 speaker icon)
3. Audio should now play

### 🔍 **Check These Things:**

#### **1. Environment Variables**
Make sure you have the OpenAI API key for voice:

```bash
# Check your .env.local file:
OPENAI_API_KEY=sk-your-openai-key-here
```

**Missing this?** Voice won't work at all.

#### **2. Browser Volume & Settings**
- Check browser tab isn't muted (look for 🔇 icon on tab)
- Check system volume is up
- Check browser settings allow audio

#### **3. Voice Button Status**
Look for these indicators in the lesson:

```
🔊 = Voice enabled, unmuted
🔇 = Voice enabled but muted  
No icon = Voice not available
```

#### **4. Console Errors**
Open browser dev tools (F12) and check for errors:

```javascript
// Look for these in console:
✅ "Voice ready: true"
❌ "OpenAI API error"
❌ "Audio playback failed"
```

---

## 🎯 **Specific to Your App:**

### **Voice-Enabled Lessons**
Only **Grade 1 (primary-early)** has voice enabled:
- ✅ http://localhost:3000/playground/primary-early/lesson/math
- ❌ http://localhost:3000/playground/primary-mid/lesson/math (no voice)

### **Two Voice Modes**

#### **🤖 Gemini Live Mode (AI Conversation)**
- Requires: `NEXT_PUBLIC_GEMINI_API_KEY`
- Real-time speech recognition
- Needs microphone permissions

#### **🎤 Standard Voice Mode (Pre-recorded)**
- Requires: `OPENAI_API_KEY` 
- Pre-generated audio responses
- No microphone needed

---

## 🔧 **Step-by-Step Debug:**

### **Step 1: Check API Keys**
```bash
# Run in terminal:
cd c:\Users\PC\Desktop\business-apps\atutori
node voice-troubleshooting.js
```

### **Step 2: Test Basic Audio**
1. Visit any Grade 1 lesson
2. **Click the lesson title first** (important!)
3. Click voice button (🔊)
4. Should hear audio within 2-3 seconds

### **Step 3: Check Network**
Open browser dev tools → Network tab:
- Look for `/api/` calls
- Check if any fail with errors
- Voice audio loads as base64 data

### **Step 4: Force Standard Voice**
If Gemini Live has issues, force standard voice:
```
http://localhost:3000/playground/primary-early/lesson/math?gemini_live=false
```

---

## 🎓 **Expected Behavior:**

### **When Working Correctly:**
1. Visit Grade 1 lesson
2. See voice indicator in header
3. Audio preloads in background
4. Click voice button → immediate audio playback
5. Lesson content is spoken aloud

### **Audio Content Includes:**
- **Lesson introduction** ("Let's learn about numbers!")
- **Activity prompts** ("Can you count to 5?")
- **Repeat-after-me** ("Say 'one, two, three'")
- **Quiz questions** ("Which number comes next?")

---

## 🚀 **Quick Test:**

### **Method 1: Quick Check**
```javascript
// Paste in browser console:
const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTARVBUE9BAAAADwAAAABIZWxsbyB3b3JsZEQGAAAA');
audio.play().then(() => console.log('✅ Audio works')).catch(err => console.log('❌ Audio blocked:', err));
```

### **Method 2: Check Voice Status**
Look for these indicators in lesson page:
- 🎯 Purple banner = Gemini Live active
- 🎤 Blue banner = Standard voice active  
- 🔊 Speaker button = Voice controls available

---

## ❓ **Still Not Working?**

1. **Try different browser** (Chrome usually works best)
2. **Check if HTTPS** (some voice features need secure context)
3. **Clear browser cache** (audio files might be cached incorrectly)
4. **Check browser console** for specific error messages

**Most likely issue:** You need to **click something on the page first**, then click the voice button. This is due to browser autoplay policies! 🎯
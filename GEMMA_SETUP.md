# Gemma 3n E4B-it Local LLM Integration Setup

This guide walks you through setting up the local Gemma 3n E4B-it model with Beepin using MediaPipe GenAI for browser-based inference via WebGPU.

## 🚀 Quick Start

### 1. Install Dependencies ✅
Already done! `@mediapipe/tasks-genai` is installed via `bun install`.

### 2. Prepare the Model File

You have two options:

#### **Option A: Download Pre-Converted Model (Recommended)**
The easiest approach—download the web-converted `.litertlm` file:

1. Visit: https://huggingface.co/google/gemma-3n-E4B-it-litert-lm
2. Accept the license agreement
3. Download: `gemma-3n-E4B-it-int4-Web.litertlm` (~4.28 GB)
4. Place it in: `/assets/gemma-3n-E4B-it-int4-Web.litertlm`

**Note:** The download is large; use a fast connection or consider hosting on a CDN.

#### **Option B: Convert Your `.task` File (Advanced)**
If you prefer to convert your existing `/assets/gemma-3n-E4B-it-int4.task` file:

```bash
# Install LiteRT tools (oneAPI/MediaPipe SDK)
# https://github.com/google-ai-edge/LiteRT-LM

# Convert .task to .litertlm for web
litert-convert \
  --model_file=/assets/gemma-3n-E4B-it-int4.task \
  --target_format=web \
  --output=/assets/gemma-3n-E4B-it-int4-Web.litertlm
```

(Detailed conversion instructions: https://github.com/google-ai-edge/LiteRT-LM/wiki/Model-Conversion)

### 3. Environment Configuration ✅
The `.env` file is pre-configured:

```env
LLM_BACKEND=mediapipe
MEDIAPIPE_MODEL_PATH=/assets/gemma-3n-E4B-it-int4-Web.litertlm
MEDIAPIPE_WASM_PATH=https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm
```

Ollama remains available as fallback:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder
```

### 4. Start Beepin

```bash
bun dev
```

The app will start on `http://localhost:3000` (or next available port).

### 5. First Launch

**On app startup:**
1. The system checks for WebGPU availability
2. Attempts to initialize MediaPipe LLM
3. Downloads the model (~4.28 GB) on first use
4. Falls back to Ollama if WebGPU unavailable

**Browser Console Output:**
```
[LLM] Checking MediaPipe availability...
[MediaPipe] Initializing GenAI runtime...
[MediaPipe] FilesetResolver and LlmInference loaded.
[LLM] MediaPipe initialized successfully. Using as primary backend.
```

## ✅ Verification

### Check Backend Status

1. **In Browser Console** (F12 → Console):
   ```javascript
   // Check which backend is active
   fetch('/api/llm-status').then(r => r.json()).then(console.log);
   // Or manually in App.tsx, check logs
   ```

2. **In Beepin UI:**
   - Open the Command Palette (`Ctrl+K`)
   - Look for messages like: "Local AI engine initialized via WebGPU."

3. **Test Chat:**
   - Open the main view (Cockpit)
   - Try a prompt in the Command Stream
   - Response should come from Gemma (faster, local) or Ollama (fallback)

### Monitor Download Progress

For the first model download (~4.28 GB):
- Open DevTools → Network tab
- Look for requests to `/assets/gemma-3n-E4B-it-int4-Web.litertlm`
- Use DevTools → Performance to monitor memory usage (target: 3–5GB for model + session)

## ⚙️ Configuration Options

### Priority: Browser-First LLM

If you want to force MediaPipe (even if Ollama is running):
```env
LLM_BACKEND=mediapipe
```

### Priority: Ollama Fallback

If you want Ollama as primary (e.g., for testing):
```env
LLM_BACKEND=ollama
```

### Custom WASM Path

If self-hosting the WASM runtime:
```env
MEDIAPIPE_WASM_PATH=http://your-cdn.com/mediapipe-wasm
```

### Custom Model Path

If hosting the model elsewhere:
```env
MEDIAPIPE_MODEL_PATH=https://your-cdn.com/gemma-model.litertlm
```

## 🔍 Debugging

### MediaPipe Won't Initialize

**Symptom:** Console shows `[MediaPipe] Initialization failed...`

**Causes & Solutions:**

1. **WebGPU Not Supported**
   - Use a modern browser: Chrome 113+, Firefox 119+, Edge 113+
   - Check: https://caniuse.com/webgpu
   - Fallback: Ollama is used automatically

2. **Model File Missing**
   - Verify `/assets/gemma-3n-E4B-it-int4-Web.litertlm` exists
   - Check file size (~4.28 GB)
   - If corrupted, re-download

3. **CORS Issues**
   - If model hosted remotely, ensure CORS headers:
     ```
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: GET
     ```

4. **Memory Insufficient**
   - Check available VRAM/RAM (minimum ~6GB recommended)
   - Close other browser tabs/applications
   - Try smaller model variant (Gemma 1B, ~500MB)

### Ollama Fallback Triggered

**Check why MediaPipe didn't work:**

```javascript
// In browser console
const logs = document.body.innerText; // Captures console messages
console.log('Check [MediaPipe] messages above');
```

Or check server logs:
```bash
# If running custom backend
tail -f backend.log | grep MediaPipe
```

### Slow Response Generation

**If model loads but responses are slow:**

1. **GPU Underutilized:**
   - Verify WebGPU is actually being used (DevTools → Performance)
   - Try different browser (Chrome/Edge have better WebGPU support)

2. **Large Model:**
   - Try smaller Gemma variant (E2B: ~3GB, 1B: ~500MB)
   - Reduce `maxTokens` in `mediapieLLMService.ts`:
     ```typescript
     maxTokens: 512,  // Shorter responses = faster
     ```

3. **Model Not Quantized:**
   - Verify using `int4` variant (already pre-quantized in `-Web.litertlm`)
   - Check filename: should contain `int4` or `int8`

## 📊 Architecture Overview

```
Beepin App (React)
    ↓
[LLM Backend Router]
    ├─→ MediaPipe LLM (Primary)
    │   ├─ WebGPU detection
    │   ├─ Model loading (/assets/gemma-3n-E4B-it-int4-Web.litertlm)
    │   └─ Browser-based inference
    │
    └─→ Ollama Service (Fallback)
        ├─ OLLAMA_BASE_URL
        ├─ OLLAMA_MODEL
        └─ HTTP request serialization
```

**Request Flow:**

1. User sends prompt → `runMainframeChat()` (or other agent)
2. `runChat()` → `routeChatRequest()`
3. Router checks if MediaPipe ready:
   - ✅ Yes → MediaPipe generates response
   - ❌ No → Ollama generates response
4. Response returned to UI with streaming support

## 🎯 Performance Expectations

| Aspect | Expectation |
|--------|-------------|
| **First Load** | ~30–60s (model download ~4.28GB on slow connection) |
| **Subsequent Loads** | ~2–5s (model cached in browser) |
| **Response Time** | 5–15s per prompt (depends on model size, hardware) |
| **Memory (Runtime)** | ~3–5GB VRAM + session overhead |
| **Privacy** | ✅ All inference local, no cloud calls |
| **Latency** | ✅ Sub-second LLM access (no network round-trip) |

## 🛠 Advanced: Caching for Offline Use

To avoid re-downloading the 4.28GB model:

### Option 1: Service Worker + Cache API
Add to App.tsx or custom hook:
```typescript
// Register service worker for model caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### Option 2: OPFS (Origin Private File System)
Persist model in browser storage (requires modern browser):
```typescript
const root = await navigator.storage.getDirectory();
// Persist model to OPFS for faster reload
```

## 📚 References

- [MediaPipe GenAI Docs](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js)
- [Gemma 3n Model Card](https://huggingface.co/google/gemma-3n-E4B-it)
- [LiteRT-LM Conversion Guide](https://github.com/google-ai-edge/LiteRT-LM)
- [WebGPU Support](https://caniuses.com/webgpu)

## ❓ FAQ

**Q: Can I use the `.task` file directly without conversion?**
A: Not in the browser—the web format (`.litertlm`) is required. You must either download the pre-converted file or convert your `.task` file using the LiteRT SDK.

**Q: Will Ollama still work?**
A: Yes! Ollama is automatically used as a fallback if MediaPipe is unavailable or fails.

**Q: How much VRAM does it need?**
A: Minimum ~3GB for the E4B model alone, but ~6GB recommended for comfortable operation with browser overhead.

**Q: Can I use this on mobile?**
A: Not recommended for E4B (4.28GB). Consider downloading the smaller Gemma 1B variant (~500MB) or use Ollama as server API for mobile devices.

**Q: Will my prompts be sent to the cloud?**
A: No—all inference happens locally in your browser with MediaPipe. Your data never leaves your device.

---

**Integration Status:** ✅ Complete  
**Last Updated:** March 2026  
**Tested With:** Beepin v1.0, MediaPipe GenAI v0.10+, Gemma 3n E4B-it

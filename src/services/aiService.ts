// ============================================================
// AI Chat Service — Dual Engine (Gemini + Groq)
// Anti-Hallucination Architecture with Conversation Memory
// ============================================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const CEREBRAS_API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY || '';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SYSTEM_PROMPT = `Anda adalah "RavenStack AI Analyst", seorang Business Analyst profesional yang menganalisis dashboard SaaS.

ATURAN MUTLAK:
1. ZERO HALLUCINATION: Anda HANYA boleh menyebutkan angka yang PERSIS ADA di data yang diberikan. Jika suatu angka tidak ada, katakan dengan jujur.
2. JANGAN PERNAH mengarang angka, estimasi, atau membulatkan. Gunakan angka persis dari data.
3. BAHASA: Jika user menulis "cart"/"kart"/"kartu", itu mereka maksudnya "chart" (grafik). Jangan bingung.
4. KONTEKS HALAMAN (SANGAT PENTING): Jika user bertanya "jelaskan grafik ini" tanpa menyebut namanya, Anda WAJIB HANYA MEMBACA grafik yang memiliki tag "[GRAFIK DI HALAMAN INI]" di dalam data. ABAIKAN SEMUA grafik yang memiliki tag "[GRAFIK DI HALAMAN LAIN]". Ini harga mati.
5. GAYA JAWABAN: Jawab seperti konsultan bisnis profesional — langsung ke analisis, gunakan angka spesifik, dan berikan insight. JANGAN jelaskan proses internal Anda.
6. FORMAT: Gunakan **bold** untuk semua angka, mata uang, dan persentase.
7. JANGAN PERNAH menyebutkan kata "SECTION", "KONTEKS", "DATA DI ATAS", "data yang diberikan", atau istilah teknis internal lainnya. Bicaralah seolah Anda sendiri yang menganalisis data tersebut.
8. FILTER: Sebutkan filter aktif di awal jawaban secara singkat.
9. BAHASA: Jawab dalam bahasa yang sama dengan user.
10. JANGAN menjelaskan apa itu MRR/churn/KPI kecuali user bertanya definisinya. Langsung analisis saja.`;

// ---- Build conversation history for multi-turn context ----
function buildConversationHistory(chatHistory: ChatMessage[]): Array<{ role: string; content: string }> {
  // Keep last 10 messages for context (5 exchanges)
  const recent = chatHistory.slice(-10);
  return recent.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
}

// ---- Cerebras API (New Primary - World's Fastest) ----
async function callCerebras(
  userMessage: string,
  dataContext: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  if (!CEREBRAS_API_KEY) throw new Error('Cerebras API key not configured');

  const history = buildConversationHistory(chatHistory);
  const messages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n${dataContext}` },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const models = ['qwen-3-235b-a22b-instruct-2507', 'llama3.1-8b'];
  let lastError = '';

  for (const model of models) {
    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.05,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = `Cerebras Error ${response.status}`;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error?.message || errJson.message || errMsg;
        } catch { errMsg = errText || errMsg; }
        throw new Error(errMsg);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response from Cerebras.';
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`Cerebras model ${model} failed:`, lastError);
    }
  }

  throw new Error(`All Cerebras models failed. Last error: ${lastError}`);
}

// ---- Gemini API (with conversation history) ----
async function callGemini(
  userMessage: string,
  dataContext: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

  const history = buildConversationHistory(chatHistory);
  const contents = [
    {
      role: 'user',
      parts: [{ text: `SYSTEM INSTRUCTION: ${SYSTEM_PROMPT}\n\nDATA CONTEXT: ${dataContext}\n\nPlease acknowledge you understand these rules.` }]
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I am RavenStack AI Analyst. I will ONLY analyze the exact data provided in the context above and follow all rules strictly.' }]
    },
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  // List of models to try in order
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  let lastError = '';

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.05,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errText = await response.text();
        lastError = `${modelName}: ${response.status} - ${errText}`;
        console.warn(`Gemini model ${modelName} failed, trying next...`, lastError);
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`Fetch error for ${modelName}, trying next...`, lastError);
    }
  }

  // Ultimate Fallback: Try to list models to see what is available
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const availableModels = listData.models
        ?.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => m.name.replace('models/', '')) || [];

      console.log('Available models for this key:', availableModels);

      // Try the first 3 available models from the list
      for (const modelName of availableModels.slice(0, 3)) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents,
                generationConfig: { temperature: 0.05, maxOutputTokens: 2048 },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Response empty';
          }
        } catch { continue; }
      }
      lastError = `Models found but all failed. List: ${availableModels.join(', ')}`;
    } else {
      lastError = `Failed to list models: ${listRes.status}`;
    }
  } catch (err) {
    lastError = `Discovery failed: ${err instanceof Error ? err.message : String(err)}`;
  }

  throw new Error(`Semua model Gemini gagal. ${lastError}`);
}

// ---- Groq API (Primary with Key Rotation and Model Fallback) ----
async function callGroq(
  userMessage: string,
  dataContext: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('Groq API key not configured');

  // Support multiple keys for rotation (separated by comma)
  const keys = (GROQ_API_KEY as string).split(',').map(k => k.trim()).filter(Boolean);
  const history = buildConversationHistory(chatHistory);
  const messages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n${dataContext}` },
    ...history,
    { role: 'user', content: userMessage },
  ];

  // Models to try
  const modelsToTry = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  let lastError = '';

  // Rotate through keys
  for (let kIndex = 0; kIndex < keys.length; kIndex++) {
    const currentKey = keys[kIndex];

    // For each key, try both models
    for (const modelName of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            temperature: 0.05,
            max_tokens: 2048,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices?.[0]?.message?.content || 'No response from Groq.';
        } else {
          const errText = await response.text();
          let errDetail = `${modelName}: ${response.status}`;
          try {
            const errJson = JSON.parse(errText);
            errDetail = errJson.error?.message || errDetail;
          } catch { /* ignore */ }

          lastError = errDetail;

          // If it's not a rate limit error, don't just switch key, maybe try next model
          if (response.status !== 429) {
            console.warn(`Groq model ${modelName} failed with key ${kIndex + 1}: ${errDetail}`);
          } else {
            console.warn(`Groq Key ${kIndex + 1} reached limit. Trying next key/model...`);
            break; // Break the model loop to try the NEXT KEY
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error(`Fetch error for key ${kIndex + 1}:`, lastError);
      }
    }
  }

  throw new Error(`Semua kunci Groq (${keys.length} akun) telah mencapai batas atau gagal. Terakhir: ${lastError}`);
}

// ---- Main function: Groq -> Gemini -> Cerebras ----
export async function askAI(
  userMessage: string,
  dataContext: string,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  let groqError = '';
  let geminiError = '';
  let cerebrasError = '';

  // 1. Try Groq First (Most reliable for instruction-following)
  if (GROQ_API_KEY) {
    try {
      return await callGroq(userMessage, dataContext, chatHistory);
    } catch (err) {
      groqError = err instanceof Error ? err.message : String(err);
      console.warn('Groq failed, trying Gemini...', groqError);
    }
  }

  // 2. Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      return await callGemini(userMessage, dataContext, chatHistory);
    } catch (err) {
      geminiError = err instanceof Error ? err.message : String(err);
      console.warn('Gemini failed, trying Cerebras...', geminiError);
    }
  }

  // 3. Last Resort: Cerebras
  if (CEREBRAS_API_KEY) {
    try {
      return await callCerebras(userMessage, dataContext, chatHistory);
    } catch (err) {
      cerebrasError = err instanceof Error ? err.message : String(err);
      console.error('Cerebras also failed:', cerebrasError);
    }
  }

  throw new Error(`Semua layanan AI gagal.\n\n🔴 Groq: ${groqError || 'N/A'}\n\n🟡 Gemini: ${geminiError || 'N/A'}\n\n🔵 Cerebras: ${cerebrasError || 'N/A'}`);
}

// const { GoogleGenerativeAI } = require('@google/generative-ai');

// const getClient = () => {
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) {
//     throw new Error('GEMINI_API_KEY is not configured.');
//   }
//   return new GoogleGenerativeAI(apiKey);
// };

// const MODEL = 'gemini-2.5-flash';

// const MCQ_PROMPT_TEMPLATE = `
// You are an expert academic quiz generator.

// Given the following study material, generate exactly 10 multiple-choice questions (MCQs).

// Rules:
// - Each question must have exactly 4 options: A, B, C, D
// - Only one correct answer per question
// - Academic tone, no trivial questions
// - Output ONLY valid JSON — no markdown, no explanations, no extra text
// - Use this exact JSON structure:

// {
//   "questions": [
//     {
//       "question_text": "...",
//       "option_a": "...",
//       "option_b": "...",
//       "option_c": "...",
//       "option_d": "...",
//       "correct_answer": "A"
//     }
//   ]
// }

// Study Material:
// """
// {text}
// """
// `;

// const NOTES_PROMPT_TEMPLATE = `
// You are an expert academic note-taker.

// Given the following study material, generate concise, well-structured study notes.

// Rules:
// - Use clear headings and bullet points
// - Highlight key concepts, definitions, and important facts
// - Keep notes academically rigorous but easy to understand
// - Aim for 300-500 words
// - Output plain text only (no markdown code blocks)

// Study Material:
// """
// {text}
// """
// `;

// const FLASHCARDS_PROMPT_TEMPLATE = `
// You are an expert academic flashcard creator.

// Given the following study material, generate exactly 10 flashcards.

// Rules:
// - Each flashcard has a "front" (a question or key term) and a "back" (the answer or definition)
// - Keep fronts concise (max 15 words), backs informative (max 50 words)
// - Cover the most important concepts from the material
// - Output ONLY valid JSON — no markdown, no explanations, no extra text
// - Use this exact JSON structure:

// {
//   "flashcards": [
//     {
//       "front": "...",
//       "back": "..."
//     }
//   ]
// }

// Study Material:
// """
// {text}
// """
// `;

// const _extractJson = (raw) => {
//   let cleaned = raw.replace(/```(?:json)?/g, '').trim();
//   cleaned = cleaned.replace(/`+$/, '').trim();
//   return JSON.parse(cleaned);
// };

// const _generate = async (prompt) => {
//   const genAI = getClient();
//   const model = genAI.getGenerativeModel({ model: MODEL });
//   const result = await model.generateContent(prompt);
//   return result.response.text().trim();
// };

// const generateMcqs = async (text) => {
//   const prompt = MCQ_PROMPT_TEMPLATE.replace('{text}', text.substring(0, 12000));
//   const raw = await _generate(prompt);
//   try {
//     const data = _extractJson(raw);
//     const questions = data.questions || [];
//     if (!questions.length) {
//       throw new Error('Empty questions list in AI response.');
//     }
//     const requiredKeys = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
//     for (const q of questions) {
//       for (const key of requiredKeys) {
//         if (!(key in q)) throw new Error(`Question missing key: ${key}`);
//       }
//       if (!['A', 'B', 'C', 'D'].includes(q.correct_answer.toUpperCase())) {
//         throw new Error(`Invalid correct_answer: ${q.correct_answer}`);
//       }
//     }
//     return questions;
//   } catch (err) {
//     throw new Error(`Failed to parse AI response: ${err.message}`);
//   }
// };

// const generateNotes = async (text) => {
//   const prompt = NOTES_PROMPT_TEMPLATE.replace('{text}', text.substring(0, 12000));
//   return await _generate(prompt);
// };

// const generateFlashcards = async (text) => {
//   const prompt = FLASHCARDS_PROMPT_TEMPLATE.replace('{text}', text.substring(0, 12000));
//   const raw = await _generate(prompt);
//   try {
//     const data = _extractJson(raw);
//     const cards = data.flashcards || [];
//     if (!cards.length) throw new Error('Empty flashcards list in AI response.');
//     for (const card of cards) {
//       if (!('front' in card) || !('back' in card)) {
//         throw new Error("Flashcard missing 'front' or 'back' key.");
//       }
//     }
//     return cards;
//   } catch (err) {
//     throw new Error(`Failed to parse AI response: ${err.message}`);
//   }
// };

// module.exports = {
//   generateMcqs,
//   generateNotes,
//   generateFlashcards
// };

const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash';

/**
 * Keep-alive HTTPS agent — fixes "fetch failed" on Render
 */
const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 60000,
});

/**
 * Get Gemini Client
 */
const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }
  return new GoogleGenerativeAI(apiKey, {
    fetchOptions: { agent: httpsAgent },
  });
};

/**
 * Sleep Utility
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if an error is retryable (network/server errors)
 */
const isRetryable = (message) => {
  return (
    message.includes('503') ||
    message.includes('500') ||
    message.includes('overloaded') ||
    message.includes('timeout') ||
    message.includes('service unavailable') ||
    message.includes('fetch failed') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('enotfound') ||
    message.includes('network') ||
    message.includes('socket hang up') ||
    message.includes('epipe')
  );
};

/**
 * Prompt Templates
 */
const MCQ_PROMPT_TEMPLATE = `
You are an expert academic quiz generator.

Given the following study material, generate exactly 10 multiple-choice questions (MCQs).

CRITICAL RULES:
- Each question must have exactly 4 options: A, B, C, D
- Only one correct answer per question
- Academic tone, no trivial questions
- Keep each question_text under 100 characters
- Keep each option under 80 characters
- Output ONLY STRICTLY VALID JSON — no markdown, no explanation, no extra text
- Do NOT truncate the output — output ALL 10 questions completely

Use this exact JSON structure:

{
  "questions": [
    {
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "A"
    }
  ]
}

Study Material:
"""
{text}
"""
`;

const NOTES_PROMPT_TEMPLATE = `
You are an expert academic note-taker.

Given the following study material, generate concise, well-structured study notes.

Rules:
- Use headings and bullet points
- Highlight key concepts and important facts
- Keep notes easy to understand
- Academic tone
- 300-500 words
- Output plain text only
- No markdown code blocks

Study Material:
"""
{text}
"""
`;

const FLASHCARDS_PROMPT_TEMPLATE = `
You are an expert academic flashcard creator.

Given the following study material, generate exactly 10 flashcards.

CRITICAL RULES:
- Each flashcard must have "front" and "back"
- Keep front under 80 characters
- Keep back under 200 characters
- Output ONLY STRICTLY VALID JSON — no markdown, no explanation, no extra text
- Do NOT truncate the output — output ALL 10 flashcards completely

Use this exact JSON structure:

{
  "flashcards": [
    {
      "front": "...",
      "back": "..."
    }
  ]
}

Study Material:
"""
{text}
"""
`;

/**
 * Attempt to repair truncated JSON by closing open structures
 */
const _repairJson = (raw) => {
  let s = raw.trim();

  // Remove markdown fences
  s = s.replace(/```json/g, '').replace(/```/g, '').trim();

  // Find the outermost { ... }
  const start = s.indexOf('{');
  if (start === -1) throw new Error('No JSON object found.');
  s = s.substring(start);

  // Count open braces/brackets to detect truncation
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;
  let lastValidPos = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '{') braces++;
    else if (ch === '}') { braces--; if (braces === 0) { lastValidPos = i; break; } }
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }

  // If JSON was cut off mid-way, close it
  if (braces > 0 || brackets > 0) {
    // Strip the last incomplete item (usually a partial string or object)
    // Find last complete }, then close the array and object
    const lastCompleteObj = s.lastIndexOf('},');
    const lastCompleteObjNoComma = s.lastIndexOf('}');

    let cutAt = Math.max(lastCompleteObj, lastCompleteObjNoComma);
    if (cutAt === -1) throw new Error('Cannot repair: no complete objects found.');

    // Keep up to and including that last }
    s = s.substring(0, cutAt + 1);

    // Close open brackets and braces
    while (brackets > 0) { s += ']'; brackets--; }
    while (braces > 0) { s += '}'; braces--; }
  } else {
    s = s.substring(0, lastValidPos + 1);
  }

  // Fix common JSON mistakes
  s = s.replace(/}\s*{/g, '},{');
  s = s.replace(/,\s*}/g, '}');
  s = s.replace(/,\s*]/g, ']');

  return JSON.parse(s);
};

/**
 * Safe JSON Extraction with truncation repair
 */
const _extractJson = (raw) => {
  try {
    return _repairJson(raw);
  } catch (err) {
    console.error('[_extractJson] RAW AI RESPONSE:\n', raw);
    throw new Error(`Invalid JSON response: ${err.message}`);
  }
};

/**
 * Generate Content with:
 * - Higher token limit (8192) to prevent truncation
 * - Retry Logic (catches network errors too)
 * - Exponential Backoff
 * - Extended Timeout for Render (60s)
 * - Automatic Fallback Model
 */
const _generate = async (prompt, retries = 5) => {
  const genAI = getClient();

  const modelConfig = {
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,          // Increased from 2048 — prevents truncation
      responseMimeType: 'application/json',
    },
  };

  const primaryModel = genAI.getGenerativeModel({
    model: PRIMARY_MODEL,
    ...modelConfig,
  });

  const fallbackModel = genAI.getGenerativeModel({
    model: FALLBACK_MODEL,
    ...modelConfig,
  });

  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`[_generate] Attempt ${attempt + 1}/${retries} using ${PRIMARY_MODEL}`);

      const result = await Promise.race([
        primaryModel.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout after 60s')), 60000)
        ),
      ]);

      return result.response.text().trim();

    } catch (err) {
      lastError = err;
      const message = err.message.toLowerCase();

      console.error(`[_generate] Attempt ${attempt + 1} failed: ${err.message}`);

      if (isRetryable(message)) {
        const delay = Math.pow(2, attempt + 1) * 1000;
        console.log(`[_generate] Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        console.error('[_generate] Non-retryable error. Aborting retries.');
        throw err;
      }
    }
  }

  // All primary retries exhausted — try fallback model once
  console.log(`[_generate] Switching to fallback model ${FALLBACK_MODEL}...`);

  try {
    const fallbackResult = await Promise.race([
      fallbackModel.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Fallback timeout after 60s')), 60000)
      ),
    ]);

    return fallbackResult.response.text().trim();

  } catch (fallbackErr) {
    console.error('[_generate] Fallback model also failed:', fallbackErr.message);
    throw new Error(
      `AI service unavailable. Last error: ${lastError?.message || fallbackErr.message}`
    );
  }
};

/**
 * Generate MCQs
 */
const generateMcqs = async (text) => {
  const prompt = MCQ_PROMPT_TEMPLATE.replace('{text}', text.substring(0, 6000));
  const raw = await _generate(prompt);

  try {
    const data = _extractJson(raw);
    const questions = data.questions || [];

    if (!questions.length) {
      throw new Error('Empty questions list in AI response.');
    }

    const requiredKeys = [
      'question_text',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'correct_answer',
    ];

    // Filter out any incomplete questions (from repaired truncated JSON)
    const validQuestions = questions.filter((q) => {
      for (const key of requiredKeys) {
        if (!(key in q)) return false;
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correct_answer.toUpperCase())) return false;
      return true;
    });

    if (!validQuestions.length) {
      throw new Error('No valid questions found after parsing.');
    }

    return validQuestions;

  } catch (err) {
    throw new Error(`Failed to parse MCQ response: ${err.message}`);
  }
};

/**
 * Generate Notes
 */
const generateNotes = async (text) => {
  const prompt = NOTES_PROMPT_TEMPLATE.replace('{text}', text.substring(0, 6000));
  return await _generate(prompt);
};

/**
 * Generate Flashcards
 */
const generateFlashcards = async (text) => {
  const prompt = FLASHCARDS_PROMPT_TEMPLATE.replace('{text}', text.substring(0, 6000));
  const raw = await _generate(prompt);

  try {
    const data = _extractJson(raw);
    const cards = data.flashcards || [];

    if (!cards.length) {
      throw new Error('Empty flashcards list in AI response.');
    }

    // Filter out incomplete cards (from repaired truncated JSON)
    const validCards = cards.filter(
      (card) => 'front' in card && 'back' in card && card.front && card.back
    );

    if (!validCards.length) {
      throw new Error('No valid flashcards found after parsing.');
    }

    return validCards;

  } catch (err) {
    throw new Error(`Failed to parse flashcards response: ${err.message}`);
  }
};

module.exports = {
  generateMcqs,
  generateNotes,
  generateFlashcards,
};

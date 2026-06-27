import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });

/**
 * Robust helper to extract error status code from a Google Gen AI SDK exception.
 */
function getStatusCode(error: any): number | null {
  if (!error) return null;
  if (typeof error.status === 'number') return error.status;
  if (typeof error.code === 'number') return error.code;
  if (typeof error.statusCode === 'number') return error.statusCode;

  const statusStr = error.status || error.code || error.statusCode;
  if (statusStr) {
    const parsed = parseInt(statusStr, 10);
    if (!isNaN(parsed)) return parsed;
  }

  const msg = String(error.message || '').toLowerCase();
  if (msg.includes('503') || msg.includes('service unavailable')) return 503;
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('resource exhausted')) return 429;
  if (msg.includes('400') || msg.includes('bad request') || msg.includes('invalid argument')) return 400;

  return null;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Resilient multi-model fallback and retry wrapper for Google Gemini API.
 * Calls models in sequence with exponential backoff on 503 and immediate fallback on 429/400.
 */
export async function generateWithFallback(
  systemInstruction: string,
  userPrompt: any
): Promise<string> {
  const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

  for (let modelIdx = 0; modelIdx < models.length; modelIdx++) {
    const model = models[modelIdx];
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: userPrompt,
          config: {
            systemInstruction: systemInstruction || undefined,
            responseMimeType: "application/json",
          },
        });

        if (response && response.text) {
          return response.text;
        }

        throw new Error("Empty text response from AI model");
      } catch (error: any) {
        const statusCode = getStatusCode(error);

        console.error(
          `[AI Error] Model: ${model}, Attempt: ${attempts}/${maxAttempts}, Status: ${statusCode || 'unknown'}, Error: ${error.message}`
        );

        if (statusCode === 429 || statusCode === 400) {
          console.warn(`[AI Fallback] Abandoning ${model} due to status ${statusCode}. Moving to next fallback.`);
          break; // Break the attempts loop to move to the next model
        }

        // Retry same model if 503 or other transient errors, up to maxAttempts
        if (attempts < maxAttempts) {
          const backoffTime = attempts * 2000;
          console.log(`[AI Retry] Retrying ${model} in ${backoffTime}ms due to transient/503 error...`);
          await delay(backoffTime);
        } else {
          console.warn(`[AI Fallback] Exhausted ${maxAttempts} attempts for ${model}. Moving to next fallback.`);
        }
      }
    }
  }

  // Graceful fallback response if all models and retries are exhausted
  const gracefulFallbackResponse = {
    error: true,
    message: "AI servers are currently experiencing high traffic. Please try again.",
    atsScore: 0,
    suggestions: [],
  };

  return JSON.stringify(gracefulFallbackResponse);
}

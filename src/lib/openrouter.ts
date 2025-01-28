import { OpenRouter } from 'openrouter-sdk';

const openrouterKey = import.meta.env.VITE_OPENROUTER_KEY;

if (!openrouterKey) {
  throw new Error('Missing OpenRouter API key');
}

export const openrouter = new OpenRouter({
  apiKey: openrouterKey,
});

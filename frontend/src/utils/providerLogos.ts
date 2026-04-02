/**
 * Provider logo asset map.
 * Keys are exact provider names (case-sensitive, matching Provider.name in the DB).
 * Values are paths relative to /public (served at the root URL in production).
 *
 * Drop logo files in:  ami/frontend/public/assets/logos/
 * Supported formats:   SVG preferred; PNG and JPEG accepted.
 */
const PROVIDER_LOGOS: Record<string, string> = {
  'Adobe Firefly':  '/assets/logos/adobe-firefly-color.svg',
  'ChatGPT':        '/assets/logos/chatgpt.png',
  'Claude':         '/assets/logos/Claude.png',
  'Cursor':         '/assets/logos/cursor.svg',
  'ElevenLabs':     '/assets/logos/elevenlabs.svg',
  'Gemini':         '/assets/logos/gemini.svg',
  'GitHub Copilot': '/assets/logos/github-copilot.svg',
  'Leonardo AI':    '/assets/logos/leonardo-ai.svg',
  'Luma AI':        '/assets/logos/luma.png',
  'MidJourney':     '/assets/logos/midjourney.svg',
  'Perplexity':     '/assets/logos/perplexity.svg',
  'Pika':           '/assets/logos/pika.svg',
  'Replit':         '/assets/logos/replit-color.svg',
  'Runway':         '/assets/logos/runway-black.svg',
  'Stability AI':   '/assets/logos/stability-color-ai.svg',
  'Suno':           '/assets/logos/Suno.jpeg',
  'Udio':           '/assets/logos/udio-color.svg',
}

/**
 * Returns the asset URL for a provider's logo, or null if no logo is mapped.
 * The caller renders a colored-initial fallback when this returns null.
 */
export function getProviderLogoUrl(providerName: string): string | null {
  return PROVIDER_LOGOS[providerName] ?? null
}

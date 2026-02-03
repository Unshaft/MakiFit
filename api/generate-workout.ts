import Anthropic from '@anthropic-ai/sdk';

export const config = {
  runtime: 'edge',
};

interface GenerateRequest {
  profile: 'marianne' | 'killian';
  duration: number; // minutes
  focus?: string; // ex: "cardio", "jambes", "haut du corps"
  mood?: string; // ex: "énergique", "doux", "intense"
}

const SYSTEM_PROMPT = `Tu es un coach fitness expert. Tu génères des séances d'entraînement en JSON UNIQUEMENT.

TEMPLATE DE RÉPONSE (copie exactement cette structure):
{"name":"Nom","description":"Description","exercises":[{"name":"Exercice","description":"Instructions","sets":3,"reps":12,"difficulty":"medium"}]}

RÈGLES STRICTES:
1. Ta réponse doit être UNIQUEMENT du JSON valide
2. PAS de texte avant ou après le JSON
3. PAS de blocs markdown (\`\`\`)
4. PAS de commentaires dans le JSON
5. Utilise "reps" pour les répétitions OU "duration" (secondes) pour les exercices en temps - jamais les deux

FORMAT DES EXERCICES:
- name: nom court de l'exercice
- description: instructions en 1-2 phrases
- sets: nombre de séries (1-5)
- reps: nombre de répétitions (si basé sur reps)
- duration: durée en secondes (si basé sur temps, ex: planche)
- difficulty: "easy" | "medium" | "hard"

PROFILS:
- Marianne: remise en forme douce, tonification, exercices accessibles
- Killian: performance, explosivité badminton, intensité plus élevée

Exercices réalisables à la maison sans équipement ou avec haltères légers.`;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Clé API non configurée. Contacte le développeur.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: GenerateRequest = await req.json();
    const { profile, duration, focus, mood } = body;

    const client = new Anthropic({ apiKey });

    const userPrompt = `Séance ${duration} min pour ${profile === 'marianne' ? 'Marianne' : 'Killian'}.${focus ? ` Focus: ${focus}.` : ''}${mood ? ` Mood: ${mood}.` : ''} 4-6 exercices. Réponds en JSON uniquement.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('FORMAT_ERROR');
    }

    // Extrait le JSON de la réponse (gère les cas où Claude ajoute du texte ou des blocs markdown)
    const extractJSON = (text: string): string => {
      // Cas 1: bloc markdown ```json ... ```
      const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch) {
        return jsonBlockMatch[1].trim();
      }

      // Cas 2: trouver le premier { et le dernier }
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return text.slice(firstBrace, lastBrace + 1);
      }

      // Cas 3: retourner le texte tel quel
      return text.trim();
    };

    const jsonString = extractJSON(content.text);
    const workout = JSON.parse(jsonString);

    return new Response(JSON.stringify(workout), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating workout:', error);

    // Détermine le type d'erreur pour un message approprié
    let errorMessage = 'Impossible de générer la séance. Réessaie dans quelques instants.';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = 'Clé API invalide ou expirée. Contacte le développeur.';
        statusCode = 401;
      } else if (error.message.includes('429') || error.message.includes('rate')) {
        errorMessage = 'Trop de requêtes. Attends quelques secondes et réessaie.';
        statusCode = 429;
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Le serveur met trop de temps à répondre. Réessaie.';
        statusCode = 504;
      } else if (error.message === 'FORMAT_ERROR') {
        errorMessage = 'Erreur de format dans la réponse. Réessaie.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Erreur de parsing. Réessaie.';
      } else if (error.message.includes('insufficient') || error.message.includes('credit')) {
        errorMessage = 'Crédit API épuisé. Contacte le développeur.';
        statusCode = 402;
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

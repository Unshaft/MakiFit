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

const SYSTEM_PROMPT = `Tu es un coach fitness expert qui crée des séances d'entraînement personnalisées pour une app appelée MakiFit.

Tu dois générer un workout structuré en JSON avec le format suivant:
{
  "name": "Nom de la séance",
  "description": "Description courte",
  "exercises": [
    {
      "name": "Nom de l'exercice",
      "description": "Instructions courtes",
      "sets": 3,
      "reps": 12, // OU "duration": 30 (en secondes) pour les exercices en temps
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

Règles importantes:
- Les exercices doivent être réalisables à la maison sans équipement (ou avec haltères légers)
- Adapte la difficulté au profil
- Pour Marianne: séances douces, focus remise en forme et tonification
- Pour Killian: séances plus intenses, focus explosivité et performance badminton
- Inclus toujours un échauffement et des exercices variés
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`;

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

    const userPrompt = `Génère une séance de ${duration} minutes pour ${profile === 'marianne' ? 'Marianne (remise en forme, tonification douce)' : 'Killian (performance badminton, explosivité)'}.
${focus ? `Focus: ${focus}` : ''}
${mood ? `Ambiance souhaitée: ${mood}` : ''}

La séance doit contenir 4-6 exercices adaptés.`;

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

    // Parse le JSON de la réponse
    const workout = JSON.parse(content.text);

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

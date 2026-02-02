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
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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
      throw new Error('Unexpected response type');
    }

    // Parse le JSON de la réponse
    const workout = JSON.parse(content.text);

    return new Response(JSON.stringify(workout), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating workout:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate workout' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

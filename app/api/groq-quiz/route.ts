import { NextRequest, NextResponse } from 'next/server';

type ModuleName = 'budgeting' | 'saving' | 'investing' | 'credit';
type Difficulty = 'easy' | 'medium' | 'hard';

interface ApiQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
  category: ModuleName;
}

const MODULES: ModuleName[] = ['budgeting', 'saving', 'investing', 'credit'];

function sanitizeQuestions(raw: unknown, moduleName: ModuleName, count: number): ApiQuestion[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const cleaned: ApiQuestion[] = [];

  for (let i = 0; i < raw.length && cleaned.length < count; i++) {
    const q = raw[i] as Partial<ApiQuestion>;
    if (
      typeof q?.question !== 'string' ||
      !Array.isArray(q?.options) ||
      q.options.length !== 4 ||
      typeof q?.correctAnswer !== 'number' ||
      q.correctAnswer < 0 ||
      q.correctAnswer > 3 ||
      typeof q?.explanation !== 'string'
    ) {
      continue;
    }

    const options = q.options.map((opt) => String(opt)).slice(0, 4);
    const difficulty: Difficulty =
      q.difficulty === 'easy' || q.difficulty === 'medium' || q.difficulty === 'hard'
        ? q.difficulty
        : 'medium';

    cleaned.push({
      id: `groq_${moduleName}_${Date.now()}_${i}`,
      question: q.question.trim(),
      options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation.trim(),
      difficulty,
      category: moduleName,
    });
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const moduleName = body?.moduleName as ModuleName;
    const count = Math.min(Math.max(Number(body?.count ?? 5), 3), 8);

    if (!MODULES.includes(moduleName)) {
      return NextResponse.json({ error: 'Invalid moduleName.' }, { status: 400 });
    }

    const prompt = [
      `Generate ${count} high-quality, varied financial literacy multiple-choice questions for the module "${moduleName}".`,
      'Rules:',
      '- Return ONLY valid JSON array, no markdown fences.',
      '- Each item shape:',
      '{"question":string,"options":[string,string,string,string],"correctAnswer":0|1|2|3,"explanation":string,"difficulty":"easy"|"medium"|"hard"}',
      '- Create diverse question patterns (scenario, calculation, concept, decision-making).',
      '- Ensure different wording and structures across questions.',
      '- Include practical, realistic numbers when relevant.',
      '- Exactly 4 options and exactly one correct answer per question.',
      '- Keep explanations concise and accurate.',
    ].join('\n');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.95,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a strict JSON generator. Return only JSON that can be parsed directly.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Groq request failed: ${errorText}` },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Groq response was empty.' }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Failed to parse Groq JSON content.' }, { status: 502 });
    }

    const arrayPayload = Array.isArray(parsed)
      ? parsed
      : (parsed as { questions?: unknown[] })?.questions;

    const questions = sanitizeQuestions(arrayPayload, moduleName, count);

    if (questions.length < Math.min(3, count)) {
      return NextResponse.json(
        { error: 'Groq did not return enough valid questions.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
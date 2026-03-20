export type BlindAssistantSeverity = 'safe' | 'caution' | 'danger';

export type BlindAssistantGuidance = {
  title: string;
  detail: string;
  spokenText: string;
  severity: BlindAssistantSeverity;
  tags: string[];
};

const DEFAULT_GUIDANCE: BlindAssistantGuidance = {
  title: 'Сцена не распознана',
  detail: 'Не удалось уверенно разобрать сцену. Остановитесь и повторите анализ.',
  spokenText: 'Не удалось уверенно разобрать сцену. Остановитесь и повторите анализ.',
  severity: 'caution',
  tags: ['Повторить', 'Осторожно'],
};

function extractJsonObject(text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1);
}

function normalizeGuidance(input: Partial<BlindAssistantGuidance> | null | undefined): BlindAssistantGuidance {
  if (!input) {
    return DEFAULT_GUIDANCE;
  }

  const severity =
    input.severity === 'safe' || input.severity === 'caution' || input.severity === 'danger'
      ? input.severity
      : DEFAULT_GUIDANCE.severity;

  const tags =
    Array.isArray(input.tags) && input.tags.length
      ? input.tags.filter((item): item is string => typeof item === 'string').slice(0, 4)
      : DEFAULT_GUIDANCE.tags;

  return {
    title: typeof input.title === 'string' && input.title.trim() ? input.title.trim() : DEFAULT_GUIDANCE.title,
    detail: typeof input.detail === 'string' && input.detail.trim() ? input.detail.trim() : DEFAULT_GUIDANCE.detail,
    spokenText:
      typeof input.spokenText === 'string' && input.spokenText.trim()
        ? input.spokenText.trim()
        : typeof input.detail === 'string' && input.detail.trim()
          ? input.detail.trim()
          : DEFAULT_GUIDANCE.spokenText,
    severity,
    tags,
  };
}

export function hasOpenAIVisionConfig() {
  return Boolean(process.env.EXPO_PUBLIC_OPENAI_API_KEY);
}

export async function analyzeImageForBlindAssistance(base64Image: string) {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const model = process.env.EXPO_PUBLIC_OPENAI_VISION_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    throw new Error('OpenAI API key is missing.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_output_tokens: 180,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text:
                'Ты ассистент навигации для незрячего человека. Анализируй только то, что реально видно на фото. ' +
                'Отвечай только JSON без markdown. ' +
                'Формат: {"title":"...","detail":"...","spokenText":"...","severity":"safe|caution|danger","tags":["...","..."]}. ' +
                'Пиши очень коротко и по-русски. ' +
                'Сообщай только практические подсказки: люди впереди, препятствия, лестницы, бордюр, столб, машина, дверь, свободный путь, неровное покрытие. ' +
                'Если уверенности мало, советуй остановиться и осмотреться.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                'Опиши сцену для незрячего пользователя. ' +
                'Нужна безопасная навигационная подсказка на ближайшие 2-4 шага.',
            },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'low',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'OpenAI request failed.');
  }

  const data = (await response.json()) as { output_text?: string };
  const rawText = typeof data.output_text === 'string' ? data.output_text.trim() : '';
  const jsonText = extractJsonObject(rawText);

  if (!jsonText) {
    return DEFAULT_GUIDANCE;
  }

  try {
    return normalizeGuidance(JSON.parse(jsonText) as Partial<BlindAssistantGuidance>);
  } catch {
    return DEFAULT_GUIDANCE;
  }
}

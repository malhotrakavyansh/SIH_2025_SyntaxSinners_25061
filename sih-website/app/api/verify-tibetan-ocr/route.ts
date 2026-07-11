import { NextRequest, NextResponse } from 'next/server';

const TIBETAN_DATASET = `tibetan_character,romanization,type
ཀ,ka,consonant
ཁ,k'a,consonant
ག,g'a,consonant
ང,nga,consonant
ཅ,cha,consonant
ཆ,ch'a,consonant
ཇ,j'a,consonant
ཉ,nya,consonant
ཏ,ta,consonant
ཐ,t'a,consonant
ད,d'a,consonant
ན,na,consonant
པ,pa,consonant
ཕ,p'a,consonant
བ,b'a,consonant
མ,ma,consonant
ཙ,tsa,consonant
ཚ,ts'a,consonant
ཛ,dz'a,consonant
ཝ,wa,consonant
ཞ,zha,consonant
ཟ,za,consonant
འ,'a,consonant
ཡ,ya,consonant
ར,ra,consonant
ལ,la,consonant
ཤ,sha,consonant
ས,sa,consonant
ཧ,ha,consonant
ཨ,a,consonant
ཱི,i,vowel_modifier
ུ,u,vowel_modifier
ེ,e,vowel_modifier
ོ,o,vowel_modifier`;

// Server-side only - never exposed to the client, unlike the previous
// NEXT_PUBLIC_ANTHROPIC_API_KEY approach which shipped the key in the JS bundle.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server' },
      { status: 503 }
    );
  }

  let body: { image?: string; tesseractOutput?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { image, tesseractOutput } = body;
  if (!image || !tesseractOutput?.trim()) {
    return NextResponse.json(
      { error: 'Both image and tesseractOutput are required' },
      { status: 400 }
    );
  }

  const commaIndex = image.indexOf(',');
  if (!image.startsWith('data:') || commaIndex === -1) {
    return NextResponse.json({ error: 'image must be a data URL' }, { status: 400 });
  }
  const imageData = image.slice(commaIndex + 1);
  const mimeType = image.slice(5, image.indexOf(';'));

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mimeType, data: imageData },
              },
              {
                type: 'text',
                text: `You are a Tibetan OCR verification expert. Here is the Tibetan script reference dataset:

${TIBETAN_DATASET}

The Tesseract OCR output for the uploaded image is:
"${tesseractOutput}"

Please analyze the image carefully and:
1. Identify what Tibetan characters are actually shown in the image
2. Compare them with the Tesseract output
3. Calculate the accuracy percentage
4. Provide the correct OCR output if Tesseract was wrong

You MUST respond with ONLY a valid JSON object (no markdown formatting, no backticks, no explanation):
{
  "actual_characters": "the correct Tibetan characters from the image",
  "tesseract_output": "${tesseractOutput}",
  "is_correct": true,
  "accuracy_percentage": 95,
  "correct_ocr": "the correct output",
  "errors_found": ["error 1", "error 2"],
  "character_by_character": [
    {"position": 1, "expected": "ཀ", "got": "ཀ", "correct": true}
  ]
}`,
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || anthropicResponse.statusText;
      return NextResponse.json(
        { error: `Anthropic API error (${anthropicResponse.status}): ${errorMsg}` },
        { status: 502 }
      );
    }

    const data = await anthropicResponse.json();
    const responseText: string = Array.isArray(data.content)
      ? data.content
          .filter((item: { type: string }) => item.type === 'text')
          .map((item: { text: string }) => item.text)
          .join('')
      : '';

    let cleanText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanText = jsonMatch[0];

    const parsed = JSON.parse(cleanText);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Verification failed: ${message}` }, { status: 500 });
  }
}

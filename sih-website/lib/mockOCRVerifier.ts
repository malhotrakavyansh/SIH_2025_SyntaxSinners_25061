/**
 * Mock Tibetan OCR Verification Service
 * For testing without an API key - used as a fallback when the server-side
 * ANTHROPIC_API_KEY (see app/api/verify-tibetan-ocr) isn't configured.
 */

interface VerificationResult {
  actual_characters: string;
  tesseract_output: string;
  is_correct: boolean;
  accuracy_percentage: number;
  correct_ocr: string;
  errors_found: string[];
  character_by_character: Array<{
    position: number;
    expected: string;
    got: string;
    correct: boolean;
  }>;
}

/**
 * Mock verification - simulates AI response for demo purposes
 */
export async function mockVerifyOCR(tesseractOutput: string): Promise<VerificationResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Sample Tibetan characters for testing
  const tibetanChars = ['ཀ', 'ཁ', 'ག', 'ང', 'ཅ', 'ཆ', 'ཇ', 'ཉ'];

  // Generate mock result
  const charArray = tesseractOutput.split(' ').filter((c) => c.trim());
  const characterByCharacter = charArray.map((char, idx) => ({
    position: idx + 1,
    expected: tibetanChars[idx % tibetanChars.length],
    got: char,
    correct: Math.random() > 0.3, // 70% accuracy
  }));

  const correctCount = characterByCharacter.filter((c) => c.correct).length;
  const accuracy = Math.round((correctCount / characterByCharacter.length) * 100);

  return {
    actual_characters: characterByCharacter.map((c) => c.expected).join(' '),
    tesseract_output: tesseractOutput,
    is_correct: accuracy > 90,
    accuracy_percentage: accuracy,
    correct_ocr: characterByCharacter.map((c) => c.expected).join(' '),
    errors_found:
      accuracy < 100
        ? [
            `Character position 2: Expected "${characterByCharacter[1]?.expected}" but got "${characterByCharacter[1]?.got}"`,
          ]
        : [],
    character_by_character: characterByCharacter,
  };
}

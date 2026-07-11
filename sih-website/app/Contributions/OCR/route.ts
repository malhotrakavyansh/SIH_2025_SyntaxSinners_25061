import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');

    // Call OCR.Space API. Falls back to OCR.space's public "helloworld" demo
    // key (rate-limited, for testing only) if OCR_SPACE_API_KEY isn't set -
    // the previous hardcoded key here was committed in plaintext to source.
    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';
    const ocrResponse = await fetch('https://api.ocr.space/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: apiKey,
        base64Image: `data:image/jpeg;base64,${base64String}`,
        language: 'eng',
        isOverlayRequired: false,
      }),
    });

    if (!ocrResponse.ok) {
      return NextResponse.json(
        { error: 'OCR service temporarily unavailable' },
        { status: 500 }
      );
    }

    const ocrData = await ocrResponse.json();

    if (!ocrData.IsErroredOnProcessing) {
      return NextResponse.json(
        { 
          text: ocrData.ParsedText || '',
          success: true 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: ocrData.ErrorMessage || 'Failed to extract text from image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { error: 'Error processing image. Please try again.' },
      { status: 500 }
    );
  }
}
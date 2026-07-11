"use client";
import { useState } from "react";
import Tesseract from "tesseract.js";
import TibetanOCRVerifier from "./TibetanOCRVerifier";

interface OCRMetadata {
  title: string;
  language: string;
  capturedOn: string;
  location: string;
  monasteryName: string;
  description: string;
  tags: string[];
  rawText: string;
  cleanedText: string;
}

export default function OCR() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [cleanedText, setCleanedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['eng']);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTibetanVerifier, setShowTibetanVerifier] = useState(false);
  
  // Metadata fields
  const [metadata, setMetadata] = useState<OCRMetadata>({
    title: '',
    language: 'English',
    capturedOn: new Date().toISOString().split('T')[0],
    location: '',
    monasteryName: '',
    description: '',
    tags: [],
    rawText: '',
    cleanedText: ''
  });
  const [tagInput, setTagInput] = useState('');
  
  const languageOptions = [
    { code: 'eng', name: 'English' },
    { code: 'hin', name: 'Hindi' },
    { code: 'nep', name: 'Nepali' },
    { code: 'ben', name: 'Bengali' },
    { code: 'bod', name: 'Tibetan' },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clean OCR text with advanced corrections
  const cleanOCRText = (text: string): string => {
    let cleaned = text;
    
    // Remove extra whitespace and normalize line breaks
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    cleaned = cleaned.trim();
    
    // Fix common OCR character mistakes
    const charCorrections: { [key: string]: string } = {
      '0': 'O',  // Zero to letter O
      'l': 'I',  // lowercase L to capital I (in certain contexts)
      '1': 'I',  // Number 1 to letter I (in certain contexts)
      '5': 'S',  // Number 5 to letter S (in certain contexts)
      '8': 'B',  // Number 8 to letter B (in certain contexts)
      '|': 'I',  // Pipe to letter I
      '!': 'I',  // Exclamation to letter I (in certain contexts)
      '@': 'a',  // At symbol to letter a
    };
    
    // Fix common word-level OCR mistakes
    const wordCorrections: { [key: string]: string } = {
      // Monastery related
      'Monastry': 'Monastery',
      'monastry': 'monastery',
      'Monastary': 'Monastery',
      'monastary': 'monastery',
      'Monestry': 'Monastery',
      'monestry': 'monastery',
      
      // Time/Century
      'sentury': 'century',
      'centure': 'century',
      'Sentury': 'Century',
      'Centure': 'Century',
      
      // Building related
      'buiIt': 'built',
      'bullt': 'built',
      'constructd': 'constructed',
      'establishd': 'established',
      
      // Common words
      'teh': 'the',
      'Teh': 'The',
      'adn': 'and',
      'Adn': 'And',
      'hte': 'the',
      'taht': 'that',
      'thsi': 'this',
      'tihis': 'this',
      'thier': 'their',
      'recieve': 'receive',
      
      // Location related
      'Sikkm': 'Sikkim',
      'sikkm': 'sikkim',
      'Nepai': 'Nepal',
      'nepai': 'nepal',
      'Bhutam': 'Bhutan',
      'bhutam': 'bhutan',
      
      // Buddhist/Religious terms
      'Budha': 'Buddha',
      'budha': 'buddha',
      'Budhist': 'Buddhist',
      'budhist': 'buddhist',
      'Dharrna': 'Dharma',
      'dharrna': 'dharma',
      'Stupa': 'Stupa',
      'stupa': 'stupa',
    };
    
    // Apply word-level corrections
    Object.entries(wordCorrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'g');
      cleaned = cleaned.replace(regex, correct);
    });
    
    // Remove obvious OCR garbage characters
    cleaned = cleaned.replace(/[|~`^°º•※]/g, '');
    cleaned = cleaned.replace(/[▪▫■□●○◆◇]/g, '');
    
    // Fix multiple punctuation marks
    cleaned = cleaned.replace(/\.{2,}/g, '.');
    cleaned = cleaned.replace(/,{2,}/g, ',');
    cleaned = cleaned.replace(/!{2,}/g, '!');
    cleaned = cleaned.replace(/\?{2,}/g, '?');
    
    // Fix spacing around punctuation
    cleaned = cleaned.replace(/\s+([.,!?;:])/g, '$1');
    cleaned = cleaned.replace(/([.,!?;:])\s*/g, '$1 ');
    
    // Fix smart quotes and apostrophes
    cleaned = cleaned.replace(/['']/g, "'");
    cleaned = cleaned.replace(/[""]/g, '"');
    
    // Capitalize first letter of sentences
    cleaned = cleaned.replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());
    
    // Fix common date patterns (e.g., "17 th century" -> "17th century")
    cleaned = cleaned.replace(/(\d+)\s+(st|nd|rd|th)\b/gi, '$1$2');
    
    // Fix spacing around hyphens in dates/ranges
    cleaned = cleaned.replace(/(\d+)\s*-\s*(\d+)/g, '$1-$2');
    
    // Remove standalone single characters that are likely OCR errors (except valid ones like 'a', 'I')
    cleaned = cleaned.replace(/\b[^aAiI\d\s]\b/g, '');
    
    // Fix common Devanagari/Tibetan OCR issues (if present)
    // Remove zero-width spaces and invisible characters
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    // Final cleanup
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  };

  const preprocessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas not supported'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Convert to grayscale and increase contrast
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Increase contrast
            const contrast = 1.5;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            const newValue = factor * (avg - 128) + 128;
            const clampedValue = Math.max(0, Math.min(255, newValue));
            
            data[i] = data[i + 1] = data[i + 2] = clampedValue;
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const startOCR = async () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    // Start OCR
    setIsLoading(true);
    setRawText("");
    setCleanedText("");
    setProgress(0);

    try {
      console.log("Starting OCR process...");
      
      // Preprocess image for better OCR
      console.log("Preprocessing image...");
      const processedImage = await preprocessImage(selectedFile);
      
      // Use createWorker with selected languages (including Tibetan)
      console.log("Loading languages:", selectedLanguages);
      const langString = selectedLanguages.join('+');
      
      const worker = await Tesseract.createWorker(langString, 1, {
        logger: (m) => {
          console.log("OCR Progress:", m);
          if (m.status === "recognizing text") {
            setProgress(50 + Math.round(m.progress * 50));
          } else if (m.status === "loading tesseract core") {
            setProgress(Math.round(m.progress * 20));
          } else if (m.status === "initializing tesseract") {
            setProgress(20 + Math.round(m.progress * 10));
          } else if (m.status === "loading language traineddata") {
            setProgress(30 + Math.round(m.progress * 20));
          }
        },
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
      });

      // Set parameters optimized for artistic/painted text
      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_char_whitelist: '',
        preserve_interword_spaces: '1',
      });
      
      // Try recognition with preprocessed image
      console.log("Attempting OCR with preprocessed image...");
      const result = await worker.recognize(processedImage);
      
      console.log("OCR Result:", result.data);
      
      let finalText = result.data.text.trim();
      
      // If no text found with preprocessed image, try original
      if (!finalText) {
        console.log("Trying with original image...");
        const originalResult = await worker.recognize(selectedFile);
        finalText = originalResult.data.text.trim();
      }
      
      await worker.terminate();
      
      if (finalText) {
        setRawText(finalText);
        const cleaned = cleanOCRText(finalText);
        setCleanedText(cleaned);
        setMetadata(prev => ({ ...prev, rawText: finalText, cleanedText: cleaned }));
        setShowMetadataForm(true);
      } else {
        setRawText("No text found in the image. This image may contain artistic or stylized text that is difficult to recognize. For best results:\n\n• Use images with clear, printed text\n• Ensure good lighting and contrast\n• Avoid heavily stylized fonts\n• Try photographing text straight-on");
        setCleanedText("");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setRawText(`Error extracting text: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSaveOCRData = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/ocr/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metadata,
          imageData: image,
        }),
      });

      if (response.ok) {
        alert('OCR data saved successfully!');
        // Reset form
        setShowMetadataForm(false);
        setImage(null);
        setSelectedFile(null);
        setRawText('');
        setCleanedText('');
        setMetadata({
          title: '',
          language: 'English',
          capturedOn: new Date().toISOString().split('T')[0],
          location: '',
          monasteryName: '',
          description: '',
          tags: [],
          rawText: '',
          cleanedText: ''
        });
      } else {
        const error = await response.json();
        alert(`Error saving data: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save OCR data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-amber-200 mb-4">
          Upload Image for OCR
        </h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="block w-full text-sm text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-amber-600 file:text-white
            hover:file:bg-amber-700 file:cursor-pointer
            cursor-pointer"
        />
        <p className="text-gray-400 text-sm mt-2">
          Supports multiple languages including Tibetan script
        </p>
        <p className="text-amber-300 text-xs mt-1">
          💡 Tip: For best results, use high-contrast images with clear, well-lit text
        </p>

        {/* Language Selection */}
        <div className="mt-4">
          <label className="text-amber-200 text-sm font-semibold mb-2 block">
            Select Languages for Recognition:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {languageOptions.map((lang) => (
              <label
                key={lang.code}
                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                  selectedLanguages.includes(lang.code)
                    ? 'bg-amber-600/30 border-amber-500'
                    : 'bg-gray-900/50 border-amber-900/30 hover:border-amber-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(lang.code)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLanguages([...selectedLanguages, lang.code]);
                    } else {
                      setSelectedLanguages(selectedLanguages.filter(l => l !== lang.code));
                    }
                  }}
                  className="w-4 h-4 accent-amber-600"
                />
                <span className="text-gray-300 text-sm">{lang.name}</span>
              </label>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Select at least one language. More languages may take longer to process.
          </p>
        </div>
        
        {selectedFile && !isLoading && selectedLanguages.length > 0 && (
          <button
            onClick={startOCR}
            className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
          >
            Start OCR
          </button>
        )}
        
        {selectedFile && !isLoading && selectedLanguages.length === 0 && (
          <p className="mt-4 text-amber-400 text-sm">
            Please select at least one language to proceed.
          </p>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <div className="flex-1">
              <p className="text-white font-semibold mb-2">
                {progress < 50 ? "Loading OCR engine..." : "Extracting text..."} {progress}%
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                First-time load may take 30-60 seconds to download language files
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {image && (
        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-200 mb-4">
            Image Preview
          </h3>
          <img
            src={image}
            alt="Uploaded"
            className="max-w-full h-auto rounded-lg border border-amber-900/50"
          />
        </div>
      )}

      {/* Raw OCR Text */}
      {rawText && !isLoading && (
        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Raw OCR Output
          </h3>
          <pre className="bg-gray-900/50 border border-amber-900/30 rounded-lg p-4 text-gray-200 whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">
            {rawText}
          </pre>
        </div>
      )}

      {/* Cleaned Text */}
      {cleanedText && !isLoading && (
        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            Cleaned Text
          </h3>
          <div className="bg-gray-900/50 border border-amber-900/30 rounded-lg p-4">
            <textarea
              value={cleanedText}
              onChange={(e) => {
                setCleanedText(e.target.value);
                setMetadata(prev => ({ ...prev, cleanedText: e.target.value }));
              }}
              className="w-full bg-transparent text-gray-200 whitespace-pre-wrap font-sans text-sm min-h-32 outline-none resize-y"
              placeholder="Edit cleaned text here..."
            />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            💡 You can edit the cleaned text to fix any remaining errors
          </p>
        </div>
      )}

      {/* Metadata Form */}
      {showMetadataForm && !isLoading && (
        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Add Metadata for Archiving
          </h3>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">
                Title *
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-900/50 border border-amber-900/30 rounded-lg px-4 py-2 text-gray-200 outline-none focus:border-amber-500"
                placeholder="e.g., Tashiding Monastery Board"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">
                Language *
              </label>
              <select
                value={metadata.language}
                onChange={(e) => setMetadata(prev => ({ ...prev, language: e.target.value }))}
                className="w-full bg-gray-900/50 border border-amber-900/30 rounded-lg px-4 py-2 text-gray-200 outline-none focus:border-amber-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Nepali">Nepali</option>
                <option value="Bengali">Bengali</option>
                <option value="Tibetan">Tibetan</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                Date Captured *
              </label>
              <input
                type="date"
                value={metadata.capturedOn}
                onChange={(e) => setMetadata(prev => ({ ...prev, capturedOn: e.target.value }))}
                className="w-full bg-gray-900/50 border border-amber-900/30 rounded-lg px-4 py-2 text-gray-200 outline-none focus:border-amber-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Location *
              </label>
              <input
                type="text"
                value={metadata.location}
                onChange={(e) => setMetadata(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-gray-900/50 border border-amber-900/30 rounded-lg px-4 py-2 text-gray-200 outline-none focus:border-amber-500"
                placeholder="e.g., West Sikkim"
              />
            </div>

            {/* Monastery Name */}
            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
                Monastery/Source *
              </label>
              <input
                type="text"
                value={metadata.monasteryName}
                onChange={(e) => setMetadata(prev => ({ ...prev, monasteryName: e.target.value }))}
                className="w-full bg-gray-900/50 border border-amber-900/30 rounded-lg px-4 py-2 text-gray-200 outline-none focus:border-amber-500"
                placeholder="e.g., Tashiding Monastery"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                Description
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-900/50 border border-amber-900/30 rounded-lg px-4 py-2 text-gray-200 outline-none focus:border-amber-500 resize-y"
                rows={3}
                placeholder="Describe what this text is about..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                </svg>
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 bg-gray-900/50 border border-amber-900/30 rounded-lg px-4 py-2 text-gray-200 outline-none focus:border-amber-500"
                  placeholder="Add tag and press Enter"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-amber-600/30 border border-amber-600 rounded-full text-amber-200 text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Suggested: monastery, sikkim, heritage, history, buddhist, etc.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSaveOCRData}
              disabled={isSaving || !metadata.title || !metadata.location || !metadata.monasteryName}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                    </svg>
                    Save OCR Data to Archive
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Tibetan OCR Verifier Section */}
      {selectedLanguages.includes('bod') && (cleanedText || rawText) && (
        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-200 mb-4">
            Tibetan Text Verification
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Use AI-powered verification to check the accuracy of Tibetan OCR results
          </p>
          
          {!showTibetanVerifier ? (
            <button
              onClick={() => setShowTibetanVerifier(true)}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Verify Tibetan Text Accuracy
            </button>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setShowTibetanVerifier(false)}
                className="text-amber-400 hover:text-amber-300 text-sm font-semibold mb-4"
              >
                ← Hide Verifier
              </button>
              <TibetanOCRVerifier
                tesseractOutput={cleanedText || rawText}
                imageData={image || ''}
                onVerificationComplete={(results) => {
                  console.log('Verification complete:', results);
                  if (results.correct_ocr) {
                    setCleanedText(results.correct_ocr);
                    setMetadata(prev => ({ ...prev, cleanedText: results.correct_ocr }));
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

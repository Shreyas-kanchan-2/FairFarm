import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { speakVoiceAI } from '../api/client';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand?: (command: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onCommand,
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      if (language === 'hi') recognition.lang = 'hi-IN';
      else if (language === 'kn') recognition.lang = 'kn-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use the text input below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      handleProcessQuery(transcript);
    } else {
      setTranscript('');
      setAssistantResponse('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const lower = queryText.toLowerCase();
    let reply = '';

    if (lower.includes('netprofit') || lower.includes('profit') || lower.includes('नफा') || lower.includes('ಲಾಭ')) {
      reply =
        'NetProfit Match calculates your real take-home earnings. It deducts transportation logistics, estimated crop perishability losses, and handling fees so you see which buyer offer yields the most cash in hand.';
    } else if (lower.includes('transport') || lower.includes('vehicle') || lower.includes('वाहन') || lower.includes('ಸಾರಿಗೆ')) {
      reply =
        'Shared Transport connects nearby farmers traveling towards the same mandi or city hub. By pooling vehicle space, you can reduce transport costs by up to 50 percent.';
    } else if (lower.includes('tomato') || lower.includes('टमाटर') || lower.includes('ಟೊಮೆಟೊ')) {
      reply =
        'Fresh Vine Tomatoes are available from Narayangaon, Pune at ₹34 per kilogram. Verified organic harvest with high shelf life.';
    } else if (lower.includes('offer') || lower.includes('accept') || lower.includes('प्रस्ताव')) {
      reply =
        'To accept an offer, navigate to My Listings, click View Offers, review the NetProfit ranking, and click Accept Offer. This atomically creates a confirmed order and decrements available stock.';
    } else {
      reply =
        `I understood: "${queryText}". FairFarm connects smallholder farmers directly to verified businesses with transparent net pricing and shared logistics.`;
    }

    setAssistantResponse(reply);
    setIsSpeaking(true);

    try {
      await speakVoiceAI(reply, language);
    } finally {
      setIsSpeaking(false);
    }

    if (onCommand) {
      onCommand(queryText);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setTranscript(textInput);
    handleProcessQuery(textInput);
    setTextInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-cream-50 p-6 shadow-2xl border border-cream-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-600 text-cream-50 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-forest-950">{t('voiceAssistant')}</h3>
              <p className="text-xs text-forest-700">Powered by ElevenLabs & Browser Speech</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-forest-800 hover:bg-cream-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Voice Interaction Body */}
        <div className="my-6 flex flex-col items-center text-center">
          <div className="relative my-4 flex items-center justify-center">
            {isListening && (
              <span className="absolute h-24 w-24 rounded-full bg-forest-500/20 animate-ping" />
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-md transition transform active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-forest-700 text-cream-50 hover:bg-forest-800'
              }`}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </button>
          </div>

          <p className="text-sm font-medium text-forest-800">
            {isListening ? t('voiceListening') : t('voiceSpeakPrompt')}
          </p>
          <p className="mt-1 text-xs text-forest-600">
            Tap the microphone and speak in English, Hindi, or Kannada.
          </p>

          {/* Transcript Display */}
          {transcript && (
            <div className="mt-4 w-full rounded-xl bg-white p-3 text-left border border-cream-200 shadow-xs">
              <span className="text-xs font-semibold text-forest-600 uppercase">You said:</span>
              <p className="mt-0.5 text-sm font-medium text-forest-950">"{transcript}"</p>
            </div>
          )}

          {/* Assistant Audio / Text Response */}
          {assistantResponse && (
            <div className="mt-3 w-full rounded-xl bg-forest-50 p-4 text-left border border-forest-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-forest-700 uppercase flex items-center gap-1">
                  <Volume2 className="h-3.5 w-3.5" /> FairFarm Voice AI:
                </span>
                {isSpeaking && (
                  <span className="text-xs text-forest-600 animate-pulse font-medium">
                    Speaking audio...
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-forest-950 leading-relaxed">{assistantResponse}</p>
            </div>
          )}
        </div>

        {/* Text Fallback Form */}
        <form onSubmit={handleTextSubmit} className="mt-4 border-t border-cream-200 pt-4">
          <label className="block text-xs font-medium text-forest-800 mb-1.5">
            {t('voiceTextFallback')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. How does NetProfit match work?"
              className="flex-1 rounded-lg border border-cream-300 bg-white px-3.5 py-2 text-sm text-forest-950 placeholder-gray-400 focus:border-forest-600 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-forest-700 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-forest-800 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Sample Voice Prompts */}
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          <button
            type="button"
            onClick={() => handleProcessQuery('Explain NetProfit match')}
            className="rounded-md bg-cream-200/80 px-2 py-1 text-xs text-forest-800 hover:bg-cream-300 transition"
          >
            "Explain NetProfit"
          </button>
          <button
            type="button"
            onClick={() => handleProcessQuery('Find shared transport for Pune')}
            className="rounded-md bg-cream-200/80 px-2 py-1 text-xs text-forest-800 hover:bg-cream-300 transition"
          >
            "Shared transport"
          </button>
          <button
            type="button"
            onClick={() => handleProcessQuery('Show tomato listings')}
            className="rounded-md bg-cream-200/80 px-2 py-1 text-xs text-forest-800 hover:bg-cream-300 transition"
          >
            "Show tomatoes"
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';

// --- Type Definitions for Web Speech API ---
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface VoiceExpenseInputProps {
  onSpeechEnd: (text: string) => void;
  language?: string;
}

const VoiceExpenseInput: React.FC<VoiceExpenseInputProps> = ({ 
  onSpeechEnd, 
  language = 'my-MM' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initRecognition = () => {
    const Window = window as unknown as IWindow;
    const SpeechRecognition = Window.SpeechRecognition || Window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition. Please use Chrome.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true; // Keep recording while holding
    recognition.interimResults = true; // CRITICAL: Allows real-time streaming

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript(''); // Clear previous text
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // Update UI immediately with what is being spoken
      const currentText = finalTranscript + interimTranscript;
      setTranscript(currentText);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to stop scrolling/long-press context menus on mobile
    if (e.type === 'touchstart') e.preventDefault();

    if (isListening) return;

    const recognition = initRecognition();
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStop = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchend') e.preventDefault();

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Pass the final text back to parent after a slight delay 
      // to ensure state is updated
      setTimeout(() => {
        if (transcript.trim()) {
           onSpeechEnd(transcript);
           setTranscript(''); // Clear after sending
        }
      }, 100);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 relative z-50">
      {/* Real-time Transcript Display (Only shows when speaking) */}
      {transcript && (
        <div className="absolute bottom-20 w-64 bg-slate-900/90 text-white p-3 rounded-xl border border-emerald-500/30 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-1 text-xs text-emerald-400 font-bold uppercase tracking-wider">
             <Activity size={12} className="animate-pulse"/> Live Input
          </div>
          <p className="text-sm font-medium leading-relaxed">
            {transcript}
            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-emerald-500 animate-pulse"/>
          </p>
        </div>
      )}

      {/* Push-to-Talk Button */}
      <button
        onMouseDown={handleStart}
        onMouseUp={handleStop}
        onMouseLeave={handleStop} // Stop if mouse slides off
        onTouchStart={handleStart}
        onTouchEnd={handleStop}
        className={`
          relative group flex items-center justify-center p-4 rounded-full shadow-lg transition-all duration-200 select-none
          ${isListening 
            ? 'bg-red-500 text-white scale-110 shadow-red-500/40 ring-4 ring-red-500/20' 
            : 'bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800'
          }
        `}
        title="Hold to Speak"
        style={{ touchAction: 'none' }} // Prevents browser gestures
      >
        {isListening ? (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
            <Mic size={24} className="animate-pulse" />
          </>
        ) : (
          <Mic size={24} />
        )}
      </button>
      
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest opacity-60">
        {isListening ? 'Listening...' : 'Hold to Speak'}
      </span>
    </div>
  );
};

export default VoiceExpenseInput;

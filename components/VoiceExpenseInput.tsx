
import React, { useState, useRef } from 'react';
import { Mic, Loader2, AlertCircle } from 'lucide-react';

interface VoiceExpenseInputProps {
  onSpeechEnd: (text: string) => void;
}

const VoiceExpenseInput: React.FC<VoiceExpenseInputProps> = ({ onSpeechEnd }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true); // Show loader while waiting for API
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1]; // Remove data:audio/webm;base64, prefix

        if (!base64Audio) {
            console.error("Failed to convert audio to base64");
            setIsProcessing(false);
            return;
        }

        try {
          // Send to Backend API
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              audio: base64Audio,
              mimeType: audioBlob.type 
            }),
          });

          const data = await response.json();

          if (data.text) {
            onSpeechEnd(data.text);
          } else {
            console.error("Transcription failed:", data.error);
            alert("Error: " + (data.error || "Could not transcribe audio"));
          }
        } catch (err) {
            console.error("API Call Error:", err);
            alert("Network error connecting to transcription service.");
        } finally {
            setIsProcessing(false);
        }
      };
    } catch (e) {
      console.error("Error processing audio", e);
      setIsProcessing(false);
    }
  };

  // Interaction Handlers
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchstart') e.preventDefault();
    if (!isProcessing) startRecording();
  };

  const handleStop = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchend') e.preventDefault();
    stopRecording();
  };

  return (
    <div className="flex flex-col items-center gap-2 relative z-50">
      <button
        onMouseDown={handleStart}
        onMouseUp={handleStop}
        onMouseLeave={handleStop}
        onTouchStart={handleStart}
        onTouchEnd={handleStop}
        disabled={isProcessing}
        className={`
          relative flex items-center justify-center p-4 rounded-full shadow-lg transition-all duration-200 select-none
          ${isRecording 
            ? 'bg-red-500 text-white scale-110 shadow-red-500/40 ring-4 ring-red-500/20' 
            : isProcessing 
              ? 'bg-slate-700/50 cursor-wait' 
              : 'bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800'
          }
        `}
        title="Hold to Speak"
        style={{ touchAction: 'none' }}
      >
        {isProcessing ? (
          <Loader2 size={24} className="animate-spin text-emerald-400" />
        ) : isRecording ? (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
            <Mic size={24} className="animate-pulse" />
          </>
        ) : (
          <Mic size={24} />
        )}
      </button>
      
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest opacity-60">
        {isProcessing ? 'Processing...' : isRecording ? 'Recording...' : 'Hold to Speak'}
      </span>
    </div>
  );
};

export default VoiceExpenseInput;

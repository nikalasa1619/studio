

// src/components/newsletter-pro/ui/speech-to-text-button.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { LogEntryType } from '../types';

interface SpeechToTextButtonProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
  addLogEntry: (message: string, type?: LogEntryType) => void;
}

export function SpeechToTextButton({ onTranscript, disabled, addLogEntry }: SpeechToTextButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(isListening); 

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setIsSupported(true);
        if (!recognitionRef.current) {
          const instance = new SpeechRecognitionAPI();
          instance.continuous = false; 
          instance.interimResults = false;
          instance.lang = 'en-US';
          recognitionRef.current = instance;
        }
      } else {
        setIsSupported(false);
        addLogEntry('Speech Recognition API not supported in this browser.', 'warning');
      }
    }
    return () => {
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [addLogEntry]); 

  useEffect(() => {
    if (!recognitionRef.current || !isSupported) {
      return;
    }

    const recognitionInstance = recognitionRef.current;

    const handleResult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false); 
      addLogEntry(`Speech recognized: "${transcript}"`, "success");
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      let descriptionMessage = 'An error occurred during speech recognition.';
      let logType: LogEntryType = 'error';

      if (event.error === 'network') {
        descriptionMessage = 'A network error occurred with speech recognition. Please check your internet connection and try again.';
        logType = 'warning'; // Network errors are often transient or external
        console.warn(`Speech recognition API reported a "network" error. This usually means the browser cannot connect to its speech-to-text service or there's an internet issue. User will be notified. Raw error:`, event.error);
      } else {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          descriptionMessage = 'No speech detected. Please try speaking again.';
        } else if (event.error === 'audio-capture') {
          descriptionMessage = 'Microphone not available. Please check your microphone settings.';
        } else if (event.error === 'not-allowed') {
          descriptionMessage = 'Permission to use microphone was denied. Please enable it in browser settings.';
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description: descriptionMessage,
      });
      addLogEntry(`Speech recognition error: ${event.error} - ${descriptionMessage}`, logType);
      setIsListening(false);
    };
    
    const handleEnd = () => {
      if (isListeningRef.current) {
        setIsListening(false); 
        addLogEntry("Speech recognition ended.", "info");
      }
    };

    recognitionInstance.addEventListener('result', handleResult);
    recognitionInstance.addEventListener('error', handleError);
    recognitionInstance.addEventListener('end', handleEnd);

    return () => {
      recognitionInstance.removeEventListener('result', handleResult);
      recognitionInstance.removeEventListener('error', handleError);
      recognitionInstance.removeEventListener('end', handleEnd);
    };
  }, [isSupported, onTranscript, toast, addLogEntry]);


  const handleToggleListening = async () => {
    if (!isSupported || !recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Feature',
        description: 'Speech recognition is not supported by your browser.',
      });
      addLogEntry("Speech recognition toggled but feature not supported.", "error");
      return;
    }

    const recognition = recognitionRef.current;

    if (isListening) {
      recognition.stop();
      addLogEntry("Stopped listening for speech.", "info");
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); 
        } else {
            addLogEntry('navigator.mediaDevices.getUserMedia not supported. Speech recognition might rely on older permission models or fail if permissions are not already granted.', 'warning');
        }
        
        recognition.start();
        setIsListening(true);
        addLogEntry("Started listening for speech.", "info");
      } catch (err: any) {
        let toastMessage = 'Please allow microphone access in your browser settings.';
        let detailedError = `Error accessing microphone or starting recognition: ${err.name} - ${err.message}`;
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            toastMessage = 'No microphone found. Please connect a microphone and grant access.';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            toastMessage = 'Permission to use microphone was denied. Please enable it in browser settings.';
        } else if (err.name === 'SecurityError') {
            toastMessage = 'Microphone access is insecure. Please ensure your page is served over HTTPS.';
        }
        console.error(detailedError, err);
        toast({
          variant: 'destructive',
          title: 'Microphone Access Issue',
          description: toastMessage,
        });
        addLogEntry(`Microphone access issue: ${toastMessage}. Details: ${detailedError}`, "error");
        setIsListening(false);
      }
    }
  };

  if (!isSupported) {
      return (
        <Button variant="outline" size="icon" disabled title="Speech-to-text not supported">
            <MicOff className="h-4 w-4" />
        </Button>
      );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleListening}
      disabled={disabled}
      title={isListening ? 'Stop listening' : 'Start speech-to-text'}
      className={cn(isListening ? 'speech-to-text-listening ring-2 ring-primary' : '')}
    >
      {isListening ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}


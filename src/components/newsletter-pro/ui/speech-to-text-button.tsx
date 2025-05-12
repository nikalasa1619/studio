// src/components/newsletter-pro/ui/speech-to-text-button.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SpeechToTextButtonProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export function SpeechToTextButton({ onTranscript, disabled }: SpeechToTextButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(isListening); // Ref to track isListening for cleanup

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  
  const { toast } = useToast();

  // Effect for initializing the SpeechRecognition object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setIsSupported(true);
        if (!recognitionRef.current) { // Create instance only if it doesn't exist
          const instance = new SpeechRecognitionAPI();
          instance.continuous = false; 
          instance.interimResults = false;
          instance.lang = 'en-US';
          recognitionRef.current = instance;
        }
      } else {
        setIsSupported(false);
        console.warn('Speech Recognition API not supported in this browser.');
      }
    }
    // Cleanup on component unmount
    return () => {
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array, runs once on mount

  // Effect for handling recognition events
  useEffect(() => {
    if (!recognitionRef.current || !isSupported) {
      return;
    }

    const recognition = recognitionRef.current;

    const handleResult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false); 
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error); 
      let descriptionMessage = 'An error occurred during speech recognition.';
      if (event.error === 'no-speech') {
        descriptionMessage = 'No speech detected. Please try speaking again.';
      } else if (event.error === 'audio-capture') {
        descriptionMessage = 'Microphone not available. Please check your microphone settings.';
      } else if (event.error === 'not-allowed') {
        descriptionMessage = 'Permission to use microphone was denied. Please enable it in browser settings.';
      } else if (event.error === 'network') {
        descriptionMessage = 'A network error occurred. Please check your internet connection and try again.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description: descriptionMessage,
      });
      setIsListening(false);
    };
    
    const handleEnd = () => {
      setIsListening(false); 
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);
    recognition.addEventListener('end', handleEnd);

    // Cleanup listeners when dependencies change or component unmounts
    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError);
      recognition.removeEventListener('end', handleEnd);
    };
  }, [isSupported, onTranscript, toast]); // Dependencies for re-binding listeners if necessary


  const handleToggleListening = async () => {
    if (!isSupported || !recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Feature',
        description: 'Speech recognition is not supported by your browser.',
      });
      return;
    }

    const recognition = recognitionRef.current;

    if (isListening) {
      recognition.stop();
      // setIsListening(false); // onend will handle this
    } else {
      try {
        // Attempt to get user media to ensure permissions are active or prompt if needed.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // We don't need to keep the stream

        recognition.start();
        setIsListening(true);
      } catch (err: any) {
        console.error('Error accessing microphone or starting recognition:', err);
        let toastMessage = 'Please allow microphone access in your browser settings.';
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            toastMessage = 'No microphone found. Please connect a microphone and grant access.';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            toastMessage = 'Permission to use microphone was denied. Please enable it in browser settings.';
        } else if (err.name === 'SecurityError') {
            toastMessage = 'Microphone access is insecure. Please ensure your page is served over HTTPS.';
        }
        toast({
          variant: 'destructive',
          title: 'Microphone Access Issue',
          description: toastMessage,
        });
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

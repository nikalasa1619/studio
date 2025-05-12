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
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
          setIsListening(false);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast({
            variant: 'destructive',
            title: 'Speech Recognition Error',
            description: event.error === 'no-speech' ? 'No speech detected.' : event.error === 'audio-capture' ? 'Microphone not available.' : event.error === 'not-allowed' ? 'Permission denied.' : 'An error occurred during speech recognition.',
          });
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          if (isListening) { // if onend is called while still intending to listen (e.g. auto-stop)
            setIsListening(false);
          }
        };
        recognitionRef.current = recognitionInstance;
      } else {
        setIsSupported(false);
        console.warn('Speech Recognition API not supported in this browser.');
      }
    }
  }, [onTranscript, toast, isListening]);

  const handleToggleListening = async () => {
    if (!isSupported || !recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Feature',
        description: 'Speech recognition is not supported by your browser.',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        // Check for microphone permission explicitly if possible, though some browsers handle it in start()
        // This is a basic check; robust permission handling is more complex.
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error accessing microphone or starting recognition:', err);
        toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description: 'Please allow microphone access in your browser settings.',
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

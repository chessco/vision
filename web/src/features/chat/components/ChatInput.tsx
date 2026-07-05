// ─── Chat Input ────────────────────────────────────────────────
// The main chat input area with support for voice, file uploads, and sending messages.

import { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Paperclip, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500" />
      <div className="relative bg-paper border border-border-subtle rounded-2xl overflow-hidden focus-within:border-primary/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Creative Director to design a campaign, generate an image, or write copy..."
          className="w-full max-h-[200px] min-h-[56px] bg-transparent p-4 text-white text-sm focus:outline-none resize-none placeholder:text-ink-muted/50"
          rows={1}
        />
        
        <div className="flex items-center justify-between p-2 pt-0">
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-ink-muted hover:text-white hover:bg-white/5 transition-colors" title="Attach file">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-ink-muted hover:text-white hover:bg-white/5 transition-colors" title="Upload image">
              <Image className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-ink-muted hover:text-white hover:bg-white/5 transition-colors" title="Voice input">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={clsx(
              'p-2 rounded-xl flex items-center justify-center transition-all',
              input.trim() && !isLoading
                ? 'bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                : 'bg-white/5 text-ink-muted/50 cursor-not-allowed'
            )}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}


import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const PromptInput = ({ value, onChange, onGenerate, isGenerating }: PromptInputProps) => {
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setCharCount(value.length);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus();
    }
  }, [isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex items-center space-x-3 mb-4">
          <Terminal className="h-5 w-5 text-blue-400" />
          <label className="text-sm font-medium text-slate-300 font-mono">
            NEURAL INPUT
          </label>
          {isFocused && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-cyan-400 rounded-full status-processing"
            />
          )}
        </div>
        
        <div className={`relative glass-panel rounded-xl overflow-hidden transition-all duration-300 ${
          isFocused 
            ? 'neon-blue ring-1 ring-blue-400/30' 
            : 'hover:border-slate-600/60'
        }`}>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Initialize neural interface..."
            className={`resize-none bg-transparent border-0 text-slate-200 placeholder:text-slate-500 focus:ring-0 focus:border-0 leading-relaxed font-mono ${
              isMobile 
                ? 'min-h-[120px] max-h-[200px] text-base p-4' 
                : 'min-h-[140px] max-h-[300px] text-sm p-6'
            }`}
            disabled={isGenerating}
          />
          
          <div className="absolute bottom-4 right-4 flex items-center space-x-3">
            <div className="text-xs text-slate-500 font-mono">
              {charCount} chars
            </div>
            {charCount > 500 && (
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-slate-500 font-mono">
          {!isMobile && (
            <div className="flex items-center space-x-4">
              <span>⌘+Enter to execute</span>
              <div className="w-px h-4 bg-slate-600"></div>
              <span className="text-cyan-400">Ready for processing</span>
            </div>
          )}
        </div>
        
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !value.trim()}
          className={`glass-button border border-blue-500/50 bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-500/80 hover:to-cyan-500/80 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isMobile 
              ? 'px-6 py-3 text-sm' 
              : 'px-8 py-3 text-sm'
          } ${!isGenerating && value.trim() ? 'neon-blue' : ''}`}
        >
          <div className="flex items-center font-mono">
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Loader2 className={isMobile ? 'h-4 w-4' : 'h-4 w-4'} />
                </motion.div>
                PROCESSING...
              </>
            ) : (
              <>
                <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} mr-2`} />
                EXECUTE
              </>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
};

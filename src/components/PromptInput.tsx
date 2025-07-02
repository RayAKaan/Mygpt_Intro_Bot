
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Prompt
        </label>
        
        <div className={`relative bg-gray-900 border rounded-lg overflow-hidden transition-all duration-200 ${
          isFocused 
            ? 'border-blue-500 ring-1 ring-blue-500/20' 
            : 'border-gray-700'
        }`}>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter your prompt here..."
            className={`resize-none bg-transparent border-0 text-gray-200 placeholder:text-gray-500 focus:ring-0 focus:border-0 leading-relaxed ${
              isMobile 
                ? 'min-h-[100px] max-h-[200px] text-base p-3' 
                : 'min-h-[120px] max-h-[300px] text-sm p-4'
            }`}
            disabled={isGenerating}
          />
          
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {charCount} characters
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {!isMobile && (
            <span>Press ⌘+Enter to generate</span>
          )}
        </div>
        
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !value.trim()}
          className={`bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isMobile 
              ? 'px-6 py-2 text-sm' 
              : 'px-8 py-2 text-sm'
          }`}
        >
          <div className="flex items-center">
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Loader2 className={isMobile ? 'h-4 w-4' : 'h-4 w-4'} />
                </motion.div>
                Generating...
              </>
            ) : (
              <>
                <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'} mr-2`} />
                Generate
              </>
            )}
          </div>
        </Button>
      </div>
    </div>
  );
};

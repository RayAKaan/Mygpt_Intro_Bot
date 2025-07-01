
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    setCharCount(value.length);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Command Label */}
        <motion.div
          className="flex items-center space-x-2 mb-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Zap className="h-4 w-4 text-[#00e0ff]" />
          <span className="text-sm font-mono text-[#c0e5ff] tracking-wider">
            NEURAL COMMAND INPUT
          </span>
        </motion.div>

        {/* Enhanced Textarea Container */}
        <motion.div
          className={`relative bg-[#0f0f0f] border-2 rounded-lg overflow-hidden transition-all duration-300 ${
            isFocused 
              ? 'border-[#00e0ff] shadow-lg shadow-[#00e0ff]/20' 
              : 'border-[#1a1a1a]'
          }`}
          animate={isFocused ? { 
            boxShadow: [
              '0 0 20px rgba(0, 224, 255, 0.2)',
              '0 0 30px rgba(0, 224, 255, 0.3)',
              '0 0 20px rgba(0, 224, 255, 0.2)'
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Scanning line effect */}
          {isFocused && (
            <motion.div
              className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-[#00e0ff] to-transparent"
              initial={{ width: '0%', x: '0%' }}
              animate={{ width: '100%', x: '0%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="[ ENTER TACTICAL COMMAND PARAMETERS... ]"
            className="min-h-[120px] max-h-[300px] resize-none bg-transparent border-0 text-[#c9c9c9] placeholder:text-[#666] focus:ring-0 focus:border-0 text-lg leading-relaxed font-mono p-4"
            disabled={isGenerating}
          />
          
          {/* Neural activity indicator */}
          {value && (
            <motion.div
              className="absolute bottom-3 left-3 flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-[#00ff90]"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs text-[#00ff90] font-mono">NEURAL ACTIVE</span>
            </motion.div>
          )}
          
          {/* Character Counter */}
          <div className="absolute bottom-3 right-3 text-xs text-[#666] font-mono">
            [ {charCount} CHARS ]
          </div>
        </motion.div>
      </div>

      {/* Execute Button */}
      <div className="flex justify-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onGenerate}
            disabled={isGenerating || !value.trim()}
            className="bg-gradient-to-r from-[#3b82f6] to-[#00e0ff] hover:from-[#2563eb] hover:to-[#0ea5e9] text-black px-8 py-3 text-lg font-bold font-mono tracking-wider shadow-lg hover:shadow-xl border-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {/* Button glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#00e0ff] opacity-0"
              animate={!isGenerating && value.trim() ? { 
                opacity: [0, 0.3, 0]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <div className="relative z-10 flex items-center">
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Loader2 className="h-5 w-5" />
                  </motion.div>
                  EXECUTING...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  EXECUTE NEURAL COMMAND
                </>
              )}
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

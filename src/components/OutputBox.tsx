
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Download, Share, Clock, Zap, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface OutputBoxProps {
  content: string;
  isGenerating: boolean;
  inferenceTime?: number;
  tokensUsed?: number;
}

export const OutputBox = ({ content, isGenerating, inferenceTime, tokensUsed }: OutputBoxProps) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Enhanced typewriter effect with neural flicker
  useEffect(() => {
    if (content && !isGenerating) {
      setIsTyping(true);
      setDisplayedContent('');
      
      let index = 0;
      const timer = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 15); // Faster for more fluid effect

      return () => clearInterval(timer);
    }
  }, [content, isGenerating]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minigpt-output-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Response saved as text file.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MiniGPT-MLOps Output',
          text: content,
        });
      } catch (error) {
        // Fallback to clipboard
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-[#0f0f0f]/80 border-2 border-[#1a1a1a] backdrop-blur-md relative overflow-hidden">
        {/* Neural activity border */}
        <motion.div
          className="absolute inset-0 border-2 border-[#00ff90] opacity-20 rounded-lg"
          animate={{ 
            opacity: isGenerating ? [0.2, 0.5, 0.2] : 0.2,
            boxShadow: isGenerating ? [
              '0 0 10px rgba(0, 255, 144, 0.3)',
              '0 0 20px rgba(0, 255, 144, 0.5)',
              '0 0 10px rgba(0, 255, 144, 0.3)'
            ] : 'none'
          }}
          transition={{ duration: 1.5, repeat: isGenerating ? Infinity : 0 }}
        />

        {/* Header - Neural Output Terminal */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#0f0f0f]/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-[#00ff90]" />
              <h3 className="font-bold text-[#c0e5ff] font-mono tracking-wider">
                NEURAL OUTPUT TERMINAL
              </h3>
            </div>
            {(inferenceTime || tokensUsed) && (
              <div className="flex items-center space-x-4 text-sm text-[#00e0ff] font-mono">
                {inferenceTime && (
                  <div className="flex items-center space-x-1 border border-[#1a1a1a] px-2 py-1 rounded bg-[#000]/50">
                    <Clock className="h-3 w-3" />
                    <span>{inferenceTime}ms</span>
                  </div>
                )}
                {tokensUsed && (
                  <div className="flex items-center space-x-1 border border-[#1a1a1a] px-2 py-1 rounded bg-[#000]/50">
                    <Zap className="h-3 w-3" />
                    <span>{tokensUsed} TK</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-[#c0e5ff] hover:text-[#00e0ff] hover:bg-[#1a1a1a] border border-[#1a1a1a] p-2"
              disabled={isGenerating}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-[#c0e5ff] hover:text-[#00e0ff] hover:bg-[#1a1a1a] border border-[#1a1a1a] p-2"
              disabled={isGenerating}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-[#c0e5ff] hover:text-[#00e0ff] hover:bg-[#1a1a1a] border border-[#1a1a1a] p-2"
              disabled={isGenerating}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Neural Processing Content */}
        <div className="p-6 relative">
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                className="relative"
              >
                {/* Central processing core */}
                <motion.div
                  className="h-8 w-8 border-2 border-[#00e0ff] rounded-full"
                  animate={{ 
                    rotate: 360,
                    borderColor: ['#00e0ff', '#00ff90', '#3b82f6', '#00e0ff']
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    borderColor: { duration: 3, repeat: Infinity }
                  }}
                />
                {/* Orbital rings */}
                <motion.div
                  className="absolute inset-0 h-8 w-8 border border-[#00ff90]/50 rounded-full"
                  animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                />
              </motion.div>
              <span className="ml-4 text-[#c0e5ff] font-mono tracking-wider">
                [ NEURAL PATHWAYS PROCESSING... ]
              </span>
            </div>
          ) : (
            <div className="relative">
              {/* Terminal-style output */}
              <div className="bg-black/50 rounded border border-[#1a1a1a] p-4 font-mono">
                <div className="text-[#00ff90] text-sm mb-2">
                  &gt; NEURAL_OUTPUT.execute()
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-pre-wrap text-[#c9c9c9] leading-relaxed"
                >
                  {displayedContent}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-[#00e0ff] bg-[#00e0ff] w-2 h-5 inline-block ml-1"
                    >
                      █
                    </motion.span>
                  )}
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

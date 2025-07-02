
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Download, Share, Clock, Zap } from 'lucide-react';
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
      }, 20);

      return () => clearInterval(timer);
    }
  }, [content, isGenerating]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Response has been copied successfully.",
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
      title: "Downloaded",
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
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-gray-200">Response</h3>
          {(inferenceTime || tokensUsed) && (
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              {inferenceTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{inferenceTime}ms</span>
                </div>
              )}
              {tokensUsed && (
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>{tokensUsed} tokens</span>
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
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            disabled={isGenerating}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            disabled={isGenerating}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            disabled={isGenerating}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="ml-3 text-gray-400">Generating response...</span>
          </div>
        ) : (
          <div className="bg-gray-950 rounded-md p-4">
            <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">
              {displayedContent}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-blue-400"
                >
                  |
                </motion.span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};


import { useState, useEffect } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { OutputBox } from '@/components/OutputBox';
import { SettingsPanel } from '@/components/SettingsPanel';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { Settings, History, Cpu, Activity, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topK: number;
  topP: number;
  preset: 'creative' | 'balanced' | 'precise';
}

interface ChatMessage {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
  config: ModelConfig;
  inferenceTime?: number;
  tokensUsed?: number;
}

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [config, setConfig] = useState<ModelConfig>({
    temperature: 0.7,
    maxTokens: 150,
    topK: 50,
    topP: 0.9,
    preset: 'balanced'
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('minigpt-history');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Auto-close panels on mobile when generating
  useEffect(() => {
    if (isMobile && isGenerating) {
      setShowSettings(false);
      setShowHistory(false);
    }
  }, [isMobile, isGenerating]);

  // Save history to localStorage
  const saveHistory = (newHistory: ChatMessage[]) => {
    localStorage.setItem('minigpt-history', JSON.stringify(newHistory));
    setChatHistory(newHistory);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to generate text.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setCurrentResponse('');

    if (isMobile) {
      setShowSettings(false);
      setShowHistory(false);
    }

    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          top_k: config.topK,
          top_p: config.topP
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate text');
      }

      const data = await response.json();
      const inferenceTime = Date.now() - startTime;
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        prompt,
        response: data.generated_text || 'Sample generated response from MiniGPT-MLOps model...',
        timestamp: new Date(),
        config,
        inferenceTime,
        tokensUsed: data.tokens_used || 42
      };

      setCurrentResponse(newMessage.response);
      const updatedHistory = [newMessage, ...chatHistory];
      saveHistory(updatedHistory);

      toast({
        title: "Generated successfully",
        description: `Response ready in ${inferenceTime}ms`,
      });

    } catch (error) {
      const mockResponse = `This is a demonstration of MiniGPT-MLOps generating text based on your prompt: "${prompt}"\n\nThe model would process this input using the transformer architecture with the configured parameters. In a production environment, this would connect to your FastAPI backend at the /predict endpoint.`;
      
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        prompt,
        response: mockResponse,
        timestamp: new Date(),
        config,
        inferenceTime: 1200,
        tokensUsed: 85
      };

      setCurrentResponse(newMessage.response);
      const updatedHistory = [newMessage, ...chatHistory];
      saveHistory(updatedHistory);

      toast({
        title: "Demo mode",
        description: "Connect to FastAPI backend for live generation",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistorySelect = (message: ChatMessage) => {
    setPrompt(message.prompt);
    setCurrentResponse(message.response);
    setConfig(message.config);
    if (isMobile) {
      setShowHistory(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('minigpt-history');
    setChatHistory([]);
    toast({
      title: "History cleared",
      description: "All conversation history has been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Cpu className="h-6 w-6 text-blue-400" />
              <div>
                <h1 className="text-lg font-semibold text-gray-100">
                  MiniGPT-MLOps
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Neural Language Generation
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <div className="flex items-center space-x-4 text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-md">
                <div className="flex items-center space-x-1">
                  <Activity className="h-3 w-3" />
                  <span>Online</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Gauge className="h-3 w-3" />
                  <span>212ms</span>
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (isMobile && !showHistory) setShowSettings(false);
              }}
              className={`p-2 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors ${showHistory ? 'bg-gray-700 text-blue-400' : 'text-gray-300'}`}
            >
              <History className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                if (isMobile && !showSettings) setShowHistory(false);
              }}
              className={`p-2 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors ${showSettings ? 'bg-gray-700 text-blue-400' : 'text-gray-300'}`}
            >
              <Settings className="h-4 w-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: isMobile ? 0 : -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? 0 : -320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`${
                isMobile 
                  ? 'fixed inset-0 z-40 bg-black/95 backdrop-blur-sm' 
                  : 'w-80 border-r border-gray-800 bg-gray-900/30 backdrop-blur-sm'
              }`}
            >
              <HistoryPanel
                history={chatHistory}
                onSelect={handleHistorySelect}
                onClear={clearHistory}
              />
              {isMobile && (
                <button
                  onClick={() => setShowHistory(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Prompt Input */}
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />

              {/* Output */}
              {(currentResponse || isGenerating) && (
                <OutputBox
                  content={currentResponse}
                  isGenerating={isGenerating}
                  inferenceTime={chatHistory[0]?.inferenceTime}
                  tokensUsed={chatHistory[0]?.tokensUsed}
                />
              )}

              {/* Welcome State */}
              {!currentResponse && !isGenerating && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                    <Cpu className="h-8 w-8 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-100">
                    Neural Interface Ready
                  </h2>
                  <p className="text-gray-400 max-w-md mx-auto text-sm">
                    Enter your prompt above to begin text generation. Configure model parameters using the settings panel for customized output.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ x: isMobile ? 0 : 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? 0 : 320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`${
                isMobile 
                  ? 'fixed inset-0 z-40 bg-black/95 backdrop-blur-sm' 
                  : 'w-80 border-l border-gray-800 bg-gray-900/30 backdrop-blur-sm'
              }`}
            >
              <SettingsPanel
                config={config}
                onConfigChange={setConfig}
              />
              {isMobile && (
                <button
                  onClick={() => setShowSettings(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;


import { useState, useEffect } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { OutputBox } from '@/components/OutputBox';
import { SettingsPanel } from '@/components/SettingsPanel';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { Settings, History, Zap, Activity, Cpu, Gauge, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
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

  // Boot sequence animation
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const bootTimer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(bootTimer);
  }, []);

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

    // Close panels on mobile during generation
    if (isMobile) {
      setShowSettings(false);
      setShowHistory(false);
    }

    try {
      const startTime = Date.now();
      
      // Simulate API call - replace with actual FastAPI endpoint
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
        title: "Text generated successfully!",
        description: `Generated in ${inferenceTime}ms`,
      });

    } catch (error) {
      // Fallback for demo purposes
      const mockResponse = `This is a demonstration of MiniGPT-MLOps generating text based on your prompt: "${prompt}"\n\nThe model would process this input using the transformer architecture with the following parameters:\n- Temperature: ${config.temperature}\n- Max Tokens: ${config.maxTokens}\n- Top-k: ${config.topK}\n- Top-p: ${config.topP}\n\nIn a real implementation, this would connect to your FastAPI backend at /predict endpoint.`;
      
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
        title: "Demo mode active",
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
      description: "All chat history has been removed.",
    });
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-blue-500 rounded-full mx-auto mb-6 sm:mb-8"
            animate={{
              rotate: 360,
              borderColor: ['#3b82f6', '#00e0ff', '#00ff90', '#3b82f6']
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              borderColor: { duration: 3, repeat: Infinity }
            }}
          />
          <motion.h1
            className="text-xl sm:text-2xl font-bold text-[#c0e5ff] font-mono tracking-wider"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            INITIALIZING TACTICAL INTERFACE
          </motion.h1>
          <motion.div
            className="mt-4 text-[#c9c9c9] text-xs sm:text-sm font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            [ NEURAL PATHWAYS ONLINE ]
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#c9c9c9] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Header - Tactical Command */}
      <header className="border-b border-[#1a1a1a] bg-black/80 backdrop-blur-md relative z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-30" />
        <div className="flex items-center justify-between p-3 sm:p-4 relative z-10">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[#00e0ff]" />
                <motion.div
                  className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 text-[#00e0ff]"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-sm sm:text-xl font-bold text-[#c0e5ff] font-mono tracking-wider">
                  MINIGPT-TACTICAL
                </h1>
                <p className="text-xs text-[#00ff90] font-mono hidden sm:block">
                  [ NEURAL LINGUISTIC WARFARE v2.1 ]
                </p>
              </div>
            </motion.div>
          </div>
          
          {/* Tactical Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Status indicators - hidden on mobile */}
            {!isMobile && (
              <motion.div
                className="flex items-center space-x-3 text-xs text-[#00e0ff] font-mono border border-[#1a1a1a] px-3 py-1 rounded bg-[#0f0f0f]/50"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Cpu className="h-3 w-3" />
                <span>CORE ONLINE</span>
                <Activity className="h-3 w-3" />
                <span>212ms</span>
                <Gauge className="h-3 w-3" />
                <span>132 TK</span>
              </motion.div>
            )}
            
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (isMobile && !showHistory) setShowSettings(false);
              }}
              className={`p-2 rounded border border-[#1a1a1a] bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all duration-200 text-[#c0e5ff] hover:text-[#00e0ff] hover:shadow-lg hover:shadow-blue-500/20 ${showHistory ? 'bg-[#1a1a1a] text-[#00e0ff]' : ''}`}
              title="Command History"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                if (isMobile && !showSettings) setShowHistory(false);
              }}
              className={`p-2 rounded border border-[#1a1a1a] bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all duration-200 text-[#c0e5ff] hover:text-[#00e0ff] hover:shadow-lg hover:shadow-blue-500/20 ${showSettings ? 'bg-[#1a1a1a] text-[#00e0ff]' : ''}`}
              title="Neural Parameters"
            >
              <Settings className="h-4 w-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] relative">
        {/* History Panel - Mobile: overlay, Desktop: sidebar */}
        {showHistory && (
          <motion.div
            initial={{ x: isMobile ? 0 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? 0 : -300, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`${
              isMobile 
                ? 'fixed inset-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md' 
                : 'w-80 border-r border-[#1a1a1a] bg-[#0f0f0f]/50 backdrop-blur-md relative'
            }`}
          >
            {isMobile && (
              <button
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 p-2 text-[#c0e5ff] hover:text-[#00e0ff] z-50"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <HistoryPanel
              history={chatHistory}
              onSelect={handleHistorySelect}
              onClear={clearHistory}
            />
          </motion.div>
        )}

        {/* Main Command Interface */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <div className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 relative z-10 overflow-auto">
            {/* Prompt Command Center */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </motion.div>

            {/* Neural Output Terminal */}
            {(currentResponse || isGenerating) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <OutputBox
                  content={currentResponse}
                  isGenerating={isGenerating}
                  inferenceTime={chatHistory[0]?.inferenceTime}
                  tokensUsed={chatHistory[0]?.tokensUsed}
                />
              </motion.div>
            )}

            {/* Standby Interface */}
            {!currentResponse && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center py-8 sm:py-12 relative"
              >
                <motion.div
                  className="relative inline-block mb-4 sm:mb-6"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity }
                  }}
                >
                  <Zap className="h-12 w-12 sm:h-16 sm:w-16 text-[#00e0ff]" />
                  <motion.div
                    className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 text-[#00e0ff] opacity-50"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="h-12 w-12 sm:h-16 sm:w-16" />
                  </motion.div>
                </motion.div>
                <h2 className="text-lg sm:text-2xl font-bold mb-2 text-[#c0e5ff] font-mono tracking-wider">
                  NEURAL INTERFACE READY
                </h2>
                <p className="text-[#c9c9c9] max-w-md mx-auto font-mono text-xs sm:text-sm px-4">
                  [ TACTICAL LANGUAGE MODEL ARMED & OPERATIONAL ]<br />
                  Enter command parameters to initiate neural pathway activation.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Settings Command Panel - Mobile: overlay, Desktop: sidebar */}
        {showSettings && (
          <motion.div
            initial={{ x: isMobile ? 0 : 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? 0 : 300, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`${
              isMobile 
                ? 'fixed inset-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md' 
                : 'w-80 border-l border-[#1a1a1a] bg-[#0f0f0f]/50 backdrop-blur-md relative'
            }`}
          >
            {isMobile && (
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 p-2 text-[#c0e5ff] hover:text-[#00e0ff] z-50"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <SettingsPanel
              config={config}
              onConfigChange={setConfig}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;

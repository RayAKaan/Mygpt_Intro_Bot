
import { useState, useEffect } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { OutputBox } from '@/components/OutputBox';
import { SettingsPanel } from '@/components/SettingsPanel';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sidebar, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { Settings, History, Brain, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('minigpt-history');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

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
  };

  const clearHistory = () => {
    localStorage.removeItem('minigpt-history');
    setChatHistory([]);
    toast({
      title: "History cleared",
      description: "All chat history has been removed.",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="lg:hidden" />
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Brain className="h-8 w-8 text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MiniGPT-MLOps
                  </h1>
                  <p className="text-xs text-slate-400">Transformer Text Generation</p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Toggle History"
              >
                <History className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Toggle Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* History Sidebar */}
          {showHistory && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 border-r border-slate-700 bg-slate-900/50 backdrop-blur-sm"
            >
              <HistoryPanel
                history={chatHistory}
                onSelect={handleHistorySelect}
                onClear={clearHistory}
              />
            </motion.div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 space-y-6">
              {/* Prompt Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <PromptInput
                  value={prompt}
                  onChange={setPrompt}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              </motion.div>

              {/* Output Box */}
              {(currentResponse || isGenerating) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <OutputBox
                    content={currentResponse}
                    isGenerating={isGenerating}
                    inferenceTime={chatHistory[0]?.inferenceTime}
                    tokensUsed={chatHistory[0]?.tokensUsed}
                  />
                </motion.div>
              )}

              {/* Welcome Message */}
              {!currentResponse && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-center py-12"
                >
                  <Zap className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Welcome to MiniGPT-MLOps</h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Your transformer-based text generation system. Enter a prompt above to start generating text with complete transparency and control.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Settings Sidebar */}
          {showSettings && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 border-l border-slate-700 bg-slate-900/50 backdrop-blur-sm"
            >
              <SettingsPanel
                config={config}
                onConfigChange={setConfig}
              />
            </motion.div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

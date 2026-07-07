import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  User, 
  Bot, 
  Clock, 
  FileSpreadsheet, 
  RefreshCw,
  Zap,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  Percent
} from 'lucide-react';
import Markdown from 'react-markdown';
import { sendCopilotMessage } from '../lib/api';
import { ChatMessage } from '../types';

export default function Copilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `### 🤖 Namaste! I am your autonomous VyaparaMitra Copilot.

I have full operational access to your **inventory ledger, customer lists, and daily sales streams**. 

How can I help you optimize your business today? You can write any custom query or tap one of the **Smart Actions** on the side to get instant strategic analysis!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts specifically requested by the user
  const QUICK_PROMPTS = [
    { text: "Show today's sales", icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50' },
    { text: "Which products should I reorder?", icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
    { text: "Generate invoice for Rajesh", icon: FileSpreadsheet, color: 'text-blue-500 bg-blue-50' },
    { text: "Who are my inactive customers?", icon: AlertCircle, color: 'text-rose-500 bg-rose-50' },
    { text: "How much profit did I make this week?", icon: Zap, color: 'text-purple-500 bg-purple-50' },
    { text: "Generate GST report", icon: FileSpreadsheet, color: 'text-indigo-500 bg-indigo-50' },
    { text: "Generate weekly report", icon: FileSpreadsheet, color: 'text-teal-500 bg-teal-50' },
    { text: "How can I increase sales?", icon: Percent, color: 'text-pink-500 bg-pink-50' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history format for API (only send last 8 messages to keep token sizes optimized)
      const formattedHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-8)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const reply = await sendCopilotMessage(textToSend, formattedHistory);

      const modelMessage: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: 'model',
        content: '⚠️ Oops! I ran into an error communicating with the backend brain. Please make sure your server is online or check your connection.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear chat session memory?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: `### 🤖 System Re-booted.

All context remains active. What shop metric, tax report, or logistics reorder planning would you like to run next?`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[75vh]"
    >
      {/* Quick Prompts Panel */}
      <div className="lg:col-span-1 space-y-4 flex flex-col justify-start">
        <div className="glass-card rounded-2xl p-4 space-y-3 shrink-0">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h3 className="font-semibold text-sm text-slate-800">Smart Voice Actions</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click any prompt below. It automatically retrieves database logs and prompts Gemini to compose a response.
          </p>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[55vh] pr-1">
          {QUICK_PROMPTS.map((prompt) => {
            const IconComponent = prompt.icon;
            return (
              <button
                key={prompt.text}
                onClick={() => handleSend(prompt.text)}
                disabled={loading}
                className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50/60 border border-slate-100 rounded-xl text-left text-xs font-medium text-slate-700 transition shadow-sm hover:shadow-md hover:border-blue-200/50 disabled:opacity-50"
              >
                <div className={`p-2 rounded-lg ${prompt.color} shrink-0`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="truncate">{prompt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Workstation */}
      <div className="lg:col-span-3 glass-card rounded-2xl flex flex-col h-[75vh] relative overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                VyaparaMitra AI Copilot
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Gemini 3.5</span>
              </h3>
              <p className="text-[10px] text-slate-400">Autonomous Shop Assistant • Standing by</p>
            </div>
          </div>

          <button 
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition rounded-lg text-xs flex items-center gap-1.5"
            title="Reset Chat Sessions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Context</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200/60 shadow-sm'
              }`}>
                {msg.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
              </div>

              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="markdown-body space-y-2">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-1 text-[9px] text-slate-400 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <Clock className="w-2.5 h-2.5" />
                  <span>{new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="p-2.5 bg-white text-blue-600 border border-slate-100 rounded-xl shrink-0 shadow-sm h-9 w-9 flex items-center justify-center animate-pulse">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 py-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Footer */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
          className="p-4 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask anything (e.g. 'How much profit did I make this week?', 'Generate GST report')..."
            className="flex-1 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-300 rounded-xl transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  MessageSquare, 
  ArrowUpRight, 
  Sparkles, 
  ChevronUp, 
  CornerDownRight, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from './NotificationManager';
import { fetchStats, fetchMetadata } from '../lib/api';

interface VoiceAssistantProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onInvoicePreset?: (presetData: { customerName: string; customerPhone?: string }) => void;
  onTriggerReport?: () => void;
}

interface SpeechTurn {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  intentDetected?: string;
}

export default function VoiceAssistant({ 
  currentTab, 
  onNavigate, 
  onInvoicePreset,
  onTriggerReport 
}: VoiceAssistantProps) {
  const { triggerNotification } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muteTts, setMuteTts] = useState(false);
  const [history, setHistory] = useState<SpeechTurn[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: "Hello Sampath! I am VyaparaMitra AI, your voice-activated operating system. Say 'Hey VyaparaMitra' or click below and speak to command your business.",
      timestamp: new Date()
    }
  ]);

  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    fetchMetadata().then(meta => {
      setMetadata(meta);
      // Personalize initial message
      if (meta && meta.ownerName) {
        setHistory([
          {
            id: 'init',
            sender: 'assistant',
            text: `Hello ${meta.ownerName}! I am VyaparaMitra AI, your voice-activated copilot. Say "Hey VyaparaMitra" or speak directly to query status or navigate!`,
            timestamp: new Date()
          }
        ]);
      }
    }).catch(console.error);
  }, []);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, transcript]);

  // Keep handleVoiceCommand fresh using a ref to prevent stale closures in speech recognition
  const handleVoiceCommandRef = useRef<((command: string) => Promise<void>) | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let rec: any = null;

    if (SpeechRecognition) {
      rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN'; // Indian-English standard language locale

      rec.onstart = () => {
        setIsListening(true);
        triggerNotification('info', 'Microphone Active', "Speak now! Say 'take me to inventory' or 'what is low stock?'");
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setTranscript(interim);
        }

        if (final) {
          setTranscript('');
          handleVoiceCommandRef.current?.(final.trim());
        }
      };

      rec.onerror = (err: any) => {
        const errorType = err && err.error ? err.error : 'unknown';
        console.warn('Speech Recognition notice:', errorType);
        setIsListening(false);
        
        if (errorType === 'not-allowed') {
          triggerNotification('error', 'Microphone Access Required', 'Please allow microphone access in your browser to use voice commands.');
        } else if (errorType === 'network') {
          triggerNotification('warning', 'Network Issue', 'Speech recognition requires internet connectivity.');
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (rec) {
        try {
          rec.onstart = null;
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          rec.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Cancel active speaking to avoid self-listening loop
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      
      try {
        setTranscript('');
        recognitionRef.current?.start();
        setIsOpen(true);
      } catch (e) {
        console.warn('Speech recognition start issue:', e);
      }
    }
  };

  // TTS Engine Helper
  const speakText = (text: string) => {
    if (muteTts || !window.speechSynthesis) return;
    
    // Stop ongoing speaks
    window.speechSynthesis.cancel();

    // Clean markdown characters from synthesis text
    const cleanText = text
      .replace(/[\*#_`\-]/g, ' ')
      .replace(/Suggested Next Action:.*/is, '') // Avoid reading out huge action steps
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; // Slightly faster for natural tech copilot speed
    
    // Attempt Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes('EN-IN') || v.lang.includes('en-IN'));
    if (indVoice) {
      utterance.voice = indVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Voice Command Processing
  const handleVoiceCommand = async (command: string) => {
    if (!command) return;

    // Add user turn to chat history
    const userTurn: SpeechTurn = {
      id: Math.random().toString(),
      sender: 'user',
      text: command,
      timestamp: new Date()
    };
    setHistory(prev => [...prev, userTurn]);

    const query = command.toLowerCase();
    let reply = '';
    let intent = 'General Inquiry';

    try {
      // Navigation Intent detection
      if (query.includes('inventory') || query.includes('stock') || query.includes('products')) {
        if (query.includes('low')) {
          intent = 'Query Low Stock';
          const statsRes = await fetchStats();
          const items = statsRes.lowStockProducts || [];
          if (items.length > 0) {
            reply = `**Summary**: You currently have ${items.length} products with critical low stock status.\n\n**Analysis**: These products are below safety thresholds and are at risk of run-outs.\n\n**Business Insight**: Stockouts of popular items like ${items[0].name} can lead to up to an 18% loss in daily client loyalty.\n\n**Recommendation**: Order replenishments immediately.\n\n**Suggested Next Action**: Let's view the inventory to approve purchase orders.`;
            onNavigate('inventory');
          } else {
            reply = `**Summary**: Your inventory levels are perfectly balanced. No items are low stock.\n\n**Analysis**: Stock turnover remains highly optimal.\n\n**Business Insight**: Excellent capital flow efficiency. Over-stocking costs are reduced by 12%.\n\n**Recommendation**: Keep monitoring regular sales velocity.\n\n**Suggested Next Action**: Take a look at the Revenue trends.`;
          }
        } else {
          intent = 'Navigation (Inventory)';
          reply = "Affirmative. Navigating to your Inventory Management suite.";
          onNavigate('inventory');
        }
      } 
      else if (query.includes('invoice') || query.includes('bill') || query.includes('gst')) {
        intent = 'Create Invoice';
        reply = "Initiating the GST-compliant Tax Invoice workflow. Ready for billing inputs.";
        onNavigate('invoices');
        
        // Check for specific customers
        if (query.includes('rajesh')) {
          onInvoicePreset?.({ customerName: 'Rajesh Kumar', customerPhone: '+91 98765 43210' });
          reply = "I've loaded Rajesh Kumar's billing ledger into the invoice composer. Ready to add products!";
        } else if (query.includes('priya')) {
          onInvoicePreset?.({ customerName: 'Priya Patel', customerPhone: '+91 98123 45678' });
          reply = "I've pre-filled the invoice for Priya Patel. You can now choose products from the inventory catalog.";
        }
      } 
      else if (query.includes('sales') || query.includes('revenue') || query.includes('ledger') || query.includes('transaction')) {
        intent = 'Navigation (Sales Ledger)';
        const statsRes = await fetchStats();
        reply = `**Summary**: Loaded the Sales history. Today's dynamic revenue stands at ₹${statsRes.stats.todayRevenue}.\n\n**Analysis**: Sales are tracking 8% higher than yesterday's average.\n\n**Business Insight**: UPI transactions continue to account for 65% of customer settlements.\n\n**Recommendation**: Incentivize digital cash collection to minimize cash handling discrepancies.\n\n**Suggested Next Action**: View the sales ledger logs below.`;
        onNavigate('sales');
      } 
      else if (query.includes('report') || query.includes('summary') || query.includes('generate')) {
        intent = 'Generate Report';
        reply = "Executing real-time Business Diagnostic Report generation. This compiles sales metrics and low stock audits.";
        onNavigate('reports');
        if (onTriggerReport) {
          setTimeout(() => onTriggerReport(), 800);
        }
      } 
      else if (query.includes('customer') || query.includes('client')) {
        intent = 'Navigation (Customers)';
        reply = "Displaying your customer directory. Active loyalty metrics are shown.";
        onNavigate('customers');
      } 
      else if (query.includes('analytics') || query.includes('chart') || query.includes('trend')) {
        intent = 'Navigation (Analytics)';
        reply = "Opening Advanced Analytics dashboard. Generating trend comparisons.";
        onNavigate('analytics');
      }
      else if (query.includes('copilot') || query.includes('chat') || query.includes('ai')) {
        intent = 'Navigation (AI Copilot)';
        reply = "Opening the conversational Copilot engine. Let's discuss strategy!";
        onNavigate('copilot');
      }
      else if (query.includes('health') || query.includes('score')) {
        intent = 'Query Business Health';
        reply = `**Summary**: Your overall Business Health Score is excellent at **84/100**.\n\n**Analysis**: This is powered by exceptional customer retention rate (82%) and steady daily cash receipts.\n\n**Business Insight**: Inventory optimization has saved you 14% of overhead space this month.\n\n**Recommendation**: Boost the health further by restocking low-threshold commodities.\n\n**Suggested Next Action**: Check out the low stock items on the inventory page.`;
      }
      else {
        // Fallback natural AI responses following the strict 5-part format!
        reply = `**Summary**: Received the command: "${command}". I am here to assist as your smart Business Pilot.\n\n**Analysis**: Command doesn't match direct navigation macros, but implies a strategic interest.\n\n**Business Insight**: Digital voice commands increase business catalog speed by up to 40% compared to legacy ERP entry panels.\n\n**Recommendation**: Try voice commands like "Take me to inventory", "What are my low stock products?", or "Create an invoice for Rajesh".\n\n**Suggested Next Action**: Speak one of these commands or tap the shortcut buttons below!`;
      }
    } catch (e) {
      console.error(e);
      reply = "I'm having a slight difficulty processing the database metrics. Let's try again in a moment!";
    }

    const aiTurn: SpeechTurn = {
      id: Math.random().toString(),
      sender: 'assistant',
      text: reply,
      timestamp: new Date(),
      intentDetected: intent
    };

    setHistory(prev => [...prev, aiTurn]);
    speakText(reply);
  };

  useEffect(() => {
    handleVoiceCommandRef.current = handleVoiceCommand;
  }, [handleVoiceCommand]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value;
      if (val.trim()) {
        handleVoiceCommand(val.trim());
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  return (
    <>
      {/* Draggable/Fixed Floating Microphone Button */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
        <motion.button
          onClick={toggleListening}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={`relative p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all ${
            isListening 
              ? 'bg-red-600 text-white ring-4 ring-red-500/30' 
              : isSpeaking 
              ? 'bg-amber-500 text-white ring-4 ring-amber-500/30'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
          }`}
          id="floating-voice-mic"
          title="Hey VyaparaMitra - Click to talk"
        >
          {/* Waveform Pulses while active */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
              <span className="absolute -inset-2 rounded-full border-2 border-red-500/20 animate-pulse" />
            </>
          )}
          {isSpeaking && (
            <>
              <span className="absolute inset-0 rounded-full bg-amber-500/40 animate-ping" />
            </>
          )}

          {isListening ? (
            <Mic className="w-6 h-6 animate-pulse" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </motion.button>

        {/* Quick Activation Toast / Subtitle */}
        <AnimatePresence>
          {(isListening || isSpeaking) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => setIsOpen(true)}
              className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-4 py-2.5 rounded-2xl shadow-lg border border-white/10 flex items-center gap-2 cursor-pointer max-w-xs"
            >
              <div className="flex gap-0.5 items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="truncate">
                {isListening ? (transcript || 'Listening for commands...') : 'Speaking recommendations...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Toggle Button for Chat History Logs Panel */}
      <div className="fixed bottom-6 right-22 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          className={`p-3.5 rounded-full shadow-lg border cursor-pointer flex items-center justify-center transition-all ${
            isOpen 
              ? 'bg-slate-800 border-slate-700 text-white' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="Voice Log Console"
        >
          <MessageSquare className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Slide-out Voice Console Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-24 left-6 right-6 md:left-auto md:right-6 md:w-96 z-40 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl flex flex-col max-h-[500px] overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 leading-tight">VyaparaMitra Assistant</h3>
                  <span className="text-[9px] text-slate-400 font-medium">Hey VyaparaMitra Voice Terminal</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMuteTts(!muteTts)}
                  className={`p-1.5 rounded-lg transition ${muteTts ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:bg-slate-100'}`}
                  title={muteTts ? "Unmute Voice" : "Mute Voice"}
                >
                  {muteTts ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[320px]">
              {history.map((turn) => (
                <div 
                  key={turn.id} 
                  className={`flex flex-col ${turn.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Badge */}
                  <span className="text-[9px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    {turn.sender === 'user' ? 'You' : 'VyaparaMitra AI'}
                    {turn.intentDetected && (
                      <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-bold">
                        {turn.intentDetected}
                      </span>
                    )}
                  </span>

                  {/* Message Bubble */}
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed font-medium ${
                    turn.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none space-y-2'
                  }`}>
                    {/* Render standard structured text nicely */}
                    {turn.text.includes('**Summary**') ? (
                      <div className="space-y-2">
                        {turn.text.split('\n\n').map((para, pIdx) => {
                          const match = para.match(/^\*\*(.*?)\*\*:\s*(.*)/s);
                          if (match) {
                            return (
                              <div key={pIdx}>
                                <strong className="text-slate-900 block font-bold text-[10px] uppercase tracking-wider text-blue-600 mb-0.5">{match[1]}</strong>
                                <p className="text-slate-600">{match[2]}</p>
                              </div>
                            );
                          }
                          return <p key={pIdx}>{para}</p>;
                        })}
                      </div>
                    ) : (
                      <p>{turn.text}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Interim voice transcript */}
              {isListening && transcript && (
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-slate-400 font-bold mb-1 animate-pulse">Transcribing...</span>
                  <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl rounded-tr-none text-xs italic font-medium">
                    {transcript}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Terminal Input Box */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <input 
                type="text" 
                placeholder="Type command or speak..." 
                onKeyDown={handleKeyPress}
                className="flex-1 bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs outline-none transition font-medium"
              />
              <button 
                onClick={toggleListening}
                className={`p-2 rounded-xl transition ${isListening ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Shortcuts inside Drawer */}
            <div className="px-4 pb-4 pt-1 bg-slate-50/50 flex flex-wrap gap-1.5">
              <button 
                onClick={() => handleVoiceCommand("What are my low stock products?")}
                className="text-[9px] bg-white border border-slate-150 hover:bg-slate-50 text-slate-600 font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
              >
                <CornerDownRight className="w-2.5 h-2.5 text-blue-500" />
                Check Low Stock
              </button>
              <button 
                onClick={() => handleVoiceCommand("Generate a weekly report")}
                className="text-[9px] bg-white border border-slate-150 hover:bg-slate-50 text-slate-600 font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
              >
                <CornerDownRight className="w-2.5 h-2.5 text-emerald-500" />
                Generate Weekly Report
              </button>
              <button 
                onClick={() => handleVoiceCommand("Take me to sales ledger")}
                className="text-[9px] bg-white border border-slate-150 hover:bg-slate-50 text-slate-600 font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition"
              >
                <CornerDownRight className="w-2.5 h-2.5 text-purple-500" />
                Open Sales Log
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

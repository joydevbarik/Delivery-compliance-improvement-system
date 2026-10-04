import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare, X, Send, Loader2, Bot, User,
  Sparkles, ChevronDown, RotateCcw, Copy, Check,
  Zap, Package, BarChart3, Factory
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─── Suggested Quick Questions ───
const QUICK_QUESTIONS = [
  { icon: Package, text: 'What is the current inventory stock?' },
  { icon: BarChart3, text: 'What is the overall compliance rate?' },
  { icon: Factory, text: 'Tell me about Jamshedpur plant' },
  { icon: Zap, text: 'Which orders have shortages?' },
];

// ─── Markdown-like simple renderer ───
const renderMessage = (text, isDarkTheme) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Render bold text
    const boldRendered = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
      j % 2 === 1 
        ? <strong key={j} className={`font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{part}</strong> 
        : part
    );

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <li key={i} className={`ml-4 list-disc leading-relaxed ${isDarkTheme ? 'text-slate-200' : 'text-slate-800 font-medium'}`}>
          {boldRendered}
        </li>
      );
    }
    if (line.trim().startsWith('## ')) {
      return (
        <p key={i} className="font-bold text-blue-600 dark:text-blue-400 mt-2 text-sm">
          {line.replace('## ', '')}
        </p>
      );
    }
    if (line.trim().startsWith('# ')) {
      return (
        <p key={i} className={`font-bold mt-2 text-base ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
          {line.replace('# ', '')}
        </p>
      );
    }
    if (line.trim() === '') {
      return <br key={i} />;
    }
    return (
      <p key={i} className={`leading-relaxed ${isDarkTheme ? 'text-slate-200' : 'text-slate-700'}`}>
        {boldRendered}
      </p>
    );
  });
};

// ─── Single Message Bubble ───
const MessageBubble = ({ msg, isDarkTheme }) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const copyText = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
        isUser
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-500/30 shadow-md'
          : 'bg-gradient-to-br from-teal-650 to-cyan-650 border border-teal-500/30 shadow-md'
      }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-white" />
          : <Bot className="w-3.5 h-3.5 text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`relative max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className={`px-3 py-2 rounded-xl text-[11px] leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-sm'
            : isDarkTheme
              ? 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-sm backdrop-blur-sm'
              : 'bg-slate-100 border border-slate-200/80 text-slate-800 rounded-tl-sm'
        }`}>
          {isUser
            ? <p className="leading-relaxed font-medium">{msg.content}</p>
            : <div className="space-y-0.5">{renderMessage(msg.content, isDarkTheme)}</div>
          }
        </div>

        {/* Copy button for AI messages */}
        {!isUser && (
          <button
            onClick={copyText}
            className={`opacity-0 group-hover:opacity-100 transition-opacity self-start flex items-center gap-1 text-[9px] px-1 mt-0.5 ${
              isDarkTheme ? 'text-slate-500 hover:text-slate-350' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {copied ? <Check className="w-2 h-2 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}

        <span className={`text-[8.5px] px-1 ${
          isDarkTheme ? 'text-slate-550' : 'text-slate-500 font-medium'
        } ${isUser ? 'text-right' : 'text-left'}`}>
          {msg.time}
        </span>
      </div>
    </div>
  );
};

// ─── Typing Indicator ───
const TypingIndicator = ({ isDarkTheme }) => (
  <div className="flex items-start gap-2">
    <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-650 to-cyan-650 border border-teal-500/30 shadow-md">
      <Bot className="w-3.5 h-3.5 text-white" />
    </div>
    <div className={`px-3 py-2 rounded-xl rounded-tl-sm shadow-sm backdrop-blur-sm ${
      isDarkTheme 
        ? 'bg-slate-800/90 border border-slate-700/60' 
        : 'bg-slate-100 border border-slate-200/80'
    }`}>
      <div className="flex items-center gap-1">
        <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// ─── Main Chatbot Component ───
const AIChatbot = ({ context = 'landing' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm **ARIA** — your AI assistant for the Tata Steel Delivery Compliance System. 🏭\n\nI can answer questions about:\n- **Inventory** stock levels and products\n- **Compliance** records and order status\n- **Plants** — Jamshedpur, Kalinganagar, Meramandali\n- **System features** and how everything works\n\nWhat would you like to know?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Safely hook into theme context
  let isDarkTheme = true;
  try {
    const themeContext = useTheme();
    if (themeContext) {
      isDarkTheme = themeContext.isDark;
    }
  } catch (e) {
    // If used outside of ThemeProvider, default to dark theme
    isDarkTheme = true;
  }

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollBtn(!isAtBottom);
  };

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    const userMsg = {
      role: 'user',
      content: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now().toString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const historyForApi = messages
      .filter(m => m.id !== 'welcome' && m.id !== 'welcome_new')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, history: historyForApi })
      });

      const data = await res.json();

      const aiMsg = {
        role: 'assistant',
        content: res.ok ? data.reply : (data.error || 'Sorry, something went wrong. Please try again.'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now().toString() + '_ai'
      };

      setMessages(prev => [...prev, aiMsg]);
      if (!isOpen) setHasUnread(true);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Unable to reach the AI server. Please make sure the backend is running on port 5000.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now().toString() + '_err'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! I'm **ARIA**, ready to help again. Ask me anything about the Tata Steel Delivery Compliance System.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: 'welcome_new'
    }]);
  };

  const contextLabel = {
    landing: 'Home',
    inventory: 'Inventory',
    compliance: 'Compliance'
  }[context] || 'Assistant';

  return (
    <>
      {/* ─── Floating Toggle Button ─── */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
        )}

        <button
          onClick={() => { setIsOpen(o => !o); setHasUnread(false); }}
          id="ai-chatbot-toggle"
          className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
            isOpen
              ? isDarkTheme 
                ? 'bg-slate-800 border border-slate-700 text-slate-300' 
                : 'bg-white border border-slate-200 text-slate-700 shadow-slate-200/50'
              : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 border border-blue-500/40 hover:scale-110 shadow-blue-500/30'
          }`}
          title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        >
          {isOpen
            ? <X className="w-4.5 h-4.5" />
            : <MessageSquare className="w-5.5 h-5.5 text-white" />
          }

          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center animate-bounce">
              !
            </span>
          )}
        </button>
      </div>

      {/* ─── Chat Window ─── */}
      <div className={`fixed bottom-20 right-5 z-[9998] w-[325px] max-w-[calc(100vw-2rem)] transition-all duration-300 origin-bottom-right ${
        isOpen
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      }`}>
        <div className={`flex flex-col h-[470px] max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border ${
          isDarkTheme 
            ? 'border-slate-800 text-slate-200 bg-[#0f172a]' 
            : 'border-slate-250 text-slate-800 bg-white'
        }`}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
            style={{ 
              background: isDarkTheme 
                ? 'linear-gradient(90deg, #0f2040 0%, #0d1a35 100%)' 
                : 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)',
              borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(59, 130, 246, 0.12)'
            }}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border ${
                  isDarkTheme 
                    ? 'bg-gradient-to-br from-blue-500/30 to-violet-600/30 border-blue-500/30' 
                    : 'bg-white border-blue-200 shadow-sm'
                }`}>
                  <Sparkles className="w-[15px] h-[15px] text-blue-600 dark:text-blue-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h3 className={`text-xs font-bold tracking-wide ${isDarkTheme ? 'text-white' : 'text-blue-950'}`}>ARIA</h3>
                <p className={`text-[8px] uppercase tracking-wider font-bold ${isDarkTheme ? 'text-slate-500' : 'text-blue-600/80'}`}>
                  Tata Steel AI · {contextLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className={`p-1 rounded-lg transition-all ${
                  isDarkTheme ? 'hover:bg-slate-800 text-slate-500 hover:text-slate-350' : 'hover:bg-blue-100/50 text-blue-600 hover:text-blue-900'
                }`}
                title="Clear chat"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition-all ${
                  isDarkTheme ? 'hover:bg-slate-800 text-slate-550 hover:text-slate-350' : 'hover:bg-blue-100/50 text-blue-600 hover:text-blue-900'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* ── Messages Area ── */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin"
            style={{ 
              scrollbarWidth: 'thin',
              background: isDarkTheme ? 'transparent' : 'rgba(248, 250, 252, 0.6)'
            }}
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isDarkTheme={isDarkTheme} />
            ))}
            {isLoading && <TypingIndicator isDarkTheme={isDarkTheme} />}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-[66px] right-6 w-6 h-6 rounded-full bg-blue-600 border border-blue-500/30 text-white flex items-center justify-center shadow-lg hover:bg-blue-500 transition-all z-10"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          )}

          {/* ── Quick Suggestions (show only when 1 message = welcome) ── */}
          {messages.length <= 1 && (
            <div className="px-2 pb-1.5 grid grid-cols-2 gap-1 shrink-0">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q.text)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-2 py-1.5 border rounded-lg text-[9px] transition-all text-left leading-tight disabled:opacity-50 ${
                    isDarkTheme
                      ? 'bg-slate-800/60 hover:bg-slate-700/80 border-slate-700/60 text-slate-300 hover:text-white'
                      : 'bg-blue-50/50 hover:bg-blue-100/70 border-blue-100/60 text-blue-900 font-medium'
                  }`}
                >
                  <q.icon className="w-2.5 h-2.5 text-blue-550 shrink-0" />
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Input Area ── */}
          <div className={`px-2 pb-2.5 pt-1.5 border-t shrink-0 ${
            isDarkTheme ? 'border-slate-800/60' : 'border-slate-200/80 bg-white'
          }`}>
            <div className={`flex items-end gap-1.5 border rounded-xl px-2.5 py-1.5 transition-all shadow-sm ${
              isDarkTheme
                ? 'bg-slate-800/60 border-slate-700/60 focus-within:border-blue-500/60 text-slate-200'
                : 'bg-slate-50 border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 text-slate-800'
            }`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about compliance..."
                disabled={isLoading}
                rows={1}
                className={`flex-1 bg-transparent text-[11px] placeholder-slate-550 resize-none focus:outline-none leading-relaxed disabled:opacity-50 max-h-16 ${
                  isDarkTheme ? 'text-slate-100' : 'text-slate-900'
                }`}
                style={{ fieldSizing: 'content' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                id="ai-chat-send-btn"
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-500 hover:to-indigo-600 transition-all active:scale-90 shadow-lg shadow-blue-500/20"
              >
                {isLoading
                  ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                  : <Send className="w-3 h-3 text-white" />
                }
              </button>
            </div>
            <p className={`text-[8px] text-center mt-1 font-bold tracking-wider ${
              isDarkTheme ? 'text-slate-600' : 'text-blue-800/60'
            }`}>
              Powered by Google Gemini · Live DB Context
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatbot;

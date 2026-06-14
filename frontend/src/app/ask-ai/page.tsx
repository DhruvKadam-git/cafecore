"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, RefreshCw, AlertCircle, Trash2, ArrowRight } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function AskAiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am **Cafe AI**, your virtual business partner. Ask me anything about your store's sales performance, slow-moving items, best performing employees, or billing stats.",
    },
  ]);
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = "http://localhost:3000";

  const SUGGESTED_PROMPTS = [
    "Why are sales down?",
    "Which products should I remove?",
    "Who is my best employee?",
    "Which tables generate highest revenue?",
  ];

  // Auto-login to obtain JWT token
  useEffect(() => {
    async function autoLogin() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@cafe.com",
            password: "Admin@123",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setToken(data.accessToken);
          console.log("Chatbot auto-login successful.");
        } else {
          setErrorMsg("Failed to authenticate with backend server. Make sure NestJS is running.");
        }
      } catch (err) {
        console.error("Chatbot login error:", err);
        setErrorMsg("Cannot connect to backend server. Make sure NestJS is running on port 3000.");
      }
    }
    autoLogin();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading || !token) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setErrorMsg(null);

    // Extract history matching Pydantic ChatRequest format
    const historyPayload = messages.slice(1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/reports/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply || "I didn't receive a response from the service.",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errJson = await response.json();
        setErrorMsg(errJson.message || "Failed to fetch response from Cafe AI.");
      }
    } catch (err) {
      console.error("Chat connection error:", err);
      setErrorMsg("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat history cleared! What can I help you analyze next?",
      },
    ]);
    setErrorMsg(null);
  };

  // Simple, elegant Markdown to HTML parser
  const renderMessageContent = (content: string) => {
    // Escape HTML first
    let escaped = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace bold formatting: **text** -> <strong>text</strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Split by newlines
    const lines = escaped.split("\n");
    let inList = false;
    const htmlElements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check list bullets: - item or * item
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList) {
          inList = true;
        }
        const itemText = trimmed.substring(2);
        htmlElements.push(
          <li key={`li-${index}`} className="ml-5 list-disc mb-1" dangerouslySetInnerHTML={{ __html: itemText }} />
        );
      } else {
        if (inList) {
          inList = false;
        }

        // Check headers
        if (trimmed.startsWith("### ")) {
          htmlElements.push(
            <h4 key={`h4-${index}`} className="text-[14px] font-bold text-slate-900 mt-3 mb-1.5" dangerouslySetInnerHTML={{ __html: trimmed.substring(4) }} />
          );
        } else if (trimmed.startsWith("## ")) {
          htmlElements.push(
            <h3 key={`h3-${index}`} className="text-[15px] font-bold text-slate-900 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: trimmed.substring(3) }} />
          );
        } else if (trimmed === "") {
          htmlElements.push(<div key={`space-${index}`} className="h-2" />);
        } else {
          htmlElements.push(
            <p key={`p-${index}`} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmed }} />
          );
        }
      }
    });

    return <div className="text-[14px] leading-relaxed break-words">{htmlElements}</div>;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-[1200px] mx-auto font-sans p-4 md:p-6 text-slate-800">
      
      {/* Alert Header */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl mb-4 shadow-sm animate-fade-in">
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-[13px] font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Header Container */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#866443]/15 text-[#866443] rounded-2xl">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-none">Ask Cafe AI</h2>
            <p className="text-[12px] text-slate-400 mt-1">Virtual manager business partner</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 size={14} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Chat Area Container */}
      <div className="flex-1 min-h-0 bg-slate-50/50 border border-slate-100 rounded-3xl p-4 md:p-6 flex flex-col justify-between shadow-xs mb-4">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-4 scrollbar-thin scrollbar-thumb-slate-200">
          {messages.map((msg, index) => {
            const isAI = msg.role === "assistant";
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  isAI ? "self-start" : "self-end flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[15px] select-none ${
                    isAI ? "bg-[#866443] text-white" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {isAI ? <Bot size={18} /> : "👤"}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-3xl shadow-xs ${
                    isAI
                      ? "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                      : "bg-[#C9783A] text-white rounded-tr-none"
                  }`}
                >
                  {isAI ? renderMessageContent(msg.content) : <p className="text-[14px] leading-relaxed break-words">{msg.content}</p>}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-9 h-9 rounded-full bg-[#866443] text-white flex items-center justify-center select-none">
                <Bot size={18} />
              </div>
              <div className="px-5 py-4 bg-white text-slate-800 border border-slate-100 rounded-3xl rounded-tl-none shadow-xs flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Block (Only shown if we only have initial greetings) */}
        {messages.length === 1 && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 select-none">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="flex items-center justify-between p-3.5 bg-white hover:bg-amber-50/40 border border-slate-200/80 rounded-2xl text-[13px] font-semibold text-slate-700 hover:text-amber-950 text-left transition-all hover:border-amber-200 hover:-translate-y-[1px] hover:shadow-xs group cursor-pointer"
              >
                <span>{prompt}</span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-700 transition-colors shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="flex gap-2.5 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !token}
            placeholder={
              !token
                ? "Connecting to virtual business partner..."
                : "Ask anything (e.g., Which products should I remove?)..."
            }
            className="flex-1 h-[50px] px-5 bg-white border border-slate-200 rounded-[18px] text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100/50"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading || !token}
            className="w-[50px] h-[50px] bg-[#C9783A] text-white hover:bg-[#B7672D] rounded-[18px] flex items-center justify-center transition-all disabled:bg-slate-300 disabled:shadow-none shadow-sm cursor-pointer shrink-0"
          >
            <Send size={18} />
          </button>
        </form>

      </div>

    </div>
  );
}

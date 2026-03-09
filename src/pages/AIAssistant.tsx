import { useState, useRef, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Bot, Send, Sparkles, User, Upload } from "lucide-react";
import { useEDI } from "../contexts/EDIContext";
import { askCopilot, ChatMessage } from "../lib/openaiClient";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Message {
  role: "user" | "ai";
  content: string;
  isLoading?: boolean;
}

const SUGGESTIONS = [
  "What does the CLM segment mean?",
  "Why is this claim rejected?",
  "Explain the NPI Luhn check",
  "What is an 835 remittance?",
  "How do HL loops work in 837?",
  "What does INS01 mean in 834?",
];

function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? "bg-blue-600 text-white" : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[78%] p-4 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? "bg-blue-600 text-white rounded-tr-none shadow shadow-blue-900/20"
          : "bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none"
      }`}>
        {!isUser && <Sparkles className="w-3 h-3 text-purple-400 mb-2" />}
        {msg.isLoading ? (
          <span className="flex gap-1 items-center">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        )}
      </div>
    </div>
  );
}

export function AIAssistant() {
  const { aiAnalysis } = useEDI();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([{
    role: "ai",
    content: aiAnalysis
      ? `Hello! I'm Claimbot. I've analyzed your **${aiAnalysis.fileType}** file. Ask me anything about this file or EDI in general!`
      : "Hello! I'm Claimbot, your HIPAA X12 expert. Upload an EDI file and I can explain its structure, validate it, and answer any questions about healthcare EDI transactions.",
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pre-fill from validation "Explain" button
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setInput(q);
      inputRef.current?.focus();
    }
  }, [searchParams]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    // Add loading bubble
    setMessages((prev) => [...prev, { role: "ai", content: "", isLoading: true }]);

    try {
      // Build chat history for OpenAI (last 10 messages)
      const chatHistory: ChatMessage[] = messages
        .filter((m) => !m.isLoading)
        .slice(-10)
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));
      chatHistory.push({ role: "user", content: text });

      const response = await askCopilot(chatHistory, aiAnalysis, aiAnalysis?.errors || []);

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        { role: "ai", content: response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        {
          role: "ai",
          content: `Failed to get response: ${(err as Error).message}. Please ensure the backend is running and GEMINI_API_KEY is configured correctly.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendSuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <Layout title="AI Assistant" icon={<Bot className="w-5 h-5 text-blue-500" />}>
      <div className="max-w-5xl mx-auto flex flex-col relative" style={{ height: "calc(100vh - 10rem)" }}>
        {/* No file banner */}
        {!aiAnalysis && (
          <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <Upload className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              No EDI file loaded. <button onClick={() => navigate("/upload")} className="font-semibold underline hover:no-underline">Upload a file</button> for file-specific answers.
            </p>
          </div>
        )}

        <div className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-xl relative">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 relative z-10">
            {messages.map((msg, idx) => <ChatBubble key={idx} msg={msg} />)}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hidden md:flex gap-2 overflow-x-auto relative z-10">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendSuggestion(s)}
                className="whitespace-nowrap bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 transition"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 relative z-20 sticky bottom-0">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 p-2 rounded-xl focus-within:border-blue-500 transition shadow-inner"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about EDI segments, validation errors, HIPAA rules..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 px-3 text-sm placeholder:text-slate-400 h-12 md:h-10"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 hover:bg-blue-500 text-white p-3 md:p-2 rounded-lg transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useState, useRef, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Bot, Send, Sparkles, User } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hello! I am your ClaimLens Copilot. I've analyzed your most recent '837 Professional Claim' file which contains 1 Critical Error. How can I help you understand or resolve this today?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      let aiResponse =
        "I have analyzed the segment. The error indicates missing data required by the HIPAA X12 implementation guidelines.";

      if (userMsg.toLowerCase().includes("clm")) {
        aiResponse =
          "The **CLM** (Claim Information) segment is used to specify basic claim-level data. The Error `CLM02 (Total Claim Charge Amount) does not match sum of service line charges` means the total billed amount in Loop 2300 does not equal the arithmetic sum of the `SV102` (Line Item Charge Amount) elements across all 2400 Loops. You need to verify the math on the service lines.";
      } else if (userMsg.toLowerCase().includes("nm1")) {
        aiResponse =
          "The **NM1** segment (Individual or Organizational Name) identifies a party by type of organization, name, and identification number. A common issue is a missing National Provider Identifier (NPI) in NM109 when NM108 is 'XX'.";
      }

      setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);
    }, 1000);
  };

  return (
    <Layout
      title="AI Assistant"
      icon={<Bot className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-300 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden relative">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 text-slate-900 dark:text-slate-100"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-6 h-6" />
                )}
              </div>
              <div
                className={`max-w-[75%] p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-sm dark:shadow-none shadow-blue-900/20"
                    : "bg-slate-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-slate-200 rounded-tl-none shadow-sm dark:shadow-none"
                }`}
              >
                {msg.role === "ai" && (
                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400 mb-2" />
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Actions */}
        <div className="px-6 pb-2 pt-4 border-t border-gray-200 dark:border-gray-300 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900 relative z-10 hidden md:flex gap-3 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setInput("What does the CLM segment mean?")}
            className="whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-4 py-2 rounded-full border border-gray-300 dark:border-slate-700 transition"
          >
            What does the CLM segment mean?
          </button>
          <button
            onClick={() => setInput("Why is this claim rejected?")}
            className="whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-4 py-2 rounded-full border border-gray-300 dark:border-slate-700 transition"
          >
            Why is this claim rejected?
          </button>
          <button
            onClick={() => setInput("Explain NM1 identification rules")}
            className="whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-4 py-2 rounded-full border border-gray-300 dark:border-slate-700 transition"
          >
            Explain NM1 identification rules
          </button>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 relative z-10">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 bg-white dark:bg-slate-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 p-2 rounded-xl focus-within:border-blue-500 transition-colors shadow-inner"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ClaimLens Copilot to explain errors or segment rules..."
              className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 px-3 text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-600 dark:text-slate-500 hover:bg-blue-500 text-white p-2 rounded-lg transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

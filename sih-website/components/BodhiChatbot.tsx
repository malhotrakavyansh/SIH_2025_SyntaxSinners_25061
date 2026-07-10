"use client";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function BodhiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; text: string; sources?: string[] }[]
  >([{ sender: "bot", text: "How can I help you?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const existing = sessionStorage.getItem("bodhi_session_id");
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem("bodhi_session_id", id);
    return id;
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, session_id: sessionId })
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { sender: "bot", text: data.reply, sources: data.sources }]);
    } catch {
      setMessages((msgs) => [...msgs, { sender: "bot", text: "Sorry, I couldn't connect to Bodhi right now." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Chatbot Icon */}
      <button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[#e6e0cc] hover:scale-105 transition-transform bg-transparent"
        aria-label="Open Bodhi chatbot"
        onClick={() => setOpen(true)}
      >
        <img src="/bodhi.png" alt="Bodhi chatbot icon" className="w-14 h-14 rounded-full object-cover" />
      </button>
      {/* Chatbot Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#e6e0cc]">
          {/* Close button */}
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#004d4d] text-[#e6e0cc] flex items-center justify-center text-2xl leading-none font-bold hover:bg-[#1a1a1a]"
            aria-label="Close chatbot"
            onClick={() => setOpen(false)}
          ><span className="-translate-y-px">×</span></button>
          {/* Chatbot Header */}
          <div className="flex flex-col items-center justify-center pt-10 pb-4">
            <img src="/bodhi.png" alt="Bodhi chatbot icon" className="w-28 h-40 object-contain" />
            <h2 className="text-2xl font-bold text-[#004d4d] mt-2">Hello, I&apos;m Bodhi</h2>
          </div>
          {/* Chat area */}
          <div className="flex-1 w-full max-w-2xl mx-auto px-6 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={
                    msg.sender === "bot"
                      ? "bg-[#004d4d] text-[#e6e0cc] px-4 py-2 rounded-2xl max-w-[80%]"
                      : "bg-[#e6e0cc] text-[#1a1a1a] px-4 py-2 rounded-2xl border border-[#004d4d] max-w-[80%]"
                  }
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({ ...props }) => <ul className="list-disc list-inside mb-2 last:mb-0 space-y-1" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal list-inside mb-2 last:mb-0 space-y-1" {...props} />,
                        strong: ({ ...props }) => <strong className="font-bold" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                  {msg.sender === "bot" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#e6e0cc]/30 text-xs opacity-80">
                      Sources: {msg.sources.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-2 flex self-start">
                <div className="bg-[#004d4d] text-[#e6e0cc] px-4 py-2 rounded-2xl max-w-[80%]">Bodhi is typing...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {/* Input area */}
          <form
            className="w-full max-w-2xl mx-auto px-6 py-6 flex gap-2"
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
          >
            <input
              type="text"
              className="w-full rounded-2xl border border-[#004d4d] px-4 py-2 text-[#1a1a1a] bg-[#e6e0cc]"
              placeholder="Message"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#004d4d] text-[#e6e0cc] px-4 py-2 rounded-2xl font-bold"
              disabled={loading || !input.trim()}
            >Send</button>
          </form>
        </div>
      )}
    </>
  );
}

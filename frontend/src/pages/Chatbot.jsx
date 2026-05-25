import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw, Globe } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const QUICK_QUESTIONS = {
  en: ["How to treat tomato blight?", "Best fertilizer for rice?", "PM-KISAN scheme details", "Monsoon crop planning"],
  hi: ["टमाटर के रोग का उपचार?", "धान के लिए सबसे अच्छा खाद?", "पीएम-किसान योजना", "मानसून में कौन सी फसल?"],
  mr: ["टोमॅटो रोगावर उपाय?", "भाताला कोणते खत?", "PM-KISAN योजना", "पावसाळ्यात कोणते पीक?"],
  ta: ["தக்காளி நோய் சிகிச்சை?", "நெல்லுக்கு சிறந்த உரம்?", "PM-KISAN திட்டம்", "மழை பருவ பயிர்கள்?"],
};

const SESSION_ID = `session_${Date.now()}`;

function renderMessage(content) {
  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const lines = content
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    const sentences = lines[0]?.split(/(?=\s*\d+\.\s+\*\*)/g).map(s => s.trim()).filter(Boolean) || [];
    if (sentences.length > 1) {
      return (
        <div className="space-y-2">
          {sentences.map((sentence, index) => (
            <p key={index}>{renderInline(sentence.replace(/^\d+\.\s*/, ""))}</p>
          ))}
        </div>
      );
    }
  }

  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <p key={index}>{renderInline(line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""))}</p>
      ))}
    </div>
  );
}

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    { role: "assistant", content: t("chatbot.welcome"), time: new Date() }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang]       = useState(i18n.language || "en");
  const endRef                = useRef(null);

  useEffect(() => { setLang(i18n.language); }, [i18n.language]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text = input) => {
    const msg = text.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg, time: new Date() }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/chatbot/chat`, {
        message: msg, session_id: SESSION_ID, language: lang,
      });
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, time: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: t("chatbot.connectError"),
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quick = QUICK_QUESTIONS[lang] || QUICK_QUESTIONS.en;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-gray-800">AgriBot 🤖</h1>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> {t("chatbot.online")}
          </p>
        </div>
        {/* Language */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <select
            value={lang}
            onChange={e => { setLang(e.target.value); i18n.changeLanguage(e.target.value); }}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="bn">বাংলা</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </div>
      </div>

      {/* Quick questions */}
      <div className="flex gap-2 flex-wrap mb-3">
        {quick.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            className="px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-full text-xs font-medium hover:bg-green-50 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-card p-4 space-y-3">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${m.role === "user" ? "bg-secondary" : "bg-primary"}`}>
                {m.role === "user"
                  ? <User className="w-4 h-4 text-white" />
                  : <Bot className="w-4 h-4 text-white" />
                }
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${m.role === "user"
                  ? "bg-primary text-white rounded-tr-sm"
                  : "bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100"
                }`}
              >
                {m.role === "assistant" ? renderMessage(m.content) : m.content}
                <p className={`text-xs mt-1 ${m.role === "user" ? "text-white/60 text-right" : "text-gray-400"}`}>
                  {m.time?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
          placeholder={t("chatbot.placeholder")}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

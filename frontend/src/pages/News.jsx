import { useState, useEffect } from "react";
import axios from "axios";
import { Newspaper, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CATS = ["general", "weather", "market", "schemes", "disease"];
const CAT_COLORS = { general: "bg-blue-100 text-blue-700", weather: "bg-sky-100 text-sky-700", market: "bg-yellow-100 text-yellow-700", schemes: "bg-green-100 text-green-700", disease: "bg-red-100 text-red-700" };

export default function News() {
  const { t } = useTranslation();
  const [cat, setCat] = useState("general");
  const [articles, setArts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/news/?category=${cat}`)
      .then(r => setArts(r.data.articles || []))
      .finally(() => setLoading(false));
  }, [cat]);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">{t("news.title")}</h1>
        <p className="text-gray-500 mt-1">{t("news.subtitle")}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${cat === c ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-green-50"}`}>{c}</button>
        ))}
      </div>
      {loading ? <div className="text-center py-12 text-gray-400">{t("news.loading")}</div> : (
        <div className="space-y-3">
          {articles.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-4 flex gap-4 items-start hover:shadow-hover transition">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Newspaper className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm leading-snug">{a.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${CAT_COLORS[a.category] || CAT_COLORS.general}`}>{a.category}</span>
                  <span className="text-xs text-gray-400">{a.source}</span>
                  {a.published_at && <span className="text-xs text-gray-400">{new Date(a.published_at).toLocaleDateString()}</span>}
                </div>
              </div>
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary flex-shrink-0">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

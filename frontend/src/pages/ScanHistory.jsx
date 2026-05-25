import { useState, useEffect } from "react";
import axios from "axios";
import { History, Leaf, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ScanHistory() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/disease/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setScans(r.data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-center py-16 text-gray-400">{t("history.loading")}</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">{t("history.title")}</h1>
        <p className="text-gray-500 mt-1">{t("history.recorded", { count: scans.length })}</p>
      </div>

      {scans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center text-gray-300">
          <History className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t("history.emptyTitle")}</p>
          <p className="text-sm mt-1">{t("history.emptySub")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-card p-4 flex gap-4 items-start hover:shadow-hover transition">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-green-50 flex-shrink-0">
                <img src={`${API.replace("/api", "")}/${s.image_path}`} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
                <Leaf className="w-6 h-6 text-primary m-auto mt-4 hidden" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-800 text-sm leading-snug">
                    {s.disease_name ? s.disease_name.replace(/___/g, " -> ").replace(/_/g, " ") : s.plant_type || t("history.unknown")}
                  </h3>
                  {s.confidence && (
                    <span className={`text-xs font-bold flex-shrink-0 ${s.confidence >= 0.8 ? "text-green-600" : s.confidence >= 0.6 ? "text-yellow-600" : "text-red-500"}`}>
                      {(s.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                {s.supplement && <p className="text-xs text-gray-500 mt-0.5">{s.supplement}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(s.scanned_at).toLocaleString()}</p>
              </div>
              {s.disease_name && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

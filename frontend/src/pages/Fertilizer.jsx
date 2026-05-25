import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Leaf, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SOILS = ["Sandy", "Loamy", "Black", "Red", "Clayey", "Silty"];
const CROPS = ["Rice", "Wheat", "Maize", "Soybean", "Sugarcane", "Cotton", "Groundnut", "Tomato", "Potato", "Onion", "Chickpea", "Mustard"];

export function Fertilizer() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ nitrogen: "", phosphorus: "", potassium: "", soil_type: "Loamy", crop_type: "Wheat", temperature: "25", humidity: "60", moisture: "40" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/fertilizer/recommend`, {
        ...form,
        nitrogen: +form.nitrogen,
        phosphorus: +form.phosphorus,
        potassium: +form.potassium,
        temperature: +form.temperature,
        humidity: +form.humidity,
        moisture: +form.moisture,
      });
      setResult(data);
      toast.success(t("fertilizer.generated"));
    } catch {
      toast.error(t("fertilizer.failed"));
    } finally {
      setLoading(false);
    }
  };

  const inp = (label, key, type = "number", min = 0, max = 200) => (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
      <input
        type={type}
        min={min}
        max={max}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">{t("fertilizer.title")}</h1>
        <p className="text-gray-500 mt-1">{t("fertilizer.subtitle")}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <p className="text-sm font-bold text-gray-600">{t("fertilizer.npk")}</p>
        <div className="grid grid-cols-3 gap-3">
          {inp(t("fertilizer.nitrogen"), "nitrogen")}
          {inp(t("fertilizer.phosphorus"), "phosphorus")}
          {inp(t("fertilizer.potassium"), "potassium")}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("fertilizer.soilType")}</label>
            <select value={form.soil_type} onChange={e => setForm(p => ({ ...p, soil_type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {SOILS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t("fertilizer.cropType")}</label>
            <select value={form.crop_type} onChange={e => setForm(p => ({ ...p, crop_type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <p className="text-sm font-bold text-gray-600">{t("fertilizer.weather")}</p>
        <div className="grid grid-cols-3 gap-3">
          {inp(t("fertilizer.temp"), "temperature", "number", 0, 50)}
          {inp(t("fertilizer.humidity"), "humidity", "number", 0, 100)}
          {inp(t("fertilizer.moisture"), "moisture", "number", 0, 100)}
        </div>

        <button onClick={submit} disabled={loading || !form.nitrogen || !form.phosphorus || !form.potassium} className="w-full py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 hover:bg-primary-dark transition flex items-center justify-center gap-2">
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {loading ? t("fertilizer.analyzing") : t("fertilizer.get")}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">{t("fertilizer.recommended")}</p>
              <h2 className="text-xl font-bold text-gray-800">{result.recommended_fertilizer}</h2>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">{t("fertilizer.advice")}</p>
            <p className="text-sm text-gray-600">{result.crop_specific_advice}</p>
          </div>
          {result.weather_note && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-sm text-amber-700">{result.weather_note}</p></div>}
          <p className="text-sm text-gray-500">{result.application_note}</p>
        </div>
      )}
    </div>
  );
}

export default Fertilizer;

import { useState, useEffect } from "react";
import axios from "axios";
import { CloudSun, Thermometer, Droplets, Wind, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Weather() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = (lat, lon) => {
    setLoading(true);
    axios.get(`${API}/weather/crop-suggestions?lat=${lat}&lon=${lon}`)
      .then(r => { setWeather(r.data.weather); setCrops(r.data.recommended_crops); })
      .catch(() => setError(t("weather.error")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchData(pos.coords.latitude, pos.coords.longitude),
        () => fetchData(19.07, 72.87)
      );
    } else {
      fetchData(19.07, 72.87);
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">{t("weather.title")}</h1>
        <p className="text-gray-500 mt-1">{t("weather.subtitle")}</p>
      </div>

      {loading && <div className="bg-white rounded-2xl p-12 text-center text-gray-400">{t("weather.fetching")}</div>}
      {error && <div className="bg-red-50 rounded-2xl p-4 text-red-600 text-sm">{error}</div>}

      {weather && (
        <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-80 mb-4 flex items-center gap-2">
            <CloudSun className="w-4 h-4" /> {t("weather.current")}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center"><Thermometer className="w-6 h-6 mx-auto mb-1 opacity-80" /><p className="text-3xl font-bold">{weather.temperature}°C</p><p className="text-xs opacity-70">{t("weather.temperature")}</p></div>
            <div className="text-center"><Droplets className="w-6 h-6 mx-auto mb-1 opacity-80" /><p className="text-3xl font-bold">{weather.humidity}%</p><p className="text-xs opacity-70">{t("weather.humidity")}</p></div>
            <div className="text-center"><Wind className="w-6 h-6 mx-auto mb-1 opacity-80" /><p className="text-3xl font-bold">{weather.weekly_rainfall_mm}mm</p><p className="text-xs opacity-70">{t("weather.weeklyRain")}</p></div>
          </div>
        </div>
      )}

      {crops.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-gray-800 mb-4">{t("weather.recommended")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {crops.slice(0, 9).map(c => (
              <div key={c.crop} className={`rounded-xl p-3 border-2 ${c.ideal ? "border-green-400 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                  <Leaf className={`w-4 h-4 ${c.ideal ? "text-green-500" : "text-gray-400"}`} />
                  <span className="font-semibold text-sm text-gray-800">{c.crop}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded ${i <= c.suitability_score ? "bg-green-400" : "bg-gray-200"}`} />)}
                </div>
                {c.ideal && <p className="text-xs text-green-600 font-semibold mt-1">{t("weather.ideal")}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

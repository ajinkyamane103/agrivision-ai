import { useNavigate } from "react-router-dom";
import { Microscope, Leaf, Map, MessageCircle, CloudSun, ShoppingCart, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const FEATURES = [
  { icon: Microscope, label: "home.featureDisease", desc: "home.featureDiseaseDesc", path: "/detect", color: "bg-red-50 text-red-500" },
  { icon: Leaf, label: "home.featureFertilizer", desc: "home.featureFertilizerDesc", path: "/fertilizer", color: "bg-green-50 text-green-500" },
  { icon: Map, label: "home.featureMap", desc: "home.featureMapDesc", path: "/crop-map", color: "bg-blue-50 text-blue-500" },
  { icon: CloudSun, label: "home.featureWeather", desc: "home.featureWeatherDesc", path: "/weather", color: "bg-sky-50 text-sky-500" },
  { icon: MessageCircle, label: "home.featureBot", desc: "home.featureBotDesc", path: "/chatbot", color: "bg-purple-50 text-purple-500" },
  { icon: ShoppingCart, label: "home.featureMarket", desc: "home.featureMarketDesc", path: "/market", color: "bg-yellow-50 text-yellow-500" },
];

const STATS = [
  { value: "39+", label: "home.statsDisease" },
  { value: "20+", label: "home.statsStates" },
  { value: "8+", label: "home.statsLanguages" },
  { value: "24/7", label: "home.statsSupport" },
];

const HIGHLIGHTS = [
  { icon: Shield, title: "home.trustedTitle", desc: "home.trustedDesc" },
  { icon: Globe, title: "home.languageTitle", desc: "home.languageDesc" },
  { icon: Zap, title: "home.realtimeTitle", desc: "home.realtimeDesc" },
];

export default function HomeComponent() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-4 right-24 w-16 h-16 rounded-full bg-white" />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4">
            {t("home.badge")}
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight">{t("home.title")}</h1>
          <p className="text-white/80 mt-3 text-lg">{t("home.subtitle")}</p>
          <div className="flex gap-3 mt-6 flex-wrap">
            <button onClick={() => navigate("/detect")} className="px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-green-50 transition flex items-center gap-2">
              <Microscope className="w-4 h-4" /> {t("home.detect")}
            </button>
            <button onClick={() => navigate("/chatbot")} className="px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> {t("home.talk")}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-5 text-center">
            <p className="text-3xl font-display font-bold text-primary">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{t(s.label)}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-display font-bold text-gray-800 mb-4">{t("home.featuresTitle")}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc, path, color }) => (
            <button key={label} onClick={() => navigate(path)} className="bg-white rounded-2xl shadow-card p-5 text-left hover:shadow-hover hover:-translate-y-1 transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 group-hover:text-primary transition">{t(label)}</h3>
              <p className="text-sm text-gray-500 mt-1">{t(desc)}</p>
              <div className="flex items-center gap-1 mt-3 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition">
                {t("common.explore")} <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-gradient-to-br from-surface to-green-100 rounded-2xl p-5 border border-green-200">
            <Icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-gray-800">{t(title)}</h3>
            <p className="text-sm text-gray-600 mt-1">{t(desc)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

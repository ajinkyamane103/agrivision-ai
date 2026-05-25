import { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingCart, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const CAT_COLORS = { Fungicide: "bg-purple-100 text-purple-700", Insecticide: "bg-red-100 text-red-700", "Bio-fungicide": "bg-green-100 text-green-700", "Bio-Pesticide": "bg-teal-100 text-teal-700", Fertilizer: "bg-blue-100 text-blue-700", Organic: "bg-lime-100 text-lime-700" };

export default function Market() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { axios.get(`${API}/market/categories`).then(r => setCats(r.data)); }, []);
  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/market/products`, { params: { category: cat } })
      .then(r => setProducts(r.data.products || []))
      .finally(() => setLoading(false));
  }, [cat]);

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">{t("market.title")}</h1>
        <p className="text-gray-500 mt-1">{t("market.subtitle")}</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder={t("market.search")} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">{t("market.allCategories")}</option>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      {loading ? <div className="text-center py-12 text-gray-400">{t("market.loading")}</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-card p-4 hover:shadow-hover transition">
              <div className="flex items-start gap-3 mb-3">
                <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{p.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${CAT_COLORS[p.category] || "bg-gray-100 text-gray-600"}`}>{p.category}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">{t("market.for")}: {p.for_crop.join(", ")}</p>
              <div className="flex items-center justify-between">
                <div><p className="text-xl font-bold text-primary">₹{p.price}</p><p className="text-xs text-gray-400">{p.unit}</p></div>
                <a href={p.buy_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-secondary-dark transition">
                  <ShoppingCart className="w-3 h-3" /> {t("market.buy")}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

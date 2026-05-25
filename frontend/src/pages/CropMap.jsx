import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import axios from "axios";
import { Map, Locate, Leaf } from "lucide-react";
import "leaflet/dist/leaflet.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SEASON_COLORS = { primary: "#2D7A3A", kharif: "#F9A825", rabi: "#0288D1" };

function LocationMarker({ onLocate }) {
  const map = useMap();
  const locate = () => {
    map.locate({ setView: true, maxZoom: 8 });
    map.on("locationfound", (e) => onLocate(e.latlng));
  };
  return (
    <button
      onClick={locate}
      className="absolute top-20 right-3 z-[1000] bg-white p-2 rounded-lg shadow-md hover:bg-green-50 border border-gray-200"
      title="Locate me"
    >
      <Locate className="w-5 h-5 text-primary" />
    </button>
  );
}

export default function CropMap() {
  const [states, setStates]         = useState([]);
  const [selected, setSelected]     = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [season, setSeason]         = useState("primary");

  useEffect(() => {
    axios.get(`${API}/crop-map/states`)
      .then(r => setStates(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleLocate = async ({ lat, lng }) => {
    try {
      const { data } = await axios.get(`${API}/crop-map/suggest?lat=${lat}&lng=${lng}`);
      setSuggestion(data);
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">🗺️ Map-Based Crop Suggestion</h1>
        <p className="text-gray-500 mt-1">Click any state marker to see recommended crops. Use Locate to get suggestions for your location.</p>
      </div>

      {/* Season filter */}
      <div className="flex gap-2 flex-wrap">
        {["primary", "kharif", "rabi"].map(s => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition
              ${season === s ? "text-white shadow-md" : "bg-white border border-gray-200 text-gray-600"}`}
            style={season === s ? { backgroundColor: SEASON_COLORS[s] } : {}}
          >
            {s === "primary" ? "All Crops" : s.charAt(0).toUpperCase() + s.slice(1)} Season
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Map */}
        <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-card relative" style={{ height: "480px" }}>
          {!loading && (
            <MapContainer
              center={[20.59, 78.96]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              className="rounded-2xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {states.map(st => (
                <CircleMarker
                  key={st.state}
                  center={[st.lat, st.lng]}
                  radius={14}
                  pathOptions={{
                    fillColor: SEASON_COLORS[season] || "#2D7A3A",
                    fillOpacity: 0.75,
                    color: "#fff",
                    weight: 2,
                  }}
                  eventHandlers={{ click: () => setSelected(st) }}
                >
                  <Popup>
                    <div className="font-sans">
                      <p className="font-bold text-gray-800">{st.state}</p>
                      <p className="text-xs text-gray-500 mb-1">Top crops ({season})</p>
                      <div className="flex flex-wrap gap-1">
                        {(st[season] || st.primary_crops)?.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{c}</span>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              <LocationMarker onLocate={handleLocate} />
            </MapContainer>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          {suggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-blue-800 mb-2">📍 Your Location</p>
              <p className="text-sm text-blue-700 font-semibold">{suggestion.detected_state}</p>
              <p className="text-xs text-blue-500 mt-1">{suggestion.note}</p>
              <div className="mt-3 space-y-2">
                {Object.entries(suggestion.crops || {}).map(([s, crops]) => (
                  <div key={s}>
                    <p className="text-xs font-bold uppercase text-blue-600">{s}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {crops.map(c => (
                        <span key={c} className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 rounded-full text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected ? (
            <div className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-gray-800">{selected.state}</h2>
              </div>
              <div className="space-y-3">
                {["primary_crops", "kharif", "rabi"].map(key => (
                  <div key={key}>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
                      {key === "primary_crops" ? "Top Crops" : key.charAt(0).toUpperCase() + key.slice(1) + " Season"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(selected[key] || []).map(c => (
                        <span key={c} className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                          <Leaf className="w-2.5 h-2.5 inline mr-0.5" />{c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card p-6 text-center text-gray-300">
              <Map className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Click a state marker on the map</p>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-2xl shadow-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Legend</p>
            <div className="space-y-1.5">
              {Object.entries(SEASON_COLORS).map(([s, c]) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-xs text-gray-600 capitalize">{s === "primary" ? "All/Primary Crops" : s + " Season"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

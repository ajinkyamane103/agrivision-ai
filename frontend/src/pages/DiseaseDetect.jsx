import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, AlertCircle, CheckCircle, Leaf, ShoppingCart, RefreshCw, MapPin } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL || "https://agrivision-ai.up.railway.app/api";

export default function DiseaseDetect() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] }, maxFiles: 1,
  });

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);

      // Optionally append GPS coords
      if (navigator.geolocation) {
        await new Promise((res) =>
          navigator.geolocation.getCurrentPosition(
            (pos) => { form.append("lat", pos.coords.latitude); form.append("lng", pos.coords.longitude); res(); },
            res
          )
        );
      }

      const { data } = await axios.post(`${API}/disease/predict`, form);
      setResult(data);
      toast.success(t("detect.analysisComplete"));
    } catch (err) {
      toast.error(t("detect.analysisFailed"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); };

  const conf = result?.confidence;
  const confColor = conf >= 80 ? "text-green-600" : conf >= 60 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">{t("detect.title")}</h1>
        <p className="text-gray-500 mt-1">{t("detect.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload card */}
        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragActive ? "border-primary bg-green-50" : "border-green-200 hover:border-primary hover:bg-green-50/50"}`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">{t("detect.drop")}</p>
                  <p className="text-sm text-gray-400 mt-1">{t("detect.browse")}</p>
                  <p className="text-xs text-gray-400 mt-2">{t("detect.fileHint")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={analyze}
              disabled={!file || loading}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-primary-dark transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> {t("common.analyzing")}</>
              ) : (
                <><Leaf className="w-4 h-4" /> {t("common.analyze")}</>
              )}
            </button>
            {file && (
              <button onClick={reset} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700 font-medium">{t("detect.tipsTitle")}</p>
            <ul className="text-xs text-amber-600 mt-1 space-y-0.5">
              <li>{t("detect.tip1")}</li>
              <li>{t("detect.tip2")}</li>
              <li>{t("detect.tip3")}</li>
              <li>{t("detect.tip4")}</li>
            </ul>
          </div>
        </div>

        {/* Result card */}
        <AnimatePresence>
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-card p-6 space-y-4"
            >
              {result.type === "plant_identification" ? (
                <PlantTypeResult result={result} />
              ) : result.type === "invalid_image" ? (
                <InvalidImageResult result={result} />
              ) : (
                <DiseaseResult result={result} confColor={confColor} />
              )}
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col items-center justify-center text-center text-gray-300 min-h-[300px]">
              <Leaf className="w-16 h-16 mb-3 opacity-30" />
              <p className="font-medium">{t("detect.resultsTitle")}</p>
              <p className="text-sm mt-1">{t("detect.resultsSub")}</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DiseaseResult({ result, confColor }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-start gap-3">
        {result.confidence >= 70
          ? <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          : <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
        }
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{result.disease_name?.replace(/_/g, " ")}</h2>
          <p className={`text-sm font-semibold ${confColor}`}>{t("detect.confidence")}: {result.confidence}%</p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all"
          style={{ width: `${result.confidence}%` }}
        />
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t("detect.description")}</p>
        <p className="text-sm text-gray-700">{result.description}</p>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t("detect.prevention")}</p>
        <p className="text-sm text-gray-700">{result.prevention}</p>
      </div>

      {result.supplement_name && (
        <div className="border border-green-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex-shrink-0 overflow-hidden">
            {result.supplement_image_url && (
              <img src={result.supplement_image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{result.supplement_name}</p>
            <p className="text-xs text-gray-400">{t("detect.supplement")}</p>
          </div>
          {result.buy_link && (
            <a href={result.buy_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-white rounded-lg text-xs font-semibold hover:bg-secondary-dark transition">
              <ShoppingCart className="w-3 h-3" /> Buy
            </a>
          )}
        </div>
      )}

      {result.scan_id && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Saved to your history (Scan #{result.scan_id})
        </p>
      )}
    </>
  );
}

function PlantTypeResult({ result }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-start gap-3">
        <Leaf className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{t("detect.plantIdentified")}</h2>
          <p className="text-sm text-gray-500">{result.message}</p>
        </div>
      </div>
      <div className="bg-green-50 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-700">{t("detect.detectedType")}</p>
        <p className="text-xl font-bold text-primary mt-1">{result.plant_type}</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
        💡 For precise plant identification, use <strong>PlantNet</strong> or
        <strong> iNaturalist</strong> apps for free plant recognition.
      </div>
    </>
  );
}

function InvalidImageResult({ result }) {
  return (
    <div className="text-center py-10">
      <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-800">
        Invalid Image
      </h2>
      <p className="text-gray-500 mt-2">
        Please upload a valid plant leaf image.
      </p>
      <p className="text-sm text-gray-400 mt-3">
        Confidence: {result.confidence}%
      </p>
    </div>
  );
}

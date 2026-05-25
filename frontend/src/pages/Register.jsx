import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import toast from "react-hot-toast";

const STATES = ["Maharashtra","Punjab","Uttar Pradesh","Madhya Pradesh","Rajasthan","Karnataka","Andhra Pradesh","Tamil Nadu","Gujarat","Bihar","West Bengal","Haryana","Odisha","Assam","Telangana","Kerala","Jharkhand","Himachal Pradesh","Uttarakhand","Chhattisgarh","Goa","Other"];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", state: "Maharashtra", language: "en" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Welcome to AgriVision AI 🌿");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  const field = (k, l, t = "text", opts = null) => (
    <div key={k}>
      <label className="block text-sm font-bold text-gray-600 mb-1">{l}</label>
      {opts ? (
        <select value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          {opts.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input type={t} required value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-1">Join AgriVision AI — free forever</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-8 space-y-4">
          {field("name", "Full Name")}
          {field("email", "Email", "email")}
          {field("password", "Password", "password")}
          {field("state", "Your State", "select", STATES)}
          {field("language", "Preferred Language", "select", [
            { value: "en", label: "English" }, { value: "hi", label: "हिंदी" },
            { value: "mr", label: "मराठी" }, { value: "ta", label: "தமிழ்" },
            { value: "te", label: "తెలుగు" }, { value: "kn", label: "ಕನ್ನಡ" },
            { value: "bn", label: "বাংলা" }, { value: "gu", label: "ગુજરાતી" },
          ])}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition disabled:opacity-50 mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

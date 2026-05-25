// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useAuth } from "../hooks/useAuth.jsx";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch { toast.error("Invalid email or password"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-800">AgriVision AI</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-8 space-y-5">
          {[["email", "Email", "email"], ["password", "Password", "password"]].map(([k, l, t]) => (
            <div key={k}>
              <label className="block text-sm font-bold text-gray-600 mb-1">{l}</label>
              <input type={t} required value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link></p>
        </form>
      </div>
    </div>
  );
}

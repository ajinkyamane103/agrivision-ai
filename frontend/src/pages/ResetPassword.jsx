import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Leaf } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.jsx";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset link is missing or invalid");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, form.password);
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            Choose New Password
          </h1>
          <p className="text-gray-500 mt-1">
            Create a new password for your AgriVision AI account
          </p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-8 space-y-5">
          {!token && (
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <KeyRound className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-sm text-gray-500">
                This reset link is missing a token. Request a new link to continue.
              </p>
            </div>
          )}

          {token && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition disabled:opacity-50"
              >
                {loading ? "Resetting password..." : "Reset Password"}
              </button>
            </>
          )}

          <Link
            to={token ? "/login" : "/forgot-password"}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 font-semibold hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {token ? "Back to sign in" : "Request new link"}
          </Link>
        </form>
      </div>
    </div>
  );
}

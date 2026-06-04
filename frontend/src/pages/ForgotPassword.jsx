import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Leaf, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent if the email exists");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            Reset Password
          </h1>
          <p className="text-gray-500 mt-1">
            Enter your account email to receive a reset link
          </p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-8 space-y-5">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MailCheck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Check your email</h2>
                <p className="text-sm text-gray-500 mt-1">
                  If an account exists, a password reset link has been sent.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {!sent && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? "Sending reset link..." : "Send Reset Link"}
            </button>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 font-semibold hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </form>
      </div>
    </div>
  );
}

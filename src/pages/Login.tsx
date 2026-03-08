import { Languages, Chrome } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
} from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSigningIn) return; // prevent double-click
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error: any) {
      // cancelled-popup-request fires when popup is closed or duplicate — ignore silently
      if (error.code !== "auth/cancelled-popup-request" && error.code !== "auth/popup-closed-by-user") {
        setError(error.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="bg-background text-foreground h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-sm dark:shadow-none">
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: "linear-gradient(to bottom right, #5555ff, #10b981)",
            }}
          >
            <Languages className="text-slate-900 dark:text-slate-100 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to ClaimLens
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Sign in to your PS2 MVP Account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full bg-transparent border border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full bg-transparent border border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center -mt-1 mb-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg px-4 py-2 hover:bg-slate-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningIn ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="px-3 text-xs text-gray-500 uppercase">
            Or continue with
          </span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white dark:bg-[#1a1a1c] border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-slate-100 font-medium rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm dark:shadow-none"
        >
          <Chrome className="w-4 h-4" />
          Google
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

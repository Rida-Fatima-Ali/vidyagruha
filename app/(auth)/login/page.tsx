"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Lock,
  Mail,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";

const ROLES: { id: UserRole; label: string; icon: any; hint: string }[] = [
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
    hint: "e.g. lakshyachoithani@somaiya.edu",
  },
  {
    id: "faculty",
    label: "Faculty",
    icon: Users,
    hint: "e.g. varshakinge@somaiya.edu",
  },
  {
    id: "admin",
    label: "Admin",
    icon: ShieldCheck,
    hint: "e.g. admin01",
  },
];

const PRESET_ACCOUNTS = [
  { role: "student", name: "Lakshya Choithani", email: "lakshyachoithani@somaiya.edu" },
  { role: "student", name: "Gargi Thotam", email: "gargithotam@somaiya.edu" },
  { role: "student", name: "Rida Fatima", email: "ridafatima@somaiya.edu" },
  { role: "student", name: "Priyansh Bhan", email: "priyanshbhan@somaiya.edu" },
  { role: "student", name: "Tejas Nagare", email: "tejasnagare@somaiya.edu" },
  { role: "faculty", name: "Varsha Kinge", email: "varshakinge@somaiya.edu" },
  { role: "faculty", name: "RNP", email: "rnp@somaiya.edu" },
  { role: "faculty", name: "NRP", email: "nrp@somaiya.edu" },
  { role: "faculty", name: "Charu", email: "charu@somaiya.edu" },
  { role: "admin", name: "System Administrator", email: "admin01" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [identifier, setIdentifier] = useState("lakshyachoithani@somaiya.edu");
  const [password, setPassword] = useState("kjsp@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelectRole(newRole: UserRole) {
    setRole(newRole);
    setError(null);
    if (newRole === "student") {
      setIdentifier("lakshyachoithani@somaiya.edu");
      setPassword("kjsp@123");
    } else if (newRole === "faculty") {
      setIdentifier("varshakinge@somaiya.edu");
      setPassword("kjsp@123");
    } else {
      setIdentifier("admin01");
      setPassword("kjsp@123");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    // Frontend validation for student & faculty domain
    if (role !== "admin" && cleanId !== "admin01") {
      if (!cleanId.toLowerCase().endsWith("@somaiya.edu")) {
        setError("Student and Faculty sign in requires a valid @somaiya.edu institutional email.");
        return;
      }
    }

    setLoading(true);

    try {
      // Authenticate via database auth provider
      const result = await login(cleanId, password, role);

      if (!result.success) {
        setError(result.error || "Invalid username or password.");
        setLoading(false);
        return;
      }

      // Role-based redirection
      if (role === "student") {
        router.push("/student/dashboard");
      } else if (role === "faculty") {
        router.push("/faculty/dashboard");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] text-[#28251D] flex flex-col justify-between selection:bg-[#8B1E1E] selection:text-[#FAF9F5]">
      {/* Top Header */}
      <header className="w-full bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#28251D]/08 sticky top-0 z-30">
        <div className="max-w-[1300px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-44 sm:w-56 flex items-center">
              <Image
                src="/vidyagruha-logo.png"
                alt="VidyaGruha"
                width={240}
                height={60}
                priority
                className="object-contain object-left h-9 sm:h-10 w-auto transition-opacity duration-200 group-hover:opacity-85"
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#8B1E1E] hover:underline"
            >
              Sign Up
            </Link>
            <Link
              href="/explore"
              className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-full border border-[#28251D]/15 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#28251D] hover:bg-[#28251D] hover:text-[#FAF9F5] transition-all"
            >
              Explore Tour
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-10 py-10 lg:py-16 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#FDFCFB] border border-[#28251D]/12 rounded-2xl p-8 sm:p-10 shadow-sm"
        >
          {/* Brand Logo & Welcome */}
          <div className="text-center mb-8">
            <div className="relative h-12 w-48 mx-auto mb-4 flex items-center justify-center">
              <Image
                src="/vidyagruha-logo.png"
                alt="VidyaGruha"
                width={220}
                height={55}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-serif text-[#1C1917]">
              Sign in to your account
            </h1>
            <p className="mt-1 text-xs text-[#77736B]">
              Enter your institutional credentials to access your workspace.
            </p>
          </div>

          {/* Account Type Selection Tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#77736B] mb-2 text-center">
              Select Account Type
            </label>
            <div className="grid grid-cols-3 gap-2 bg-[#FAF9F5] p-1.5 rounded-xl border border-[#28251D]/10">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRole(r.id)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#1C1917] text-white shadow-sm"
                        : "text-[#77736B] hover:text-[#1C1917] hover:bg-white/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 p-3.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736B] mb-1.5">
                {role === "admin" ? "Username" : "Email / Username"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={ROLES.find((r) => r.id === role)?.hint}
                  className="w-full rounded-xl border border-[#28251D]/15 bg-[#FAF9F5] pl-10 pr-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all"
                />
                <Mail className="w-4 h-4 text-[#A9A59D] absolute left-3.5 top-3.5" />
              </div>
              {role !== "admin" && (
                <p className="mt-1 text-[11px] text-[#A9A59D]">
                  Must end with <code className="text-[#8B1E1E]">@somaiya.edu</code>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-[#28251D]/15 bg-[#FAF9F5] pl-10 pr-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all"
                />
                <Lock className="w-4 h-4 text-[#A9A59D] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#8B1E1E] text-white text-xs font-semibold uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Preset Selector for Easy Testing */}
          <div className="mt-8 pt-6 border-t border-[#28251D]/08">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#A9A59D] mb-2.5 text-center">
              Quick Prototype Credential Presets:
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {PRESET_ACCOUNTS.filter((a) => a.role === role).map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setIdentifier(acc.email);
                    setPassword("kjsp@123");
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                    identifier === acc.email
                      ? "bg-[#8B1E1E]/10 border-[#8B1E1E] text-[#8B1E1E] font-medium"
                      : "bg-[#FAF9F5] border-[#28251D]/10 text-[#77736B] hover:text-[#1C1917]"
                  }`}
                >
                  {acc.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Link to Sign Up */}
          <div className="text-center mt-6 text-xs text-[#77736B]">
            Need a new account?{" "}
            <Link href="/signup" className="font-semibold text-[#8B1E1E] hover:underline">
              Submit registration request
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 py-6 border-t border-[#28251D]/08 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A9A59D] tracking-wider uppercase">
        <div>
          <span>VidyaGruha</span> · <span>Authentication & Access Portal</span>
        </div>
        <div className="flex items-center gap-6 mt-2 sm:mt-0">
          <Link href="/" className="hover:text-[#28251D] transition-colors">
            Home
          </Link>
          <Link href="/signup" className="hover:text-[#28251D] transition-colors">
            Sign Up
          </Link>
          <Link href="/explore" className="hover:text-[#28251D] transition-colors">
            Explore
          </Link>
        </div>
      </footer>
    </div>
  );
}

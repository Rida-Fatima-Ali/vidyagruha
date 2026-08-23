"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Brand } from "@/components/layout/brand";

type SignupRole = "student" | "faculty";

export default function SignupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dept, setDept] = useState("Computer Engineering");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Frontend validation
    if (!displayName.trim()) {
      setError("Please enter your full display name.");
      return;
    }

    if (!cleanEmail.endsWith("@somaiya.edu")) {
      setError("Institutional email required. Address must end with @somaiya.edu");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: cleanEmail,
          role: selectedRole,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setSubmittedRequest(data.request);
      setSubmitted(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] text-[#28251D] flex flex-col justify-between selection:bg-[#8B1E1E] selection:text-[#FAF9F5]">
      {/* Top Navbar */}
      <header className="w-full bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#28251D]/08 sticky top-0 z-30">
        <div className="max-w-[1300px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-44 sm:w-52 flex items-center">
              <Image
                src="/vidyagruha-logo.png"
                alt="VidyaGruha"
                width={220}
                height={55}
                priority
                className="object-contain object-left h-9 w-auto transition-opacity duration-200 group-hover:opacity-85"
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[12px] font-medium tracking-[0.14em] uppercase text-[#77736B] hover:text-[#28251D] transition-colors"
            >
              Sign In
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

      {/* Main Container */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-10 py-10 lg:py-16 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT ROLE */}
          {!selectedRole && !submitted && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto w-full"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1E1E]/08 border border-[#8B1E1E]/15 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8B1E1E] mb-3">
                  <span>Create Your Account</span>
                </div>
                <h1 className="text-[2.5rem] sm:text-[3.25rem] font-normal leading-[1.08] tracking-[-0.02em] font-serif text-[#1C1917] mb-3">
                  Join VidyaGruha
                </h1>
                <p className="text-[15px] text-[#77736B] leading-[1.6]">
                  Select your institutional affiliation to begin registration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Student Option */}
                <div
                  onClick={() => setSelectedRole("student")}
                  className="group relative bg-[#FDFCFB] border border-[#28251D]/12 hover:border-[#8B1E1E]/50 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#8B1E1E]/08 border border-[#8B1E1E]/15 flex items-center justify-center text-[#8B1E1E] group-hover:bg-[#8B1E1E] group-hover:text-white transition-all mb-6">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-serif text-[#1C1917] mb-2 group-hover:text-[#8B1E1E] transition-colors">
                      Student
                    </h2>
                    <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#77736B] mb-3">
                      Enrolled Learners
                    </p>
                    <p className="text-sm text-[#77736B] leading-relaxed">
                      Access lecture schedules, mark attendance, submit assignments, and engage in peer doubt threads.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#28251D]/08 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1C1917] group-hover:text-[#8B1E1E]">
                    <span>Continue as Student</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Faculty Option */}
                <div
                  onClick={() => setSelectedRole("faculty")}
                  className="group relative bg-[#FDFCFB] border border-[#28251D]/12 hover:border-[#8B1E1E]/50 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#01696f]/08 border border-[#01696f]/15 flex items-center justify-center text-[#01696f] group-hover:bg-[#01696f] group-hover:text-white transition-all mb-6">
                      <Users className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-serif text-[#1C1917] mb-2 group-hover:text-[#01696f] transition-colors">
                      Faculty
                    </h2>
                    <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#77736B] mb-3">
                      Professors & Instructors
                    </p>
                    <p className="text-sm text-[#77736B] leading-relaxed">
                      Take attendance with 6-second undo, review cover requests, verify doubt resolutions, and grade coursework.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#28251D]/08 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1C1917] group-hover:text-[#01696f]">
                    <span>Continue as Faculty</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              <div className="text-center mt-10">
                <p className="text-xs text-[#77736B]">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-[#8B1E1E] hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CREDENTIAL FORM */}
          {selectedRole && !submitted && (
            <motion.div
              key="credential-form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl mx-auto w-full bg-[#FDFCFB] border border-[#28251D]/12 rounded-2xl p-8 sm:p-10 shadow-sm"
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedRole(null);
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#77736B] hover:text-[#1C1917] mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Role</span>
              </button>

              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B1E1E]/08 border border-[#8B1E1E]/15 text-[11px] font-semibold tracking-wider uppercase text-[#8B1E1E] mb-2">
                  <span>{selectedRole === "student" ? "Student" : "Faculty"} Registration</span>
                </div>
                <h2 className="text-3xl font-serif text-[#1C1917]">
                  Enter your credentials
                </h2>
                <p className="mt-1 text-xs text-[#77736B]">
                  Use your institutional Somaiya credentials for validation.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 p-3.5 text-xs text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736B] mb-1.5">
                    Full Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Lakshya Choithani"
                    className="w-full rounded-xl border border-[#28251D]/15 bg-[#FAF9F5] px-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all"
                  />
                  <p className="mt-1 text-[11px] text-[#A9A59D]">
                    This is your human-readable name shown across the dashboard.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736B] mb-1.5">
                    Somaiya Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@somaiya.edu"
                    className="w-full rounded-xl border border-[#28251D]/15 bg-[#FAF9F5] px-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all"
                  />
                  <p className="mt-1 text-[11px] text-[#A9A59D]">
                    Must end with <code className="text-[#8B1E1E]">@somaiya.edu</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736B] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-[#28251D]/15 bg-[#FAF9F5] px-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#77736B] mb-1.5">
                    Department / Programme
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full rounded-xl border border-[#28251D]/15 bg-[#FAF9F5] px-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#8B1E1E] transition-all"
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Telecomm">Electronics & Telecommunication</option>
                    <option value="Artificial Intelligence">Artificial Intelligence & Data Science</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#8B1E1E] text-white text-xs font-semibold uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <span>Submit Registration Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: REGISTRATION SUBMITTED / APPROVAL PENDING */}
          {submitted && (
            <motion.div
              key="submitted-step"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl mx-auto w-full bg-[#FDFCFB] border border-[#28251D]/12 rounded-2xl p-8 sm:p-10 text-center shadow-sm"
            >
              <div className="w-16 h-16 rounded-full bg-warning/10 text-warning border border-warning/20 mx-auto flex items-center justify-center mb-6">
                <Clock className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-[11px] font-semibold tracking-wider uppercase text-warning mb-3">
                <span>Request Submitted</span>
              </div>

              <h2 className="text-3xl font-serif text-[#1C1917] mb-3">
                Pending Approval
              </h2>

              <p className="text-sm text-[#77736B] leading-relaxed mb-6">
                Thank you, <strong>{displayName}</strong>. Your registration request for{" "}
                <code className="bg-[#FAF9F5] px-1.5 py-0.5 rounded border border-[#28251D]/10 text-[#8B1E1E]">
                  {email}
                </code>{" "}
                has been submitted for administrative review.
              </p>

              <div className="bg-[#FAF9F5] border border-[#28251D]/08 rounded-xl p-4 text-left text-xs text-[#77736B] space-y-1.5 mb-8">
                <div className="flex justify-between">
                  <span className="text-[#A9A59D]">Account Type:</span>
                  <span className="font-semibold text-[#1C1917] capitalize">{selectedRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A59D]">Display Name:</span>
                  <span className="font-semibold text-[#1C1917]">{displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A9A59D]">Status:</span>
                  <span className="font-semibold text-warning">Pending Admin Approval</span>
                </div>
              </div>

              <p className="text-xs text-[#A9A59D] mb-8">
                Once the administrator approves your account, you will be able to log in immediately.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1C1917] hover:bg-[#8B1E1E] text-white text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[#28251D]/15 text-[#28251D] text-xs font-semibold uppercase tracking-wider hover:bg-[#FAF9F5] transition-all"
                >
                  <span>Return to Home</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 py-6 border-t border-[#28251D]/08 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A9A59D] tracking-wider uppercase">
        <div>
          <span>VidyaGruha</span> · <span>Identity & Registration</span>
        </div>
        <div className="flex items-center gap-6 mt-2 sm:mt-0">
          <Link href="/login" className="hover:text-[#28251D] transition-colors">
            Sign In Portal
          </Link>
          <Link href="/explore" className="hover:text-[#28251D] transition-colors">
            Explore Experience
          </Link>
        </div>
      </footer>
    </div>
  );
}

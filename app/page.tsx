"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, GraduationCap, Users, ShieldCheck } from "lucide-react";
import EditorialNavbar from "@/components/editorial/EditorialNavbar";

export default function PrimarySignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#FAF9F5] text-[#28251D] flex flex-col justify-between overflow-x-hidden font-sans selection:bg-[#8B1E1E] selection:text-[#FAF9F5]">
      {/* Top Editorial Navbar */}
      <EditorialNavbar />

      {/* Main 100vh Hero Composition */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-10 pt-24 pb-8 lg:py-0 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Typography & Actions (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-5 flex flex-col items-start pr-0 lg:pr-6"
          >
            {/* Small uppercase kicker */}
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-6 bg-[#8B1E1E]" />
              <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[#8B1E1E]">
                Academic Intelligence Platform
              </span>
            </div>

            {/* Dominant Headline */}
            <h1 className="text-[3.25rem] sm:text-[4.25rem] lg:text-[4.75rem] font-normal leading-[1.04] tracking-[-0.02em] font-serif text-[#1C1917] mb-6">
              Your Campus,
              <br />
              <span className="italic font-serif text-[#8B1E1E]">Connected.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-[15px] sm:text-[16px] text-[#77736B] leading-[1.65] max-w-[460px] font-normal mb-8">
              One unified, architectural workspace designed specifically for college students, faculty members, and institutional administrators.
            </p>

            {/* Primary Action Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={() => router.push("/signin")}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1C1917] hover:bg-[#8B1E1E] text-[#FAF9F5] text-[13px] font-medium tracking-[0.18em] uppercase transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-[#28251D]/15 hover:border-[#28251D] text-[#28251D] text-[13px] font-medium tracking-[0.16em] uppercase transition-all duration-200"
              >
                <span>Explore Tour</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>

            {/* Quick Role Direct Access Pills */}
            <div className="pt-6 border-t border-[#28251D]/08 w-full">
              <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#A9A59D] mb-3">
                Quick Role Entry
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/student"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#F0EEE7] hover:bg-[#E7E4DB] text-[#28251D] text-[12px] font-medium transition-colors duration-150"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#8B1E1E]" />
                  <span>Student</span>
                </Link>
                <Link
                  href="/faculty"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#F0EEE7] hover:bg-[#E7E4DB] text-[#28251D] text-[12px] font-medium transition-colors duration-150"
                >
                  <Users className="w-3.5 h-3.5 text-[#8B1E1E]" />
                  <span>Faculty</span>
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#F0EEE7] hover:bg-[#E7E4DB] text-[#28251D] text-[12px] font-medium transition-colors duration-150"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B1E1E]" />
                  <span>Admin</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Architectural Editorial Composition (7 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-7 relative w-full flex items-center justify-center lg:justify-end"
          >
            {/* Subtle background architectural frame line inspired by reference 3 */}
            <div className="hidden sm:block absolute -top-6 -left-6 w-full h-full border border-[#28251D]/08 pointer-events-none rounded-sm z-0" />

            {/* Primary Editorial Image Card */}
            <div className="relative z-10 w-full max-w-[560px] aspect-[4/3] sm:aspect-[14/11] lg:aspect-[4/3] overflow-hidden rounded-sm bg-[#E9E7DF] border border-[#28251D]/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <Image
                src="/hero-student.jpg"
                alt="VidyaGruha Academic Community"
                fill
                priority
                className="object-cover object-center filter grayscale-[15%] contrast-[102%] hover:scale-102 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              
              {/* Subtle gradient vignette to blend into page */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/35 via-transparent to-transparent pointer-events-none" />

              {/* Inset metadata tag */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[#FAF9F5] text-[11px] font-mono tracking-wider">
                <span className="bg-[#1C1917]/70 backdrop-blur-md px-2.5 py-1 rounded">
                  COLLEGE ECOSYSTEM
                </span>
                <span className="bg-[#1C1917]/70 backdrop-blur-md px-2.5 py-1 rounded">
                  2026 EDITION
                </span>
              </div>
            </div>

            {/* Small Overlapping Secondary Photo Frame (inspired by reference 2 & 3) */}
            <div className="hidden xl:block absolute -bottom-8 -left-10 z-20 w-44 aspect-[3/4] overflow-hidden rounded-sm border-2 border-[#FAF9F5] shadow-xl bg-[#E9E7DF]">
              <Image
                src="/campus-space.jpg"
                alt="VidyaGruha Minimal Workspace"
                fill
                className="object-cover filter grayscale-[25%] contrast-[105%]"
                sizes="180px"
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 py-5 border-t border-[#28251D]/08 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A9A59D] tracking-wider uppercase">
        <div>
          <span>VidyaGruha</span> · <span>All Rights Reserved</span>
        </div>
        <div className="flex items-center gap-6 mt-2 sm:mt-0">
          <Link href="/explore" className="hover:text-[#28251D] transition-colors">
            Explore Landing
          </Link>
          <Link href="/signin" className="hover:text-[#28251D] transition-colors">
            Role Selection
          </Link>
          <span>Privacy & Terms</span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, ArrowUpRight, Radar, Megaphone, LayoutDashboard } from "lucide-react";

export default function AdminRolePage() {
  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] text-[#28251D] flex flex-col justify-between overflow-x-hidden font-sans selection:bg-[#8B1E1E] selection:text-[#FAF9F5]">
      {/* Top Navbar */}
      <header className="w-full bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#28251D]/08">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-36 sm:w-44 flex items-center">
              <Image
                src="/vidyagruha-logo.jpg"
                alt="VidyaGruha"
                width={180}
                height={44}
                priority
                className="object-contain object-left h-8 w-auto mix-blend-multiply"
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.14em] uppercase text-[#77736B] hover:text-[#28251D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 sm:px-10 py-16 flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-[#FDFCFB] border border-[#28251D]/10 rounded-sm p-10 sm:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="w-16 h-16 rounded-full bg-[#8B1E1E]/08 text-[#8B1E1E] flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 rounded bg-[#F0EEE7] text-[11px] font-mono uppercase tracking-widest text-[#77736B] mb-4">
            Administration Portal · Prototype Access
          </div>

          <h1 className="text-[2.75rem] sm:text-[3.5rem] font-normal font-serif text-[#1C1917] mb-3">
            Admin
          </h1>

          <p className="text-[17px] sm:text-[19px] text-[#77736B] font-normal max-w-lg mx-auto mb-8 leading-relaxed">
            Your administration workspace is being prepared.
          </p>

          <p className="text-[13px] text-[#A9A59D] max-w-md mx-auto mb-10 leading-normal">
            You are viewing the authenticated administrator portal prototype. Explore the Room Clash Radar, Organizational Notice Reach Tree, or institutional operations.
          </p>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-[#28251D]/08 flex-wrap">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1C1917] hover:bg-[#8B1E1E] text-[#FAF9F5] text-[12px] font-medium tracking-[0.16em] uppercase transition-all duration-200 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>

            <Link
              href="/admin/rooms/radar"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F0EEE7] hover:bg-[#E7E4DB] text-[#28251D] text-[12px] font-medium tracking-[0.14em] uppercase transition-all duration-200 w-full sm:w-auto"
            >
              <Radar className="w-4 h-4 text-[#8B1E1E]" />
              <span>Room Clash Radar</span>
            </Link>

            <Link
              href="/admin/notices"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#F0EEE7] hover:bg-[#E7E4DB] text-[#28251D] text-[12px] font-medium tracking-[0.14em] uppercase transition-all duration-200 w-full sm:w-auto"
            >
              <Megaphone className="w-4 h-4 text-[#8B1E1E]" />
              <span>Notice Reach Tree</span>
            </Link>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#28251D]/15 hover:border-[#28251D] text-[#28251D] text-[12px] font-medium tracking-[0.14em] uppercase transition-all duration-200 w-full sm:w-auto"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer bar */}
      <footer className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 py-5 border-t border-[#28251D]/08 flex items-center justify-between text-[11px] text-[#A9A59D] tracking-wider uppercase">
        <span>VidyaGruha Administration Gateway</span>
        <Link href="/explore" className="hover:text-[#28251D] flex items-center gap-1">
          <span>Explore VidyaGruha</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </footer>
    </div>
  );
}

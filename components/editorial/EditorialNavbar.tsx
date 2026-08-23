"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";

export default function EditorialNavbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#28251D]/08 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 sm:h-12 w-48 sm:w-60 flex items-center">
            <Image
              src="/vidyagruha-logo.jpg"
              alt="VidyaGruha"
              width={260}
              height={64}
              priority
              className="object-contain object-left h-10 sm:h-11 w-auto mix-blend-multiply transition-opacity duration-200 group-hover:opacity-85"
            />
          </div>
        </Link>

        {/* Center: Minimalist Editorial Nav */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12">
          <Link
            href="/explore"
            className="text-[12px] font-medium tracking-[0.2em] uppercase text-[#77736B] hover:text-[#28251D] transition-colors duration-200"
          >
            Explore
          </Link>
          <Link
            href="/explore#section-about"
            className="text-[12px] font-medium tracking-[0.2em] uppercase text-[#77736B] hover:text-[#28251D] transition-colors duration-200"
          >
            About
          </Link>
          <Link
            href="/explore#section-why"
            className="text-[12px] font-medium tracking-[0.2em] uppercase text-[#77736B] hover:text-[#28251D] transition-colors duration-200"
          >
            Features
          </Link>
        </nav>

        {/* Right: CTA / Explore button */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-[12px] font-semibold tracking-[0.16em] uppercase text-[#1C1917] hover:text-[#8B1E1E] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/explore"
            className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#28251D]/15 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#28251D] hover:border-[#28251D] hover:bg-[#28251D] hover:text-[#FAF9F5] transition-all duration-300"
          >
            <span>Explore Tour</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full bg-[#1E1C1A] text-[#FAF9F5] text-[11px] font-medium tracking-[0.1em] uppercase"
          >
            Sign In
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#28251D] hover:text-[#77736B]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF9F5] border-b border-[#28251D]/10 px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="text-[13px] font-semibold tracking-[0.18em] uppercase text-[#1E1C1A] py-1 border-b border-[#28251D]/06"
          >
            Sign In Directly
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileOpen(false)}
            className="text-[13px] font-medium tracking-[0.18em] uppercase text-[#77736B] py-1"
          >
            Explore Experience
          </Link>
          <Link
            href="/explore#section-about"
            onClick={() => setMobileOpen(false)}
            className="text-[13px] font-medium tracking-[0.18em] uppercase text-[#77736B] py-1"
          >
            About VidyaGruha
          </Link>
          <Link
            href="/explore#section-why"
            onClick={() => setMobileOpen(false)}
            className="text-[13px] font-medium tracking-[0.18em] uppercase text-[#77736B] py-1"
          >
            Features & Capabilities
          </Link>
        </div>
      )}
    </header>
  );
}

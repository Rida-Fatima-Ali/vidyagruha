"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Users, ShieldCheck, ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";

export default function RoleSignInPage() {
  const router = useRouter();

  const roles = [
    {
      id: "student",
      title: "Student",
      roleLabel: "Academic & Community",
      icon: GraduationCap,
      description: "Access course materials, daily timetable, subject attendance, and verified peer doubt discussions.",
      href: "/student",
      actionText: "Enter as Student",
      highlight: "Enrolled Students",
    },
    {
      id: "faculty",
      title: "Faculty",
      roleLabel: "Teaching & Operations",
      icon: Users,
      description: "Manage class queues, cover request marketplace, 6-second attendance undo, and student queries.",
      href: "/faculty",
      actionText: "Enter as Faculty",
      highlight: "Professors & Instructors",
    },
    {
      id: "admin",
      title: "Administrator",
      roleLabel: "Governance & Logistics",
      icon: ShieldCheck,
      description: "Live Room Clash Radar, institutional notice reach hierarchy, timetable management and analytics.",
      href: "/admin",
      actionText: "Enter as Admin",
      highlight: "Campus Leadership",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] text-[#28251D] flex flex-col justify-between overflow-x-hidden font-sans selection:bg-[#8B1E1E] selection:text-[#FAF9F5]">
      {/* Top Navbar */}
      <header className="w-full bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#28251D]/08">
        <div className="max-w-[1300px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-36 sm:w-44 flex items-center">
              <Image
                src="/vidyagruha-logo.jpg"
                alt="VidyaGruha"
                width={180}
                height={44}
                priority
                className="object-contain object-left h-8 w-auto mix-blend-multiply transition-opacity duration-200 group-hover:opacity-85"
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.14em] uppercase text-[#77736B] hover:text-[#28251D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/explore"
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-[#28251D]/15 text-[11px] font-semibold tracking-[0.14em] uppercase text-[#28251D] hover:bg-[#28251D] hover:text-[#FAF9F5] transition-all"
            >
              <span>Explore Tour</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1300px] w-full mx-auto px-6 sm:px-10 py-12 lg:py-16 flex flex-col justify-center">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1E1E]/08 border border-[#8B1E1E]/15 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8B1E1E] mb-4">
            <span>Identity & Access</span>
          </div>

          <h1 className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] font-normal leading-[1.08] tracking-[-0.02em] font-serif text-[#1C1917] mb-4">
            Welcome to VidyaGruha
          </h1>

          <p className="text-[15px] sm:text-[16px] text-[#77736B] leading-[1.65] font-normal">
            Choose how you want to enter the campus ecosystem.
          </p>
        </motion.div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: 0.1 + idx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative bg-[#FDFCFB] border border-[#28251D]/10 hover:border-[#8B1E1E]/40 rounded-sm p-7 sm:p-8 flex flex-col justify-between shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] transition-all duration-300 cursor-pointer"
                onClick={() => router.push(role.href)}
              >
                {/* Top Badge & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded bg-[#FAF9F5] border border-[#28251D]/08 flex items-center justify-center text-[#8B1E1E] group-hover:bg-[#8B1E1E] group-hover:text-[#FAF9F5] group-hover:border-[#8B1E1E] transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A9A59D] bg-[#F0EEE7] px-2.5 py-1 rounded">
                      {role.highlight}
                    </span>
                  </div>

                  <h2 className="text-[1.75rem] font-normal font-serif text-[#1C1917] mb-2 group-hover:text-[#8B1E1E] transition-colors">
                    {role.title}
                  </h2>

                  <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-[#77736B] mb-4">
                    {role.roleLabel}
                  </p>

                  <p className="text-[13.5px] text-[#77736B] leading-[1.6] mb-8 font-normal">
                    {role.description}
                  </p>
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-5 border-t border-[#28251D]/06 flex items-center justify-between text-[12px] font-semibold tracking-[0.16em] uppercase text-[#1C1917] group-hover:text-[#8B1E1E] transition-colors">
                  <span>{role.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Prototype Notification Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12 text-[12px] text-[#A9A59D] font-mono"
        >
          <span>PROTOTYPE ACCESS · SELECT A ROLE TO EXPLORE THE WORKSPACE</span>
        </motion.div>
      </main>

      {/* Footer bar */}
      <footer className="w-full max-w-[1300px] mx-auto px-6 sm:px-10 py-5 border-t border-[#28251D]/08 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A9A59D] tracking-wider uppercase">
        <div>
          <span>VidyaGruha</span> · <span>Identity & Access System</span>
        </div>
        <div className="flex items-center gap-6 mt-2 sm:mt-0">
          <Link href="/" className="hover:text-[#28251D] transition-colors">
            ← Home Screen
          </Link>
          <Link href="/explore" className="hover:text-[#28251D] transition-colors">
            Explore Experience →
          </Link>
        </div>
      </footer>
    </div>
  );
}

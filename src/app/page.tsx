"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { TreePine, ArrowRight, ShieldCheck, HardHat, Smartphone, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[#f3f7f1] flex flex-col justify-between font-sans text-[#1c241c]">
      {/* Official State Top Header */}
      <header className="h-16 bg-white border-b border-[#dce5d8] px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#204e37] flex items-center justify-center text-[#a7f3d0] shadow-xs">
            <TreePine size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[#143826] leading-none">WasteLoop CG</span>
              <span className="text-[10px] bg-[#e8f5e9] text-[#205136] font-bold px-2 py-0.5 rounded-full">
                छत्तीसगढ़ शासन
              </span>
            </div>
            <span className="text-[11px] text-[#556955] font-semibold leading-none mt-1 block">
              नगर पालिक निगम रायपुर (Raipur Municipal Corporation)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#4e644e] bg-[#f0f6ed] px-3 py-1.5 rounded-xl border border-[#d8e3d2]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Swachhata Helpline: 1100</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-8 flex flex-col gap-6 text-center">
          {/* Emblem & Title */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] text-[#204e37] flex items-center justify-center shadow-xs">
              <TreePine size={30} />
            </div>
            <h1 className="text-2xl font-black text-[#143826] tracking-tight">WasteLoop CG</h1>
            <p className="text-xs text-[#556955] font-medium max-w-xs">
              Swachh Chhattisgarh Mission · Sign in with Google to report issues, track field squads, or manage city wards
            </p>
          </div>

          {/* Signed Out View - Single Google Sign In Button */}
          <SignedOut>
            <div className="flex flex-col gap-3">
              <SignInButton mode="modal" forceRedirectUrl="/citizen">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 text-[#1f2937] border-2 border-[#d1d5db] font-bold py-3.5 px-6 rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-[#9ca3af] active:scale-[0.99] text-sm cursor-pointer"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </SignInButton>

              <p className="text-[11px] text-[#6b7280]">
                Powered by Clerk Auth · Fast 1-tap sign in
              </p>
            </div>
          </SignedOut>

          {/* Signed In View */}
          <SignedIn>
            <div className="flex flex-col items-center gap-4 bg-[#f0f6ed] p-5 rounded-2xl border border-[#d6dfce]">
              <div className="flex items-center gap-3">
                <UserButton />
                <div className="text-left">
                  <div className="text-sm font-bold text-[#143826]">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress || "Welcome back"}
                  </div>
                  <div className="text-[11px] text-[#4b634b]">
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/citizen")}
                className="w-full bg-[#204e37] hover:bg-[#183d2b] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Citizen App</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </SignedIn>

          {/* Quick Demo Access for Field Squad / Municipal Supervisor */}
          <div className="border-t border-[#e2ebd8] pt-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#556b55] uppercase tracking-wider text-center">
              Direct Role Demo Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => router.push("/citizen")}
                className="py-2.5 px-2 text-xs font-bold text-[#204e37] bg-[#eef6ec] hover:bg-[#dfeede] rounded-xl transition flex flex-col items-center gap-1 border border-[#d2e5cf] cursor-pointer"
              >
                <Smartphone size={16} />
                <span>Citizen</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/field")}
                className="py-2.5 px-2 text-xs font-bold text-[#0369a1] bg-[#e0f2fe] hover:bg-[#bae6fd] rounded-xl transition flex flex-col items-center gap-1 border border-[#bae6fd] cursor-pointer"
              >
                <HardHat size={16} />
                <span>Field Squad</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/supervisor")}
                className="py-2.5 px-2 text-xs font-bold text-[#1e3a8a] bg-[#ede9fe] hover:bg-[#ddd6fe] rounded-xl transition flex flex-col items-center gap-1 border border-[#ddd6fe] cursor-pointer"
              >
                <ShieldCheck size={16} />
                <span>Officer</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Official Govt Footer */}
      <footer className="bg-white border-t border-[#dce5d8] py-4 px-6 text-center text-xs text-[#556955]">
        <p>
          WasteLoop CG · Urban Administration & Development Department, Govt. of Chhattisgarh
        </p>
        <p className="text-[11px] text-[#788e78] mt-0.5">
          Raipur Municipal Corporation (RMC) · Swachh Bharat Mission (Urban)
        </p>
      </footer>
    </div>
  );
}

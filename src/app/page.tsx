"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TreePine,
  Smartphone,
  HardHat,
  ShieldCheck,
  ArrowRight,
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  Building2,
  Sparkles
} from "lucide-react";

type RoleType = "citizen" | "field" | "supervisor";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>("citizen");
  const [identifier, setIdentifier] = useState("9826012345");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setErrorMsg("");
    if (role === "citizen") {
      setIdentifier("9826012345");
      setPassword("123456");
    } else if (role === "field") {
      setIdentifier("squad12@raipur.cg.gov.in");
      setPassword("1212");
    } else {
      setIdentifier("officer.sharma@raipur.cg.gov.in");
      setPassword("admin123");
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg("Please enter your identifier / credentials");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === "citizen") {
        router.push("/citizen");
      } else if (selectedRole === "field") {
        router.push("/field");
      } else {
        router.push("/supervisor");
      }
    }, 400);
  };

  const handleQuickLogin = (role: RoleType) => {
    handleRoleSelect(role);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === "citizen") {
        router.push("/citizen");
      } else if (role === "field") {
        router.push("/field");
      } else {
        router.push("/supervisor");
      }
    }, 200);
  };

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

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#4e644e] bg-[#f0f6ed] px-3 py-1.5 rounded-xl border border-[#d8e3d2]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Swachhata Helpline: 1100</span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-6 md:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] text-[#204e37] flex items-center justify-center shadow-2xs mb-1">
              {selectedRole === "citizen" && <Smartphone size={24} />}
              {selectedRole === "field" && <HardHat size={24} />}
              {selectedRole === "supervisor" && <Building2 size={24} />}
            </div>
            <h1 className="text-2xl font-black text-[#143826] tracking-tight">Single Sign-On</h1>
            <p className="text-xs text-[#556955] font-medium">
              Select your role to access WasteLoop CG
            </p>
          </div>

          {/* 3 Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#f0f5ee] p-1.5 rounded-2xl border border-[#dce6d8]">
            <button
              type="button"
              onClick={() => handleRoleSelect("citizen")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                selectedRole === "citizen"
                  ? "bg-white text-[#204e37] shadow-sm"
                  : "text-[#5e735e] hover:text-[#204e37]"
              }`}
            >
              <Smartphone size={16} />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("field")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                selectedRole === "field"
                  ? "bg-white text-[#204e37] shadow-sm"
                  : "text-[#5e735e] hover:text-[#204e37]"
              }`}
            >
              <HardHat size={16} />
              <span>Field Squad</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("supervisor")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                selectedRole === "supervisor"
                  ? "bg-white text-[#204e37] shadow-sm"
                  : "text-[#5e735e] hover:text-[#204e37]"
              }`}
            >
              <ShieldCheck size={16} />
              <span>Officer</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {errorMsg && (
              <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Identifier input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#2a3c2a] flex items-center justify-between">
                <span>
                  {selectedRole === "citizen" && "Mobile Number / Citizen ID"}
                  {selectedRole === "field" && "Squad ID / Staff Number"}
                  {selectedRole === "supervisor" && "Government Officer Email"}
                </span>
                <span className="text-[10px] text-[#205136] font-semibold">Verified</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-3 rounded-xl border border-[#d6dfce] bg-[#fbfdfa] focus:outline-none focus:ring-2 focus:ring-[#204e37] focus:bg-white transition"
                  placeholder={
                    selectedRole === "citizen"
                      ? "Enter 10-digit mobile number"
                      : selectedRole === "field"
                      ? "e.g. squad12@raipur.cg.gov.in"
                      : "e.g. officer@raipur.cg.gov.in"
                  }
                />
                <User size={15} className="absolute left-3 top-3.5 text-[#6c826c]" />
              </div>
            </div>

            {/* Password / OTP input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#2a3c2a] flex items-center justify-between">
                <span>{selectedRole === "citizen" ? "One-Time Password (OTP)" : "Security Password / PIN"}</span>
                <span className="text-[10px] text-[#5b715b]">Raipur SSO</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-3 rounded-xl border border-[#d6dfce] bg-[#fbfdfa] focus:outline-none focus:ring-2 focus:ring-[#204e37] focus:bg-white transition"
                  placeholder="Enter credential"
                />
                <KeyRound size={15} className="absolute left-3 top-3.5 text-[#6c826c]" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#204e37] hover:bg-[#183d2b] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>
                    {selectedRole === "citizen" && "Open Citizen App"}
                    {selectedRole === "field" && "Open Field Squad Portal"}
                    {selectedRole === "supervisor" && "Open Command Center"}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="border-t border-[#e2ebd8] pt-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#556b55] uppercase tracking-wider text-center">
              Quick Role Access (One-Click)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("citizen")}
                className="py-2 px-1 text-[11px] font-bold text-[#204e37] bg-[#eef6ec] hover:bg-[#dfeede] rounded-xl transition text-center border border-[#d2e5cf]"
              >
                📱 Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("field")}
                className="py-2 px-1 text-[11px] font-bold text-[#0369a1] bg-[#e0f2fe] hover:bg-[#bae6fd] rounded-xl transition text-center border border-[#bae6fd]"
              >
                👷 Squad #12
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("supervisor")}
                className="py-2 px-1 text-[11px] font-bold text-[#1e3a8a] bg-[#ede9fe] hover:bg-[#ddd6fe] rounded-xl transition text-center border border-[#ddd6fe]"
              >
                🏛️ Officer
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

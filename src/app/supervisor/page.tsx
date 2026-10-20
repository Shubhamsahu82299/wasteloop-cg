"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import {
  TreePine,
  Search,
  Bell,
  LayoutDashboard,
  Flag,
  MapPin,
  Recycle,
  Users,
  Flame,
  FileBarChart,
  Settings,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronLeft,
  X,
  Sparkles,
  Building2,
  Clock,
  ShieldCheck,
  RotateCcw,
  Smartphone,
  HardHat,
  Monitor,
  LogOut
} from "lucide-react";
import { CaseItem, CaseStatus, MunicipalTab } from "../types";
import { useWasteLoop } from "../../context/WasteLoopContext";

export default function SupervisorPortalPage() {
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    updateCaseStatus,
    resetDemoData,
    toast
  } = useWasteLoop();

  const [activeTab, setActiveTab] = useState<MunicipalTab>("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMapPin, setSelectedMapPin] = useState<string | null>(activeCaseId);
  const [selectedDrawerCase, setSelectedDrawerCase] = useState<CaseItem | null>(null);

  const totalCount = cases.length + 119;
  const pendingCount = cases.filter((c) => c.status === "Submitted" || c.status === "Under Review").length + 15;
  const inProgressCount = cases.filter((c) => c.status === "In Progress" || c.status === "Assigned").length + 29;
  const resolvedCount = cases.filter((c) => c.status === "Resolved").length + 73;

  const sidebarLinks: { label: MunicipalTab; icon: any }[] = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Complaints", icon: Flag },
    { label: "Map", icon: MapPin },
    { label: "Work Orders", icon: Recycle },
    { label: "Teams", icon: Users },
    { label: "Hotspots", icon: Flame },
    { label: "Reports", icon: FileBarChart },
    { label: "Settings", icon: Settings },
  ];

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f7f2] text-[#1e261e] font-sans flex flex-col">
      {/* Enterprise Municipal Topbar */}
      <nav className="bg-white border-b border-[#e1e7dc] px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-50 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#204e37] flex items-center justify-center text-[#a7f3d0] shadow-xs">
            <TreePine size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[#143826] leading-none">WasteLoop CG</span>
              <span className="text-[10px] bg-[#e8f5e9] text-[#205136] font-bold px-2 py-0.5 rounded-full">
                Raipur Municipal Corporation
              </span>
            </div>
            <span className="text-[11px] text-[#556955] font-semibold tracking-wide">
              Solid Waste Management & Triage Command Centre
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#627762] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#dbe4d6] px-3 py-1.5 rounded-xl transition shadow-2xs"
            title="Log Out"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </Link>

          <button
            onClick={resetDemoData}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#f4f7f2] border border-[#d8e2d4] text-[#556955] hover:bg-[#eaf1e6] transition"
          >
            <RotateCcw size={12} />
            <span>Reset Seed</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#e2e8dd]">
            <div className="w-8 h-8 rounded-xl bg-[#22543d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              MA
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#1a2d1a] leading-none">Municipal Admin</span>
              <span className="text-[10px] text-[#637763] font-medium leading-none mt-1">
                Zone 2 Operations
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Command Dashboard Layout */}
      <div className="flex flex-1">
        {/* Left Navigation Sidebar */}
        <aside className="w-60 bg-white border-r border-[#e1e7dc] p-4 flex flex-col justify-between shrink-0">
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map(({ label, icon: Icon }) => {
              const isActive = activeTab === label;
              return (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    isActive
                      ? "bg-[#204e37] text-white shadow-xs"
                      : "text-[#516351] hover:bg-[#f1f6ed] hover:text-[#193623]"
                  }`}
                >
                  <Icon size={17} className={isActive ? "text-[#a7f3d0]" : "text-[#6b7e6b]"} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Zone Info */}
          <div className="bg-[#f2f7ed] rounded-xl p-3 border border-[#dbe6d3]">
            <span className="text-[10px] font-bold text-[#204e37] uppercase tracking-wider block">Zone Status</span>
            <span className="text-xs font-bold text-[#1d3521] block mt-0.5">Raipur District: Normal</span>
            <span className="text-[10px] text-[#617761] block mt-0.5">70 Wards actively synced</span>
          </div>
        </aside>

        {/* Dashboard Main Content Pane */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-7xl">
          {/* Top Row with Header and Date Range */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#163522]">Overview</h2>
              <span className="text-xs text-[#5f745f]">
                Real-time civic issue triage, field team dispatch, and verified resolutions.
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white border border-[#dce4d7] rounded-xl px-3.5 py-2 shadow-2xs text-xs font-bold text-[#324532]">
              <Calendar size={15} className="text-[#205136]" />
              <span>12 Oct 2024 – 18 Oct 2024</span>
            </div>
          </div>

          {/* 4 Calculated KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#dce5d6] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#667a66]">Total Complaints</span>
                <div className="text-2xl font-bold text-[#142918] mt-1">{totalCount}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-2">
                <ArrowUpRight size={14} />
                <span>+12%</span>
                <span className="text-[10px] font-medium text-[#7d917d] ml-1">vs last week</span>
              </div>
            </div>

            <div className="bg-white border border-[#dce5d6] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#667a66]">Pending Review</span>
                <div className="text-2xl font-bold text-[#142918] mt-1">{pendingCount}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-2">
                <ArrowDownRight size={14} />
                <span>-5%</span>
                <span className="text-[10px] font-medium text-[#7d917d] ml-1">faster triage</span>
              </div>
            </div>

            <div className="bg-white border border-[#dce5d6] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#667a66]">In Progress</span>
                <div className="text-2xl font-bold text-[#142918] mt-1">{inProgressCount}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-sky-700 mt-2">
                <ArrowUpRight size={14} />
                <span>+20%</span>
                <span className="text-[10px] font-medium text-[#7d917d] ml-1">field dispatched</span>
              </div>
            </div>

            <div className="bg-white border border-[#dce5d6] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#667a66]">Resolved</span>
                <div className="text-2xl font-bold text-[#142918] mt-1">{resolvedCount}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-2">
                <ArrowUpRight size={14} />
                <span>+18%</span>
                <span className="text-[10px] font-medium text-[#7d917d] ml-1">verified closed</span>
              </div>
            </div>
          </div>

          {/* Split Content: Complaint Map (Left) + Recent Complaints Table (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Complaint Map */}
            <div className="lg:col-span-7 bg-white border border-[#dce5d6] rounded-2xl p-5 shadow-2xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#1b3420]">Complaint Map</span>
                <span className="text-[11px] font-medium text-[#647964]">Raipur Urban District</span>
              </div>

              {/* Styled Interactive SVG Map */}
              <div className="relative rounded-xl overflow-hidden border border-[#d3ded0] bg-[#e8efe4] h-[350px] flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 500 350" preserveAspectRatio="none">
                  {/* Water Body (Telibandha Lake) */}
                  <path
                    d="M 330,80 C 370,70 410,120 380,160 C 350,190 320,150 330,80 Z"
                    fill="#cae4db"
                    stroke="#b4d6cb"
                    strokeWidth="1.5"
                  />
                  <text x="345" y="125" fill="#4d7c6d" fontSize="9" fontWeight="bold">
                    Telibandha Lake
                  </text>

                  {/* Main Roads */}
                  <line x1="10" y1="175" x2="490" y2="175" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                  <line x1="10" y1="175" x2="490" y2="175" stroke="#cfded0" strokeWidth="1" strokeDasharray="4 4" />

                  <path d="M 60,30 C 140,110 180,260 220,330" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 220,175 C 270,205 330,255 430,330" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                  <line x1="190" y1="30" x2="190" y2="330" stroke="#ffffff" strokeWidth="4" />

                  {/* City Center */}
                  <rect x="235" y="160" width="55" height="22" rx="4" fill="#ffffff" stroke="#c0d1c0" />
                  <text x="245" y="175" fill="#205136" fontSize="10" fontWeight="bold">
                    Raipur
                  </text>

                  <text x="90" y="230" fill="#607760" fontSize="9" fontWeight="600">Sundar Nagar</text>
                  <text x="145" y="90" fill="#607760" fontSize="9" fontWeight="600">Civil Lines</text>
                  <text x="210" y="70" fill="#607760" fontSize="9" fontWeight="600">Shankar Nagar</text>
                  <text x="60" y="80" fill="#607760" fontSize="9" fontWeight="600">Kota Road</text>
                </svg>

                {/* Pins */}
                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0187")}
                  className="absolute top-[200px] left-[110px] -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-125 transition"
                  title="Sundar Nagar (High)"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0185")}
                  className="absolute top-[110px] left-[170px] -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-125 transition"
                  title="Civil Lines (Medium)"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0180")}
                  className="absolute top-[90px] left-[240px] -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-125 transition"
                  title="Shankar Nagar (Medium)"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0175")}
                  className="absolute top-[100px] left-[70px] -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-125 transition"
                  title="Kota Road (Urgent)"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-700 border-2 border-white flex items-center justify-center text-white shadow-md animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0170")}
                  className="absolute top-[240px] left-[320px] -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-125 transition"
                  title="Shankar Nagar Resolved"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                {selectedMapPin && (
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-[#d2dfce] shadow-md max-w-xs text-left z-20">
                    <span className="text-[10px] font-mono font-bold text-[#204e37] block">{selectedMapPin}</span>
                    <strong className="text-xs text-[#1e2f1e] block truncate">
                      {cases.find((c) => c.id === selectedMapPin)?.title}
                    </strong>
                    <span className="text-[10px] text-[#556955] block">
                      {cases.find((c) => c.id === selectedMapPin)?.location}
                    </span>
                    <button
                      onClick={() => {
                        const target = cases.find((c) => c.id === selectedMapPin);
                        if (target) setSelectedDrawerCase(target);
                      }}
                      className="text-[10px] font-bold text-[#204e37] hover:underline mt-1.5 block"
                    >
                      Open Case Triage Drawer →
                    </button>
                  </div>
                )}
              </div>

              {/* Map Legend */}
              <div className="flex items-center justify-between mt-3 text-[11px] text-[#526652]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    High
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Medium
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Low
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#205136]">
                  Active Area: Raipur Ward 12
                </span>
              </div>
            </div>

            {/* Right: Live Complaints Table */}
            <div className="lg:col-span-5 bg-white border border-[#dce5d6] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#1b3420]">Recent Complaints</span>
                  <span className="text-xs text-[#697d69] font-medium">{filteredCases.length} records</span>
                </div>

                <div className="flex flex-col divide-y divide-[#edf2eb]">
                  {filteredCases.map((c) => {
                    const statusBadgeClass =
                      c.status === "Resolved"
                        ? "bg-[#dcfce7] text-[#15803d]"
                        : c.status === "In Progress"
                        ? "bg-[#e0f2fe] text-[#0369a1]"
                        : "bg-[#fef3c7] text-[#92400e]";

                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedDrawerCase(c)}
                        className="py-3 px-1 flex items-center justify-between text-left hover:bg-[#f6f9f3] rounded-xl transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={c.photoUrl}
                            alt={c.title}
                            className="w-12 h-12 rounded-xl object-cover border border-[#d6dfce] shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#1e2f1e] truncate group-hover:text-[#205136]">
                              {c.title}
                            </h4>
                            <span className="text-[11px] text-[#657965] block truncate mt-0.5">
                              {c.location}
                            </span>
                            <span className="text-[10px] text-[#869986] font-mono block">
                              {c.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass}`}>
                            {c.status}
                          </span>
                          <span className="text-[10px] text-[#788c78] font-medium">{c.time}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Info Footer */}
              <div className="bg-[#f2f7ee] border border-[#d8e3d2] rounded-xl p-3 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#205136]" />
                  <span className="text-xs font-semibold text-[#203622]">All field squads transmitting GPS telemetry</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Case Details Slide-Over Drawer */}
      {selectedDrawerCase && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e5ece0]">
              <div>
                <span className="text-xs font-mono font-bold text-[#204e37] bg-[#edf4ea] px-2 py-0.5 rounded">
                  {selectedDrawerCase.id}
                </span>
                <h3 className="text-base font-bold text-[#19321c] mt-1">{selectedDrawerCase.title}</h3>
                <span className="text-xs text-[#596d59]">{selectedDrawerCase.location}</span>
              </div>
              <button
                onClick={() => setSelectedDrawerCase(null)}
                className="w-8 h-8 rounded-full bg-[#f2f6ee] flex items-center justify-center text-[#405440] hover:bg-[#e4edd0]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Details */}
            <div className="flex flex-col gap-4 py-4">
              {/* Site Photos */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#203420]">Photo Evidence</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative rounded-xl overflow-hidden border border-[#d4ded0] h-36">
                    <img src={selectedDrawerCase.photoUrl} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Reported (Before)
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-[#d4ded0] h-36">
                    <img src={selectedDrawerCase.afterPhotoUrl || "/cleaned_street.jpg"} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-[#205136] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Resolved (After)
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Triage Card */}
              <div className="bg-[#f0f7ee] border border-[#d8e5d2] rounded-2xl p-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-[#1c3922] flex items-center gap-1.5">
                  <Sparkles size={15} className="text-[#205136]" />
                  AI Triage & Operations Plan
                </span>
                <p className="text-xs text-[#3d503d] leading-relaxed">
                  {selectedDrawerCase.description}
                </p>
                <div className="text-[11px] text-[#4d634d] pt-1 border-t border-[#dce8d5] flex items-center justify-between">
                  <span>Assigned: <strong>{selectedDrawerCase.recommendedDepartment || "Sanitation Squad"}</strong></span>
                  <span>Priority: <strong className="text-rose-700">{selectedDrawerCase.priority}</strong></span>
                </div>
              </div>

              {/* Supervisor Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-bold text-[#203420]">Supervisor Actions</span>

                {selectedDrawerCase.status !== "Resolved" ? (
                  <button
                    onClick={() => {
                      updateCaseStatus(selectedDrawerCase.id, "Resolved", "Approved by Municipal Supervisor");
                      setSelectedDrawerCase({ ...selectedDrawerCase, status: "Resolved" });
                    }}
                    className="w-full bg-[#204e37] hover:bg-[#183d2b] text-white py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve Resolution & Archive Case</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Case is marked as Resolved & Verified.</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    updateCaseStatus(selectedDrawerCase.id, "In Progress", "Dispatched to alternate squad");
                    setSelectedDrawerCase({ ...selectedDrawerCase, status: "In Progress" });
                  }}
                  className="w-full bg-white border border-[#d5dfcf] hover:bg-[#f6f9f3] text-[#2b412b] py-2.5 rounded-xl font-bold text-xs transition"
                >
                  Dispatch Alternate Field Squad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#204e37] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={18} className="text-[#a7f3d0]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

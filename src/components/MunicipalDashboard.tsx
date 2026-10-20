"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
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
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  CircleAlert
} from "lucide-react";
import { CaseItem, MunicipalTab } from "../app/types";

interface MunicipalDashboardProps {
  cases: CaseItem[];
  activeTab: MunicipalTab;
  setActiveTab: (tab: MunicipalTab) => void;
  onSelectCase: (caseItem: CaseItem) => void;
}

export default function MunicipalDashboard({
  cases,
  activeTab,
  setActiveTab,
  onSelectCase,
}: MunicipalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMapPin, setSelectedMapPin] = useState<string | null>("#WL-2024-0187");

  const totalCount = 124;
  const pendingCount = 18;
  const inProgressCount = 32;
  const resolvedCount = 74;

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
    <div className="w-full min-h-screen bg-[#f4f7f2] text-[#1e261e] font-sans flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-[#e1e7dc] px-6 flex items-center justify-between shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#204e37] flex items-center justify-center text-[#a7f3d0] shadow-sm">
            <TreePine size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#143826] leading-none">WasteLoop CG</span>
            <span className="text-[10px] text-[#556955] font-semibold tracking-wide">Raipur Command Portal</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#768976]" />
          <input
            type="text"
            placeholder="Search complaints, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f6f9f3] border border-[#dce4d7] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#204e37] text-[#202e20]"
          />
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-xl bg-[#f6f9f3] border border-[#dce4d7] flex items-center justify-center text-[#405240] hover:bg-[#edf4e8] relative transition">
            <Bell size={17} />
            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-2 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-[#e2e8dd]">
            <div className="w-9 h-9 rounded-xl bg-[#22543d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              MA
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#1a2d1a] leading-none">Municipal Admin</span>
              <span className="text-[10px] text-[#637763] font-medium leading-none mt-1">
                Raipur Municipal Corporation
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex flex-1 min-h-[580px]">
        {/* Left Sidebar */}
        <aside className="w-56 bg-white border-r border-[#e1e7dc] p-4 flex flex-col justify-between shrink-0">
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

          {/* Sidebar Footer info */}
          <div className="bg-[#f2f7ed] rounded-xl p-3 border border-[#dbe6d3]">
            <span className="text-[10px] font-bold text-[#204e37] uppercase tracking-wider block">Zone Status</span>
            <span className="text-xs font-bold text-[#1d3521] block mt-0.5">Raipur District: Normal</span>
            <span className="text-[10px] text-[#617761] block mt-0.5">70 Wards connected</span>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto max-h-[720px]">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#163522]">Overview</h2>
              <span className="text-xs text-[#5f745f]">Consolidated field reports and municipal routing</span>
            </div>

            <div className="flex items-center gap-2 bg-white border border-[#dce4d7] rounded-xl px-3 py-1.5 shadow-2xs text-xs font-bold text-[#324532]">
              <Calendar size={15} className="text-[#205136]" />
              <span>12 Oct 2024 – 18 Oct 2024</span>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* 1. Total Complaints */}
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

            {/* 2. Pending Review */}
            <div className="bg-white border border-[#dce5d6] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#667a66]">Pending Review</span>
                <div className="text-2xl font-bold text-[#142918] mt-1">{pendingCount}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-2">
                <ArrowDownRight size={14} />
                <span>-5%</span>
                <span className="text-[10px] font-medium text-[#7d917d] ml-1">triage speed up</span>
              </div>
            </div>

            {/* 3. In Progress */}
            <div className="bg-white border border-[#dce5d6] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#667a66]">In Progress</span>
                <div className="text-2xl font-bold text-[#142918] mt-1">{inProgressCount}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-sky-700 mt-2">
                <ArrowUpRight size={14} />
                <span>+20%</span>
                <span className="text-[10px] font-medium text-[#7d917d] ml-1">dispatched</span>
              </div>
            </div>

            {/* 4. Resolved */}
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

          {/* Split Content: Complaint Map (Left) + Recent Complaints (Right) */}
          <div className="grid grid-cols-12 gap-5">
            {/* Left: Complaint Map */}
            <div className="col-span-7 bg-white border border-[#dce5d6] rounded-2xl p-4 shadow-2xs flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#1b3420]">Complaint Map</span>
                <span className="text-[11px] font-medium text-[#647964]">Raipur Urban District</span>
              </div>

              {/* Styled Interactive SVG Map */}
              <div className="relative rounded-xl overflow-hidden border border-[#d3ded0] bg-[#e8efe4] h-[330px] flex items-center justify-center">
                {/* SVG Map of Raipur with roads and lake */}
                <svg className="w-full h-full" viewBox="0 0 500 330" preserveAspectRatio="none">
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

                  {/* Main Arterial Roads */}
                  {/* GE Road */}
                  <line x1="10" y1="160" x2="490" y2="160" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                  <line x1="10" y1="160" x2="490" y2="160" stroke="#cfded0" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Ring Road 1 */}
                  <path
                    d="M 60,30 C 140,110 180,260 220,320"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* VIP Road */}
                  <path
                    d="M 220,160 C 270,190 330,240 430,310"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Shankar Nagar cross road */}
                  <line x1="190" y1="30" x2="190" y2="300" stroke="#ffffff" strokeWidth="4" />

                  {/* City Center Marker */}
                  <rect x="235" y="145" width="55" height="22" rx="4" fill="#ffffff" stroke="#c0d1c0" />
                  <text x="245" y="160" fill="#205136" fontSize="10" fontWeight="bold">
                    Raipur
                  </text>

                  {/* Landmark labels */}
                  <text x="90" y="210" fill="#607760" fontSize="9" fontWeight="600">
                    Sundar Nagar
                  </text>
                  <text x="145" y="90" fill="#607760" fontSize="9" fontWeight="600">
                    Civil Lines
                  </text>
                  <text x="210" y="70" fill="#607760" fontSize="9" fontWeight="600">
                    Shankar Nagar
                  </text>
                  <text x="60" y="80" fill="#607760" fontSize="9" fontWeight="600">
                    Kota Road
                  </text>
                </svg>

                {/* Map Pins overlay with coordinates */}
                {/* Pin 1: Sundar Nagar (High - Red) */}
                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0187")}
                  className="absolute top-[180px] left-[110px] -translate-x-1/2 -translate-y-1/2 z-10 transition hover:scale-125"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                {/* Pin 2: Civil Lines (Medium - Amber) */}
                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0185")}
                  className="absolute top-[110px] left-[170px] -translate-x-1/2 -translate-y-1/2 z-10 transition hover:scale-125"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                {/* Pin 3: Shankar Nagar (Medium - Amber) */}
                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0180")}
                  className="absolute top-[90px] left-[240px] -translate-x-1/2 -translate-y-1/2 z-10 transition hover:scale-125"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                {/* Pin 4: Kota Road (Urgent - Rose) */}
                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0175")}
                  className="absolute top-[100px] left-[70px] -translate-x-1/2 -translate-y-1/2 z-10 transition hover:scale-125"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-700 border-2 border-white flex items-center justify-center text-white shadow-md animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                {/* Pin 5: Shankar Nagar Resolved (Low - Emerald) */}
                <button
                  onClick={() => setSelectedMapPin("#WL-2024-0170")}
                  className="absolute top-[220px] left-[320px] -translate-x-1/2 -translate-y-1/2 z-10 transition hover:scale-125"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </button>

                {/* Pin Details tooltip if active */}
                {selectedMapPin && (
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-[#d2dfce] shadow-md max-w-xs text-left z-20">
                    <span className="text-[10px] font-mono font-bold text-[#204e37] block">{selectedMapPin}</span>
                    <strong className="text-xs text-[#1e2f1e] block truncate">
                      {cases.find((c) => c.id === selectedMapPin)?.title}
                    </strong>
                    <span className="text-[10px] text-[#556955] block">
                      {cases.find((c) => c.id === selectedMapPin)?.location}
                    </span>
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
                <button className="text-[11px] font-bold text-[#205136] hover:underline">
                  Filter Wards
                </button>
              </div>
            </div>

            {/* Right: Recent Complaints List */}
            <div className="col-span-5 bg-white border border-[#dce5d6] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#1b3420]">Recent Complaints</span>
                  <button className="text-xs font-bold text-[#205136] hover:underline">View All</button>
                </div>

                <div className="flex flex-col divide-y divide-[#edf2eb]">
                  {filteredCases.slice(0, 4).map((c) => {
                    const statusBadgeClass =
                      c.status === "Resolved"
                        ? "bg-[#dcfce7] text-[#15803d]"
                        : c.status === "In Progress"
                        ? "bg-[#e0f2fe] text-[#0369a1]"
                        : "bg-[#fef3c7] text-[#92400e]";

                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelectCase(c)}
                        className="py-2.5 px-1 flex items-center justify-between text-left hover:bg-[#f6f9f3] rounded-lg transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={c.photoUrl}
                            alt={c.title}
                            className="w-10 h-10 rounded-lg object-cover border border-[#d6dfce] shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#1e2f1e] truncate group-hover:text-[#205136]">
                              {c.title}
                            </h4>
                            <span className="text-[10px] text-[#657965] block truncate">
                              {c.location}
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

              {/* Quick Batch Routing Banner */}
              <div className="bg-[#f2f7ee] border border-[#d8e3d2] rounded-xl p-3 flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#205136]" />
                  <span className="text-xs font-semibold text-[#203622]">Auto-dispatch active for Ward 12</span>
                </div>
                <button className="text-[11px] font-bold text-[#205136] hover:underline">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

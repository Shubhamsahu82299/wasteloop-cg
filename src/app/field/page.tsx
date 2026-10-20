"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import {
  TreePine,
  Bell,
  ChevronLeft,
  MoreVertical,
  Plus,
  CheckCircle2,
  ListTodo,
  MapPin,
  Sparkles,
  User,
  ArrowRight,
  Check,
  Smartphone,
  Monitor,
  RotateCcw,
  LogOut,
  Clock,
  Truck,
  ShieldCheck,
  CheckCheck
} from "lucide-react";
import { FieldScreen } from "../types";
import { useWasteLoop } from "../../context/WasteLoopContext";

export default function FieldTeamPage() {
  const {
    cases,
    activeCase,
    setActiveCaseId,
    completeFieldTask,
    resetDemoData,
    toast
  } = useWasteLoop();

  const [currentScreen, setCurrentScreen] = useState<FieldScreen>("tasks");
  const [filterTab, setFilterTab] = useState<"All" | "In Progress" | "Completed">("All");
  const [wasteAmount, setWasteAmount] = useState<number>(activeCase.wasteCollectedKg || 50);
  const [taskNotes, setTaskNotes] = useState<string>(
    activeCase.notes || "Area cleaned. Bin overflow was the main reason. Additional bin recommended."
  );
  const [activeStepChecklist, setActiveStepChecklist] = useState<boolean[]>([true, true, false, false]);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState("/cleaned_street.jpg");

  const filteredTasks = cases.filter((t) => {
    if (filterTab === "In Progress") return t.status === "In Progress" || t.status === "Assigned";
    if (filterTab === "Completed") return t.status === "Resolved";
    return true;
  });

  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAfterPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkCompleted = () => {
    completeFieldTask(activeCase.id, wasteAmount, taskNotes, afterPhotoUrl);
    setTimeout(() => {
      setCurrentScreen("tasks");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f3f7f1] text-[#1c241c] font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-[#dce5d8] px-4 md:px-10 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen("tasks")}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#204e37] flex items-center justify-center text-[#a7f3d0] shadow-xs">
              <TreePine size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[#143826] leading-none">WasteLoop Field</span>
                <span className="text-[10px] bg-[#e0f2fe] text-[#0369a1] font-bold px-2 py-0.5 rounded-full">
                  Squad #12
                </span>
              </div>
              <span className="text-[11px] text-[#556955] font-semibold leading-none mt-1 block">
                Ward 12 · Raipur Municipal Sanitation Squad
              </span>
            </div>
          </button>
        </div>

        {/* Center Shift Telemetry */}
        <div className="hidden md:flex items-center gap-4 bg-[#f0f5ee] px-4 py-1.5 rounded-2xl border border-[#dce6d8] text-xs font-semibold">
          <div className="flex items-center gap-2 text-[#204e37]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shift 1 (07:00 - 15:00) Active</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1.5 text-[#556955]">
            <Truck size={14} className="text-[#0369a1]" />
            <span>Vehicle: CG-04-E-8821</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-[#143826] leading-none">Rajesh Kumar</span>
            <span className="text-[10px] text-[#556955] leading-none mt-0.5">Squad Lead</span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-white border border-[#d8e3d2] flex items-center justify-center text-[#374537] relative shadow-2xs">
            <Bell size={16} />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#556955] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#d8e3d2] px-3 py-2 rounded-xl transition shadow-2xs"
            title="Log Out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </header>

      {/* Main Responsive Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        {/* ================= SCREEN 6: TEAM TASK LIST ================= */}
        {currentScreen === "tasks" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Header & Status Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-3xl border border-[#d8e3d2] p-6 shadow-xs">
              <div>
                <h1 className="text-2xl font-black text-[#143826]">Sanitation Task Queue</h1>
                <p className="text-xs text-[#556955] font-medium mt-0.5">
                  Assigned complaints routed by Municipal Command AI for Ward 12, Raipur
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#f0f5ee] p-1.5 rounded-2xl border border-[#dce6d8]">
                {(["All", "In Progress", "Completed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      filterTab === tab
                        ? "bg-white text-[#204e37] shadow-xs"
                        : "text-[#556955] hover:text-[#204e37]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setActiveCaseId(task.id);
                    setCurrentScreen("instructions");
                  }}
                  className="bg-white rounded-3xl border border-[#d8e3d2] p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={task.photoUrl}
                      alt={task.title}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#d8e3d2]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#204e37]">
                          {task.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.priority === "Urgent"
                              ? "bg-rose-100 text-rose-700"
                              : task.priority === "High"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#e8f5e9] text-[#204e37]"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#143826] truncate mt-1">
                        {task.title}
                      </h3>
                      <p className="text-xs text-[#556955] flex items-center gap-1 mt-1 truncate">
                        <MapPin size={12} className="text-[#204e37] shrink-0" />
                        <span className="truncate">{task.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#f0f4ee] flex items-center justify-between text-xs">
                    <span className="text-[#637763] font-medium">
                      {task.distance || "1.2 km"} · ETA {task.eta || "20 min"}
                    </span>
                    <span className="font-bold text-[#204e37] group-hover:translate-x-1 transition flex items-center gap-1">
                      Start Task →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SCREEN 7: WORK INSTRUCTIONS ================= */}
        {currentScreen === "instructions" && (
          <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-6 md:p-8 flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#e6eee1] pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen("tasks")}
                  className="w-9 h-9 rounded-xl bg-[#f0f5ee] hover:bg-[#e4edd0] flex items-center justify-center text-[#204e37] transition cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-black text-[#143826]">Task Details & Instructions</h1>
                  <p className="text-xs text-[#556955] font-mono">{activeCase.id} · {activeCase.location}</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-[#fee2e2] text-[#991b1b] px-3 py-1 rounded-full">
                {activeCase.priority} Priority
              </span>
            </div>

            {/* Site Image & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden border border-[#d8e3d2] h-52 relative">
                <img
                  src={activeCase.photoUrl}
                  alt={activeCase.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                  Reported Site Photo
                </span>
              </div>

              <div className="bg-[#f8faf7] border border-[#d8e3d2] rounded-2xl p-5 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#204e37] uppercase tracking-wider block">Issue Details</span>
                  <h3 className="text-base font-bold text-[#143826] mt-1">{activeCase.title}</h3>
                  <p className="text-xs text-[#556955] mt-1">{activeCase.description}</p>
                </div>

                <div className="pt-2 border-t border-[#e2ebd8] flex items-center justify-between text-xs font-semibold text-[#556955]">
                  <span>Distance: {activeCase.distance || "1.2 km"}</span>
                  <span className="text-[#204e37]">Depot: Telibandha</span>
                </div>
              </div>
            </div>

            {/* AI Action Checklist */}
            <div className="bg-[#fbfdfa] border border-[#d8e3d2] rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#143826]">
                <Sparkles size={16} className="text-[#204e37]" />
                <span>AI Sanitation Protocol Checklist (Complete all before submission)</span>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                {(activeCase.steps || [
                  "Wear mandatory PPE gloves & high-visibility safety jackets",
                  "Collect bulk garbage into tipper vehicle CG-04-E-8821",
                  "Sweep and clear surrounding pavement within 15 meters",
                  "Disinfect the area and capture clear After photo"
                ]).map((step, idx) => {
                  const isChecked = activeStepChecklist[idx];
                  return (
                    <button
                      key={step}
                      onClick={() => {
                        const updated = [...activeStepChecklist];
                        updated[idx] = !updated[idx];
                        setActiveStepChecklist(updated);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#e2ebd8] bg-white hover:bg-[#f5f9f2] transition text-left cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition shrink-0 ${
                          isChecked
                            ? "bg-[#204e37] text-white"
                            : "border-2 border-[#ccd8c6] text-[#697d69]"
                        }`}
                      >
                        {isChecked ? <Check size={14} strokeWidth={3} /> : idx + 1}
                      </div>
                      <span className={`text-xs ${isChecked ? "text-[#143826] font-bold line-through opacity-75" : "text-[#374b37] font-medium"}`}>
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Work Action */}
            <button
              onClick={() => setCurrentScreen("progress")}
              className="w-full bg-[#204e37] hover:bg-[#183d2b] text-white py-4 rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Work Finished · Upload Evidence & Close Task</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ================= SCREEN 8: SUBMIT EVIDENCE ================= */}
        {currentScreen === "progress" && (
          <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-6 md:p-8 flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#e6eee1] pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen("instructions")}
                  className="w-9 h-9 rounded-xl bg-[#f0f5ee] hover:bg-[#e4edd0] flex items-center justify-center text-[#204e37] transition cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-black text-[#143826]">Submit Cleanup Evidence</h1>
                  <p className="text-xs text-[#556955]">Record after photo and logged waste weight</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-[#e0f2fe] text-[#0369a1] px-3 py-1 rounded-full">
                Final Step
              </span>
            </div>

            {/* Side-by-Side Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#d8e3d2] h-48">
                <img src={activeCase.photoUrl} alt="Before" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Before Cleanup
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[#d8e3d2] h-48 bg-gray-50 flex items-center justify-center">
                <img src={afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-[#204e37] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  After Cleanup Evidence
                </span>
                <label className="absolute top-2 right-2 bg-white/90 hover:bg-white text-[#204e37] text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs cursor-pointer border border-[#d8e3d2]">
                  Retake Photo
                  <input type="file" accept="image/*" onChange={handleAfterPhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Waste Weight Logging */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#143826]">Total Waste Collected (Kilograms)</label>
              <div className="bg-[#f8faf7] border border-[#d6dfce] rounded-2xl px-4 py-3 flex items-center justify-between">
                <input
                  type="number"
                  value={wasteAmount}
                  onChange={(e) => setWasteAmount(Number(e.target.value))}
                  className="text-lg font-black text-[#143826] bg-transparent focus:outline-none w-36"
                />
                <span className="text-xs font-bold text-[#556955] bg-white border border-[#d8e3d2] px-3 py-1.5 rounded-xl">
                  Kilograms (KG)
                </span>
              </div>
            </div>

            {/* Field Notes */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#143826]">Sanitation Team Remarks</label>
              <textarea
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                rows={2}
                className="w-full text-xs p-3.5 rounded-2xl border border-[#d8e3d2] focus:outline-none focus:ring-2 focus:ring-[#204e37]"
                placeholder="Disinfected area, bin emptied, clear for traffic..."
              />
            </div>

            {/* Submit CTA */}
            <button
              onClick={handleMarkCompleted}
              className="w-full bg-[#204e37] hover:bg-[#183d2b] text-white py-4 rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={18} />
              <span>Mark as Completed & Sync with Command Center</span>
            </button>
          </div>
        )}
      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-[#dce5d8] py-4 px-6 md:px-12 text-center text-xs text-[#556955] mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WasteLoop Field Squad Portal · Raipur Municipal Corporation (RMC)</span>
          <span>Shift Dispatch: Central Control Room 1100</span>
        </div>
      </footer>
    </div>
  );
}

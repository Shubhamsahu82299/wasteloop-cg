"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import {
  Bell,
  ChevronLeft,
  MoreVertical,
  Plus,
  CheckCircle2,
  Trash2,
  ListTodo,
  MapPin,
  Clock,
  Sparkles,
  Camera,
  Weight,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react";
import { CaseItem, FieldScreen } from "../app/types";

interface FieldAppProps {
  currentScreen: FieldScreen;
  setScreen: (screen: FieldScreen) => void;
  cases: CaseItem[];
  activeTask: CaseItem;
  setActiveTaskId: (id: string) => void;
  onCompleteTask: (taskId: string, wasteKg: number, notes: string) => void;
  standalone?: boolean;
}

export default function FieldApp({
  currentScreen,
  setScreen,
  cases,
  activeTask,
  setActiveTaskId,
  onCompleteTask,
  standalone = true,
}: FieldAppProps) {
  const [filterTab, setFilterTab] = useState<"All" | "In Progress" | "Completed">("All");
  const [wasteAmount, setWasteAmount] = useState<number>(activeTask.wasteCollectedKg || 50);
  const [taskNotes, setTaskNotes] = useState<string>(
    activeTask.notes || "Area cleaned. Bin overflow was the main reason. Additional bin recommended."
  );
  const [taskCompletedToast, setTaskCompletedToast] = useState(false);
  const [activeStepChecklist, setActiveStepChecklist] = useState<boolean[]>([true, true, false, false]);

  const filteredTasks = cases.filter((t) => {
    if (filterTab === "In Progress") return t.status === "In Progress" || t.status === "Assigned";
    if (filterTab === "Completed") return t.status === "Resolved" || t.status === "Awaiting Verification";
    return true;
  });

  const handleMarkCompleted = () => {
    onCompleteTask(activeTask.id, wasteAmount, taskNotes);
    setTaskCompletedToast(true);
    setTimeout(() => {
      setTaskCompletedToast(false);
      setScreen("tasks");
    }, 1200);
  };

  const phoneContent = (
    <div className="flex flex-col h-full bg-[#f8faf7] text-[#1c241c] select-none font-sans relative overflow-hidden">
      {/* Top Status Bar */}
      <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs font-semibold text-[#2d372d] z-30 shrink-0">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] tracking-tight">5G</span>
          <div className="w-5 h-2.5 border border-[#2d372d] rounded-sm p-0.5 flex items-center">
            <div className="w-3 h-full bg-[#2d372d] rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Main Screen Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
        {/* ================= SCREEN 6: TEAM TASK LIST (MY TASKS) ================= */}
        {currentScreen === "tasks" && (
          <div className="px-5 pt-1 pb-6 flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#163824]">My Tasks</h1>
                <span className="text-[10px] text-[#556955] font-medium">Ward 12 Sanitation Squad · Raipur</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#374537] relative shadow-2xs">
                <Bell size={16} />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2">
              {[
                { label: "All (5)", key: "All" },
                { label: "In Progress (2)", key: "In Progress" },
                { label: "Completed", key: "Completed" },
              ].map((tab) => {
                const isActive = filterTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                      isActive
                        ? "bg-[#204e37] text-white shadow-xs"
                        : "bg-white text-[#526352] border border-[#dce5d7] hover:bg-[#f1f6ed]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Task Cards List */}
            <div className="flex flex-col gap-2.5">
              {filteredTasks.map((task) => {
                const isUrgent = task.priority === "Urgent" || task.priority === "High";
                return (
                  <button
                    key={task.id}
                    onClick={() => {
                      setActiveTaskId(task.id);
                      setScreen("instructions");
                    }}
                    className="bg-white hover:bg-[#f4f8f1] border border-[#dbe4d6] rounded-2xl p-3 flex gap-3 text-left transition shadow-2xs group"
                  >
                    <img
                      src={task.photoUrl}
                      alt={task.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#d2dfcf] group-hover:scale-105 transition"
                    />
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-xs font-bold text-[#1a2d1a] truncate">{task.category}</h3>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                              isUrgent ? "bg-[#fee2e2] text-[#991b1b]" : "bg-[#fef3c7] text-[#92400e]"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#58735b] font-medium block mt-0.5">
                          {task.id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#617361] mt-1">
                        <span className="flex items-center gap-1 truncate max-w-[130px]">
                          <MapPin size={11} className="text-[#205136] shrink-0" />
                          <span className="truncate">{task.location}</span>
                        </span>
                        <span className="shrink-0 font-medium text-[#465c49]">
                          {task.distance || "2 km"} · {task.eta || "30 min"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= SCREEN 7: WORK INSTRUCTIONS (TASK DETAILS) ================= */}
        {currentScreen === "instructions" && (
          <div className="px-5 pt-1 pb-6 flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setScreen("tasks")}
                className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-base font-bold text-[#1b3d2b]">Task Details</h2>
              <div className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]">
                <MoreVertical size={16} />
              </div>
            </div>

            {/* Badges & ID row */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-[#e8f5e9] text-[#22543d] px-2.5 py-1 rounded-full">
                {activeTask.category}
              </span>
              <span className="text-xs font-bold bg-[#fee2e2] text-[#991b1b] px-2.5 py-1 rounded-full">
                {activeTask.priority}
              </span>
            </div>

            {/* Title & Location */}
            <div>
              <div className="text-sm font-mono font-bold text-[#1b3420]">{activeTask.id}</div>
              <p className="text-xs text-[#526652] mt-0.5">
                {activeTask.location} · <span className="font-semibold text-[#1e482b]">{activeTask.distance || "2 km"} away</span>
              </p>
            </div>

            {/* Large Site Photo */}
            <div className="rounded-2xl overflow-hidden border border-[#d2ded0] h-44 shadow-2xs">
              <img
                src={activeTask.photoUrl}
                alt={activeTask.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* AI Suggested Steps */}
            <div className="bg-white border border-[#d8e3d2] rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
              <span className="text-xs font-bold text-[#1c3220] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#205136]" />
                AI Suggested Steps
              </span>

              <div className="flex flex-col gap-2.5">
                {(activeTask.steps || [
                  "Collect garbage using vehicle",
                  "Clean surrounding area",
                  "Check bin capacity",
                  "Take after photo"
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
                      className="flex items-center gap-3 text-left group"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition shrink-0 ${
                          isChecked
                            ? "bg-[#204e37] text-white"
                            : "border-2 border-[#ccd8c6] text-[#697d69]"
                        }`}
                      >
                        {isChecked ? <Check size={14} strokeWidth={3} /> : idx + 1}
                      </div>
                      <span className={`text-xs ${isChecked ? "text-[#1d3521] font-semibold" : "text-[#4a5e4b]"}`}>
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Work CTA Button */}
            <button
              onClick={() => setScreen("progress")}
              className="w-full mt-1 bg-[#204e37] hover:bg-[#183d2b] text-white py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Start Work</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ================= SCREEN 8: SUBMIT EVIDENCE (UPDATE PROGRESS) ================= */}
        {currentScreen === "progress" && (
          <div className="px-5 pt-1 pb-6 flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen("instructions")}
                className="w-8 h-8 rounded-full bg-white border border-[#e1e8dc] flex items-center justify-center text-[#2d372d]"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-base font-bold text-[#1b3d2b]">Update Progress</h2>
            </div>

            {/* Photo Upload Section: Side by Side Before & After */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#203420]">Photo upload</label>
              <div className="grid grid-cols-3 gap-2">
                {/* Before Photo */}
                <div className="relative rounded-xl overflow-hidden border border-[#d2dfce] h-24">
                  <img src={activeTask.photoUrl} alt="Before" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Before
                  </span>
                </div>

                {/* After Photo */}
                <div className="relative rounded-xl overflow-hidden border border-[#d2dfce] h-24">
                  <img src="/cleaned_street.jpg" alt="After" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-[#205136] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    After
                  </span>
                </div>

                {/* Add Photo Button */}
                <label className="rounded-xl border-2 border-dashed border-[#ccd8c4] bg-white hover:bg-[#f3f7ef] flex flex-col items-center justify-center cursor-pointer text-[#486348] transition h-24">
                  <Plus size={22} />
                  <span className="text-[10px] font-medium mt-0.5">Add</span>
                </label>
              </div>
            </div>

            {/* Waste Collected (approx) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#203420]">Waste Collected (approx.)</label>
              <div className="bg-white border border-[#d6dfce] rounded-xl px-3 py-2.5 flex items-center justify-between shadow-2xs">
                <input
                  type="number"
                  value={wasteAmount}
                  onChange={(e) => setWasteAmount(Number(e.target.value))}
                  className="text-sm font-bold text-[#1b301c] w-28 focus:outline-none"
                />
                <span className="text-xs font-bold text-[#627662]">kg</span>
              </div>
            </div>

            {/* Notes (optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#203420]">Notes (optional)</label>
              <textarea
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 border border-[#d6dfce] rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#204e37] leading-relaxed"
                placeholder="Describe observations, bin replacement needs, or obstacles..."
              />
            </div>

            {/* Mark as Completed CTA */}
            <button
              onClick={handleMarkCompleted}
              className="w-full mt-2 bg-[#204e37] hover:bg-[#183d2b] text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
            >
              Mark as Completed
            </button>
          </div>
        )}
      </div>

      {/* Field Team Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e2e8de] flex items-center justify-around px-2 z-20">
        <button
          onClick={() => setScreen("tasks")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
            currentScreen === "tasks" || currentScreen === "instructions" || currentScreen === "progress"
              ? "text-[#205136]"
              : "text-[#788878] hover:text-[#205136]"
          }`}
        >
          <ListTodo size={19} />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => {}}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#788878] hover:text-[#205136] transition"
        >
          <MapPin size={19} />
          <span>Map</span>
        </button>

        <button
          onClick={() => {}}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#788878] hover:text-[#205136] transition"
        >
          <User size={19} />
          <span>Profile</span>
        </button>
      </div>

      {/* Completion Toast */}
      {taskCompletedToast && (
        <div className="absolute inset-x-4 top-14 bg-[#205136] text-white p-3 rounded-xl flex items-center gap-2.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-xs font-bold">
          <CheckCircle2 size={18} className="text-emerald-300" />
          <span>Task marked as Completed! Evidence logged.</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#f8faf7] shadow-xl flex flex-col relative border-x border-[#e3ebdf]">
      {phoneContent}
    </div>
  );
}

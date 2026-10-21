"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TreePine,
  ChevronLeft,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { FieldScreen } from "../types";
import { StaffComplaintRecord, toStaffCase } from "@/lib/complaint-view";
import { MAX_EVIDENCE_SIZE_BYTES } from "@/lib/evidence-file";
import { isWasteRelatedCivicIssue } from "@/lib/civic-issues";

export default function FieldTeamPage() {
  const [staffCases, setStaffCases] = useState<ReturnType<typeof toStaffCase>[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<FieldScreen>("tasks");
  const [filterTab, setFilterTab] = useState<"All" | "In Progress" | "Completed">("All");
  const [wasteAmount, setWasteAmount] = useState<number>(0);
  const [taskNotes, setTaskNotes] = useState<string>("");
  const [activeStepChecklist, setActiveStepChecklist] = useState<boolean[]>([true, true, false, false]);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState("");
  const [afterPhotoFile, setAfterPhotoFile] = useState<File | null>(null);
  const [uploadedAfterPhotoFor, setUploadedAfterPhotoFor] = useState<string | null>(null);

  const activeCase =
    staffCases.find((task) => task.id === selectedTaskId) ?? staffCases[0] ?? null;
  const requiresWasteWeight = activeCase
    ? isWasteRelatedCivicIssue(activeCase.category)
    : false;

  const reloadTasks = async () => {
    const response = await fetch("/api/staff/complaints", { cache: "no-store" });
    const result = (await response.json()) as { complaints?: StaffComplaintRecord[]; error?: string };
    if (!response.ok) throw new Error(result.error || "Unable to load assigned tasks.");
    const tasks = (result.complaints ?? []).map(toStaffCase);
    setStaffCases(tasks);
    setSelectedTaskId((current) =>
      current && tasks.some((task) => task.id === current) ? current : tasks[0]?.id ?? null,
    );
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/staff/complaints", { cache: "no-store" });
        const result = (await response.json()) as { complaints?: StaffComplaintRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to load assigned tasks.");
        if (!cancelled) {
          const tasks = (result.complaints ?? []).map(toStaffCase);
          setStaffCases(tasks);
          setSelectedTaskId(tasks[0]?.id ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Unable to load assigned tasks.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTasks = staffCases.filter((t) => {
    if (filterTab === "In Progress") return t.status === "In Progress" || t.status === "Assigned";
    if (filterTab === "Completed") return t.status === "Awaiting Verification" || t.status === "Resolved";
    return true;
  });

  const updateTaskStatus = async (status: "IN_PROGRESS" | "AWAITING_VERIFICATION") => {
    if (!activeCase) {
      setActionError("Select an assigned complaint before updating its status.");
      return;
    }
    setActionError(null);
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/staff/complaints/${encodeURIComponent(activeCase.id.replace(/^#/, ""))}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            note: status === "IN_PROGRESS" ? "Field team started work." : "Field work submitted for verification.",
            ...(status === "AWAITING_VERIFICATION"
              ? {
                  completionNotes: taskNotes,
                  ...(requiresWasteWeight ? { wasteCollectedKg: wasteAmount } : {}),
                }
              : {}),
          }),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to update the task.");
      await reloadTasks();
      if (status === "IN_PROGRESS") setCurrentScreen("instructions");
      else setCurrentScreen("tasks");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update the task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > MAX_EVIDENCE_SIZE_BYTES
      ) {
        setActionError("Choose a JPEG, PNG, or WebP photo that is 4 MB or smaller.");
        e.target.value = "";
        return;
      }
      setActionError(null);
      setAfterPhotoFile(file);
      setUploadedAfterPhotoFor(null);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAfterPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkCompleted = async () => {
    if (!activeCase) {
      setActionError("Select an assigned complaint before submitting work.");
      return;
    }
    const requiredChecklistCount = activeCase.steps?.length ?? 4;
    if (!activeStepChecklist.slice(0, requiredChecklistCount).every(Boolean)) {
      setActionError("Complete every field checklist step before submitting the work.");
      return;
    }
    if (!afterPhotoUrl && !activeCase.afterPhotoUrl) {
      setActionError("Upload a completion photo before submitting the work.");
      return;
    }
    if (afterPhotoFile && uploadedAfterPhotoFor !== activeCase.id) {
      setActionError(null);
      setIsSaving(true);
      try {
        const formData = new FormData();
        formData.set("type", "AFTER");
        formData.set("file", afterPhotoFile);
        const response = await fetch(
          `/api/complaints/${encodeURIComponent(activeCase.id.replace(/^#/, ""))}/evidence`,
          { method: "POST", body: formData },
        );
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to save the after photo.");
        setUploadedAfterPhotoFor(activeCase.id);
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "Unable to save the after photo.");
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }
    await updateTaskStatus("AWAITING_VERIFICATION");
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
              </div>
              <span className="text-[11px] text-[#556955] font-semibold leading-none mt-1 block">
                Municipal complaint assignments
              </span>
            </div>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-[#143826] leading-none">Field worker</span>
            <span className="text-[10px] text-[#556955] leading-none mt-0.5">Team-scoped queue</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#556955] hover:text-[#204e37] bg-white border border-[#d8e3d2] px-3 py-2 rounded-xl transition shadow-2xs"
            title="Portal home"
          >
            <ChevronLeft size={15} />
            <span className="hidden sm:inline">Portal home</span>
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
                <h1 className="text-2xl font-black text-[#143826]">Civic Service Task Queue</h1>
                <p className="text-xs text-[#556955] font-medium mt-0.5">
                  Tasks assigned to your field team
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

            {isLoading && <p className="rounded-xl bg-white p-4 text-sm text-[#556955]">Loading assigned tasks…</p>}
            {loadError && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{loadError}</p>}
            {actionError && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{actionError}</p>}
            {!isLoading && !loadError && filteredTasks.length === 0 && (
              <p className="rounded-xl bg-white p-4 text-sm text-[#556955]">
                No assigned complaints in this view. Ask a supervisor to assign a complaint to your team.
              </p>
            )}

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setWasteAmount(task.wasteCollectedKg ?? 0);
                    setTaskNotes(task.notes ?? "");
                    setAfterPhotoFile(null);
                    setAfterPhotoUrl("");
                    setUploadedAfterPhotoFor(null);
                    setCurrentScreen("instructions");
                  }}
                  className="bg-white rounded-3xl border border-[#d8e3d2] p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5">
                    {task.photoUrl ? (
                      <img src={task.photoUrl} alt={task.title} className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#d8e3d2]" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[#f0f5ee] shrink-0 border border-[#d8e3d2] flex items-center justify-center text-[10px] text-[#556955]">
                        No photo
                      </div>
                    )}
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
                      {task.status} · Updated {task.time}
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
        {currentScreen === "instructions" && activeCase && (
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
                  <span>Ward: {activeCase.ward || "Not recorded"}</span>
                  <span className="text-[#204e37]">{activeCase.recommendedDepartment ?? "Assigned team"}</span>
                </div>
              </div>
            </div>

            {/* AI Action Checklist */}
            <div className="bg-[#fbfdfa] border border-[#d8e3d2] rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#143826]">
                <Sparkles size={16} className="text-[#204e37]" />
                <span>Work checklist (complete all steps before submission)</span>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                {(activeCase.steps || [
                  "Review the reported issue and confirm the site details",
                  "Follow the safety procedure for this type of work",
                  "Complete the assigned repair or public service",
                  "Record the outcome and capture a completion photo"
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
              disabled={isSaving || (activeCase.status !== "Assigned" && activeCase.status !== "In Progress")}
              onClick={() => {
                if (activeCase.status === "Assigned") void updateTaskStatus("IN_PROGRESS");
                else setCurrentScreen("progress");
              }}
              className="w-full bg-[#204e37] hover:bg-[#183d2b] text-white py-4 rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{activeCase.status === "Assigned" ? "Start Field Work" : "Work Finished · Submit for Verification"}</span>
              <ArrowRight size={18} />
            </button>
            {actionError && <p role="alert" className="text-sm text-rose-700">{actionError}</p>}
          </div>
        )}

        {/* ================= SCREEN 8: SUBMIT EVIDENCE ================= */}
        {currentScreen === "progress" && activeCase && (
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
                  <h1 className="text-xl font-black text-[#143826]">Submit Work Evidence</h1>
                  <p className="text-xs text-[#556955]">Record a completion photo and work notes</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-[#e0f2fe] text-[#0369a1] px-3 py-1 rounded-full">
                Final Step
              </span>
            </div>

            {/* Side-by-Side Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#d8e3d2] h-48">
                {activeCase.photoUrl ? (
                  <img src={activeCase.photoUrl} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#f8faf7] text-xs text-[#556955]">
                    No before photo saved
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Before Work
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[#d8e3d2] h-48 bg-gray-50 flex items-center justify-center">
                {afterPhotoUrl || activeCase.afterPhotoUrl ? (
                  <img src={afterPhotoUrl || activeCase.afterPhotoUrl} alt="After preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#556955]">
                    Select after photo
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-[#204e37] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Completion Evidence
                </span>
                <label className="absolute top-2 right-2 bg-white/90 hover:bg-white text-[#204e37] text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs cursor-pointer border border-[#d8e3d2]">
                  Retake Photo
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAfterPhotoUpload} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-[#556955]">
                After photos are stored privately and can only be viewed by the complaint owner and assigned municipal staff.
              </p>
            </div>

            {requiresWasteWeight && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#143826]">Total Waste Collected (Kilograms)</label>
                <div className="bg-[#f8faf7] border border-[#d6dfce] rounded-2xl px-4 py-3 flex items-center justify-between">
                  <input
                    type="number"
                    min={0}
                    max={100000}
                    value={wasteAmount}
                    onChange={(e) => setWasteAmount(Number(e.target.value))}
                    className="text-lg font-black text-[#143826] bg-transparent focus:outline-none w-36"
                  />
                  <span className="text-xs font-bold text-[#556955] bg-white border border-[#d8e3d2] px-3 py-1.5 rounded-xl">
                    Kilograms (KG)
                  </span>
                </div>
              </div>
            )}

            {/* Completion notes */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#143826]">Work completed / follow-up notes</label>
              <textarea
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                rows={2}
                className="w-full text-xs p-3.5 rounded-2xl border border-[#d8e3d2] focus:outline-none focus:ring-2 focus:ring-[#204e37]"
                placeholder="Describe the repair or service completed and any follow-up needed..."
              />
            </div>

            {/* Submit CTA */}
            <button
              onClick={() => void handleMarkCompleted()}
              disabled={
                isSaving ||
                !taskNotes.trim() ||
                (requiresWasteWeight && (wasteAmount < 0 || wasteAmount > 100000)) ||
                (!afterPhotoUrl && !activeCase.afterPhotoUrl) ||
                !activeStepChecklist.slice(0, activeCase.steps?.length ?? 4).every(Boolean)
              }
              className="w-full bg-[#204e37] hover:bg-[#183d2b] text-white py-4 rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              <span>{isSaving ? "Saving…" : "Submit Work for Verification"}</span>
            </button>
            {actionError && <p role="alert" className="text-sm text-rose-700">{actionError}</p>}
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

"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import CitizenApp from "./CitizenApp";
import FieldApp from "./FieldApp";
import MunicipalDashboard from "./MunicipalDashboard";
import { AppMode, CaseItem, CitizenScreen, FieldScreen, MunicipalTab } from "../app/types";
import { ExternalLink, Sparkles } from "lucide-react";

interface ShowcaseMatrixProps {
  cases: CaseItem[];
  activeCase: CaseItem;
  setActiveCaseId: (id: string) => void;
  onNavigateToScreen: (mode: AppMode, screen?: any) => void;
  onSubmitNewCase: (newCase: Partial<CaseItem>) => void;
  onFeedbackSubmit: (caseId: string, resolved: boolean, comment: string) => void;
  onCompleteTask: (taskId: string, wasteKg: number, notes: string) => void;
}

export default function ShowcaseMatrix({
  cases,
  activeCase,
  setActiveCaseId,
  onNavigateToScreen,
  onSubmitNewCase,
  onFeedbackSubmit,
  onCompleteTask,
}: ShowcaseMatrixProps) {
  return (
    <div className="w-full flex flex-col gap-10 py-6 px-4 max-w-[1700px] mx-auto animate-in fade-in duration-300">
      {/* SECTION 1: CITIZEN APP (MOBILE) - SCREENS 1 TO 5 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#d8e3d2] pb-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-[#163823]">Citizen App (Mobile)</h2>
            <span className="text-xs bg-[#e8f5e9] text-[#205136] font-bold px-2.5 py-0.5 rounded-full">
              Screens 1 – 5
            </span>
          </div>
          <p className="text-xs text-[#5a6f5a]">
            Interactive mobile citizen reporting lifecycle from complaint submission to AI triage and resolution feedback.
          </p>
        </div>

        {/* 5 Mobile Screens in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 justify-items-center">
          {/* Screen 1: Home */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-full max-w-[290px] h-[580px] rounded-[38px] border-[6px] border-[#1c221c] bg-[#f8faf7] shadow-xl overflow-hidden relative transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1c221c] rounded-b-xl z-40" />
              <div className="scale-[0.82] origin-top h-[700px] -mt-1 pointer-events-auto">
                <CitizenApp
                  currentScreen="home"
                  setScreen={(s) => onNavigateToScreen("citizen", s)}
                  cases={cases}
                  activeCase={activeCase}
                  setActiveCaseId={setActiveCaseId}
                  onSubmitNewCase={onSubmitNewCase}
                  onFeedbackSubmit={onFeedbackSubmit}
                  standalone={false}
                />
              </div>
            </div>
            <button
              onClick={() => onNavigateToScreen("citizen", "home")}
              className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 mt-1"
            >
              <span>1. Home</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Screen 2: Report Issue */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-full max-w-[290px] h-[580px] rounded-[38px] border-[6px] border-[#1c221c] bg-[#f8faf7] shadow-xl overflow-hidden relative transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1c221c] rounded-b-xl z-40" />
              <div className="scale-[0.82] origin-top h-[700px] -mt-1 pointer-events-auto">
                <CitizenApp
                  currentScreen="report"
                  setScreen={(s) => onNavigateToScreen("citizen", s)}
                  cases={cases}
                  activeCase={activeCase}
                  setActiveCaseId={setActiveCaseId}
                  onSubmitNewCase={onSubmitNewCase}
                  onFeedbackSubmit={onFeedbackSubmit}
                  standalone={false}
                />
              </div>
            </div>
            <button
              onClick={() => onNavigateToScreen("citizen", "report")}
              className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 mt-1"
            >
              <span>2. Report Issue</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Screen 3: AI Analysis & Confirmation */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-full max-w-[290px] h-[580px] rounded-[38px] border-[6px] border-[#1c221c] bg-[#f8faf7] shadow-xl overflow-hidden relative transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1c221c] rounded-b-xl z-40" />
              <div className="scale-[0.82] origin-top h-[700px] -mt-1 pointer-events-auto">
                <CitizenApp
                  currentScreen="confirm"
                  setScreen={(s) => onNavigateToScreen("citizen", s)}
                  cases={cases}
                  activeCase={activeCase}
                  setActiveCaseId={setActiveCaseId}
                  onSubmitNewCase={onSubmitNewCase}
                  onFeedbackSubmit={onFeedbackSubmit}
                  standalone={false}
                />
              </div>
            </div>
            <button
              onClick={() => onNavigateToScreen("citizen", "confirm")}
              className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 mt-1"
            >
              <span>3. AI Analysis & Confirmation</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Screen 4: Track Status */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-full max-w-[290px] h-[580px] rounded-[38px] border-[6px] border-[#1c221c] bg-[#f8faf7] shadow-xl overflow-hidden relative transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1c221c] rounded-b-xl z-40" />
              <div className="scale-[0.82] origin-top h-[700px] -mt-1 pointer-events-auto">
                <CitizenApp
                  currentScreen="track"
                  setScreen={(s) => onNavigateToScreen("citizen", s)}
                  cases={cases}
                  activeCase={activeCase}
                  setActiveCaseId={setActiveCaseId}
                  onSubmitNewCase={onSubmitNewCase}
                  onFeedbackSubmit={onFeedbackSubmit}
                  standalone={false}
                />
              </div>
            </div>
            <button
              onClick={() => onNavigateToScreen("citizen", "track")}
              className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 mt-1"
            >
              <span>4. Track Status</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* Screen 5: Resolution & Feedback */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-full max-w-[290px] h-[580px] rounded-[38px] border-[6px] border-[#1c221c] bg-[#f8faf7] shadow-xl overflow-hidden relative transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#1c221c] rounded-b-xl z-40" />
              <div className="scale-[0.82] origin-top h-[700px] -mt-1 pointer-events-auto">
                <CitizenApp
                  currentScreen="feedback"
                  setScreen={(s) => onNavigateToScreen("citizen", s)}
                  cases={cases}
                  activeCase={activeCase}
                  setActiveCaseId={setActiveCaseId}
                  onSubmitNewCase={onSubmitNewCase}
                  onFeedbackSubmit={onFeedbackSubmit}
                  standalone={false}
                />
              </div>
            </div>
            <button
              onClick={() => onNavigateToScreen("citizen", "feedback")}
              className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 mt-1"
            >
              <span>5. Resolution & Feedback</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: FIELD TEAM APP & MUNICIPAL DASHBOARD */}
      <div className="flex flex-col gap-4 pt-6 border-t border-[#d8e3d2]">
        <div className="flex items-center justify-between border-b border-[#d8e3d2] pb-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-[#163823]">
              Field Team App (Mobile) & Municipal Dashboard (Web)
            </h2>
            <span className="text-xs bg-[#e0f2fe] text-[#0369a1] font-bold px-2.5 py-0.5 rounded-full">
              Screens 6 – 9
            </span>
          </div>
          <p className="text-xs text-[#5a6f5a]">
            On-ground worker task execution flow alongside central municipal authority command center.
          </p>
        </div>

        {/* Bottom Row Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Field App 3 Screens (col-span-6 on XL) */}
          <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
            {/* Screen 6: Team Task List */}
            <div className="flex flex-col items-center gap-2 group w-full">
              <div className="w-full max-w-[270px] h-[540px] rounded-[36px] border-[6px] border-[#1c221c] bg-[#f8faf7] shadow-xl overflow-hidden relative transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-[#1c221c] rounded-b-xl z-40" />
                <div className="scale-[0.78] origin-top h-[690px] -mt-1 pointer-events-auto">
                  <FieldApp
                    currentScreen="tasks"
                    setScreen={(s) => onNavigateToScreen("field", s)}
                    cases={cases}
                    activeTask={activeCase}
                    setActiveTaskId={setActiveCaseId}
                    onCompleteTask={onCompleteTask}
                    standalone={false}
                  />
                </div>
              </div>
              <button
                onClick={() => onNavigateToScreen("field", "tasks")}
                className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 mt-1"
              >
                <span>6. Team Task List</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {/* Screen 7: Work Instructions */}
            <div className="flex flex-col items-center gap-2 group w-full">
              <div className="w-full max-w-[270px] h-[540px] rounded-[36px] border-[6px] border-[#1c221c] bg-[#f8faf7] shadow-xl overflow-hidden relative transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-[#1c221c] rounded-b-xl z-40" />
                <div className="scale-[0.78] origin-top h-[690px] -mt-1 pointer-events-auto">
                  <FieldApp
                    currentScreen="instructions"
                    setScreen={(s) => onNavigateToScreen("field", s)}
                    cases={cases}
                    activeTask={activeCase}
                    setActiveTaskId={setActiveCaseId}
                    onCompleteTask={onCompleteTask}
                    standalone={false}
                  />
                </div>
              </div>
              <button
                onClick={() => onNavigateToScreen("field", "instructions")}
                className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 mt-1"
              >
                <span>7. Work Instructions</span>
                <ExternalLink size={12} />
              </button>
            </div>

            {/* Screen 8: Submit Evidence */}
            <div className="flex flex-col items-center gap-2 group w-full">
              <div className="w-full max-w-[270px] h-[540px] rounded-[36px] border-[6px] border-[#1c221c] bg-[#f8faf7] shadow-xl overflow-hidden relative transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-[#1c221c] rounded-b-xl z-40" />
                <div className="scale-[0.78] origin-top h-[690px] -mt-1 pointer-events-auto">
                  <FieldApp
                    currentScreen="progress"
                    setScreen={(s) => onNavigateToScreen("field", s)}
                    cases={cases}
                    activeTask={activeCase}
                    setActiveTaskId={setActiveCaseId}
                    onCompleteTask={onCompleteTask}
                    standalone={false}
                  />
                </div>
              </div>
              <button
                onClick={() => onNavigateToScreen("field", "progress")}
                className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 mt-1"
              >
                <span>8. Submit Evidence</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Screen 9: Municipal Dashboard (col-span-7 on XL) */}
          <div className="xl:col-span-7 flex flex-col gap-2 group">
            <div className="h-[540px] overflow-hidden rounded-3xl shadow-xl border border-[#d6dfce] bg-white transition duration-300 hover:shadow-2xl">
              <div className="scale-[0.78] origin-top-left w-[128%] h-[690px] pointer-events-auto">
                <MunicipalDashboard
                  cases={cases}
                  activeTab="Overview"
                  setActiveTab={() => onNavigateToScreen("municipal")}
                  onSelectCase={(c) => {
                    setActiveCaseId(c.id);
                    onNavigateToScreen("citizen", "track");
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => onNavigateToScreen("municipal")}
              className="text-xs font-bold text-[#1e3422] group-hover:text-[#205136] flex items-center gap-1 self-center mt-1"
            >
              <span>9. Municipal Dashboard (Web)</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

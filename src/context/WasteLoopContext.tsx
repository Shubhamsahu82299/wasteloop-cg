"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CaseItem, Priority, CaseStatus } from "../app/types";
import { initialCases } from "../app/data";

const STORAGE_KEY = "wasteloop-cg-v4-state";

interface WasteLoopContextType {
  cases: CaseItem[];
  activeCaseId: string;
  setActiveCaseId: (id: string) => void;
  activeCase: CaseItem;
  createComplaint: (data: Partial<CaseItem>) => string;
  updateCaseStatus: (id: string, status: CaseStatus, note?: string) => void;
  completeFieldTask: (id: string, wasteKg: number, notes: string, afterPhotoUrl?: string) => void;
  submitCitizenFeedback: (id: string, resolved: boolean, comment: string) => void;
  resetDemoData: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const WasteLoopContext = createContext<WasteLoopContextType | undefined>(undefined);

export function WasteLoopProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseItem[]>(initialCases);
  const [activeCaseId, setActiveCaseId] = useState<string>("#WL-2024-0187");
  const [toast, setToast] = useState<string | null>(null);

  // Rehydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCases(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const persistCases = (updated: CaseItem[]) => {
    setCases(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  };

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0] || initialCases[0];

  const createComplaint = (data: Partial<CaseItem>): string => {
    const newId = `#WL-2024-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const nowStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const newCase: CaseItem = {
      id: newId,
      title: data.title || "Waste issue near roadside",
      category: data.category || "Garbage & Dumping",
      description: data.description || "Reported through WasteLoop Citizen App.",
      location: data.location || "Sundar Nagar, Raipur",
      ward: data.ward || "Ward 12",
      priority: data.priority || "High",
      status: "In Progress",
      time: "Just now",
      createdAt: `${dateStr}, ${nowStr}`,
      photoUrl: data.photoUrl || "/garbage_pile.jpg",
      afterPhotoUrl: "/cleaned_street.jpg",
      distance: "1.8 km",
      eta: "25 min",
      possibleCause: data.possibleCause || "Missed collection or overflow due to insufficient bins.",
      recommendedDepartment: data.recommendedDepartment || "Municipal Sanitation Team",
      suggestedAction: data.suggestedAction || "Send collection vehicle and clean the area. Check if additional bins are needed.",
      steps: [
        "Collect garbage using vehicle",
        "Clean surrounding area",
        "Check bin capacity",
        "Take after photo"
      ],
      wasteCollectedKg: 45,
      notes: "Auto-dispatched to Ward 12 field squad.",
      timeline: [
        { status: "Submitted", timestamp: nowStr, completed: true },
        { status: "Under Review", timestamp: nowStr, completed: true },
        { status: "Assigned to Sanitation Team", timestamp: nowStr, completed: true },
        { status: "In Progress", timestamp: "Team reached location", completed: false, active: true, subtext: "Team reached location" },
        { status: "Awaiting Verification", timestamp: "Pending cleanup signoff", completed: false },
        { status: "Resolved", timestamp: "Final check & archive", completed: false }
      ]
    };

    const nextCases = [newCase, ...cases];
    persistCases(nextCases);
    setActiveCaseId(newId);
    showToast(`Complaint ${newId} logged & dispatched to Ward 12 team!`);
    return newId;
  };

  const updateCaseStatus = (id: string, status: CaseStatus, note?: string) => {
    const nextCases = cases.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status,
          time: "Just now",
          timeline: c.timeline.map((step) => {
            if (step.status.toLowerCase().includes(status.toLowerCase())) {
              return { ...step, completed: true, active: false };
            }
            return step;
          })
        };
      }
      return c;
    });
    persistCases(nextCases);
    showToast(`Case ${id} status updated to ${status}`);
  };

  const completeFieldTask = (id: string, wasteKg: number, notes: string, afterPhotoUrl?: string) => {
    const nextCases = cases.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: "Resolved" as const,
          wasteCollectedKg: wasteKg,
          notes,
          afterPhotoUrl: afterPhotoUrl || c.afterPhotoUrl || "/cleaned_street.jpg",
          time: "Just now",
          timeline: c.timeline.map((s) => ({ ...s, completed: true, active: false }))
        };
      }
      return c;
    });
    persistCases(nextCases);
    showToast(`Task ${id} completed! ${wasteKg} kg waste logged with photo evidence.`);
  };

  const submitCitizenFeedback = (id: string, resolved: boolean, comment: string) => {
    const nextCases = cases.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: resolved ? ("Resolved" as const) : c.status,
          feedback: { resolved, comment }
        };
      }
      return c;
    });
    persistCases(nextCases);
    showToast("Feedback recorded and shared with Raipur Municipal Corporation!");
  };

  const resetDemoData = () => {
    persistCases(initialCases);
    setActiveCaseId("#WL-2024-0187");
    showToast("System reset to initial live seed data.");
  };

  return (
    <WasteLoopContext.Provider
      value={{
        cases,
        activeCaseId,
        setActiveCaseId,
        activeCase,
        createComplaint,
        updateCaseStatus,
        completeFieldTask,
        submitCitizenFeedback,
        resetDemoData,
        toast,
        showToast
      }}
    >
      {children}
    </WasteLoopContext.Provider>
  );
}

export function useWasteLoop() {
  const context = useContext(WasteLoopContext);
  if (!context) {
    throw new Error("useWasteLoop must be used within WasteLoopProvider");
  }
  return context;
}

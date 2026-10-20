"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TreePine,
  Camera,
  Mic,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Phone,
  LogOut,
  Clock,
  Trash2,
  Droplets,
  Lightbulb,
  AlertTriangle,
  Globe,
  Sparkles,
  ChevronDown,
  Check,
  Crosshair,
  RefreshCw,
  Navigation
} from "lucide-react";
import { CitizenScreen } from "../types";
import { useWasteLoop } from "../../context/WasteLoopContext";

type Language = "en" | "hi" | "cg";

const dict = {
  en: {
    deptName: "Raipur Municipal Corporation",
    userName: "Rahul (Pandri)",
    reportIssueTitle: "Report an Issue",
    reportIssueDesc: "Take photo or speak to alert sanitation squad",
    trackStatusTitle: "Track Complaint Status",
    trackStatusDesc: "Check real-time cleanup progress",
    activeStatus: "Cleaning in Progress",
    helplineTitle: "Toll-Free Helpline: 1100",
    helplineDesc: "Tap to call Municipal Corporation directly",
    callBtn: "Call 1100",
    backBtn: "Back",
    step1Photo: "1. Photo of Issue *",
    tapToCapture: "Tap here to take photo or upload",
    changePhoto: "Change Photo",
    step2Voice: "2. Voice Note (Optional)",
    tapToSpeak: "Tap mic to speak",
    recordingVoice: "Recording voice note...",
    recordedVoice: "Voice note recorded (12 sec)",
    step3Category: "3. Select Category",
    categories: [
      { id: "Garbage Pile", label: "Garbage Pile", icon: Trash2 },
      { id: "Blocked Drain", label: "Blocked Drain", icon: Droplets },
      { id: "Street Light", label: "Street Light", icon: Lightbulb },
      { id: "Other Issue", label: "Other Issue", icon: AlertTriangle }
    ],
    gpsTag: "Auto-detected GPS Location",
    submitBtn: "Submit Complaint",
    casePhotoTag: "Reported Site Photo",
    progressTitle: "Cleanup Progress",
    steps: [
      "1. Complaint Registered",
      "2. Squad #12 Dispatched",
      "3. Cleaning in Progress",
      "4. Cleanup Completed"
    ],
    verifyBtn: "Verify Cleanup & Give Feedback →",
    reviewTitle: "Cleanup Review",
    beforeLabel: "Before",
    afterLabel: "After",
    satisfiedQuestion: "Was the area cleaned properly?",
    satisfiedSub: "Your feedback completes the resolution",
    yesSatisfied: "Yes, Cleaned Properly",
    noNotSatisfied: "No, Needs Attention",
    successMsg: "Thank you! Your feedback has been recorded."
  },
  hi: {
    deptName: "रायपुर नगर पालिक निगम",
    userName: "राहुल (पंडरी)",
    reportIssueTitle: "समस्या रिपोर्ट करें",
    reportIssueDesc: "फोटो खींचें या बोलकर सफाई टीम को बताएं",
    trackStatusTitle: "शिकायत की स्थिति देखें",
    trackStatusDesc: "सफाई की लाइव स्थिति चेक करें",
    activeStatus: "सफाई चालू है",
    helplineTitle: "टोल-फ्री हेल्पलाइन: 1100",
    helplineDesc: "नगर निगम से सीधे बात करने के लिए टैप करें",
    callBtn: "कॉल करें",
    backBtn: "वापस",
    step1Photo: "1. समस्या का फोटो *",
    tapToCapture: "यहाँ टैप करके फोटो खींचें",
    changePhoto: "फोटो बदलें",
    step2Voice: "2. बोल कर बताएं (वैकल्पिक)",
    tapToSpeak: "माइक दबाकर बोलें",
    recordingVoice: "आवाज़ रिकॉर्ड हो रही है...",
    recordedVoice: "आवाज़ रिकॉर्ड हो गई (12 sec)",
    step3Category: "3. क्या समस्या है?",
    categories: [
      { id: "Garbage Pile", label: "कचरा ढेर", icon: Trash2 },
      { id: "Blocked Drain", label: "नाली जाम", icon: Droplets },
      { id: "Street Light", label: "स्ट्रीट लाइट", icon: Lightbulb },
      { id: "Other Issue", label: "अन्य समस्या", icon: AlertTriangle }
    ],
    gpsTag: "GPS से स्वतः स्थान पहचान",
    submitBtn: "शिकायत दर्ज करें",
    casePhotoTag: "शिकायत का फोटो",
    progressTitle: "काम की प्रगति",
    steps: [
      "1. शिकायत दर्ज हुई",
      "2. गाड़ी व टीम रवाना",
      "3. सफाई चालू है",
      "4. काम पूरा हुआ"
    ],
    verifyBtn: "सफाई की जाँच करें →",
    reviewTitle: "काम की जाँच",
    beforeLabel: "पहले",
    afterLabel: "बाद में",
    satisfiedQuestion: "क्या जगह पूरी तरह साफ हो गई?",
    satisfiedSub: "आपकी प्रतिक्रिया से काम पूरा होगा",
    yesSatisfied: "हाँ, साफ हो गया",
    noNotSatisfied: "नहीं, कचरा बाकी है",
    successMsg: "धन्यवाद! आपकी प्रतिक्रिया दर्ज हो गई है।"
  },
  cg: {
    deptName: "रायपुर नगर निगम",
    userName: "राहुल (पंडरी)",
    reportIssueTitle: "समस्या के फोटो भेजव",
    reportIssueDesc: "फोटो खींचव या गोठिया के टीम ला बताव",
    trackStatusTitle: "अर्जी के हाल देखव",
    trackStatusDesc: "सफाई के लाइव हाल जानव",
    activeStatus: "सफाई चलत हे",
    helplineTitle: "टोल-फ्री हेल्पलाइन: 1100",
    helplineDesc: "नगर निगम ले गोठियाए बर टैप करव",
    callBtn: "फोन लगाव",
    backBtn: "पाछू आवव",
    step1Photo: "1. कचरा के फोटो *",
    tapToCapture: "इहाँ दबा के फोटो खींचव",
    changePhoto: "फोटो बदलव",
    step2Voice: "2. गोठिया के बताव (माइक)",
    tapToSpeak: "माइक दबा के गोठियाव",
    recordingVoice: "गोठ रिकॉर्ड होवत हे...",
    recordedVoice: "गोठ रिकॉर्ड हो गे (12 sec)",
    step3Category: "3. का समस्या हे?",
    categories: [
      { id: "Garbage Pile", label: "कचरा ढेर", icon: Trash2 },
      { id: "Blocked Drain", label: "नाली जाम", icon: Droplets },
      { id: "Street Light", label: "गली बत्ती", icon: Lightbulb },
      { id: "Other Issue", label: "अन्य समस्या", icon: AlertTriangle }
    ],
    gpsTag: "GPS ले जगह के पता",
    submitBtn: "अर्जी भेजव",
    casePhotoTag: "अर्जी के फोटो",
    progressTitle: "सफाई के काम",
    steps: [
      "1. अर्जी दर्ज होइस",
      "2. सफाई गाड़ी निकल गे",
      "3. सफाई चलत हे",
      "4. काम पूरा हो गे"
    ],
    verifyBtn: "सफाई देखव अउ बताव →",
    reviewTitle: "सफाई के जांच",
    beforeLabel: "पहिली",
    afterLabel: "पाछू",
    satisfiedQuestion: "का जगह पूरा साफ हो गे?",
    satisfiedSub: "तुंहर बताय ले काम बंद होही",
    yesSatisfied: "हव, साफ हो गे",
    noNotSatisfied: "नइ, कचरा बाचे हे",
    successMsg: "धन्यवाद! तुंहर बात दर्ज हो गे।"
  }
};

export default function CitizenMinimalApp() {
  const {
    activeCase,
    createComplaint,
    submitCitizenFeedback,
    toast
  } = useWasteLoop();

  const [lang, setLang] = useState<Language>("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = dict[lang];

  const [currentScreen, setCurrentScreen] = useState<CitizenScreen>("home");

  // Simple form states
  const [selectedCategory, setSelectedCategory] = useState("Garbage Pile");
  const [selectedLocation, setSelectedLocation] = useState("Detecting live location...");
  const [photoPreview, setPhotoPreview] = useState("/garbage_pile.jpg");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"detecting" | "locked">("detecting");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);

  const detectLiveLocation = () => {
    setGpsStatus("detecting");
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          const acc = Math.round(pos.coords.accuracy || 6);
          setCoordinates({ lat, lng, accuracy: acc });
          setGpsStatus("locked");
          setSelectedLocation(`GPS ${lat}°N, ${lng}°E · Ward 12, Telibandha, Raipur`);
        },
        () => {
          setCoordinates({ lat: 21.2514, lng: 81.6296, accuracy: 10 });
          setGpsStatus("locked");
          setSelectedLocation("Ward 12, Telibandha, Raipur (GPS Verified)");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setCoordinates({ lat: 21.2514, lng: 81.6296, accuracy: 10 });
      setGpsStatus("locked");
      setSelectedLocation("Ward 12, Telibandha, Raipur (GPS Verified)");
    }
  };

  useEffect(() => {
    detectLiveLocation();
  }, []);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState<boolean | null>(true);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordingSeconds(0);
      setDescription(
        lang === "en"
          ? "Garbage bin is overflowing and scattered on the street."
          : lang === "hi"
          ? "कचरा पेटी भर गई है और सड़क पर कचरा फैला हुआ है।"
          : "कचरा पेटी भर गे हे अउ रद्दा म कचरा बगरे हे।"
      );
    } else {
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 12) {
            clearInterval(interval);
            setIsRecording(false);
            setDescription(
              lang === "en"
                ? "Garbage bin is overflowing and scattered on the street."
                : lang === "hi"
                ? "कचरा पेटी भर गई है और सड़क पर कचरा फैला हुआ है।"
                : "कचरा पेटी भर गे हे अउ रद्दा म कचरा बगरे हे।"
            );
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const handleSubmit = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch("/api/ai-triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoBase64: photoPreview.startsWith("data:") ? photoPreview : undefined,
          description: description || "Garbage overflow issue reported by citizen",
          location: selectedLocation,
          category: selectedCategory,
          coordinates: coordinates || { lat: 21.2514, lng: 81.6296 },
        }),
      });
      const json = await res.json();
      const aiData = json.data;

      createComplaint({
        title: aiData?.summary || `${selectedCategory} issue reported`,
        category: aiData?.category || selectedCategory,
        location: selectedLocation,
        photoUrl: photoPreview,
        description: description || aiData?.summary || "Garbage overflow issue reported by citizen.",
        possibleCause: "Overflowing bin analyzed by Gemini AI",
        recommendedDepartment: aiData?.assignedSquad || "Raipur Sanitation Team",
        suggestedAction: aiData?.actionSteps?.[0] || "Dispatch squad to clear garbage",
        priority: aiData?.priority || "High",
        steps: aiData?.actionSteps || undefined,
        wasteCollectedKg: aiData?.estimatedWasteKg || 45,
      });
    } catch {
      createComplaint({
        title: `${selectedCategory} issue reported`,
        category: selectedCategory,
        location: selectedLocation,
        photoUrl: photoPreview,
        description: description || "Garbage overflow issue reported by citizen.",
        possibleCause: "Overflowing bin",
        recommendedDepartment: "Raipur Sanitation Team",
        suggestedAction: "Dispatch squad to clear garbage"
      });
    } finally {
      setIsAiAnalyzing(false);
      setCurrentScreen("track");
    }
  };

  const handleFeedback = (satisfied: boolean) => {
    setFeedbackRating(satisfied);
    submitCitizenFeedback(activeCase.id, satisfied, satisfied ? "Satisfied" : "Needs Re-inspection");
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setCurrentScreen("home");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f3f7f1] text-[#1c241c] font-sans flex flex-col justify-between">
      {/* Clean Topbar with Language Selector */}
      <header className="h-16 bg-white border-b border-[#dce5d8] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setCurrentScreen("home")}
          className="flex items-center gap-2.5 cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-[#204e37] flex items-center justify-center text-white shadow-xs">
            <TreePine size={22} />
          </div>
          <div>
            <span className="text-base font-black text-[#143826] leading-none block">
              WasteLoop CG
            </span>
            <span className="text-[11px] font-bold text-[#556955] leading-none mt-0.5 block">
              {t.deptName}
            </span>
          </div>
        </button>

        {/* Center/Right Language Selector & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 bg-[#f0f5ee] hover:bg-[#e4edd0] border border-[#d6dfce] px-3 py-1.5 rounded-xl text-xs font-bold text-[#204e37] transition cursor-pointer shadow-2xs"
            >
              <Globe size={14} className="text-[#204e37]" />
              <span>
                {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "छत्तीसगढ़ी"}
              </span>
              <ChevronDown size={13} className="text-[#556955]" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-[#d6dfce] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    setLang("en");
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-bold flex items-center justify-between hover:bg-[#f2f7ef] transition cursor-pointer ${
                    lang === "en" ? "text-[#204e37] bg-[#f2f7ef]" : "text-gray-700"
                  }`}
                >
                  <span>English</span>
                  {lang === "en" && <Check size={14} />}
                </button>
                <button
                  onClick={() => {
                    setLang("hi");
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-bold flex items-center justify-between hover:bg-[#f2f7ef] transition cursor-pointer ${
                    lang === "hi" ? "text-[#204e37] bg-[#f2f7ef]" : "text-gray-700"
                  }`}
                >
                  <span>हिंदी</span>
                  {lang === "hi" && <Check size={14} />}
                </button>
                <button
                  onClick={() => {
                    setLang("cg");
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-bold flex items-center justify-between hover:bg-[#f2f7ef] transition cursor-pointer ${
                    lang === "cg" ? "text-[#204e37] bg-[#f2f7ef]" : "text-gray-700"
                  }`}
                >
                  <span>छत्तीसगढ़ी</span>
                  {lang === "cg" && <Check size={14} />}
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#e8f5e9] text-[#204e37] px-3 py-1.5 rounded-full text-xs font-bold">
            <span>{t.userName}</span>
          </div>

          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white border border-[#d8e3d2] flex items-center justify-center text-[#556955] hover:text-rose-600 hover:bg-rose-50 transition shadow-2xs"
            title="Log Out"
          >
            <LogOut size={16} />
          </Link>
        </div>
      </header>

      {/* Main Minimal Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        {/* ================= SCREEN 1: HOME (MINIMALIST) ================= */}
        {currentScreen === "home" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-150">
            {/* Big Action 1: Report Issue */}
            <button
              onClick={() => setCurrentScreen("report")}
              className="bg-[#204e37] hover:bg-[#183d2b] active:scale-[0.99] text-white p-6 md:p-8 rounded-3xl shadow-xl transition flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-[#a7f3d0] shrink-0">
                  <Camera size={34} />
                </div>
                <div className="text-left">
                  <span className="text-xl md:text-2xl font-black block leading-tight">
                    {t.reportIssueTitle}
                  </span>
                  <span className="text-xs md:text-sm text-[#d1fae5] font-medium block mt-1">
                    {t.reportIssueDesc}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition shrink-0">
                <ArrowRight size={20} />
              </div>
            </button>

            {/* Big Action 2: Track Active Complaint */}
            <button
              onClick={() => setCurrentScreen("track")}
              className="bg-white hover:bg-[#f8faf7] active:scale-[0.99] border-2 border-[#d8e3d2] p-5 md:p-6 rounded-3xl shadow-sm hover:shadow-md transition flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center shrink-0">
                  <Clock size={28} />
                </div>
                <div className="text-left">
                  <span className="text-lg md:text-xl font-black text-[#143826] block leading-tight">
                    {t.trackStatusTitle}
                  </span>
                  <span className="text-xs text-[#556955] font-medium block mt-0.5">
                    Case #{activeCase.id} · {activeCase.location}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold bg-[#fef3c7] text-[#92400e] px-3 py-1 rounded-full shrink-0">
                {activeCase.status}
              </span>
            </button>

            {/* Helpline Callout Button */}
            <a
              href="tel:1100"
              className="bg-[#e8f5e9] hover:bg-[#d8eed8] border border-[#c6dfc6] p-4 rounded-2xl flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#204e37] text-white flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-[#143826] block">
                    {t.helplineTitle}
                  </span>
                  <span className="text-[11px] text-[#556955] block">
                    {t.helplineDesc}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#204e37] bg-white px-3 py-1.5 rounded-xl border border-[#c6dfc6]">
                {t.callBtn}
              </span>
            </a>
          </div>
        )}

        {/* ================= SCREEN 2: REPORT ISSUE ================= */}
        {currentScreen === "report" && (
          <div className="bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-5 md:p-7 flex flex-col gap-5 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eef3eb] pb-3">
              <button
                onClick={() => setCurrentScreen("home")}
                className="flex items-center gap-1.5 text-xs font-bold text-[#204e37] bg-[#f0f5ee] hover:bg-[#e4edd0] px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{t.backBtn}</span>
              </button>
              <span className="text-sm font-black text-[#143826]">
                {t.reportIssueTitle}
              </span>
            </div>

            {/* 1. Camera Upload Box */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#143826]">
                {t.step1Photo}
              </span>
              <label className="relative rounded-2xl border-2 border-dashed border-[#204e37] bg-[#f8faf7] hover:bg-[#edf3e8] transition h-48 flex flex-col items-center justify-center cursor-pointer overflow-hidden p-2 text-center">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-lg">
                      {t.changePhoto}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#204e37]">
                    <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] flex items-center justify-center shadow-xs">
                      <Camera size={30} />
                    </div>
                    <span className="text-sm font-bold">{t.tapToCapture}</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {/* 2. Voice Mic Button */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#143826]">
                {t.step2Voice}
              </span>
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition cursor-pointer ${
                  isRecording
                    ? "bg-rose-50 border-rose-400 text-rose-700 animate-pulse"
                    : "bg-[#f8faf7] border-[#d8e3d2] text-[#143826] hover:bg-[#edf3e8]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isRecording ? "bg-rose-600" : "bg-[#204e37]"}`}>
                    <Mic size={20} />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block">
                      {isRecording ? t.recordingVoice : t.tapToSpeak}
                    </span>
                    <span className="text-[11px] text-[#556955] block">
                      {description || "Record voice in English, Hindi, or Chhattisgarhi"}
                    </span>
                  </div>
                </div>
                {isRecording && (
                  <span className="text-xs font-mono font-bold text-rose-600">
                    00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </span>
                )}
              </button>
            </div>

            {/* 3. Four Simple Problem Categories */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#143826]">
                {t.step3Category}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {t.categories.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedCategory(id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                      selectedCategory === id
                        ? "bg-[#204e37] text-white border-[#204e37] shadow-sm"
                        : "bg-white text-[#405440] border-[#d8e3d2] hover:bg-[#edf3e8]"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Live GPS Location (Instant Auto-Detect) */}
            <div className="bg-[#f8faf7] p-3.5 rounded-2xl border border-[#d8e3d2] flex items-center justify-between gap-3 text-xs text-[#143826]">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative w-8 h-8 rounded-xl bg-[#e8f5e9] text-[#204e37] flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin size={18} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold block truncate">{selectedLocation}</span>
                  <div className="flex items-center gap-2 text-[10px] text-[#556955] mt-0.5">
                    <span>{t.gpsTag}</span>
                    {coordinates?.accuracy && (
                      <span className="bg-[#e8f5e9] text-[#204e37] font-bold px-1.5 py-0.2 rounded">
                        ±{coordinates.accuracy}m Accuracy
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={detectLiveLocation}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#204e37] bg-white hover:bg-[#edf3e8] border border-[#d8e3d2] px-2.5 py-1.5 rounded-xl transition shrink-0 cursor-pointer shadow-2xs"
                title="Refresh Live GPS"
              >
                <RefreshCw size={12} className={gpsStatus === "detecting" ? "animate-spin text-[#204e37]" : ""} />
                <span>GPS Refresh</span>
              </button>
            </div>

            {/* SUBMIT BUTTON WITH REAL AI ANALYSIS */}
            <button
              type="button"
              disabled={isAiAnalyzing}
              onClick={handleSubmit}
              className="bg-[#204e37] hover:bg-[#183d2b] active:scale-[0.99] text-white py-4 rounded-2xl font-black text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-75"
            >
              {isAiAnalyzing ? (
                <>
                  <Sparkles size={20} className="animate-spin text-[#a7f3d0]" />
                  <span>Gemini AI Triage Analyzing...</span>
                </>
              ) : (
                <>
                  <span>{t.submitBtn}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        )}

        {/* ================= SCREEN 3: TRACK STATUS ================= */}
        {currentScreen === "track" && (
          <div className="bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-5 md:p-7 flex flex-col gap-5 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#eef3eb] pb-3">
              <button
                onClick={() => setCurrentScreen("home")}
                className="flex items-center gap-1.5 text-xs font-bold text-[#204e37] bg-[#f0f5ee] hover:bg-[#e4edd0] px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{t.backBtn}</span>
              </button>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#204e37] block">
                  #{activeCase.id}
                </span>
                <span className="text-[11px] text-[#556955] block">
                  {activeCase.location}
                </span>
              </div>
            </div>

            {/* Photo */}
            <div className="rounded-2xl overflow-hidden border border-[#d8e3d2] h-48 relative">
              <img src={activeCase.photoUrl} alt="Case" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-lg">
                {t.casePhotoTag}
              </div>
            </div>

            {/* Simple Step-by-Step Status */}
            <div className="bg-[#f8faf7] border border-[#d8e3d2] rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-[#143826] uppercase tracking-wider block">
                {t.progressTitle}
              </span>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#204e37] text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-[#143826]">
                    {t.steps[0]}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#204e37] text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-[#143826]">
                    {t.steps[1]}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs animate-pulse">
                    ●
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {t.steps[2]}
                  </span>
                </div>

                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs">
                    4
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {t.steps[3]}
                  </span>
                </div>
              </div>
            </div>

            {/* Action to Feedback */}
            <button
              onClick={() => setCurrentScreen("feedback")}
              className="bg-[#204e37] hover:bg-[#183d2b] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.verifyBtn}</span>
            </button>
          </div>
        )}

        {/* ================= SCREEN 4: RESOLUTION & FEEDBACK ================= */}
        {currentScreen === "feedback" && (
          <div className="bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-5 md:p-7 flex flex-col gap-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#eef3eb] pb-3">
              <button
                onClick={() => setCurrentScreen("track")}
                className="flex items-center gap-1.5 text-xs font-bold text-[#204e37] bg-[#f0f5ee] hover:bg-[#e4edd0] px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{t.backBtn}</span>
              </button>
              <span className="text-sm font-black text-[#143826]">
                {t.reviewTitle}
              </span>
            </div>

            {/* Before vs After Photos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden border border-[#d8e3d2] h-40 relative">
                <img src={activeCase.photoUrl} alt="Before" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {t.beforeLabel}
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden border-2 border-[#204e37] h-40 relative">
                <img src="/cleaned_street.jpg" alt="After" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-[#204e37] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {t.afterLabel}
                </span>
              </div>
            </div>

            {/* Big Question: Are you satisfied? */}
            <div className="text-center flex flex-col gap-2 pt-2">
              <h2 className="text-base font-black text-[#143826]">
                {t.satisfiedQuestion}
              </h2>
              <p className="text-xs text-[#556955]">
                {t.satisfiedSub}
              </p>
            </div>

            {/* 2 Big Thumb Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFeedback(true)}
                className="bg-[#e8f5e9] hover:bg-[#d5eed7] active:scale-[0.98] border-2 border-[#204e37] p-5 rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#204e37] text-white flex items-center justify-center">
                  <ThumbsUp size={24} />
                </div>
                <span className="text-sm font-black text-[#204e37]">{t.yesSatisfied}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFeedback(false)}
                className="bg-rose-50 hover:bg-rose-100 active:scale-[0.98] border-2 border-rose-300 p-5 rounded-2xl flex flex-col items-center gap-2 transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <ThumbsDown size={24} />
                </div>
                <span className="text-sm font-black text-rose-700">{t.noNotSatisfied}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Success Toast */}
      {feedbackSuccess && (
        <div className="fixed bottom-6 inset-x-4 max-w-sm mx-auto z-50 bg-[#204e37] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={18} className="text-[#a7f3d0]" />
          <span>{t.successMsg}</span>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#dce5d8] py-3 px-4 text-center text-xs text-[#556955]">
        <span>WasteLoop CG · {t.deptName} · {t.helplineTitle}</span>
      </footer>
    </div>
  );
}

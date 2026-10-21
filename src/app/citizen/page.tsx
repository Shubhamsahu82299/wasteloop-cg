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
  FileText,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Phone,
  LogOut,
  Clock,
  Globe,
  Sparkles,
  ChevronDown,
  Check,
  RefreshCw,
} from "lucide-react";
import { CaseItem, CaseStatus, CitizenScreen, Priority } from "../types";
import { useWasteLoop } from "../../context/WasteLoopContext";
import { civicIssueCategories } from "@/lib/civic-issues";

type Language = "en" | "hi" | "cg";

type ComplaintRecord = {
  trackingCode: string;
  title: string;
  category: string;
  description: string;
  location: string;
  ward: string | null;
  latitude: number | null;
  longitude: number | null;
  priority: string;
  status: string;
  createdAt: string;
  possibleCause: string | null;
  recommendedAction: string | null;
  evidence?: {
    type: string;
    url: string;
    mimeType: string | null;
    createdAt: string;
  }[];
  events: { status: string; note: string | null; createdAt: string }[];
};

type GpsFix = { lat: number; lng: number; accuracy: number };

type CivicStats = {
  total: number;
  resolved: number;
  categories: { category: string; count: number }[];
};

const helplineGroups = [
  {
    id: "emergency",
    title: { en: "Universal & Critical Emergencies", hi: "आपातकालीन सेवाएँ", cg: "आपातकालीन सेवा" },
    description: {
      en: "If someone is in immediate danger, call 112.",
      hi: "तत्काल खतरे में 112 पर कॉल करें।",
      cg: "तुरते खतरा होय त 112 म फोन करव।",
    },
    urgent: true,
    services: [
      { name: "National Emergency (Police, Fire, Ambulance)", numbers: ["112"] },
      { name: "Police", numbers: ["100"] },
      { name: "Fire Service", numbers: ["101"] },
      { name: "Ambulance / Medical Emergency", numbers: ["102", "108"] },
      { name: "Disaster Management / Relief (State & District)", numbers: ["1070", "1077"] },
    ],
  },
  {
    id: "women-children",
    title: { en: "Women & Child Protection", hi: "महिला एवं बाल सुरक्षा", cg: "महिला अउ बाल सुरक्षा" },
    description: {
      en: "Support lines for women and children in distress.",
      hi: "संकट में महिलाओं और बच्चों के लिए सहायता।",
      cg: "संकट म महिला अउ लइका मन बर मदद।",
    },
    urgent: false,
    services: [
      { name: "Women Helpline (Police assistance)", numbers: ["1091"] },
      { name: "Women in Distress Helpline / One-Stop Centre", numbers: ["181"] },
      { name: "Childline (child protection and distress)", numbers: ["1098"] },
    ],
  },
  {
    id: "senior-mental-health",
    title: { en: "Senior Citizens & Mental Health", hi: "वरिष्ठ नागरिक और मानसिक स्वास्थ्य", cg: "बुजुर्ग अउ मानसिक स्वास्थ्य" },
    description: {
      en: "Senior-citizen, mental-health, and cyber-fraud support.",
      hi: "वरिष्ठ नागरिक, मानसिक स्वास्थ्य और साइबर धोखाधड़ी सहायता।",
      cg: "बुजुर्ग, मानसिक स्वास्थ्य अउ साइबर ठगी बर मदद।",
    },
    urgent: false,
    services: [
      { name: "Elder Line (Senior Citizens)", numbers: ["14567"] },
      { name: "Tele-MANAS (Mental Health Support)", numbers: ["14416", "1800-891-4416"] },
      { name: "Cyber Crime / Financial Fraud Helpline", numbers: ["1930"] },
    ],
  },
  {
    id: "public-services",
    title: { en: "Civic, Utility & Public Services", hi: "नागरिक, उपयोगिता और सार्वजनिक सेवाएँ", cg: "नागरिक, सुविधा अउ सार्वजनिक सेवा" },
    description: {
      en: "Contact the relevant service for local civic and public-service issues.",
      hi: "स्थानीय नागरिक और सार्वजनिक सेवा की समस्या के लिए संबंधित सेवा से संपर्क करें।",
      cg: "स्थानीय नागरिक अउ सार्वजनिक सेवा के समस्या बर संबंधित सेवा म फोन करव।",
    },
    urgent: false,
    services: [
      { name: "Municipal Corporation / Civic Grievances", numbers: ["1100"] },
      { name: "Electricity / CSPDCL Faults", numbers: ["1912"] },
      { name: "Indian Railways / Rail Madad", numbers: ["139"] },
      { name: "Road Accident Emergency (National Highways)", numbers: ["1073"] },
      { name: "National Consumer Helpline", numbers: ["1915", "1800-11-4000"] },
      { name: "National Health Helpline", numbers: ["1075"] },
    ],
  },
] as const;

function captureGpsFix(): Promise<GpsFix> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This device does not provide GPS location."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        if (!Number.isFinite(accuracy) || accuracy > 500) {
          reject(new Error("GPS accuracy is too low. Move outdoors and try again."));
          return;
        }
        resolve({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(accuracy),
        });
      },
      () => reject(new Error("Location permission is required to submit a report from Chhattisgarh.")),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  });
}

const statusLabels: Record<string, CaseStatus> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  AWAITING_VERIFICATION: "Awaiting Verification",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

const priorityLabels: Record<string, Priority> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

function toCaseItem(record: ComplaintRecord): CaseItem {
  return {
    id: `#${record.trackingCode}`,
    title: record.title,
    category: record.category,
    description: record.description,
    location: record.location,
    ward: record.ward ?? "",
    priority: priorityLabels[record.priority] ?? "Medium",
    status: statusLabels[record.status] ?? "Submitted",
    time: new Date(record.createdAt).toLocaleString("en-IN"),
    createdAt: new Date(record.createdAt).toLocaleString("en-IN"),
    photoUrl: record.evidence?.find((item) => item.type === "BEFORE")?.url ?? "",
    afterPhotoUrl: record.evidence?.find((item) => item.type === "AFTER")?.url,
    possibleCause: record.possibleCause ?? undefined,
    suggestedAction: record.recommendedAction ?? undefined,
    timeline: record.events.map((event) => ({
      status: statusLabels[event.status] ?? event.status,
      timestamp: new Date(event.createdAt).toLocaleString("en-IN"),
      completed: true,
      subtext: event.note ?? undefined,
    })),
  };
}

const dict = {
  en: {
    deptName: "Raipur Municipal Corporation",
    userName: "Citizen",
    reportIssueTitle: "Report an Issue",
    reportIssueDesc: "Report a civic issue to the right public service",
    homeEyebrow: "CITIZEN SERVICES · CHHATTISGARH",
    homeTitle: "A better state starts with a heard community.",
    homeSubtitle: "Report public-service issues, follow the response, and help make your neighbourhood work better.",
    mahtariCaption: "Chhattisgarh Mahtari",
    emergencyQuickTitle: "Need urgent help?",
    emergencyQuickDescription: "Call 112 for police, fire, or ambulance emergencies.",
    emergencyCallLabel: "Call 112",
    civicCallLabel: "Civic helpline 1100",
    helplinesTitle: "Important helplines",
    helplinesSubtitle: "Tap a number to call. If you are in immediate danger, call 112.",
    helplineCallAction: "Call",
    helplineSearchLabel: "Search helplines",
    helplineSearchPlaceholder: "Search by service or number, e.g. police, 112, electricity",
    helplineNoResults: "No helplines match your search.",
    communityStatsTitle: "Community activity on WasteLoop",
    totalReportsLabel: "Reports received",
    resolvedReportsLabel: "Resolved",
    supportedTypesLabel: "Issue types supported",
    statsFootnote: "Live totals from reports submitted through this platform.",
    commonIssuesTitle: "What you can report",
    commonIssuesSubtitle: "Choose from civic services across urban and rural communities. The final department is confirmed by municipal staff.",
    issueSearchLabel: "Search reportable issues",
    issueSearchPlaceholder: "Search roads, water, ration, school...",
    issueNoResults: "No reportable issue types match your search.",
    reportIssueAction: "Report this issue",
    trackStatusTitle: "Track Complaint Status",
    trackStatusDesc: "Follow updates from the responsible team",
    activeStatus: "Work in Progress",
    helplineTitle: "Toll-Free Helpline: 1100",
    helplineDesc: "Tap to call Municipal Corporation directly",
    callBtn: "Call 1100",
    backBtn: "Back",
    step1Photo: "1. Photo of Issue (Optional)",
    tapToCapture: "Tap here to take photo or upload",
    changePhoto: "Change Photo",
    step2Voice: "2. Voice Note (Optional)",
    tapToSpeak: "Tap mic to speak",
    recordingVoice: "Recording voice note...",
    recordedVoice: "Voice note recorded (12 sec)",
    step3Description: "3. Describe the issue *",
    descriptionPlaceholder: "What happened and when did you notice it?",
    step4Category: "4. Select Category",
    serviceSuggestionLabel: "Suggested responsible service",
    serviceSuggestionNote: "The municipal team will confirm the final department assignment.",
    locationDetailsTitle: "5. Help the team find the site (Optional)",
    wardLabel: "Ward / village / locality",
    wardPlaceholder: "e.g. Ward 12, village, or neighborhood",
    landmarkLabel: "Nearby landmark",
    landmarkPlaceholder: "e.g. near the government school gate",
    gpsTag: "Auto-detected GPS Location",
    submitBtn: "Submit Complaint",
    casePhotoTag: "Reported Site Photo",
    progressTitle: "Resolution Progress",
    steps: ["1. Report received", "2. Assigned to a responsible team", "3. Work in progress", "4. Resolution submitted"],
    verifyBtn: "Review Resolution & Give Feedback →",
    reviewTitle: "Resolution Review",
    beforeLabel: "Before",
    afterLabel: "After",
    satisfiedQuestion: "Has this issue been resolved properly?",
    satisfiedSub: "Your feedback completes the resolution",
    yesSatisfied: "Yes, Resolved",
    noNotSatisfied: "No, Needs Attention",
    successMsg: "Thank you! Your feedback has been recorded."
  },
  hi: {
    deptName: "रायपुर नगर पालिक निगम",
    userName: "नागरिक",
    reportIssueTitle: "समस्या रिपोर्ट करें",
    reportIssueDesc: "नागरिक समस्या सही सरकारी सेवा तक पहुँचाएँ",
    homeEyebrow: "नागरिक सेवाएँ · छत्तीसगढ़",
    homeTitle: "जागरूक नागरिक, बेहतर छत्तीसगढ़।",
    homeSubtitle: "सार्वजनिक सेवाओं की समस्या दर्ज करें, कार्रवाई देखें और अपने मोहल्ले को बेहतर बनाने में मदद करें।",
    mahtariCaption: "छत्तीसगढ़ महतारी",
    emergencyQuickTitle: "तुरंत मदद चाहिए?",
    emergencyQuickDescription: "पुलिस, आग या एम्बुलेंस की आपात स्थिति में 112 पर कॉल करें।",
    emergencyCallLabel: "112 पर कॉल करें",
    civicCallLabel: "नागरिक हेल्पलाइन 1100",
    helplinesTitle: "ज़रूरी हेल्पलाइन",
    helplinesSubtitle: "कॉल करने के लिए नंबर चुनें। तत्काल खतरे में 112 पर कॉल करें।",
    helplineCallAction: "कॉल करें",
    helplineSearchLabel: "हेल्पलाइन खोजें",
    helplineSearchPlaceholder: "सेवा या नंबर खोजें, जैसे पुलिस, 112, बिजली",
    helplineNoResults: "आपकी खोज से कोई हेल्पलाइन नहीं मिली।",
    communityStatsTitle: "WasteLoop पर सामुदायिक गतिविधि",
    totalReportsLabel: "कुल शिकायतें",
    resolvedReportsLabel: "समाधान हुआ",
    supportedTypesLabel: "समस्या के प्रकार",
    statsFootnote: "इस प्लेटफ़ॉर्म पर दर्ज शिकायतों के ताज़ा आँकड़े।",
    commonIssuesTitle: "आप किन समस्याओं की रिपोर्ट कर सकते हैं",
    commonIssuesSubtitle: "शहरी और ग्रामीण सेवाओं में से चुनें। अंतिम विभाग का निर्धारण संबंधित अधिकारी करेंगे।",
    issueSearchLabel: "रिपोर्ट योग्य समस्या खोजें",
    issueSearchPlaceholder: "सड़क, पानी, राशन, स्कूल खोजें...",
    issueNoResults: "आपकी खोज से कोई समस्या श्रेणी नहीं मिली।",
    reportIssueAction: "यह समस्या रिपोर्ट करें",
    trackStatusTitle: "शिकायत की स्थिति देखें",
    trackStatusDesc: "जिम्मेदार टीम की कार्रवाई देखें",
    activeStatus: "काम जारी है",
    helplineTitle: "टोल-फ्री हेल्पलाइन: 1100",
    helplineDesc: "नगर निगम से सीधे बात करने के लिए टैप करें",
    callBtn: "कॉल करें",
    backBtn: "वापस",
    step1Photo: "1. समस्या का फोटो (वैकल्पिक)",
    tapToCapture: "यहाँ टैप करके फोटो खींचें",
    changePhoto: "फोटो बदलें",
    step2Voice: "2. बोल कर बताएं (वैकल्पिक)",
    tapToSpeak: "माइक दबाकर बोलें",
    recordingVoice: "आवाज़ रिकॉर्ड हो रही है...",
    recordedVoice: "आवाज़ रिकॉर्ड हो गई (12 sec)",
    step3Description: "3. समस्या का वर्णन करें *",
    descriptionPlaceholder: "क्या हुआ और आपने यह समस्या कब देखी?",
    step4Category: "4. समस्या चुनें",
    serviceSuggestionLabel: "संभावित जिम्मेदार सेवा",
    serviceSuggestionNote: "नगर निकाय अंतिम विभाग का निर्धारण करेगा।",
    locationDetailsTitle: "5. जगह खोजने में मदद करें (वैकल्पिक)",
    wardLabel: "वार्ड / गाँव / मोहल्ला",
    wardPlaceholder: "जैसे वार्ड 12, गाँव या मोहल्ला",
    landmarkLabel: "पास की पहचान",
    landmarkPlaceholder: "जैसे सरकारी स्कूल के गेट के पास",
    gpsTag: "GPS से स्वतः स्थान पहचान",
    submitBtn: "शिकायत दर्ज करें",
    casePhotoTag: "शिकायत का फोटो",
    progressTitle: "समाधान की प्रगति",
    steps: ["1. शिकायत प्राप्त हुई", "2. जिम्मेदार टीम को भेजी गई", "3. काम जारी है", "4. समाधान भेजा गया"],
    verifyBtn: "समाधान देखें और प्रतिक्रिया दें →",
    reviewTitle: "समाधान की समीक्षा",
    beforeLabel: "पहले",
    afterLabel: "बाद में",
    satisfiedQuestion: "क्या समस्या का ठीक से समाधान हुआ?",
    satisfiedSub: "आपकी प्रतिक्रिया से काम पूरा होगा",
    yesSatisfied: "हाँ, समाधान हुआ",
    noNotSatisfied: "नहीं, कचरा बाकी है",
    successMsg: "धन्यवाद! आपकी प्रतिक्रिया दर्ज हो गई है।"
  },
  cg: {
    deptName: "रायपुर नगर निगम",
    userName: "नागरिक",
    reportIssueTitle: "नागरिक समस्या बताव",
    reportIssueDesc: "समस्या ला सही सरकारी सेवा तक पहुँचाव",
    homeEyebrow: "नागरिक सेवा · छत्तीसगढ़",
    homeTitle: "जागे नागरिक, बेहतर छत्तीसगढ़।",
    homeSubtitle: "सार्वजनिक सेवा के समस्या बताव, कार्रवाई देखव अउ अपन मोहल्ला ला बेहतर बनाए म मदद करव।",
    mahtariCaption: "छत्तीसगढ़ महतारी",
    emergencyQuickTitle: "तुरते मदद चाही?",
    emergencyQuickDescription: "पुलिस, आग या एम्बुलेंस के आपात म 112 म फोन करव।",
    emergencyCallLabel: "112 म फोन करव",
    civicCallLabel: "नागरिक हेल्पलाइन 1100",
    helplinesTitle: "जरूरी हेल्पलाइन",
    helplinesSubtitle: "फोन करे बर नंबर दबाव। तुरते खतरा होय त 112 म फोन करव।",
    helplineCallAction: "फोन करव",
    helplineSearchLabel: "हेल्पलाइन खोजव",
    helplineSearchPlaceholder: "सेवा या नंबर खोजव, जइसे पुलिस, 112, बिजली",
    helplineNoResults: "तुँहर खोज म कोनो हेल्पलाइन नइ मिलिस।",
    communityStatsTitle: "WasteLoop म सामुदायिक काम",
    totalReportsLabel: "कुल अर्जी",
    resolvedReportsLabel: "समाधान हो गे",
    supportedTypesLabel: "समस्या के प्रकार",
    statsFootnote: "ए प्लेटफॉर्म म दर्ज अर्जियन के ताजा गिनती।",
    commonIssuesTitle: "कोन-कोन समस्या बताय सकथो",
    commonIssuesSubtitle: "शहर अउ गाँव के सेवा म समस्या चुनव। सही विभाग के फैसला अधिकारी करहीं।",
    issueSearchLabel: "रिपोर्ट करे लायक समस्या खोजव",
    issueSearchPlaceholder: "सड़क, पानी, राशन, स्कूल खोजव...",
    issueNoResults: "तुँहर खोज म कोनो समस्या के प्रकार नइ मिलिस।",
    reportIssueAction: "ए समस्या बताव",
    trackStatusTitle: "अर्जी के हाल देखव",
    trackStatusDesc: "जिम्मेदार टीम के काम के हाल जानव",
    activeStatus: "काम चलत हे",
    helplineTitle: "टोल-फ्री हेल्पलाइन: 1100",
    helplineDesc: "नगर निगम ले गोठियाए बर टैप करव",
    callBtn: "फोन लगाव",
    backBtn: "पाछू आवव",
    step1Photo: "1. समस्या के फोटो (वैकल्पिक)",
    tapToCapture: "इहाँ दबा के फोटो खींचव",
    changePhoto: "फोटो बदलव",
    step2Voice: "2. गोठिया के बताव (माइक)",
    tapToSpeak: "माइक दबा के गोठियाव",
    recordingVoice: "गोठ रिकॉर्ड होवत हे...",
    recordedVoice: "गोठ रिकॉर्ड हो गे (12 sec)",
    step3Description: "3. समस्या के बारे म बताव *",
    descriptionPlaceholder: "का होइस अउ ए समस्या कब देखेव?",
    step4Category: "4. समस्या चुनव",
    serviceSuggestionLabel: "संभावित जिम्मेदार सेवा",
    serviceSuggestionNote: "नगर निकाय सही विभाग तय करही।",
    locationDetailsTitle: "5. जगह खोजे म मदद करव (वैकल्पिक)",
    wardLabel: "वार्ड / गाँव / मोहल्ला",
    wardPlaceholder: "जइसे वार्ड 12, गाँव या मोहल्ला",
    landmarkLabel: "पास के पहचान",
    landmarkPlaceholder: "जइसे सरकारी स्कूल के गेट के पास",
    gpsTag: "GPS ले जगह के पता",
    submitBtn: "अर्जी भेजव",
    casePhotoTag: "अर्जी के फोटो",
    progressTitle: "समाधान के हाल",
    steps: ["1. अर्जी मिल गे", "2. जिम्मेदार टीम ला भेजे गे", "3. काम चलत हे", "4. समाधान भेजे गे"],
    verifyBtn: "समाधान देखव अउ बताव →",
    reviewTitle: "समाधान के जांच",
    beforeLabel: "पहिली",
    afterLabel: "पाछू",
    satisfiedQuestion: "का समस्या के सही समाधान होइस?",
    satisfiedSub: "तुंहर बताय ले काम बंद होही",
    yesSatisfied: "हव, समाधान हो गे",
    noNotSatisfied: "नइ, कचरा बाचे हे",
    successMsg: "धन्यवाद! तुंहर बात दर्ज हो गे।"
  }
};

export default function CitizenMinimalApp() {
  const { showToast } = useWasteLoop();

  const [lang, setLang] = useState<Language>("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = dict[lang];

  const [currentScreen, setCurrentScreen] = useState<CitizenScreen>("home");
  const [citizenCases, setCitizenCases] = useState<CaseItem[]>([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState<string | null>(null);
  const [civicStats, setCivicStats] = useState<CivicStats | null>(null);
  const [civicStatsLoading, setCivicStatsLoading] = useState(true);
  const [civicStatsError, setCivicStatsError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [evidenceUploadError, setEvidenceUploadError] = useState<string | null>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const activeCase =
    citizenCases.find((complaint) => complaint.id === selectedComplaintId) ??
    citizenCases[0] ??
    null;

  // Simple form states
  const [selectedCategory, setSelectedCategory] = useState<string>(civicIssueCategories[0].value);
  const [issueSearch, setIssueSearch] = useState("");
  const [helplineSearch, setHelplineSearch] = useState("");
  const [ward, setWard] = useState("");
  const [landmark, setLandmark] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(
    "Raipur, Chhattisgarh (location not verified)",
  );
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aiConsent, setAiConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"detecting" | "locked">("locked");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const selectedCivicIssue =
    civicIssueCategories.find((issue) => issue.value === selectedCategory) ??
    civicIssueCategories[0];
  const normalizedIssueSearch = issueSearch.trim().toLocaleLowerCase();
  const filteredCivicIssues = civicIssueCategories.filter((issue) =>
    [
      issue.value,
      issue.labelHi,
      issue.labelCg,
      issue.service,
      issue.serviceHi,
      issue.serviceCg,
    ].some((value) => value.toLocaleLowerCase().includes(normalizedIssueSearch)),
  );
  const normalizedHelplineSearch = helplineSearch.trim().toLocaleLowerCase();
  const filteredHelplineGroups = helplineGroups
    .map((group) => {
      const groupMatches = [
        group.title.en,
        group.title.hi,
        group.title.cg,
        group.description.en,
        group.description.hi,
        group.description.cg,
      ].some((value) => value.toLocaleLowerCase().includes(normalizedHelplineSearch));
      const services = group.services
        .map((service) => {
          const serviceMatches = service.name.toLocaleLowerCase().includes(normalizedHelplineSearch);
          const matchingNumbers = service.numbers.filter(
            (number) =>
              number.toLocaleLowerCase().includes(normalizedHelplineSearch) ||
              number.replaceAll("-", "").includes(normalizedHelplineSearch.replaceAll("-", "")),
          );
          return {
            ...service,
            numbers: groupMatches || serviceMatches ? service.numbers : matchingNumbers,
          };
        })
        .filter(
          (service) =>
            groupMatches ||
            service.name.toLocaleLowerCase().includes(normalizedHelplineSearch) ||
            service.numbers.length > 0,
        );
      return { group, services };
    })
    .filter(({ services }) => services.length > 0);

  const detectLiveLocation = () => {
    setGpsStatus("detecting");
    void captureGpsFix()
      .then((fix) => {
        setCoordinates(fix);
        setSelectedLocation(`GPS ${fix.lat}°N, ${fix.lng}°E`);
        setSubmissionError(null);
      })
      .catch((error: unknown) => {
        setCoordinates(null);
        setSelectedLocation("GPS location required");
        setSubmissionError(error instanceof Error ? error.message : "Unable to read device GPS.");
      })
      .finally(() => {
        setGpsStatus("locked");
      });
  };

  useEffect(() => {
    let cancelled = false;
    async function loadComplaints() {
      try {
        const response = await fetch("/api/complaints", { cache: "no-store" });
        const result = (await response.json()) as {
          complaints?: ComplaintRecord[];
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Unable to load your complaints.");
        if (!cancelled) {
          const records = result.complaints ?? [];
          setCitizenCases(records.map(toCaseItem));
          setSelectedComplaintId((current) =>
            current && records.some((record) => `#${record.trackingCode}` === current)
              ? current
              : records[0]
                ? `#${records[0].trackingCode}`
                : null,
          );
          setComplaintsError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setComplaintsError(
            error instanceof Error ? error.message : "Unable to load your complaints.",
          );
        }
      } finally {
        if (!cancelled) setComplaintsLoading(false);
      }
    }
    void loadComplaints();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currentScreen !== "home") return;

    let cancelled = false;
    async function loadCivicStats() {
      setCivicStatsLoading(true);
      try {
        const response = await fetch("/api/civic-stats", { cache: "no-store" });
        const result = (await response.json()) as CivicStats & { error?: string };
        if (!response.ok) throw new Error(result.error || "Unable to load community totals.");
        if (!cancelled) {
          setCivicStats(result);
          setCivicStatsError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setCivicStats(null);
          setCivicStatsError(
            error instanceof Error ? error.message : "Unable to load community totals.",
          );
        }
      } finally {
        if (!cancelled) setCivicStatsLoading(false);
      }
    }
    void loadCivicStats();
    return () => {
      cancelled = true;
    };
  }, [currentScreen]);

  // Feedback states
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
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 4 * 1024 * 1024
      ) {
        setSubmissionError("Choose a JPEG, PNG, or WebP photo that is 4 MB or smaller.");
        e.target.value = "";
        return;
      }
      setSubmissionError(null);
      setEvidenceUploadError(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadBeforeEvidence = async (trackingCode: string, file: File) => {
    const formData = new FormData();
    formData.set("type", "BEFORE");
    formData.set("file", file);
    const response = await fetch(
      `/api/complaints/${encodeURIComponent(trackingCode)}/evidence`,
      { method: "POST", body: formData },
    );
    const result = (await response.json()) as {
      evidence?: NonNullable<ComplaintRecord["evidence"]>[number];
      error?: string;
    };
    if (!response.ok || !result.evidence) {
      throw new Error(result.error || "Unable to save the report photo.");
    }
    return result.evidence;
  };

  const retryBeforeEvidenceUpload = async () => {
    if (!activeCase || !photoFile) return;
    setIsUploadingEvidence(true);
    setEvidenceUploadError(null);
    try {
      const evidence = await uploadBeforeEvidence(
        activeCase.id.replace(/^#/, ""),
        photoFile,
      );
      setCitizenCases((current) =>
        current.map((complaint) =>
          complaint.id === activeCase.id
            ? { ...complaint, photoUrl: evidence.url }
            : complaint,
        ),
      );
      setPhotoFile(null);
      setPhotoPreview("");
      showToast("Complaint photo saved securely.");
    } catch (error) {
      setEvidenceUploadError(
        error instanceof Error ? error.message : "Unable to save the report photo.",
      );
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const handleSubmit = async () => {
    setSubmissionError(null);
    if (!description.trim()) {
      setSubmissionError("Please describe the issue before submitting.");
      return;
    }

    setGpsStatus("detecting");
    let submissionCoordinates: GpsFix;
    try {
      submissionCoordinates = await captureGpsFix();
      setCoordinates(submissionCoordinates);
      setSelectedLocation(
        `GPS ${submissionCoordinates.lat}°N, ${submissionCoordinates.lng}°E`,
      );
    } catch (error) {
      setCoordinates(null);
      setSelectedLocation("GPS location required");
      setGpsStatus("locked");
      setSubmissionError(error instanceof Error ? error.message : "Unable to verify your GPS location.");
      return;
    }
    setGpsStatus("locked");
    const gpsLocation =
      `GPS ${submissionCoordinates.lat}°N, ${submissionCoordinates.lng}°E`;
    const locationForSubmission = landmark.trim()
      ? `${gpsLocation} · Landmark: ${landmark.trim()}`
      : gpsLocation;

    setIsAiAnalyzing(true);
    try {
      let aiData: {
        priority?: Priority;
        summary?: string;
        actionSteps?: string[];
        possibleCause?: string;
      } = {};

      if (aiConsent) {
        try {
          const triageResponse = await fetch("/api/ai-triage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              photoBase64: photoPreview.startsWith("data:") ? photoPreview : undefined,
              description,
              location: locationForSubmission,
              category: selectedCategory,
              latitude: submissionCoordinates.lat,
              longitude: submissionCoordinates.lng,
              citizenLatitude: submissionCoordinates.lat,
              citizenLongitude: submissionCoordinates.lng,
              aiConsent: true,
            }),
          });
          if (triageResponse.ok) {
            const triageResult = (await triageResponse.json()) as {
              success?: boolean;
              data?: typeof aiData;
              error?: string;
            };
            if (triageResult.success) {
              aiData = triageResult.data ?? {};
            } else {
              showToast(triageResult.error || "AI triage unavailable. Submitting without AI suggestions.");
            }
          } else {
            showToast("AI triage unavailable. Submitting without AI suggestions.");
          }
        } catch {
          showToast("AI triage unavailable. The report will be submitted without AI suggestions.");
        }
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiData.summary || `${selectedCategory} issue reported`,
          category: selectedCategory,
          description,
          location: locationForSubmission,
          ward: ward.trim() || null,
          latitude: submissionCoordinates.lat,
          longitude: submissionCoordinates.lng,
          citizenLatitude: submissionCoordinates.lat,
          citizenLongitude: submissionCoordinates.lng,
          possibleCause: aiData.possibleCause,
          recommendedAction: aiData.actionSteps?.join("\n"),
        }),
      });
      const result = (await response.json()) as {
        complaint?: ComplaintRecord;
        error?: string;
      };
      if (!response.ok || !result.complaint) {
        throw new Error(result.error || "Could not submit the complaint.");
      }
      let evidence: ComplaintRecord["evidence"] = [];
      let evidenceError: string | null = null;
      if (photoFile) {
        try {
          evidence = [await uploadBeforeEvidence(result.complaint.trackingCode, photoFile)];
        } catch (error) {
          evidenceError = error instanceof Error ? error.message : "Unable to save the report photo.";
        }
      }
      const savedCase = {
        ...toCaseItem({ ...result.complaint, evidence, events: [] }),
      };
      setCitizenCases((current) => [savedCase, ...current]);
      setSelectedComplaintId(savedCase.id);
      setCurrentScreen("track");
      setDescription("");
      setSelectedCategory(civicIssueCategories[0].value);
      setWard("");
      setLandmark("");
      setCoordinates(null);
      setSelectedLocation("GPS location required");
      setEvidenceUploadError(evidenceError);
      if (!evidenceError) {
        setPhotoFile(null);
        setPhotoPreview("");
      }
      showToast(
        evidenceError
          ? `Complaint ${savedCase.id} was saved, but its photo was not: ${evidenceError}`
          : `Complaint ${savedCase.id} submitted successfully.`,
      );
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Could not submit the complaint.",
      );
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleFeedback = async (satisfied: boolean) => {
    if (!activeCase) {
      showToast("Select one of your saved complaints before submitting feedback.");
      return;
    }
    try {
      const response = await fetch(
        `/api/complaints/${encodeURIComponent(activeCase.id.replace(/^#/, ""))}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolved: satisfied,
            comment: satisfied ? "Satisfied" : "Needs re-inspection",
          }),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to save feedback.");
      setCitizenCases((current) =>
        current.map((complaint) =>
          complaint.id === activeCase.id
            ? {
                ...complaint,
                status: satisfied ? "Resolved" : "In Progress",
                timeline: [
                  ...complaint.timeline,
                  {
                    status: satisfied ? "Resolved" : "In Progress",
                    timestamp: new Date().toLocaleString("en-IN"),
                    completed: true,
                    subtext: satisfied ? "Citizen confirmed resolution." : "Citizen requested reinspection.",
                  },
                ],
              }
            : complaint,
        ),
      );
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackSuccess(false);
        setCurrentScreen("home");
      }, 1200);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to save feedback.");
    }
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
      <main className={`flex-1 ${currentScreen === "home" ? "max-w-5xl" : "max-w-2xl"} w-full mx-auto p-4 md:p-6 flex flex-col justify-center`}>
        {/* ================= SCREEN 1: HOME (MINIMALIST) ================= */}
        {currentScreen === "home" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#173f2e] text-white shadow-xl">
              <img
                src="/chhattisgarh_banner.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#143826] via-[#173f2e]/95 to-[#173f2e]/50" />
              <div className="grid min-h-[300px] grid-cols-1 items-center gap-2 px-4 py-5 sm:min-h-[320px] sm:grid-cols-[1fr_180px] sm:gap-2 sm:px-6 sm:py-8 md:grid-cols-[1fr_220px] md:px-10">
                <div className="relative z-10 min-w-0 max-w-xl">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#d9f4d8]">
                    {t.homeEyebrow}
                  </span>
                  <h1 className="mt-3 max-w-[230px] text-2xl font-black leading-tight tracking-tight sm:mt-4 sm:max-w-lg sm:text-3xl md:text-4xl">
                    {t.homeTitle}
                  </h1>
                  <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/85 sm:mt-3 sm:text-sm">
                    {t.homeSubtitle}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentScreen("report")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-black text-[#173f2e] shadow-md transition hover:bg-[#edf5e8] sm:px-4 sm:py-3 sm:text-sm"
                    >
                      <Camera size={18} />
                      <span>{t.reportIssueTitle}</span>
                      <ArrowRight size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={citizenCases.length === 0}
                      onClick={() => {
                        if (citizenCases[0]) setSelectedComplaintId(citizenCases[0].id);
                        setCurrentScreen("track");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
                    >
                      <Clock size={17} />
                      <span>{t.trackStatusTitle}</span>
                    </button>
                  </div>
                </div>
                <div className="absolute right-4 top-4 flex w-[68px] flex-col items-center sm:relative sm:right-auto sm:top-auto sm:mx-auto sm:mt-0 sm:w-full sm:max-w-[180px] md:max-w-[220px]">
                  <img
                    src="/chhattisgarh-mahtari.jpg"
                    alt="Chhattisgarh Mahtari"
                    className="aspect-square w-full rounded-2xl border border-white/25 object-cover object-center shadow-2xl sm:rounded-3xl"
                  />
                  <span className="-mt-2 whitespace-nowrap rounded-full border border-white/20 bg-[#143826]/90 px-2 py-1 text-center text-[8px] font-semibold text-white sm:-mt-3 sm:px-3 sm:text-[10px]">
                    {t.mahtariCaption}
                  </span>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="urgent-helpline-heading"
              className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 id="urgent-helpline-heading" className="text-sm font-black text-rose-950">
                  {t.emergencyQuickTitle}
                </h2>
                <p className="mt-1 text-xs text-rose-900">{t.emergencyQuickDescription}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="tel:112"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-xs font-black text-white transition hover:bg-rose-800"
                >
                  <Phone size={15} />
                  {t.emergencyCallLabel}
                </a>
                <a
                  href="tel:1100"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#b8d1b4] bg-white px-4 py-2.5 text-xs font-bold text-[#204e37] transition hover:bg-[#f2f8ef]"
                >
                  <Phone size={15} />
                  {t.civicCallLabel}
                </a>
              </div>
            </section>

            <section aria-labelledby="community-stats-heading">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <h2 id="community-stats-heading" className="text-base font-black text-[#143826]">
                  {t.communityStatsTitle}
                </h2>
                <span className="text-[10px] text-[#637763]">{t.statsFootnote}</span>
              </div>
              {civicStatsError && (
                <p role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                  {civicStatsError}
                </p>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    label: t.totalReportsLabel,
                    value: civicStats?.total,
                    icon: <FileText size={19} />,
                    tone: "bg-[#e8f5e9] text-[#204e37]",
                  },
                  {
                    label: t.resolvedReportsLabel,
                    value: civicStats?.resolved,
                    icon: <CheckCircle2 size={19} />,
                    tone: "bg-[#e0f2fe] text-[#0369a1]",
                  },
                  {
                    label: t.supportedTypesLabel,
                    value: civicIssueCategories.length,
                    icon: <Globe size={19} />,
                    tone: "bg-[#fff4d6] text-[#98610b]",
                  },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center gap-3 rounded-2xl border border-[#d8e3d2] bg-white p-4 shadow-xs">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${metric.tone}`}>
                      {metric.icon}
                    </span>
                    <span>
                      <span className="block text-2xl font-black leading-tight text-[#143826]">
                        {metric.value === undefined
                          ? civicStatsLoading && metric.label !== t.supportedTypesLabel
                            ? "—"
                            : metric.label === t.supportedTypesLabel
                              ? metric.value
                              : "—"
                          : metric.value.toLocaleString("en-IN")}
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold text-[#556955]">{metric.label}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="helplines-heading" className="rounded-2xl border border-[#d8e3d2] bg-white p-4">
              <div className="mb-3">
                <h2 id="helplines-heading" className="text-base font-black text-[#143826]">
                  {t.helplinesTitle}
                </h2>
                <p className="mt-1 text-xs text-[#637763]">{t.helplinesSubtitle}</p>
              </div>
              <label className="mb-3 flex flex-col gap-1.5 text-xs font-semibold text-[#334b37]">
                {t.helplineSearchLabel}
                <input
                  type="search"
                  value={helplineSearch}
                  onChange={(event) => setHelplineSearch(event.target.value)}
                  placeholder={t.helplineSearchPlaceholder}
                  className="w-full rounded-xl border border-[#d8e3d2] bg-[#fbfdfa] px-3 py-2.5 text-sm font-normal text-[#143826] placeholder:text-[#7b8978] focus:outline-none focus:ring-2 focus:ring-[#204e37]"
                />
              </label>
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {filteredHelplineGroups.map(({ group, services }) => (
                  <details
                    key={group.id}
                    open={normalizedHelplineSearch.length > 0 || undefined}
                    className={`group rounded-xl border ${
                      group.urgent ? "border-rose-200" : "border-[#e2e9de]"
                    }`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-bold marker:hidden hover:bg-[#fbfdfa] [&::-webkit-details-marker]:hidden">
                      <span className={group.urgent ? "text-rose-900" : "text-[#143826]"}>
                        {group.title[lang]}
                      </span>
                      <span className="shrink-0 rounded-full bg-[#f0f5ee] px-2 py-0.5 text-[10px] font-bold text-[#556955]">
                        {services.length}
                      </span>
                    </summary>
                    <div className="border-t border-[#edf1e9] px-3 pb-3 pt-2">
                      <p className="text-[11px] leading-relaxed text-[#637763]">
                        {group.description[lang]}
                      </p>
                      <ul className="mt-2 divide-y divide-[#edf1e9]">
                        {services.map((service) => (
                          <li
                            key={service.name}
                            className="flex flex-col gap-2 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span className="text-xs font-semibold text-[#334b37]">{service.name}</span>
                            <span className="flex flex-wrap gap-1.5">
                              {service.numbers.map((number) => (
                                <a
                                  key={number}
                                  href={`tel:${number.replaceAll("-", "")}`}
                                  className={`inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black ${
                                    group.urgent
                                      ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                                      : "bg-[#eef5eb] text-[#204e37] hover:bg-[#dfeedd]"
                                  }`}
                                  aria-label={`${t.helplineCallAction} ${number} — ${service.name}`}
                                >
                                  <Phone size={12} />
                                  {number}
                                </a>
                              ))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
                {filteredHelplineGroups.length === 0 && (
                  <p className="rounded-xl bg-[#fbfdfa] p-3 text-xs text-[#637763]">
                    {t.helplineNoResults}
                  </p>
                )}
              </div>
              <p className="text-[10px] leading-relaxed text-[#637763]">
                Helpline availability and service scope may vary by region. Confirm current contact details with the relevant authority.
              </p>
            </section>

            <div>
              <section className="rounded-2xl border border-[#d8e3d2] bg-white p-4 shadow-xs">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-black text-[#143826]">{t.trackStatusTitle}</h2>
                  {complaintsLoading && <span className="text-[11px] text-[#556955]">Loading…</span>}
                </div>
                {complaintsError && (
                  <p role="alert" className="mb-2 text-xs text-rose-700">{complaintsError}</p>
                )}
                {!complaintsLoading && !complaintsError && citizenCases.length === 0 && (
                  <p className="text-xs text-[#556955]">You haven’t submitted a complaint yet.</p>
                )}
                <div className="flex flex-col gap-2">
                  {citizenCases.slice(0, 4).map((complaint) => (
                    <button
                      key={complaint.id}
                      type="button"
                      onClick={() => {
                        setSelectedComplaintId(complaint.id);
                        setCurrentScreen("track");
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e9de] p-3 text-left hover:bg-[#f8faf7]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-[#143826]">{complaint.title}</span>
                        <span className="block text-[10px] text-[#556955]">{complaint.id} · {complaint.category}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-[#fef3c7] px-2 py-1 text-[10px] font-bold text-[#92400e]">
                        {complaint.status}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

            </div>

            <section className="rounded-2xl border border-[#d8e3d2] bg-white p-4 shadow-xs">
              <div className="mb-3">
                <h2 className="text-base font-black text-[#143826]">{t.commonIssuesTitle}</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#637763]">
                  {t.commonIssuesSubtitle}
                </p>
              </div>
              <label className="mb-3 flex flex-col gap-1.5 text-xs font-semibold text-[#334b37]">
                {t.issueSearchLabel}
                <input
                  type="search"
                  value={issueSearch}
                  onChange={(event) => setIssueSearch(event.target.value)}
                  placeholder={t.issueSearchPlaceholder}
                  className="w-full rounded-xl border border-[#d8e3d2] bg-[#fbfdfa] px-3 py-2.5 text-sm font-normal text-[#143826] placeholder:text-[#7b8978] focus:outline-none focus:ring-2 focus:ring-[#204e37]"
                />
              </label>
              <details
                open={normalizedIssueSearch.length > 0 || undefined}
                className="group rounded-xl border border-[#e2e9de]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#204e37] marker:hidden hover:bg-[#fbfdfa] [&::-webkit-details-marker]:hidden">
                  <span>{t.commonIssuesTitle}</span>
                  <span className="shrink-0 rounded-full bg-[#eef5eb] px-2 py-0.5 text-[10px] font-bold">
                    {normalizedIssueSearch ? filteredCivicIssues.length : civicIssueCategories.length}
                  </span>
                </summary>
                <div className="border-t border-[#edf1e9] p-3">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCivicIssues.map((issue) => (
                    <button
                      key={issue.value}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(issue.value);
                        setCurrentScreen("report");
                      }}
                      className="flex items-start justify-between gap-3 rounded-xl border border-[#e4ebdf] bg-[#fbfdfa] p-3 text-left transition hover:border-[#b6cdb1] hover:bg-[#f2f8ef]"
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-[#143826]">
                          {lang === "hi" ? issue.labelHi : lang === "cg" ? issue.labelCg : issue.value}
                        </span>
                        <span className="mt-1 block text-[10px] leading-relaxed text-[#637763]">
                          {lang === "hi"
                            ? issue.serviceHi
                            : lang === "cg"
                              ? issue.serviceCg
                              : issue.service}
                        </span>
                        <span className="mt-2 block text-[10px] font-bold text-[#204e37]">
                          {t.reportIssueAction}
                        </span>
                      </span>
                      <ArrowRight size={15} className="mt-0.5 shrink-0 text-[#204e37]" />
                    </button>
                  ))}
                  {filteredCivicIssues.length === 0 && (
                    <p className="rounded-xl bg-[#fbfdfa] p-3 text-xs text-[#637763]">
                      {t.issueNoResults}
                    </p>
                  )}
                </div>
                </div>
              </details>
            </section>

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

            {/* 1. Optional photo evidence */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#143826]">
                {t.step1Photo}
              </span>
              <p className="text-[11px] text-[#556955]">
                A photo can help the assigned team understand the issue. It is stored securely with your complaint.
              </p>
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

            {/* 3. Required Issue Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="complaint-description"
                className="text-xs font-bold text-[#143826]"
              >
                {t.step3Description}
              </label>
              <textarea
                id="complaint-description"
                name="description"
                required
                maxLength={5000}
                rows={4}
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  if (submissionError === "Please describe the issue before submitting.") {
                    setSubmissionError(null);
                  }
                }}
                placeholder={t.descriptionPlaceholder}
                aria-describedby="complaint-description-count"
                className="w-full resize-y rounded-2xl border border-[#d8e3d2] bg-white p-3.5 text-sm text-[#143826] placeholder:text-[#7b8978] focus:outline-none focus:ring-2 focus:ring-[#204e37]"
              />
              <span
                id="complaint-description-count"
                className="self-end text-[11px] text-[#556955]"
              >
                {description.length}/5000
              </span>
            </div>

            {/* 4. Civic issue category and responsible service */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="complaint-category" className="text-xs font-bold text-[#143826]">
                {t.step4Category}
              </label>
              <select
                id="complaint-category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-2xl border border-[#d8e3d2] bg-white px-3.5 py-3 text-sm font-semibold text-[#143826] focus:outline-none focus:ring-2 focus:ring-[#204e37]"
              >
                {civicIssueCategories.map((issue) => (
                  <option key={issue.value} value={issue.value}>
                    {lang === "hi" ? issue.labelHi : lang === "cg" ? issue.labelCg : issue.value}
                  </option>
                ))}
              </select>
              <div className="rounded-xl border border-[#d8e3d2] bg-[#f8faf7] px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#556955]">
                  {t.serviceSuggestionLabel}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#143826]">
                  {lang === "hi"
                    ? selectedCivicIssue.serviceHi
                    : lang === "cg"
                      ? selectedCivicIssue.serviceCg
                      : selectedCivicIssue.service}
                </p>
                <p className="mt-1 text-[10px] text-[#556955]">{t.serviceSuggestionNote}</p>
              </div>
            </div>

            {/* 5. Optional locality and landmark details */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-[#143826]">{t.locationDetailsTitle}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#143826]">
                  {t.wardLabel}
                  <input
                    value={ward}
                    onChange={(event) => setWard(event.target.value)}
                    maxLength={80}
                    placeholder={t.wardPlaceholder}
                    className="w-full rounded-xl border border-[#d8e3d2] bg-white px-3 py-2.5 text-sm font-normal placeholder:text-[#7b8978] focus:outline-none focus:ring-2 focus:ring-[#204e37]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-[#143826]">
                  {t.landmarkLabel}
                  <input
                    value={landmark}
                    onChange={(event) => setLandmark(event.target.value)}
                    maxLength={80}
                    placeholder={t.landmarkPlaceholder}
                    className="w-full rounded-xl border border-[#d8e3d2] bg-white px-3 py-2.5 text-sm font-normal placeholder:text-[#7b8978] focus:outline-none focus:ring-2 focus:ring-[#204e37]"
                  />
                </label>
              </div>
            </div>

            {/* 6. Live GPS Location (Instant Auto-Detect) */}
            <div className="bg-[#f8faf7] p-3.5 rounded-2xl border border-[#d8e3d2] flex items-center justify-between gap-3 text-xs text-[#143826]">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative w-8 h-8 rounded-xl bg-[#e8f5e9] text-[#204e37] flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin size={18} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-ping" />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    aria-label="Complaint location"
                    value={selectedLocation}
                    readOnly
                    className="w-full bg-transparent font-bold outline-none"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-[#556955] mt-0.5">
                    <span>Fresh GPS is checked against the Chhattisgarh state boundary when submitting.</span>
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
                title="Check current GPS location"
              >
                <RefreshCw size={12} className={gpsStatus === "detecting" ? "animate-spin text-[#204e37]" : ""} />
                <span>GPS Refresh</span>
              </button>
            </div>

            <label className="flex items-start gap-2 text-[11px] leading-relaxed text-[#556955]">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(event) => setAiConsent(event.target.checked)}
                className="mt-0.5 accent-[#204e37]"
              />
              <span>
                Optional AI triage sends your selected category, description, location, and photo to Google Gemini. Avoid personal or sensitive information.
              </span>
            </label>

            {/* SUBMIT BUTTON */}
            <button
              type="button"
              disabled={isAiAnalyzing}
              onClick={handleSubmit}
              className="bg-[#204e37] hover:bg-[#183d2b] active:scale-[0.99] text-white py-4 rounded-2xl font-black text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-75"
            >
              {isAiAnalyzing ? (
                <>
                  <Sparkles size={20} className="animate-spin text-[#a7f3d0]" />
                  <span>Processing and submitting...</span>
                </>
              ) : (
                <>
                  <span>{t.submitBtn}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            {submissionError && (
              <p role="alert" className="text-sm font-semibold text-rose-700">{submissionError}</p>
            )}
          </div>
        )}

        {/* ================= SCREEN 3: TRACK STATUS ================= */}
        {currentScreen === "track" && !activeCase && (
          <div className="bg-white rounded-3xl border border-[#d8e3d2] shadow-xl p-6 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-[#556955]">
              {complaintsLoading
                ? "Loading your complaints…"
                : complaintsError || "You have no saved complaints yet."}
            </p>
            <button
              onClick={() => setCurrentScreen("report")}
              className="bg-[#204e37] text-white px-5 py-3 rounded-xl text-sm font-bold"
            >
              Report an issue
            </button>
          </div>
        )}
        {currentScreen === "track" && activeCase && (
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
                  {activeCase.id}
                </span>
                <span className="text-[11px] text-[#556955] block">
                  {activeCase.location}
                </span>
              </div>
            </div>

            {/* Photo */}
            <div className="rounded-2xl overflow-hidden border border-[#d8e3d2] h-48 relative">
              {activeCase.photoUrl ? (
                <img src={activeCase.photoUrl} alt="Complaint evidence preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#f8faf7] text-[#556955] text-sm">
                  No evidence photo attached
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-lg">
                {t.casePhotoTag}
              </div>
            </div>
            {!activeCase.photoUrl &&
              (activeCase.status === "Submitted" || activeCase.status === "Under Review") && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-3">
                <p className="text-xs text-amber-900">
                  Add a before photo to support the report. It is stored privately and visible only to you and authorized municipal staff.
                </p>
                <label className="w-fit rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 cursor-pointer">
                  Choose photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoFile && (
                  <button
                    onClick={() => void retryBeforeEvidenceUpload()}
                    disabled={isUploadingEvidence}
                    className="w-fit rounded-xl bg-[#204e37] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {isUploadingEvidence ? "Saving photo…" : "Save photo"}
                  </button>
                )}
                {(evidenceUploadError || submissionError) && (
                  <p role="alert" className="text-xs font-semibold text-rose-700">
                    {evidenceUploadError || submissionError}
                  </p>
                )}
              </div>
            )}

            {/* Simple Step-by-Step Status */}
            <div className="bg-[#f8faf7] border border-[#d8e3d2] rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-[#143826] uppercase tracking-wider block">
                {t.progressTitle}
              </span>

              {activeCase.timeline.length ? (
                <ol className="flex flex-col gap-3">
                  {activeCase.timeline.map((event, index) => (
                    <li key={`${event.status}-${index}`} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#204e37] text-xs text-white">
                        ✓
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-[#143826]">{event.status}</span>
                        <span className="block text-[10px] text-[#556955]">{event.timestamp}</span>
                        {event.subtext && (
                          <span className="block text-[11px] text-[#556955]">{event.subtext}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-[#556955]">No updates have been posted yet.</p>
              )}
            </div>

            {/* Action to Feedback */}
            {activeCase.status === "Awaiting Verification" || activeCase.status === "Resolved" ? (
              <button
                onClick={() => setCurrentScreen("feedback")}
                className="bg-[#204e37] hover:bg-[#183d2b] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.verifyBtn}</span>
              </button>
            ) : (
              <p className="rounded-xl bg-[#f8faf7] p-3 text-center text-xs text-[#556955]">
                Feedback will be available after the field team submits its work for verification.
              </p>
            )}
          </div>
        )}

        {/* ================= SCREEN 4: RESOLUTION & FEEDBACK ================= */}
        {currentScreen === "feedback" && activeCase && (
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
                {activeCase.photoUrl ? (
                  <img src={activeCase.photoUrl} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#f8faf7] text-xs text-[#556955]">
                    No before photo available
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {t.beforeLabel}
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden border-2 border-[#204e37] h-40 relative">
                {activeCase.afterPhotoUrl ? (
                  <img src={activeCase.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#f8faf7] text-xs text-[#556955]">
                    No after photo submitted
                  </div>
                )}
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

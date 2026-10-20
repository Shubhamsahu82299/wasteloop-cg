import { CaseItem } from "./types";

export const initialCases: CaseItem[] = [
  {
    id: "#WL-2024-0187",
    title: "Garbage pile near community bin",
    category: "Garbage & Dumping",
    description: "Garbage pile near community bin on main road. Looks like it has been there for multiple days and may cause health issues.",
    location: "Sundar Nagar, Raipur",
    ward: "Ward 12",
    priority: "High",
    status: "In Progress",
    time: "2h ago",
    createdAt: "12 Oct 2024, 10:24 AM",
    photoUrl: "/garbage_pile.jpg",
    afterPhotoUrl: "/cleaned_street.jpg",
    distance: "2 km",
    eta: "30 min",
    possibleCause: "Missed collection or overflow due to insufficient bins.",
    recommendedDepartment: "Municipal Sanitation Team",
    suggestedAction: "Send collection vehicle and clean the area. Check if additional bins are needed.",
    steps: [
      "Collect garbage using vehicle",
      "Clean surrounding area",
      "Check bin capacity",
      "Take after photo"
    ],
    wasteCollectedKg: 50,
    notes: "Area cleaned. Bin overflow was the main reason. Additional bin recommended.",
    feedback: {
      resolved: true,
      comment: "Quick work by the sanitation team!"
    },
    timeline: [
      { status: "Submitted", timestamp: "12 Oct, 10:24 AM", completed: true },
      { status: "Under Review", timestamp: "12 Oct, 11:05 AM", completed: true },
      { status: "Assigned to Sanitation Team", timestamp: "12 Oct, 1:20 PM", completed: true },
      { status: "In Progress", timestamp: "Team reached location", completed: false, active: true, subtext: "Team reached location" },
      { status: "Awaiting Verification", timestamp: "Pending supervisor signoff", completed: false },
      { status: "Resolved", timestamp: "Final check & archive", completed: false }
    ]
  },
  {
    id: "#WL-2024-0185",
    title: "Drainage blockage on main road",
    category: "Drainage Issue",
    description: "Stormwater drain inlet is clogged with plastic waste and silt, causing dirty water to spill on the sidewalk.",
    location: "Civil Lines, Raipur",
    ward: "Ward 08",
    priority: "Medium",
    status: "Under Review",
    time: "4h ago",
    createdAt: "12 Oct 2024, 08:15 AM",
    photoUrl: "/drainage_issue.jpg",
    afterPhotoUrl: "/cleaned_street.jpg",
    distance: "4 km",
    eta: "45 min",
    possibleCause: "Silt and unsegregated plastic clogging roadside drainage grates.",
    recommendedDepartment: "Drainage & Sewerage Wing",
    suggestedAction: "Clear blockage using high-pressure jetting and de-silting rods.",
    steps: [
      "Set up safety cones along sidewalk",
      "Remove grate and pull silt & plastic debris",
      "Flush drain line to ensure unhindered flow",
      "Re-secure iron drain grate and take photo"
    ],
    timeline: [
      { status: "Submitted", timestamp: "12 Oct, 08:15 AM", completed: true },
      { status: "Under Review", timestamp: "12 Oct, 09:00 AM", completed: true, active: true },
      { status: "Assigned to Sanitation Team", timestamp: "Pending assignment", completed: false },
      { status: "In Progress", timestamp: "Awaiting field dispatch", completed: false },
      { status: "Awaiting Verification", timestamp: "Pending signoff", completed: false },
      { status: "Resolved", timestamp: "Pending clearance", completed: false }
    ]
  },
  {
    id: "#WL-2024-0180",
    title: "Tree maintenance on pedestrian path",
    category: "Tree Maintenance",
    description: "Heavy branch snapped during windy evening, blocking half of pedestrian walkway and phone line.",
    location: "Shankar Nagar, Raipur",
    ward: "Ward 15",
    priority: "Medium",
    status: "In Progress",
    time: "6h ago",
    createdAt: "12 Oct 2024, 06:40 AM",
    photoUrl: "/tree_maintenance.jpg",
    afterPhotoUrl: "/cleaned_street.jpg",
    distance: "6 km",
    eta: "1 hr",
    possibleCause: "Dead wood branch failure under high wind load.",
    recommendedDepartment: "Horticulture & Parks Division",
    suggestedAction: "Chainsaw crew to prune fractured limbs and transport timber to municipal depot.",
    steps: [
      "Cordon off walkway with warning tape",
      "Prune fallen trunk and branches into manageable logs",
      "Load into municipal tipper truck",
      "Sweep leaves and sawdust off the pavement"
    ],
    timeline: [
      { status: "Submitted", timestamp: "12 Oct, 06:40 AM", completed: true },
      { status: "Under Review", timestamp: "12 Oct, 07:10 AM", completed: true },
      { status: "Assigned to Horticulture", timestamp: "12 Oct, 07:45 AM", completed: true },
      { status: "In Progress", timestamp: "Crew pruning on-site", completed: false, active: true },
      { status: "Awaiting Verification", timestamp: "Pending cleanup check", completed: false },
      { status: "Resolved", timestamp: "Final clearance", completed: false }
    ]
  },
  {
    id: "#WL-2024-0175",
    title: "Open burning of waste",
    category: "Open Burning & Air Pollution",
    description: "Informal burning of mixed plastic and dry leaves observed behind vacant plot near highway bypass.",
    location: "Kota Road, Raipur",
    ward: "Ward 22",
    priority: "Urgent",
    status: "Under Review",
    time: "6h ago",
    createdAt: "12 Oct 2024, 05:20 AM",
    photoUrl: "/garbage_pile.jpg",
    distance: "5 km",
    eta: "50 min",
    possibleCause: "Illegal dump burning to clear accumulated yard debris.",
    recommendedDepartment: "Environmental Enforcement Squad",
    suggestedAction: "Extinguish burning immediate, issue notice to plot owner.",
    steps: [
      "Douse embers with water tender",
      "Record site geo-coordinates and plot boundaries",
      "Erect no-dumping signage"
    ],
    timeline: [
      { status: "Submitted", timestamp: "12 Oct, 05:20 AM", completed: true },
      { status: "Under Review", timestamp: "12 Oct, 05:45 AM", completed: true, active: true },
      { status: "Assigned to Sanitation Team", timestamp: "Pending", completed: false },
      { status: "In Progress", timestamp: "Pending", completed: false },
      { status: "Awaiting Verification", timestamp: "Pending", completed: false },
      { status: "Resolved", timestamp: "Pending", completed: false }
    ]
  },
  {
    id: "#WL-2024-0170",
    title: "Fallen tree branch cleared",
    category: "Trees & Green Spaces",
    description: "Obstruction cleared from main sector road, walkway restored completely.",
    location: "Shankar Nagar, Raipur",
    ward: "Ward 15",
    priority: "Low",
    status: "Resolved",
    time: "1d ago",
    createdAt: "11 Oct 2024, 02:10 PM",
    photoUrl: "/tree_maintenance.jpg",
    afterPhotoUrl: "/cleaned_street.jpg",
    distance: "6 km",
    eta: "1 hr",
    wasteCollectedKg: 120,
    notes: "Removed branch and swept pavement clean. Normal traffic restored.",
    feedback: {
      resolved: true,
      comment: "Pavement is completely clear now. Thank you."
    },
    timeline: [
      { status: "Submitted", timestamp: "11 Oct, 02:10 PM", completed: true },
      { status: "Under Review", timestamp: "11 Oct, 02:30 PM", completed: true },
      { status: "Assigned to Horticulture", timestamp: "11 Oct, 03:00 PM", completed: true },
      { status: "In Progress", timestamp: "11 Oct, 03:45 PM", completed: true },
      { status: "Awaiting Verification", timestamp: "11 Oct, 04:30 PM", completed: true },
      { status: "Resolved", timestamp: "11 Oct, 05:15 PM", completed: true }
    ]
  }
];

export const categoriesList = [
  { id: "garbage", name: "Garbage &\nDumping", icon: "Trash2", color: "green" },
  { id: "drainage", name: "Water Leakage\n& Drainage", icon: "Droplets", color: "blue" },
  { id: "burning", name: "Open Burning\n& Air Pollution", icon: "Wind", color: "orange" },
  { id: "trees", name: "Trees &\nGreen Spaces", icon: "TreePine", color: "emerald" },
  { id: "construction", name: "Construction\nWaste", icon: "Boxes", color: "amber" },
  { id: "other", name: "Other\nEnvironmental Issue", icon: "MoreHorizontal", color: "gray" },
];

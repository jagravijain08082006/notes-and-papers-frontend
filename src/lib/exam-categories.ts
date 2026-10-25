import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Cpu,
  GraduationCap,
  Layers,
  Scale,
  School,
  Shield,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export interface ExamDomain {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const BOARD_CLEAN_NAMES: Record<string, string> = {
  "uni-rajasthanboard": "RBSE Board (Rajasthan BSER)",
  "uni-cbseboardonline": "CBSE Board (Central Board)",
  "uni-upboardonline": "UP Board (UPMSP)",
  "uni-mpboardonline": "MP Board (MPBSE)",
  "uni-icseonline": "ICSE & ISC Board (CISCE)",
  "uni-bsebstudy": "Bihar Board (BSEB)",
  "uni-haryanaboard": "HBSE Haryana Board (BSEH)",
  "uni-cgboardonline": "CG Board (CGBSE)",
  "uni-gujaratboardonline": "GSEB Gujarat Board",
  "uni-maharashtrastudy": "Maharashtra State Board (MSBSHSE)",
  "uni-punjabboardonline": "PSEB Punjab Board",
  "cg-open-school": "CG Open School Board",
  "toss": "Telangana Open School (TOSS)",
  "uni-niosstudy": "NIOS National Open School",
};

/** Sanitize exam name: handles empty/whitespace titles like rajasthan-4th-grade and verbose crawler board titles */
export function cleanExamTitle(name?: string | null, slug?: string | null): string {
  if (slug && BOARD_CLEAN_NAMES[slug]) {
    return BOARD_CLEAN_NAMES[slug];
  }
  const trimmed = (name ?? "").trim();
  if (trimmed.length > 0) return trimmed;
  if (!slug) return "Examination";
  return slug
    .split("-")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

export const EXAM_DOMAINS: ExamDomain[] = [
  {
    id: "all",
    label: "All Categories",
    description: "Browse all competitive examinations and school boards across India",
    icon: Layers,
  },
  {
    id: "civil-services",
    label: "Civil Services & State PSC",
    description: "UPSC CSE, MPPSC, UPPSC, State Public Service Commissions",
    icon: Building2,
  },
  {
    id: "banking-finance",
    label: "Banking & Finance",
    description: "SBI Clerk / PO, CAIIB, JAIIB, CA, CMA & CS",
    icon: Briefcase,
  },
  {
    id: "ssc-police",
    label: "Staff Selection & Police",
    description: "SSC CGL, CHSL, Constable, Police SI & State Forces",
    icon: Shield,
  },
  {
    id: "engineering",
    label: "Engineering Entrance",
    description: "GATE, JEE Main & Advanced, WBJEE, Polytechnic",
    icon: Cpu,
  },
  {
    id: "medical",
    label: "Medical & Nursing",
    description: "NEET, B.Sc. Nursing, GPAT, Pharmacy & AIIMS NORCET",
    icon: Stethoscope,
  },
  {
    id: "teaching",
    label: "Teaching & Eligibility",
    description: "UGC-NET, CTET, MP-TET, REET, UP-TET, D.El.Ed, BSTC",
    icon: GraduationCap,
  },
  {
    id: "defence",
    label: "Defence Services",
    description: "NDA NA, Indian Army Agniveer, NCC Certificates",
    icon: Award,
  },
  {
    id: "law",
    label: "Law & Judiciary",
    description: "AIBE, CLAT, Rajasthan Judicial Service, Civil Judge Exams",
    icon: Scale,
  },
  {
    id: "school-boards",
    label: "School Boards & Entrance",
    description: "CBSE, ICSE, Navodaya JNVST, Sainik School AISSEE, NMMS, NTSE & State Boards",
    icon: School,
  },
  {
    id: "management",
    label: "Management & Others",
    description: "CAT, CMAT, CUET and National Entrance Tests",
    icon: BookOpen,
  },
];

export function getExamDomain(e: { slug: string; kind?: string; name: string }): ExamDomain {
  // 1. School Boards & Entrance / Scholarships
  if (e.kind === "board") {
    return EXAM_DOMAINS.find((d) => d.id === "school-boards")!;
  }

  const s = e.slug.toLowerCase();
  const n = e.name.toLowerCase();

  // School boards or school exams with specific slugs
  if (
    s.includes("board") ||
    s.includes("cbse") ||
    s.includes("icse") ||
    s.includes("jnvst") ||
    s.includes("aissee") ||
    s.includes("nmms") ||
    s.includes("ntse") ||
    s.includes("rms") ||
    s.includes("nso") ||
    s.includes("open-school") ||
    s.includes("toss")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "school-boards")!;
  }

  // 2. Civil Services & State PSC
  if (
    s === "upsc" ||
    s.includes("mppsc") ||
    s.includes("uppsc") ||
    s.includes("kpsc") ||
    s.includes("rpsc") ||
    s.includes("upsssc")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "civil-services")!;
  }

  // 3. Banking & Finance
  if (
    s.includes("sbi") ||
    s.includes("caiib") ||
    s.includes("jaiib") ||
    s.includes("ca-cma-cs") ||
    s.includes("bank") ||
    n.includes("bank") ||
    n.includes("sbi")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "banking-finance")!;
  }

  // 4. Staff Selection & Police
  if (
    s === "ssc" ||
    s.includes("police") ||
    s.includes("constable") ||
    s.includes("sub-inspector") ||
    s.includes("rpf") ||
    s.includes("stenography") ||
    s.includes("4th-grade") ||
    n.includes("ssc") ||
    n.includes("police")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "ssc-police")!;
  }

  // 5. Engineering
  if (
    s === "gate" ||
    s === "jee" ||
    s.includes("wbjee") ||
    s.includes("jeecup") ||
    n.includes("engineering")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "engineering")!;
  }

  // 6. Medical, Nursing & Pharmacy
  if (
    s === "neet" ||
    s.includes("nursing") ||
    s.includes("gpat") ||
    s.includes("aiapget") ||
    s.includes("drug-inspector") ||
    s.includes("niper") ||
    s.includes("norcet") ||
    s.includes("anm") ||
    n.includes("medical") ||
    n.includes("nursing") ||
    n.includes("pharmacy")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "medical")!;
  }

  // 7. Teaching & TET
  if (
    s.includes("ugc-net") ||
    s.includes("tet") ||
    s.includes("reet") ||
    s.includes("ctet") ||
    s.includes("csir-net") ||
    s.includes("deled") ||
    s.includes("bstc") ||
    s.includes("ptet") ||
    n.includes("teacher") ||
    n.includes("eligibility test")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "teaching")!;
  }

  // 8. Defence
  if (
    s === "nda" ||
    s.includes("agniveer") ||
    s.includes("ncc") ||
    n.includes("army") ||
    n.includes("defence")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "defence")!;
  }

  // 9. Law & Judiciary
  if (
    s === "aibe" ||
    s === "clat" ||
    s.includes("judicial") ||
    s.includes("civil-judge") ||
    s.includes("nlsat") ||
    s.includes("court") ||
    s.includes("adpo") ||
    n.includes("law") ||
    n.includes("judge") ||
    n.includes("judicial")
  ) {
    return EXAM_DOMAINS.find((d) => d.id === "law")!;
  }

  // 10. Management & Others
  if (s === "cat" || s.includes("cmat") || s === "cuet") {
    return EXAM_DOMAINS.find((d) => d.id === "management")!;
  }

  return EXAM_DOMAINS.find((d) => d.id === "all")!;
}

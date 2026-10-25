export interface ExamDomain {
  id: string;
  label: string;
  description: string;
}

export const EXAM_DOMAINS: ExamDomain[] = [
  {
    id: "all",
    label: "All Categories",
    description: "Browse all competitive examinations and school boards across India",
  },
  {
    id: "civil-services",
    label: "Civil Services & State PSC",
    description: "UPSC CSE, MPPSC, UPPSC, State Public Service Commissions",
  },
  {
    id: "banking-finance",
    label: "Banking & Finance",
    description: "SBI Clerk / PO, CAIIB, JAIIB, CA, CMA & CS",
  },
  {
    id: "ssc-police",
    label: "Staff Selection & Police",
    description: "SSC CGL, CHSL, Constable, Police SI & State Forces",
  },
  {
    id: "engineering",
    label: "Engineering Entrance",
    description: "GATE, JEE Main & Advanced, WBJEE, Polytechnic",
  },
  {
    id: "medical",
    label: "Medical & Nursing",
    description: "NEET, B.Sc. Nursing, GPAT, Pharmacy & AIIMS NORCET",
  },
  {
    id: "teaching",
    label: "Teaching & Eligibility",
    description: "UGC-NET, CTET, MP-TET, REET, UP-TET, D.El.Ed, BSTC",
  },
  {
    id: "defence",
    label: "Defence Services",
    description: "NDA NA, Indian Army Agniveer, NCC Certificates",
  },
  {
    id: "law",
    label: "Law & Judiciary",
    description: "AIBE, CLAT, Rajasthan Judicial Service, Civil Judge Exams",
  },
  {
    id: "school-boards",
    label: "School Boards & Entrance",
    description: "CBSE, ICSE, Navodaya JNVST, Sainik School AISSEE, NMMS, NTSE & State Boards",
  },
  {
    id: "management",
    label: "Management & Others",
    description: "CAT, CMAT, CUET and National Entrance Tests",
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

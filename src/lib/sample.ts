// A hand-written sample job (a fictional hospital patient-access role) used by /dev/engine and as
// the offline demo when no key is available. Every person and figure in it is fictional.
import type { StoryResult } from "./types";

export const SAMPLE: StoryResult = {
  brief: {
    employer: "Riverside Health (sample)",
    title: "Patient Access Coordinator",
    location: "Washington, DC",
    seniority: "Entry level",
    oneLiner: "Gets every patient registered, insured and scheduled correctly before care begins.",
    orgContext: [
      { text: "A community hospital network serving outpatients and inpatients.", basis: "posting" },
      { text: "Hospitals are paid by insurers only when registration and coverage details are correct.", basis: "general-knowledge" },
    ],
    responsibilities: [
      { id: "R1", text: "Register patients and verify identity" },
      { id: "R2", text: "Check insurance eligibility before visits" },
      { id: "R3", text: "Schedule appointments across departments" },
      { id: "R4", text: "Explain costs and forms to patients" },
    ],
    required: [{ id: "Q1", text: "High school diploma" }, { id: "Q2", text: "Customer service experience" }],
    preferred: [{ id: "P1", text: "Experience with Epic or a similar system" }],
    keywords: ["registration", "eligibility", "scheduling", "HIPAA", "customer service"],
    interviewQuestions: [
      { question: "A patient's insurance shows inactive on the day of a visit. What do you do?", strongAnswerHas: ["verify again with the insurer", "explain options calmly", "involve financial counseling"] },
    ],
    unknowns: ["Shift pattern", "Pay range"],
  },
  cast: [
    { key: "maya", name: "Maya Okoro", role: "Coordinator", skin: "skin4", hair: "hairBlack", style: "puff", top: "cardigan", topColor: "sage", bottom: "charcoal", lower: "trousers", glasses: false },
    { key: "sam", name: "Sam Patel", role: "Patient", skin: "skin2", hair: "hairBrown", style: "short", top: "sweater", topColor: "denim", bottom: "navy", lower: "trousers", glasses: true },
  ],
  story: {
    id: "00", title: "Patient Access Coordinator", part: "Part I · The organization",
    goal: "Understand why a hospital needs patient access, and what this role decides.",
    scenes: [
      { id: "open", headline: "The front door of care", fiction: false, recipe: "opener",
        narration: "Every hospital visit starts at a desk. Patient access is the front door of care, and this role keeps it open.",
        data: { kicker: "The role in one minute", title: "The front door of care", subtitle: "Correct details before treatment", glyph: "building" } },
      { id: "org", headline: "Who the hospital serves", fiction: false, recipe: "org",
        narration: "The hospital serves patients. It is paid by insurers, it relies on doctors to treat people, and it answers to regulators who protect privacy.",
        data: { center: { label: "The hospital", glyph: "building" }, around: [
          { label: "Patients", relation: "receive care", glyph: "person" },
          { label: "Insurers", relation: "pay for care", glyph: "coin" },
          { label: "Doctors", relation: "treat people", glyph: "idCard" },
          { label: "Regulators", relation: "protect privacy", glyph: "lock" } ] } },
      { id: "flow", headline: "How a visit becomes care", fiction: false, recipe: "flow",
        narration: "A visit moves in four steps. Register the patient, verify the insurance, schedule the visit, then treat. This role owns the first three.",
        data: { steps: [ { label: "Register", glyph: "form" }, { label: "Verify insurance", glyph: "magnifier" }, { label: "Schedule", glyph: "calendar" }, { label: "Treat", glyph: "person" } ], active: 1 } },
      { id: "case", headline: "A coverage problem", fiction: true, recipe: "record",
        narration: "In a fictional example, Maya opens Sam's record. The visit is tomorrow, the insurer says inactive, and the plan ended last month.",
        data: { header: "Patient record", title: "Sam Patel, visit tomorrow", rows: [ { field: "Visit", value: "Tomorrow" }, { field: "Insurer", value: "Inactive" }, { field: "Plan", value: "Ended last month" } ], state: "proposed" } },
      { id: "choice", headline: "What a strong coordinator does", fiction: true, recipe: "compare",
        narration: "A weak move is to cancel the visit. A strong move is to call the insurer, check for new coverage, and explain the options to Sam.",
        data: { title: "Two ways to respond", left: { title: "Weak move", rows: ["Cancel the visit", "Leave a voicemail"] }, right: { title: "Strong move", rows: ["Call the insurer", "Check new coverage", "Explain the options"] }, takeaway: "Protect the patient and the hospital at once" } },
      { id: "hire", headline: "What they hire for", fiction: false, recipe: "statement",
        narration: "So they are really hiring for accuracy under pressure, with kindness for people who are worried.",
        data: { text: "They hire for accuracy under pressure", emphasis: "accuracy" } },
      { id: "check", headline: "Check yourself", fiction: false, recipe: "question",
        narration: "Check yourself. Insurance shows inactive the day before a visit. What do you do first? Verify again with the insurer. Build the full course to practise this.",
        data: { prompt: "Insurance shows inactive the day before a visit. First step?", options: ["Cancel the visit", "Verify with the insurer", "Ask the doctor"], correct: 1, reason: "Coverage often changes; check before deciding." } },
    ],
    question: "Insurance shows inactive the day before a visit. What do you do first?",
    options: ["Cancel the visit", "Verify again with the insurer", "Ask the doctor to decide", "Charge the patient in full"],
    answer: 1, explanation: "Coverage data is often out of date; verify before acting.",
    optionFeedback: ["Too early: the data may be wrong.", "Right: verify first.", "Doctors don't decide coverage.", "Unfair before checking."],
    keyTerms: [{ term: "Eligibility", definition: "Whether an insurer will pay for this patient's visit." }],
  },
};

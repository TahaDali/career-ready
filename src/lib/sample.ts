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
    keywords: ["registration", "eligibility", "member ID", "claim denials", "scheduling", "HIPAA", "customer service"],
    interviewQuestions: [
      { question: "A patient's insurance shows inactive on the day of a visit. What do you do?", strongAnswerHas: ["verify again with the insurer", "explain options calmly", "involve financial counseling"] },
      { question: "A returning patient says nothing has changed. Do you check their insurance again?", strongAnswerHas: ["yes, at every visit", "plans change without patients mentioning it", "a wrong member ID gets claims denied"] },
      { question: "Tell us about a time you caught a mistake before it reached a customer.", strongAnswerHas: ["a specific situation", "how you noticed it", "what you changed so it would not repeat"] },
    ],
    unknowns: ["Shift pattern", "Pay range"],
  },
  cast: [
    { key: "maya", name: "Maya Okoro", role: "Coordinator", skin: "skin4", hair: "hairBlack", style: "puff", top: "cardigan", topColor: "sage", bottom: "charcoal", lower: "trousers", glasses: false },
    { key: "sam", name: "Sam Patel", role: "Patient", skin: "skin2", hair: "hairBrown", style: "short", top: "sweater", topColor: "denim", bottom: "navy", lower: "trousers", glasses: true },
    { key: "dana", name: "Dana Reyes", role: "Access Supervisor", skin: "skin3", hair: "hairGrey", style: "bob", top: "blazer", topColor: "navy", bottom: "charcoal", lower: "skirt", glasses: true },
    { key: "omar", name: "Omar Haddad", role: "Billing Specialist", skin: "skin5", hair: "hairBlack", style: "short", top: "shirt", topColor: "slate", bottom: "charcoal", lower: "trousers", glasses: false },
  ],
  story: {
    id: "00", title: "Patient Access Coordinator", part: "Part I · The organization",
    goal: "Understand why a hospital needs patient access, and what this role decides.",
    scenes: [
      { id: "open", headline: "Care starts at the desk", fiction: false, recipe: "opener",
        narration: "Before a doctor sees anyone, a hospital must know who you are and who pays. Patient access is the front door of care.",
        data: { kicker: "The role in one minute", title: "The front door of care", subtitle: "Who you are, who pays", glyph: "building" } },
      { id: "org", headline: "Who the hospital serves", fiction: false, recipe: "org",
        narration: "Riverside Health serves patients. Insurers pay for most of their care, doctors treat people, and regulators protect patient privacy.",
        data: { center: { label: "Riverside Health", glyph: "building" }, around: [
          { label: "Patients", relation: "receive care", glyph: "person" },
          { label: "Insurers", relation: "pay for care", glyph: "coin" },
          { label: "Doctors", relation: "treat people", glyph: "idCard" },
          { label: "Regulators", relation: "protect privacy", glyph: "lock" } ] } },
      { id: "flow", headline: "Where this role sits", fiction: false, recipe: "flow",
        narration: "Every visit moves through four steps: register, verify insurance, schedule, then treat. This role owns the first three, before care begins.",
        data: { steps: [ { label: "Register", glyph: "form" }, { label: "Verify insurance", glyph: "magnifier" }, { label: "Schedule", glyph: "calendar" }, { label: "Treat", glyph: "person" } ], active: 1 } },
      { id: "denial", headline: "A claim comes back", fiction: true, recipe: "record",
        narration: "In a fictional example, Sam Patel has a knee MRI. Weeks later, the $1,200 claim comes back denied. Reason: member not found.",
        data: { header: "Claim", title: "Sam's knee MRI claim", rows: [ { field: "Amount", value: "$1,200" }, { field: "Status", value: "Denied" }, { field: "Reason", value: "Member not found" } ], state: "decided" } },
      { id: "why", headline: "Maya finds the cause", fiction: true, recipe: "cast",
        narration: "Maya Okoro, a coordinator, calls Sam. He says: I switched plans in January. I showed my new card. The member ID was never updated.",
        data: { people: ["sam", "maya"], line: { who: "sam", text: "I switched plans in January. I showed my new card." } } },
      { id: "hire", headline: "What they hire for", fiction: false, recipe: "compare",
        narration: "A rushed desk copies last visit and fixes it later. A careful desk checks every visit, asks what changed, and explains kindly. They hire for accuracy under pressure.",
        data: { title: "What they hire for", left: { title: "Rushed desk", rows: ["Copies last visit", "Fixes it later"] }, right: { title: "Careful desk", rows: ["Checks every visit", "Asks what changed", "Explains kindly"] }, takeaway: "They hire for accuracy under pressure" } },
      { id: "check", headline: "Check yourself", fiction: false, recipe: "question",
        narration: "Check yourself. Insurance shows inactive before a visit. Do you cancel the visit, verify with the insurer, or ask the doctor? Build the full course to practise this.",
        data: { prompt: "Insurance shows inactive before a visit. First step?", options: ["Cancel the visit", "Verify with the insurer", "Ask the doctor"], correct: 1, reason: "Coverage changes; verify before deciding." } },
    ],
    question: "A patient's insurance shows inactive the day before a scheduled visit. What do you do first?",
    options: ["Cancel the visit", "Verify again with the insurer", "Ask the doctor to decide", "Charge the patient in full"],
    answer: 1, explanation: "Coverage data is often out of date, as Sam's plan change showed; verify before acting, then explain the options.",
    optionFeedback: [
      "Too early: the data may be out of date, and the patient loses a visit they may be covered for.",
      "Right: verify first, then explain the options calmly.",
      "Doctors decide care, not coverage.",
      "Charging in full before checking is unfair and often unnecessary.",
    ],
    keyTerms: [
      { term: "Eligibility", definition: "Whether an insurer will pay for this patient's visit, checked before the visit." },
      { term: "Member ID", definition: "The number an insurer uses to find a patient's coverage; claims are matched on it." },
      { term: "Claim denial", definition: "An insurer's refusal to pay a claim, with a stated reason such as 'member not found'." },
    ],
  },
};

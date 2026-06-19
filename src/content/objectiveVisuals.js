const objectiveVisuals = [
  {
    match: ["1.1"],
    theme: "controls",
    title: "Classify every safeguard two ways",
    caption: "Security+ often asks for both how a control is implemented and what outcome it is meant to create.",
    items: [
      { label: "Category", value: "Technical · Managerial · Operational · Physical" },
      { label: "Function", value: "Preventive · Detective · Corrective · Deterrent · Directive · Compensating" },
      { label: "Selection", value: "Asset → threat → vulnerability → risk → control" },
      { label: "Exam move", value: "Name both the type and the purpose" },
    ],
  },
  {
    match: ["1.2"],
    theme: "triad",
    title: "Security objectives pull in different directions",
    caption: "Good answers identify the primary objective without forgetting the tradeoff with the other two.",
    items: [
      { label: "Confidentiality", value: "Keep data from unauthorized eyes" },
      { label: "Integrity", value: "Keep data and systems trustworthy" },
      { label: "Availability", value: "Keep services usable when needed" },
      { label: "Accountability", value: "Tie actions back to identities" },
    ],
  },
  {
    match: ["1.3"],
    theme: "flow",
    title: "Change control protects production trust",
    caption: "A safe change has evidence before, guardrails during, and verification after implementation.",
    items: [
      { label: "Request", value: "Business need and scope" },
      { label: "Assess", value: "Risk, impact, and rollback" },
      { label: "Approve", value: "Authority and scheduling" },
      { label: "Validate", value: "Test, monitor, document" },
    ],
  },
  {
    match: ["1.4", "3.4"],
    theme: "chain",
    title: "Cryptography is a trust chain, not magic dust",
    caption: "Choose the primitive for the job: hide content, detect change, prove origin, or manage trust.",
    items: [
      { label: "Encrypt", value: "Confidentiality" },
      { label: "Hash", value: "Integrity check" },
      { label: "Sign", value: "Integrity plus origin" },
      { label: "Certificate", value: "Identity bound to public key" },
    ],
  },
  {
    match: ["2."],
    theme: "attack",
    title: "Read questions as an attack path",
    caption: "Most threat questions become easier when you separate entry, execution, persistence, movement, and impact.",
    items: [
      { label: "Initial access", value: "Phish, exploit, stolen credential" },
      { label: "Execution", value: "Script, malware, living-off-the-land" },
      { label: "Persistence", value: "Service, task, account, backdoor" },
      { label: "Impact", value: "Exfiltration, disruption, extortion" },
    ],
  },
  {
    match: ["3.1"],
    theme: "stack",
    title: "Architecture choices move responsibility boundaries",
    caption: "On-prem, cloud, hybrid, IoT, and ICS designs shift who owns identity, network, platform, and data protections.",
    items: [
      { label: "Physical", value: "Facility and hardware ownership" },
      { label: "Platform", value: "Shared by service model" },
      { label: "Identity + data", value: "Almost always customer-owned" },
      { label: "Operations", value: "Monitoring, response, recovery" },
    ],
  },
  {
    match: ["3.2"],
    theme: "zeroTrust",
    title: "Zero trust evaluates each request",
    caption: "The decision comes from identity, device health, resource sensitivity, behavior, and policy—not network location alone.",
    items: [
      { label: "Identity", value: "Who is asking?" },
      { label: "Device", value: "Is it healthy?" },
      { label: "Resource", value: "What is at stake?" },
      { label: "Policy", value: "Allow, deny, or step up" },
    ],
  },
  {
    match: ["3.3"],
    theme: "lifecycle",
    title: "Data protection follows the data",
    caption: "Classification drives the right control at each state and each point in the lifecycle.",
    items: [
      { label: "Create", value: "Classify and label" },
      { label: "Store", value: "Encrypt and restrict" },
      { label: "Use / share", value: "Mask, tokenize, monitor" },
      { label: "Dispose", value: "Retain, hold, or destroy" },
    ],
  },
  {
    match: ["3.4"],
    theme: "timeline",
    title: "Recovery decisions live on a timeline",
    caption: "RTO is how long the business can wait; RPO is how much data loss the business can tolerate.",
    items: [
      { label: "Normal", value: "Baseline operations" },
      { label: "Incident", value: "Service interruption" },
      { label: "Restore", value: "Meet the RTO target" },
      { label: "Recover data", value: "Meet the RPO target" },
    ],
  },
  {
    match: ["4.1", "4.2"],
    theme: "baseline",
    title: "Operations turns standards into drift control",
    caption: "Secure builds, inventory, monitoring, and lifecycle work keep the real environment aligned with the intended baseline.",
    items: [
      { label: "Inventory", value: "Know what exists" },
      { label: "Baseline", value: "Define secure state" },
      { label: "Monitor", value: "Detect configuration drift" },
      { label: "Retire", value: "Remove safely from service" },
    ],
  },
  {
    match: ["4.3"],
    theme: "funnel",
    title: "Vulnerability work is prioritization under pressure",
    caption: "Severity matters, but exposure, exploitability, business criticality, and compensating controls decide what moves first.",
    items: [
      { label: "Discover", value: "Scan and validate" },
      { label: "Prioritize", value: "Risk, not score alone" },
      { label: "Remediate", value: "Patch, configure, isolate" },
      { label: "Verify", value: "Confirm the risk changed" },
    ],
  },
  {
    match: ["4.4", "4.5", "4.7", "4.8", "4.9"],
    theme: "signal",
    title: "Investigation connects signals to decisions",
    caption: "Logs and tools matter because they support triage, containment, evidence quality, and lessons learned.",
    items: [
      { label: "Collect", value: "Logs, alerts, artifacts" },
      { label: "Correlate", value: "Timeline and scope" },
      { label: "Contain", value: "Limit additional damage" },
      { label: "Learn", value: "Root cause and fixes" },
    ],
  },
  {
    match: ["4.6"],
    theme: "identity",
    title: "Identity operations is a lifecycle",
    caption: "Access should be requested, approved, used, reviewed, and removed with accountability at every step.",
    items: [
      { label: "Join", value: "Provision least privilege" },
      { label: "Move", value: "Review role changes" },
      { label: "Elevate", value: "PAM or JIT for admin work" },
      { label: "Leave", value: "Deprovision quickly" },
    ],
  },
  {
    match: ["5.1"],
    theme: "governance",
    title: "Governance creates the decision ladder",
    caption: "Policies state intent; standards define rules; procedures tell people how; evidence proves it happened.",
    items: [
      { label: "Policy", value: "What must be true" },
      { label: "Standard", value: "Measurable requirement" },
      { label: "Procedure", value: "Repeatable steps" },
      { label: "Evidence", value: "Audit-ready proof" },
    ],
  },
  {
    match: ["5.2"],
    theme: "risk",
    title: "Risk management is a loop",
    caption: "Identify, analyze, treat, and report risk in terms the business can act on.",
    items: [
      { label: "Identify", value: "Asset, threat, weakness" },
      { label: "Analyze", value: "Likelihood and impact" },
      { label: "Treat", value: "Avoid, transfer, mitigate, accept" },
      { label: "Report", value: "Owners and status" },
    ],
  },
  {
    match: ["5.3"],
    theme: "vendor",
    title: "Third-party risk follows dependency chains",
    caption: "The risk is not only the vendor—it is the data, access, subcontractors, contract terms, and exit path.",
    items: [
      { label: "Due diligence", value: "Before onboarding" },
      { label: "Contract", value: "Security obligations" },
      { label: "Monitor", value: "Ongoing assurance" },
      { label: "Exit", value: "Return or destroy data" },
    ],
  },
  {
    match: ["5.4"],
    theme: "audit",
    title: "Compliance asks for control evidence",
    caption: "Audits and assessments compare requirements, implemented controls, and evidence—not good intentions.",
    items: [
      { label: "Requirement", value: "Law, regulation, contract" },
      { label: "Control", value: "Safeguard in place" },
      { label: "Evidence", value: "Log, ticket, report" },
      { label: "Finding", value: "Gap and remediation" },
    ],
  },
  {
    match: ["5.5", "5.6"],
    theme: "resilience",
    title: "Program work changes behavior and resilience",
    caption: "Awareness, metrics, BIA, and executive reporting connect human behavior to business recovery goals.",
    items: [
      { label: "Behavior", value: "Train and reinforce" },
      { label: "Impact", value: "BIA and priorities" },
      { label: "Metric", value: "Trend that guides action" },
      { label: "Executive", value: "Decision-ready summary" },
    ],
  },
];

function objectiveMatches(objective, visual) {
  const normalized = String(objective ?? "");
  return visual.match.some((token) => normalized.includes(token));
}

export function getObjectiveVisual(activity) {
  if (!activity || activity.type !== "lesson") return null;
  return objectiveVisuals.find((visual) => objectiveMatches(activity.objective, visual)) ?? null;
}

export { objectiveVisuals };

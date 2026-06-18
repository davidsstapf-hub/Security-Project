import { Blocks, Bug, Building2, Radar, Scale } from 'lucide-react'
import { securityControlCards, securityControlKnowledgeCheck, securityControlSectionQuiz, securityControlsReading } from './sections/securityControls.js'
import { ciaTriadCards, ciaTriadKnowledgeCheck, ciaTriadReading, ciaTriadSectionQuiz } from './sections/ciaTriad.js'

/** @typedef {'lesson'|'flashcards'|'quiz'|'checkpoint'} ActivityType */
/** @typedef {'foundation'|'developing'|'applied'|'advanced'|'synthesis'} Difficulty */

export const domains = [
  { id: 1, short: 'D1', title: 'General Security Concepts', weight: 12, color: '#00d9ff', icon: Blocks, topics: ['Security controls', 'CIA triad', 'Zero trust', 'Change management', 'Cryptography'] },
  { id: 2, short: 'D2', title: 'Threats, Vulnerabilities & Mitigations', weight: 22, color: '#ffb86b', icon: Bug, topics: ['Threat actors', 'Attack surfaces', 'Social engineering', 'Malware', 'Mitigations'] },
  { id: 3, short: 'D3', title: 'Security Architecture', weight: 18, color: '#8aa7ff', icon: Building2, topics: ['Cloud models', 'Infrastructure', 'Data protection', 'Resilience', 'Recovery'] },
  { id: 4, short: 'D4', title: 'Security Operations', weight: 28, color: '#e78cff', icon: Radar, topics: ['Hardening', 'Vulnerability management', 'Monitoring', 'Incident response', 'Forensics'] },
  { id: 5, short: 'D5', title: 'Program Management & Oversight', weight: 20, color: '#ff7c89', icon: Scale, topics: ['Governance', 'Risk', 'Third parties', 'Compliance', 'Awareness'] },
]

const tier1Questions = [
  {
    id: 't1-q-cia-availability',
    objective: '1.2',
    domain: 1,
    prompt: 'A payroll system must remain usable during a regional power outage. Which security objective is the primary concern?',
    options: ['Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'],
    correctIndex: 2,
    explanation: 'Availability keeps systems and data accessible when needed. Redundant power, failover, and recovery planning directly support it.',
  },
  {
    id: 't1-q-control-type',
    objective: '1.1',
    domain: 1,
    prompt: 'A security guard checks badges before anyone enters a data center. Which control categories best describe this?',
    options: ['Technical and detective', 'Physical and preventive', 'Managerial and corrective', 'Operational and compensating'],
    correctIndex: 1,
    explanation: 'The guard is a physical control, and checking badges is intended to prevent unauthorized access before it occurs.',
  },
  {
    id: 't1-q-least-privilege',
    objective: '1.2',
    domain: 1,
    prompt: 'A new analyst receives read-only access to logs but cannot change alert rules. Which principle is being applied?',
    options: ['Open design', 'Least privilege', 'Non-repudiation', 'Implicit trust'],
    correctIndex: 1,
    explanation: 'Least privilege grants only the access required to perform assigned work, reducing accidental and malicious impact.',
  },
  {
    id: 't1-q-pretexting',
    objective: '2.2',
    domain: 2,
    prompt: 'An attacker calls the help desk and pretends to be an executive who urgently needs a password reset. What technique is being used?',
    options: ['Typosquatting', 'Pretexting', 'Watering-hole attack', 'Credential stuffing'],
    correctIndex: 1,
    explanation: 'Pretexting uses a fabricated identity or scenario to persuade a target to disclose information or take an unsafe action.',
  },
  {
    id: 't1-q-authentication',
    objective: '4.6',
    domain: 4,
    prompt: 'A user enters a password and then approves a push notification. What security concept does this demonstrate?',
    options: ['Federation', 'Multifactor authentication', 'Single sign-on', 'Authorization'],
    correctIndex: 1,
    explanation: 'A password is something the user knows, while the approved device is something the user has: two different authentication factors.',
  },
]

/** @type {Array<{id:string,number:number,title:string,subtitle:string,difficulty:Difficulty,color:string,minutes:number,recommendedAfter:number|null,modules:Array}>} */
export const tiers = [
  {
    id: 'tier-1', number: 1, title: 'Foundations', subtitle: 'Learn the language of security', difficulty: 'foundation', color: '#00d9ff', minutes: 112, recommendedAfter: null,
    modules: [
      {
        id: 't1-controls-section', title: 'Section 1 · Security controls', summary: 'Learn how safeguards are categorized, what jobs they perform, and how layers reduce risk.',
        activities: [
          { id: 't1-controls', type: 'lesson', title: 'Security controls, decoded', duration: 10, required: true, domain: 1, objective: '1.1', difficulty: 'foundation', summary: 'Read six focused sections covering categories, functions, defense in depth, and risk-based selection.', learningObjectives: ['Distinguish control categories from control functions', 'Classify common safeguards using both dimensions', 'Explain defense in depth and risk-based selection'], headings: ['Two questions, one control', 'The four categories', 'The six functions', 'Classify by purpose', 'Build overlapping layers', 'Choose controls for risk'], content: securityControlsReading },
          { id: 't1-controls-scenario', type: 'lesson', title: 'Worked scenario · Protecting a clinic', duration: 12, required: true, domain: 1, objective: '1.1', difficulty: 'foundation', summary: 'Classify a layered set of safeguards protecting sensitive patient records.', learningObjectives: ['Explain why MFA is stronger than a password alone', 'Classify clinic safeguards by category and function', 'Recognize how preventive, detective, and corrective controls work together'], media: { src: '/images/mfa-clinic-security.png', alt: 'Electric-blue illustration of a secure phone, shield, keypad, security key, and fingerprint representing three authentication factors.', caption: 'Multifactor authentication combines evidence from different factor categories: something you know, have, or are.' }, headings: ['A small clinic with serious data', 'Why a password is not enough', 'What makes authentication multifactor', 'Classify the controls by category', 'Classify the controls by function', 'Detection closes the visibility gap', 'People and recovery matter too', 'A legacy system needs a compensating path'], content: ['A neighborhood clinic stores patient records, insurance details, prescriptions, appointment notes, and billing information in a cloud application. Doctors and nurses need rapid access, but that convenience creates risk: a stolen account could expose private health data, alter clinical information, or interrupt patient care. The clinic therefore needs controls that protect confidentiality, integrity, and availability without making routine treatment impractical.', 'Passwords are vulnerable to phishing, reuse, guessing, malware, and credential stuffing. If the clinic relies on a password alone, possession of that password may be enough to impersonate a staff member. Multifactor authentication reduces this risk by requiring additional evidence. A stolen password is less useful when the attacker must also possess an enrolled device or provide a biometric factor.', 'Authentication factors fall into distinct categories: something you know, such as a password or PIN; something you have, such as a phone, smart card, or hardware security key; and something you are, such as a fingerprint or facial characteristic. Two passwords are still one factor because both are knowledge. True MFA combines at least two different categories. A password plus a security key is multifactor; a password plus a second PIN is not.', 'The clinic’s safeguards span all four control categories. MFA and cloud access rules are technical controls. Weekly log review, security awareness training, backup testing, and account-deprovisioning procedures are operational controls. The clinic’s security policy and periodic risk assessment are managerial controls. Locked networking cabinets, visitor badges, and door access systems are physical controls.', 'The same safeguards also perform different functions. MFA, access rules, and locked rooms are preventive because they attempt to stop unauthorized access. Log monitoring and access reviews are detective because they identify suspicious behavior or improper permissions. Training is directive because it communicates required behavior and preventive because it helps staff avoid unsafe actions. Tested restoration procedures are corrective because they help return the clinic to a trusted operating state.', 'Prevention cannot provide complete certainty. The clinic reviews sign-in location, repeated failures, impossible travel, unusual download volume, and access outside normal work patterns. These signals may reveal a compromised account that passed authentication. Alerts should lead to a defined response: validate the activity, contain the account, preserve relevant records, reset credentials, and determine whether patient information was accessed.', 'Technology is only part of the system. Staff need a simple way to report suspicious login prompts and phishing messages. Administrators must remove access promptly when employment changes. The clinic also maintains encrypted, isolated backups and regularly tests restoration. Backups do not prevent account compromise, but they provide corrective recovery if ransomware or accidental deletion damages operational data.', 'Suppose one legacy workstation cannot support MFA directly. Removing every other safeguard would create an obvious gap, but replacing the workstation may not be immediate. The clinic can require access through a hardened jump server that enforces MFA, restrict the workstation to a segmented network, increase monitoring, and document the exception. These compensating controls do not erase the risk; they reduce it while the clinic works toward the preferred solution.'] },
          { id: 't1-controls-cards', type: 'flashcards', title: 'Security controls flashcards', duration: 8, required: true, domain: 1, objective: '1.1', difficulty: 'foundation', summary: 'Practice 14 essential control categories, functions, and selection concepts.', cards: securityControlCards },
          { id: 't1-controls-check', type: 'quiz', title: 'Coached knowledge check', duration: 8, required: true, domain: 1, objective: '1.1', difficulty: 'foundation', summary: 'Answer five questions with immediate explanations and no passing requirement.', questions: securityControlKnowledgeCheck },
          { id: 't1-controls-quiz', type: 'quiz', title: 'Security controls section quiz', duration: 12, required: true, domain: 1, objective: '1.1', difficulty: 'foundation', summary: 'Complete ten mixed questions to finish the Security Controls section.', questions: securityControlSectionQuiz },
        ],
      },
      {
        id: 't1-cia-section', title: 'Section 2 · The CIA triad', summary: 'Use confidentiality, integrity, and availability to reason about real security outcomes.',
        activities: [
          { id: 't1-cia', type: 'lesson', title: 'The CIA triad in practice', duration: 10, required: true, domain: 1, objective: '1.2', difficulty: 'foundation', summary: 'Read six continuous sections about confidentiality, integrity, availability, and their tradeoffs.', learningObjectives: ['Identify the primary CIA property in a scenario', 'Match common safeguards to each property', 'Recognize tradeoffs between security objectives'], headings: ['A model for security outcomes', 'Confidentiality · control disclosure', 'Integrity · preserve trust', 'Availability · keep services usable', 'Balance the three', 'Read the outcome first'], content: ciaTriadReading },
          { id: 't1-cia-scenario', type: 'lesson', title: 'Worked scenario · Online banking', duration: 6, required: true, domain: 1, objective: '1.2', difficulty: 'foundation', summary: 'Trace how one banking service protects all three parts of the triad.', headings: ['The system', 'Protect confidentiality', 'Protect integrity', 'Protect availability'], content: ['A bank’s mobile application lets customers view balances, transfer money, and deposit checks. Because the service handles sensitive data and financial transactions, a failure can affect every part of the CIA triad.', 'Encryption protects account data while it travels and while it is stored. Strong authentication and authorization prevent customers from viewing another person’s records. These safeguards primarily support confidentiality.', 'Transaction validation, controlled permissions, audit logs, and digital signatures help ensure transfer details remain accurate and unauthorized changes can be detected. These safeguards support integrity and accountability.', 'Redundant services, monitored capacity, tested backups, and recovery plans keep banking functions available during failures. The design must balance all three properties: an available service that exposes records or permits altered transfers is not secure.'] },
          { id: 't1-cia-cards', type: 'flashcards', title: 'CIA triad flashcards', duration: 8, required: true, domain: 1, objective: '1.2', difficulty: 'foundation', summary: 'Practice 14 core terms, safeguards, and tradeoffs.', cards: ciaTriadCards },
          { id: 't1-cia-check', type: 'quiz', title: 'CIA triad knowledge check', duration: 8, required: true, domain: 1, objective: '1.2', difficulty: 'foundation', summary: 'Answer five coached questions with immediate explanations.', questions: ciaTriadKnowledgeCheck },
          { id: 't1-cia-quiz', type: 'quiz', title: 'CIA triad section quiz', duration: 12, required: true, domain: 1, objective: '1.2', difficulty: 'foundation', summary: 'Complete ten mixed questions to finish the CIA Triad section.', questions: ciaTriadSectionQuiz },
        ],
      },
      {
        id: 't1-human-access', title: 'People, identity & common threats', summary: 'Connect access decisions to the human techniques attackers use.',
        activities: [
          { id: 't1-auth', type: 'lesson', title: 'Authentication vs. authorization', duration: 7, required: true, domain: 4, objective: '4.6', difficulty: 'foundation', summary: 'Separate identity proof from permission decisions.', content: ['Authentication asks: “Who are you?” Passwords, security keys, biometrics, and certificates are authentication methods.', 'Authorization asks: “What are you allowed to do?” Roles, policies, and permissions are evaluated after identity has been established.', 'Accounting records what happened. Together, authentication, authorization, and accounting form AAA—a foundational access-control model.'] },
          { id: 't1-threats', type: 'lesson', title: 'Recognizing common threats', duration: 7, required: true, domain: 2, objective: '2.2', difficulty: 'foundation', summary: 'Spot phishing, pretexting, malware, and password attacks without jargon overload.', content: ['Social engineering targets human judgment. Phishing uses deceptive messages, while pretexting builds a believable false story.', 'Malware is malicious software. Ransomware blocks access for payment, spyware collects information, and trojans disguise harmful code as something useful.', 'Password attacks include guessing, spraying common passwords across many accounts, and credential stuffing with passwords stolen elsewhere.'] },
          { id: 't1-check', type: 'quiz', title: 'Low-pressure knowledge check', duration: 8, required: true, domain: 1, objective: '1.1, 1.2, 2.2, 4.6', difficulty: 'foundation', summary: 'Three coached questions with immediate explanations.', questions: tier1Questions.slice(0, 3).map((question) => ({ ...question, id: `t1-check-${question.id}` })) },
          { id: 't1-checkpoint', type: 'checkpoint', title: 'Tier 1 checkpoint', duration: 10, required: true, domain: 1, objective: 'Tier 1 synthesis', difficulty: 'foundation', summary: 'Complete five mixed questions to finish Foundations.', questions: tier1Questions },
        ],
      },
    ],
  },
  {
    id: 'tier-2', number: 2, title: 'Systems & Threats', subtitle: 'See how attacks meet real systems', difficulty: 'developing', color: '#ffb86b', minutes: 85, recommendedAfter: 1,
    modules: [{ id: 't2-preview', title: 'System attack surface', summary: 'Networking, malware, social engineering, IAM, and hardening.', activities: [
      { id: 't2-network', type: 'lesson', title: 'Networks as attack surfaces', duration: 12, required: true, domain: 2, objective: '2.2', difficulty: 'developing', summary: 'Trace common paths into services, endpoints, and identities.' },
      { id: 't2-malware', type: 'lesson', title: 'Malware behavior & defenses', duration: 14, required: true, domain: 2, objective: '2.4', difficulty: 'developing', summary: 'Connect malicious behavior to practical mitigation.' },
      { id: 't2-hardening', type: 'quiz', title: 'Hardening decisions', duration: 10, required: true, domain: 4, objective: '4.1', difficulty: 'developing', summary: 'Choose defensible baseline controls in context.' },
    ] }],
  },
  {
    id: 'tier-3', number: 3, title: 'Secure Architecture', subtitle: 'Design systems that expect pressure', difficulty: 'applied', color: '#8aa7ff', minutes: 105, recommendedAfter: 2,
    modules: [{ id: 't3-preview', title: 'Architecture decisions', summary: 'Cloud, zero trust, cryptography, segmentation, data protection, and resilience.', activities: [
      { id: 't3-cloud', type: 'lesson', title: 'Cloud responsibility models', duration: 15, required: true, domain: 3, objective: '3.1', difficulty: 'applied', summary: 'Know which party protects each layer.' },
      { id: 't3-crypto', type: 'lesson', title: 'Cryptography in context', duration: 16, required: true, domain: 1, objective: '1.4', difficulty: 'applied', summary: 'Select encryption, hashing, and signing for the right job.' },
      { id: 't3-resilience', type: 'checkpoint', title: 'Resilient architecture lab', duration: 18, required: true, domain: 3, objective: '3.4', difficulty: 'applied', summary: 'Balance security, availability, and recovery requirements.' },
    ] }],
  },
  {
    id: 'tier-4', number: 4, title: 'Security Operations', subtitle: 'Detect, contain, recover, improve', difficulty: 'advanced', color: '#e78cff', minutes: 120, recommendedAfter: 3,
    modules: [{ id: 't4-preview', title: 'Operational defense', summary: 'Monitoring, vulnerability management, incident response, forensics, and automation.', activities: [
      { id: 't4-monitor', type: 'lesson', title: 'Reading security telemetry', duration: 16, required: true, domain: 4, objective: '4.4', difficulty: 'advanced', summary: 'Turn logs and alerts into actionable signals.' },
      { id: 't4-response', type: 'lesson', title: 'Incident response lifecycle', duration: 18, required: true, domain: 4, objective: '4.8', difficulty: 'advanced', summary: 'Move from preparation through lessons learned.' },
      { id: 't4-forensics', type: 'checkpoint', title: 'Investigation scenario', duration: 22, required: true, domain: 4, objective: '4.9', difficulty: 'advanced', summary: 'Preserve evidence and reconstruct an incident.' },
    ] }],
  },
  {
    id: 'tier-5', number: 5, title: 'Exam Synthesis', subtitle: 'Connect technical judgment to risk', difficulty: 'synthesis', color: '#ff7c89', minutes: 150, recommendedAfter: 4,
    modules: [{ id: 't5-preview', title: 'Whole-system reasoning', summary: 'Governance, risk, compliance, third parties, and performance-based scenarios.', activities: [
      { id: 't5-risk', type: 'lesson', title: 'Risk as a decision tool', duration: 18, required: true, domain: 5, objective: '5.2', difficulty: 'synthesis', summary: 'Translate technical findings into business choices.' },
      { id: 't5-third-party', type: 'lesson', title: 'Third-party & compliance tradeoffs', duration: 18, required: true, domain: 5, objective: '5.3–5.4', difficulty: 'synthesis', summary: 'Evaluate obligations across organizational boundaries.' },
      { id: 't5-pbq', type: 'checkpoint', title: 'Final scenario lab', duration: 30, required: true, domain: 1, objective: 'Cross-domain synthesis', difficulty: 'synthesis', summary: 'Apply all five domains in an exam-style environment.' },
    ] }],
  },
]

export const allActivities = tiers.flatMap((tier) => tier.modules.flatMap((module) => module.activities.map((activity) => ({ ...activity, tierId: tier.id, tierNumber: tier.number, moduleId: module.id }))))

export function getActivity(activityId) {
  return allActivities.find((activity) => activity.id === activityId)
}

export function getTier(tierId) {
  return tiers.find((tier) => tier.id === tierId)
}

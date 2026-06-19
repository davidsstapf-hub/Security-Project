import { tier3ArchitectureLab, tier3Scenarios } from "./tier3Scenarios.js";
import { tier3QuestionBanks } from "./tier3QuestionBanks.js";
import { tier4InvestigationLab, tier4Scenarios } from "./tier4Scenarios.js";
import { tier4QuestionBanks } from "./tier4QuestionBanks.js";
import { tier4Lessons } from "./tier4Lessons.js";

const letters = ["A", "B", "C", "D"];

function makeQuestions(section, count, offset, prefix) {
  if (section.questions) {
    return section.questions.slice(offset, offset + count).map((question, index) => {
      const rotation = (offset + index) % question.options.length;
      const options = [...question.options.slice(rotation), ...question.options.slice(0, rotation)];
      return {
        ...question,
        id: `${section.id}-${prefix}-${index + 1}`,
        objective: question.objective ?? section.objective,
        domain: section.domain,
        options,
        correctIndex: options.indexOf(question.options[question.correctIndex]),
      };
    });
  }
  return Array.from({ length: count }, (_, index) => {
    const answerIndex = (index + offset) % section.terms.length;
    const answer = section.terms[answerIndex];
    const choices = [
      answer,
      ...[1, 2, 3].map(
        (step) => section.terms[(answerIndex + step) % section.terms.length],
      ),
    ];
    const rotation = index % choices.length;
    const options = [
      ...choices.slice(rotation),
      ...choices.slice(0, rotation),
    ].map(([term]) => term);
    return {
      id: `${section.id}-${prefix}-${index + 1}`,
      objective: section.objective,
      domain: section.domain,
      prompt: `${section.title}: which term best matches this description — ${answer[1]}`,
      options,
      correctIndex: options.indexOf(answer[0]),
      explanation: `${answer[0]} is the best answer because it means ${answer[1].charAt(0).toLowerCase()}${answer[1].slice(1)}`,
    };
  });
}

function makeSection(section, tier) {
  const base = `t${tier.number}-${section.id}`;
  const common = {
    required: true,
    domain: section.domain,
    objective: section.objective,
    difficulty: tier.difficulty,
  };
  return {
    id: `${base}-section`,
    title: `Section ${section.number} · ${section.title}`,
    summary: section.summary,
    activities: [
      {
        id: base,
        type: "lesson",
        title: section.title,
        duration: 12,
        ...common,
        summary: section.summary,
        learningObjectives: section.objectives,
        headings: section.headings,
        content: section.reading,
      },
      {
        id: `${base}-scenario`,
        type: "scenario",
        title: `Worked scenario · ${section.scenario.title}`,
        duration: 9,
        ...common,
        summary: section.scenario.summary,
        instructions: section.scenario.instructions,
        evidence: section.scenario.evidence,
        actions: section.scenario.actions,
        scoringRules: section.scenario.scoringRules,
        hints: section.scenario.hints,
        explanation: section.scenario.explanation,
      },
      {
        id: `${base}-cards`,
        type: "flashcards",
        title: `${section.title} flashcards`,
        duration: 9,
        ...common,
        summary: `Practice ${section.terms.length} essential terms and decisions.`,
        cards: section.terms,
      },
      {
        id: `${base}-check`,
        type: "quiz",
        title: `${section.title} knowledge check`,
        duration: 8,
        ...common,
        summary: "Answer five coached questions with immediate explanations.",
        questions: makeQuestions(section, 5, 0, "kc"),
      },
      {
        id: `${base}-quiz`,
        type: "quiz",
        title: `${section.title} section quiz`,
        duration: 12,
        ...common,
        summary: `Complete ten questions to finish ${section.title}.`,
        questions: makeQuestions(section, 10, section.questions ? 5 : 4, "sq"),
      },
    ],
  };
}

const term = (name, definition) => [name, definition];
const genericScenario = (title, focus) => ({
  title,
  summary: `Apply ${focus} to a realistic security decision.`,
  instructions: `Review the evidence, select the three actions that best reduce immediate and long-term risk, then compare your reasoning with the field explanation.`,
  evidence: [
    `A production service shows an unexpected security signal.`,
    `The service supports a time-sensitive business process.`,
    `Existing documentation and ownership information are incomplete.`,
  ],
  actions: [
    {
      id: "preserve",
      label: "Preserve relevant evidence and establish scope",
      correct: true,
    },
    {
      id: "contain",
      label: `Apply a targeted ${focus} control`,
      correct: true,
    },
    {
      id: "owner",
      label: "Notify the accountable owner and record the decision",
      correct: true,
    },
    {
      id: "erase",
      label: "Erase the affected system before collecting evidence",
      correct: false,
    },
    {
      id: "ignore",
      label: "Wait for user reports before investigating",
      correct: false,
    },
  ],
  scoringRules: {
    pointsPerCorrect: 1,
    penaltyPerIncorrect: 1,
    passingScore: 2,
  },
  hints: [
    "Protect evidence before making irreversible changes.",
    "Prefer scoped containment over an unplanned outage.",
  ],
  explanation: `Strong handling combines evidence preservation, proportionate containment, clear ownership, and documented follow-through. ${focus} is useful only when it supports the risk decision rather than becoming a checkbox.`,
});

const tier2Scenarios = {
  network: {
    title: "The management port nobody meant to publish",
    summary: "Contain an exposed administrative service without losing the evidence needed to determine whether it was used.",
    instructions: "Review the scan and authentication evidence. Select the three actions that best reduce immediate risk while preserving a defensible investigation path.",
    evidence: [
      "An external scan finds TCP 8443 open on a firewall management interface that should be reachable only from the administration VLAN.",
      "The interface log contains repeated failures followed by one successful login from an unfamiliar hosting-provider address.",
      "Changing the public rule will not interrupt customer traffic, but powering off the firewall will stop two production sites.",
    ],
    actions: [
      { id: "restrict", label: "Remove public reachability and permit the management interface only from the administration path", correct: true },
      { id: "preserve", label: "Export firewall, identity, and configuration logs before their retention window rolls over", correct: true },
      { id: "rotate", label: "Revoke active administrator sessions and rotate the affected administrative credential", correct: true },
      { id: "shutdown", label: "Power off the firewall immediately without collecting volatile or configuration evidence", correct: false },
      { id: "watch", label: "Leave the interface exposed so the team can wait for another successful login", correct: false },
    ],
    scoringRules: { pointsPerCorrect: 1, penaltyPerIncorrect: 1, passingScore: 2 },
    hints: ["Contain the exposed path without creating an unrelated outage.", "A successful login changes this from a configuration finding into a possible compromise."],
    explanation: "The defensible sequence restricts the attack surface, preserves evidence, and invalidates potentially compromised access. Shutting down the production firewall is disproportionate when the management path can be isolated safely.",
  },
  vulnerabilities: {
    title: "The vendor appliance with no patch",
    summary: "Prioritize an actively exploited supplier vulnerability when replacement cannot happen immediately.",
    instructions: "Use exploit activity, reachability, business criticality, and available compensating controls to choose the three strongest actions.",
    evidence: [
      "CISA reports active exploitation of a remote-code-execution flaw in the organization’s file-transfer appliance.",
      "The vendor has not released a patch; the appliance is internet-facing and exchanges regulated customer files every night.",
      "The service can be restricted to four partner addresses, and a replacement platform can be ready in ten days.",
    ],
    actions: [
      { id: "restrict", label: "Immediately allow-list the four partner addresses and block all other inbound access", correct: true },
      { id: "hunt", label: "Review appliance, identity, and downstream logs for known exploitation indicators", correct: true },
      { id: "replace", label: "Open a tracked emergency replacement plan with an owner and ten-day deadline", correct: true },
      { id: "cvss", label: "Wait for the CVSS score to change before reducing exposure", correct: false },
      { id: "accept", label: "Accept the risk informally because the vendor has not produced a patch", correct: false },
    ],
    scoringRules: { pointsPerCorrect: 1, penaltyPerIncorrect: 1, passingScore: 2 },
    hints: ["Active exploitation and internet reachability outweigh severity score alone.", "A compensating control should reduce the actual attack path and have an expiration."],
    explanation: "Active exploitation, public reachability, and sensitive data make this urgent. Restricting sources reduces exposure, hunting checks for prior compromise, and a time-bound replacement resolves the unsupported risk.",
  },
  malware: {
    title: "Encryption starts in the finance share",
    summary: "Interrupt ransomware spread, protect recovery material, and preserve evidence from the first affected endpoint.",
    instructions: "Select the three immediate actions that best contain the incident and protect trustworthy recovery.",
    evidence: [
      "EDR reports a spreadsheet process launching PowerShell, deleting shadow copies, and writing hundreds of renamed files.",
      "The workstation has an authenticated session to the finance file share; two neighboring endpoints show the same outbound destination.",
      "The immutable backup repository is healthy and uses credentials separate from the production domain.",
    ],
    actions: [
      { id: "isolate", label: "Use EDR network isolation on the affected endpoints while retaining management visibility", correct: true },
      { id: "revoke", label: "Disable the compromised user sessions and block the observed command-and-control destination", correct: true },
      { id: "protect", label: "Confirm backup immutability and prevent production administrators from changing backup retention", correct: true },
      { id: "restore", label: "Restore the workstation immediately before identifying persistence or preserving evidence", correct: false },
      { id: "pay", label: "Pay the ransom before determining scope because encryption has already begun", correct: false },
    ],
    scoringRules: { pointsPerCorrect: 1, penaltyPerIncorrect: 1, passingScore: 2 },
    hints: ["Stop both endpoint communication and identity-enabled access.", "A backup is useful only if the attacker cannot alter it."],
    explanation: "Isolation stops lateral activity while preserving response access. Revoking sessions and blocking infrastructure interrupts additional paths, and protecting immutable backups preserves a clean recovery option. Restoration comes after scope and eradication decisions.",
  },
  social: {
    title: "The CFO’s urgent bank-detail change",
    summary: "Break a convincing payment pretext with independent verification and auditable approval.",
    instructions: "Select the three actions that let finance handle the request safely without relying on clues in the suspicious message.",
    evidence: [
      "Accounts payable receives a message using the CFO’s display name and a look-alike domain requesting an immediate supplier bank change.",
      "A voice call from an unfamiliar number follows and warns that missing today’s transfer will incur a penalty.",
      "The approved supplier record contains a known callback number and requires two-person authorization for bank changes.",
    ],
    actions: [
      { id: "callback", label: "Call the supplier using the number already stored in the approved vendor record", correct: true },
      { id: "dual", label: "Require the second authorized approver before changing payment instructions", correct: true },
      { id: "report", label: "Report and preserve the email and call details for security investigation", correct: true },
      { id: "reply", label: "Reply to the message and ask the sender to confirm the new account number", correct: false },
      { id: "caller", label: "Trust the caller because they knew the invoice amount and used executive urgency", correct: false },
    ],
    scoringRules: { pointsPerCorrect: 1, penaltyPerIncorrect: 1, passingScore: 2 },
    hints: ["Verification must leave the communication channel controlled by the requester.", "Process controls should survive a persuasive message."],
    explanation: "A known callback path and dual authorization defeat the attacker’s control of email and voice channels. Reporting preserves indicators and may reveal other targets. Replying within the suspicious thread is not independent verification.",
  },
  identity: {
    title: "The valid session from two countries",
    summary: "Contain stolen cloud session material that remains useful after a password change.",
    instructions: "Review the identity evidence and select the three actions that remove active access and reveal persistence.",
    evidence: [
      "A user completes MFA in Virginia; seven minutes later the same cloud session downloads files from an address in another country.",
      "The second event uses an existing token, so no additional password or MFA challenge appears.",
      "Audit records show a new inbox forwarding rule and an unfamiliar OAuth application consent.",
    ],
    actions: [
      { id: "revoke", label: "Revoke all active sessions and refresh tokens for the affected identity", correct: true },
      { id: "remove", label: "Remove the forwarding rule and unauthorized application consent after preserving their audit details", correct: true },
      { id: "scope", label: "Review identity, mailbox, and data-access logs to determine what the token accessed", correct: true },
      { id: "password", label: "Change only the password and assume the existing session will stop", correct: false },
      { id: "travel", label: "Suppress the alert because impossible-travel detections always indicate a VPN", correct: false },
    ],
    scoringRules: { pointsPerCorrect: 1, penaltyPerIncorrect: 1, passingScore: 2 },
    hints: ["A bearer token can survive a password reset.", "Check delegated access and mailbox changes for persistence."],
    explanation: "Revoking sessions and refresh tokens removes the stolen authentication material. Preserving and removing malicious changes closes persistence, while log review establishes scope. A password-only response can leave the attacker authenticated.",
  },
  hardening: {
    title: "The server fleet that drifted",
    summary: "Restore a secure baseline without pushing an untested change across production.",
    instructions: "Select the three actions that correct the drift, control operational risk, and demonstrate that the fix worked.",
    evidence: [
      "A compliance scan finds legacy remote administration enabled on 38 of 120 application servers after an emergency deployment.",
      "The approved baseline disables the service, but five legacy applications may still depend on it.",
      "The configuration platform can target a pilot group, record exceptions, and verify settings after deployment.",
    ],
    actions: [
      { id: "pilot", label: "Test the baseline correction on a representative pilot group with rollback prepared", correct: true },
      { id: "exception", label: "Give confirmed legacy dependencies owned, time-limited exceptions with compensating network restrictions", correct: true },
      { id: "verify", label: "Deploy through configuration management and rescan to verify the prohibited service is disabled", correct: true },
      { id: "global", label: "Force the change to all servers simultaneously without dependency testing", correct: false },
      { id: "ignore", label: "Treat the drift as acceptable because it began during an approved emergency change", correct: false },
    ],
    scoringRules: { pointsPerCorrect: 1, penaltyPerIncorrect: 1, passingScore: 2 },
    hints: ["A secure change still needs testing and rollback.", "Exceptions need ownership, compensating controls, and expiration."],
    explanation: "A pilot reduces operational risk, controlled exceptions handle real dependencies, and automated deployment plus rescanning proves the baseline was restored. Emergency origin does not make persistent drift acceptable.",
  },
};

const specs = [
  {
    tier: 2,
    id: "network",
    number: 1,
    title: "Network attack surfaces",
    domain: 2,
    objective: "2.2–2.4",
    summary:
      "Trace attacks through exposed services, protocols, and trust paths.",
    objectives: [
      "Recognize common network attacks",
      "Connect exposure to likely impact",
      "Choose layered network mitigations",
    ],
    questions: [
      { prompt: "An administrator finds the same switch port repeatedly learning two different MAC addresses for the default gateway IP. Which attack best explains the evidence?", options: ["ARP poisoning", "DNS poisoning", "VLAN hopping", "Password spraying"], correctIndex: 0, explanation: "ARP poisoning associates a trusted local IP address with an attacker-controlled MAC address, allowing local traffic interception or redirection." },
      { prompt: "Users who enter the correct banking hostname are sent to an attacker-controlled address, but direct connections to the bank’s IP work normally. Which control most directly protects the name-resolution path?", options: ["DNSSEC validation", "Port security", "Full-disk encryption", "DHCP reservations"], correctIndex: 0, explanation: "DNSSEC validation detects forged DNS data by validating signed records; the symptoms point to manipulated name resolution rather than local switching." },
      { prompt: "A public API is overwhelmed by requests from thousands of unrelated consumer devices. The application servers are healthy but the internet circuit is saturated. Which response provides the most immediate relief?", options: ["Coordinate upstream filtering or scrubbing", "Increase password complexity", "Reissue the API certificate", "Disable endpoint antivirus"], correctIndex: 0, explanation: "When a distributed attack saturates the connection, filtering must occur upstream before the unwanted traffic consumes the organization’s available bandwidth." },
      { prompt: "A wireless client connects to an access point using the company SSID, but its certificate warning was ignored and its traffic is now being intercepted. Which attack is most likely?", options: ["Evil twin", "Bluejacking", "VLAN hopping", "DNS amplification"], correctIndex: 0, explanation: "An evil twin impersonates a trusted wireless network; ignored server-certificate validation allows the malicious access point to capture authentication or traffic." },
      { prompt: "A security team must expose a vendor management portal temporarily. Which design best limits the attack surface without trusting the portal password alone?", options: ["Restrict source addresses and require MFA through a managed access path", "Publish it on a high port with the default administrator account", "Allow global access but hide the URL from search engines", "Disable logging to reduce information disclosure"], correctIndex: 0, explanation: "Source restriction, a controlled access path, and MFA layer reachability and identity controls instead of relying on obscurity or a single credential." },
      { prompt: "Packet captures show a client sending the same valid authentication message twice, with the second copy authorizing another transaction. Which protection would most directly stop this?", options: ["Nonces or sequence numbers", "Network address translation", "Longer DNS caching", "A larger wireless channel width"], correctIndex: 0, explanation: "A nonce, timestamp, or sequence number makes each authenticated exchange unique so a previously captured message cannot be accepted again." },
      { prompt: "A switch permits a user port to negotiate a trunk, allowing the connected device to reach traffic from other VLANs. What should be corrected first?", options: ["Disable dynamic trunk negotiation on access ports", "Increase the DHCP lease duration", "Replace TLS with SSH", "Enable split tunneling"], correctIndex: 0, explanation: "VLAN hopping through trunk negotiation is reduced by statically configuring user-facing ports as access ports and disabling unnecessary trunk negotiation." },
      { prompt: "An attacker changes routing advertisements so traffic to a cloud service crosses an unexpected network. Which evidence is most useful for detecting the path manipulation?", options: ["Route-monitoring changes correlated with flow telemetry", "Endpoint screen-lock events", "Printer audit logs", "Password history reports"], correctIndex: 0, explanation: "Routing changes show the altered path while flow telemetry confirms the resulting traffic movement; endpoint and account reports do not describe route selection." },
      { prompt: "A SYN flood consumes a web server’s connection table while using relatively little application processing. Which mitigation best targets the exhausted resource?", options: ["SYN cookies and connection rate limits", "Database field encryption", "Longer user sessions", "Disabling certificate revocation checks"], correctIndex: 0, explanation: "SYN cookies and connection controls reduce state allocated to incomplete handshakes, directly addressing connection-table exhaustion." },
      { prompt: "A penetration tester can scan a database subnet from a compromised marketing workstation even though the applications never communicate directly. Which architectural change most reduces lateral movement?", options: ["Enforce deny-by-default segmentation between the zones", "Increase the database password expiration frequency", "Add a privacy notice to the marketing workstation", "Use a longer internal DNS suffix"], correctIndex: 0, explanation: "Deny-by-default segmentation removes unnecessary network reachability, preventing a compromised endpoint from directly probing the database zone." },
      { prompt: "An organization deploys mutual TLS for an administrative API. What additional assurance does it provide beyond ordinary server-authenticated TLS?", options: ["The server also validates the client’s certificate identity", "The server no longer needs a certificate", "All denial-of-service attacks are blocked", "DNS records become cryptographically signed"], correctIndex: 0, explanation: "Mutual TLS authenticates both endpoints: the client validates the server and the server validates an approved client certificate." },
      { prompt: "A port scan finds an obsolete remote-management protocol on an internet-facing appliance. No exploitation is visible. What is the best first risk-reduction action?", options: ["Disable or restrict the unnecessary service", "Erase all appliance logs", "Wait until exploitation is confirmed", "Move the service to a different port only"], correctIndex: 0, explanation: "Removing or restricting an unnecessary reachable service reduces the attack surface immediately; changing its port provides only obscurity." },
      { prompt: "Users on one office floor intermittently receive incorrect default-gateway and DNS settings from an unauthorized device. Which switch feature most directly blocks the rogue service?", options: ["DHCP snooping", "Port mirroring", "Link aggregation", "Jumbo frames"], correctIndex: 0, explanation: "DHCP snooping permits server responses only from trusted switch ports, blocking unauthorized DHCP offers on user-facing ports." },
      { prompt: "A web service needs protection from high-volume abuse and expensive repeated requests. Which layered approach best addresses both network and application exhaustion?", options: ["Upstream DDoS filtering plus application-aware rate limits", "Full-disk encryption plus password history", "VLAN tagging plus longer certificates", "File integrity monitoring plus screen locks"], correctIndex: 0, explanation: "Upstream filtering protects bandwidth while application-aware limits constrain costly requests that still reach the service." },
      { prompt: "After containing an on-path attack, the team wants to confirm whether credentials were exposed. Which evidence set is most relevant?", options: ["Packet or proxy evidence, certificate events, and affected authentication logs", "Asset depreciation records and printer queues", "Backup media labels and office seating charts", "Patch-window approvals and software license counts"], correctIndex: 0, explanation: "Traffic evidence, certificate anomalies, and authentication records can show intercepted sessions or credential use associated with an on-path attack." },
    ],
    headings: [
      "Map the reachable surface",
      "Spoofing and interception",
      "Name and route manipulation",
      "Availability attacks",
      "Wireless exposure",
      "Layer the response",
    ],
    reading: [
      "Attackers begin with what they can reach: public services, remote administration, wireless networks, partner links, and trusted internal paths. Inventory and exposure management turn that surface into something defenders can reason about.",
      "Spoofing forges an identity or address, while on-path attacks place an adversary between communicating systems. Mutual authentication, protected protocols, certificate validation, and switched-network safeguards reduce these opportunities.",
      "DNS poisoning redirects names, ARP poisoning corrupts local address resolution, and route manipulation changes packet paths. Secure configurations, monitoring, and authenticated routing or naming controls help reveal and prevent tampering.",
      "Denial-of-service attacks exhaust bandwidth, state, or application resources. Rate limits, resilient capacity, filtering, content delivery networks, and upstream coordination reduce impact without assuming every request is legitimate.",
      "Evil twins, weak wireless authentication, and unmanaged access points create alternate paths into a network. Strong enterprise authentication, wireless monitoring, segmentation, and user verification reduce the blast radius.",
      "No network control is perfect. Minimize exposed services, patch reachable systems, authenticate sensitive traffic, segment trust zones, monitor behavior, and rehearse containment so one foothold does not become enterprise access.",
    ],
    terms: [
      term(
        "Attack surface",
        "All reachable points where an attacker may attempt entry.",
      ),
      term(
        "On-path attack",
        "Interception or alteration of traffic between parties.",
      ),
      term(
        "ARP poisoning",
        "False local address-resolution messages used to redirect traffic.",
      ),
      term(
        "DNS poisoning",
        "Corrupting name resolution to send users to the wrong destination.",
      ),
      term(
        "DDoS",
        "Distributed traffic intended to exhaust a service or connection.",
      ),
      term(
        "Evil twin",
        "A malicious wireless network impersonating a trusted one.",
      ),
      term(
        "Segmentation",
        "Dividing networks to restrict communication and lateral movement.",
      ),
      term("Rate limiting", "Restricting request volume over time."),
      term(
        "Mutual authentication",
        "Both communicating parties prove identity.",
      ),
      term("Port scan", "A probe that identifies reachable network services."),
      term(
        "VLAN hopping",
        "Crossing logical network boundaries through configuration abuse.",
      ),
      term("Replay attack", "Reusing captured valid data to repeat an action."),
      term(
        "Protocol hardening",
        "Disabling weak options and enforcing secure protocol settings.",
      ),
      term(
        "Network telemetry",
        "Connection and traffic evidence used for detection.",
      ),
    ],
    scenario: tier2Scenarios.network,
  },
  {
    tier: 2,
    id: "vulnerabilities",
    number: 2,
    title: "System and supply-chain vulnerabilities",
    domain: 2,
    objective: "2.3",
    summary:
      "Recognize weaknesses across applications, platforms, devices, and suppliers.",
    objectives: [
      "Classify common vulnerability sources",
      "Prioritize exposure and impact",
      "Reduce third-party and platform risk",
    ],
    questions: [
      { prompt: "Two vulnerabilities have the same CVSS score. One is actively exploited on an internet-facing payment server; the other affects an isolated lab host. Which should be remediated first?", options: ["The payment server vulnerability", "The lab vulnerability", "Whichever CVE number is lower", "Whichever asset was purchased first"], correctIndex: 0, explanation: "Active exploitation, internet exposure, asset criticality, and affected data make the payment server the higher organizational risk despite equal base severity." },
      { prompt: "A web application places unsanitized form input directly into a database query. Which control most directly prevents the resulting vulnerability?", options: ["Parameterized queries", "Longer TLS certificates", "Network address translation", "Full-disk encryption"], correctIndex: 0, explanation: "Parameterized queries separate instructions from untrusted values, preventing input from being interpreted as part of the database command." },
      { prompt: "A vendor cannot patch an industrial controller without shutting down a safety process. What is the best interim response?", options: ["Isolate access and deploy monitored compensating controls", "Ignore the flaw because uptime is important", "Expose it directly for easier vendor support", "Delete its audit records"], correctIndex: 0, explanation: "When immediate patching is unsafe, segmentation, strict access, monitoring, and a tracked remediation plan reduce exposure while preserving operations." },
      { prompt: "A cloud storage bucket containing customer exports becomes public after a deployment. Which underlying weakness best describes the event?", options: ["Security misconfiguration", "Buffer overflow", "Race condition", "Cryptographic collision"], correctIndex: 0, explanation: "The service behaved as configured, but the access setting was unsafe; this is a cloud security misconfiguration rather than a software memory flaw." },
      { prompt: "A company needs to identify whether a newly disclosed library exists inside dozens of products. Which artifact provides the most direct starting point?", options: ["Software bill of materials", "Business impact analysis", "Network topology diagram", "Password history report"], correctIndex: 0, explanation: "An SBOM inventories included software components and versions, enabling teams to locate products that contain an affected dependency." },
      { prompt: "A signed software update is delivered from the legitimate vendor service but contains malicious code inserted during the build. What attack path does this illustrate?", options: ["Supply-chain compromise", "Password spraying", "Evil twin access point", "DNS amplification"], correctIndex: 0, explanation: "The attacker compromised a trusted build or distribution process, causing customers to install malicious code through the supplier relationship." },
      { prompt: "A vulnerability scanner reports a critical issue, but manual validation shows the vulnerable service is disabled. How should the team proceed?", options: ["Document validation and adjust the finding", "Patch unrelated systems instead", "Treat every scanner result as confirmed exploitation", "Delete the scan report"], correctIndex: 0, explanation: "Scanner findings require validation; documenting that the affected service is not active prevents wasted remediation while preserving evidence of the decision." },
      { prompt: "An application accepts a user-controlled object identifier and returns another customer’s record without checking ownership. Which vulnerability is present?", options: ["Broken access control", "Integer overflow", "DNS poisoning", "Certificate pinning"], correctIndex: 0, explanation: "The application authenticates the user but fails to authorize access to the requested object, which is a broken access-control condition." },
      { prompt: "A memory-safe replacement is unavailable for a legacy network daemon with a known buffer overflow. Which mitigation most directly reduces exploitability?", options: ["Restrict reachability and enable platform exploit protections", "Increase account password age", "Publish the daemon on more interfaces", "Disable centralized logging"], correctIndex: 0, explanation: "Limiting who can reach the service and enabling memory exploit mitigations directly constrain the attack path while replacement is planned." },
      { prompt: "A mobile application embeds a reusable production API key in its install package. What is the primary weakness?", options: ["Hard-coded secret", "Input race condition", "Route poisoning", "Data remanence"], correctIndex: 0, explanation: "A secret distributed inside client software can be extracted and reused; production credentials should be brokered and stored outside the application package." },
      { prompt: "A vulnerability is severe and internet-facing, but a web application firewall rule blocks the known exploit pattern. What should the owner do?", options: ["Track the WAF rule as temporary compensation and still schedule remediation", "Close the finding permanently", "Remove monitoring because exploitation is impossible", "Replace the CVE identifier"], correctIndex: 0, explanation: "A compensating control can reduce near-term exposure but does not remove the underlying weakness; it needs validation, ownership, and an expiration." },
      { prompt: "A development team updates a dependency, but the production container still includes the vulnerable version. Which verification best detects the failed remediation?", options: ["Rescan the deployed artifact and inspect its component inventory", "Review only the developer’s ticket closure", "Change the vulnerability severity", "Restart the source repository"], correctIndex: 0, explanation: "Validation must examine the artifact actually deployed; ticket status or source changes alone do not prove production no longer contains the vulnerable component." },
      { prompt: "A zero-day is being exploited against a public VPN appliance and no patch exists. Which factor most strongly raises remediation urgency?", options: ["Confirmed active exploitation of a reachable service", "The appliance color", "The age of the asset tag", "The number of help-desk articles"], correctIndex: 0, explanation: "Active exploitation combined with public reachability creates an immediate attack path even when a formal patch is not yet available." },
      { prompt: "A supplier’s remote support account has permanent administrator rights and is shared by several technicians. Which change best reduces supplier-created exposure?", options: ["Use named accounts with time-limited privileged access", "Increase the shared password length only", "Disable logs for supplier sessions", "Allow access from any source network"], correctIndex: 0, explanation: "Named identities, approval, limited duration, and session accountability reduce standing privilege and make supplier activity attributable." },
      { prompt: "A remediation exception has no owner or expiration date and remains open for three years. What process failure does this represent?", options: ["Uncontrolled risk acceptance", "Successful patch validation", "Automated asset discovery", "Cryptographic key rotation"], correctIndex: 0, explanation: "Exceptions require accountable acceptance, compensating controls, review dates, and expiration; otherwise temporary risk silently becomes permanent." },
    ],
    headings: [
      "Weaknesses have context",
      "Application flaws",
      "Platform and device risk",
      "Cloud configuration",
      "Supply-chain trust",
      "Prioritize remediation",
    ],
    reading: [
      "A vulnerability is meaningful in context: exploitability, exposure, privileges, affected data, and business impact determine urgency. A high severity score alone does not describe organizational risk.",
      "Injection, insecure design, memory flaws, broken access control, and vulnerable dependencies can turn input or trust errors into compromise. Secure development, testing, code review, and runtime protections reduce risk at different stages.",
      "Operating systems, mobile devices, IoT, embedded systems, and industrial technology have different patch and availability constraints. Compensating controls may be necessary when immediate replacement or patching is unsafe.",
      "Cloud incidents often begin with exposed storage, excessive permissions, leaked secrets, or misunderstood provider responsibilities. Configuration assessment and policy automation help detect drift before it becomes exposure.",
      "Suppliers, build systems, updates, and dependencies extend trust beyond the organization. Software inventories, signed releases, supplier assessment, and controlled build pipelines reduce opportunities for hidden compromise.",
      "Prioritization combines severity with active exploitation, asset criticality, reachability, and available mitigations. Teams should document exceptions, verify remediation, and measure time at risk.",
    ],
    terms: [
      term("CVE", "A public identifier for a known vulnerability."),
      term("CVSS", "A standardized vulnerability severity scoring framework."),
      term(
        "Zero-day",
        "A vulnerability exploited before an effective fix is available.",
      ),
      term("Injection", "Untrusted input interpreted as commands or queries."),
      term("Buffer overflow", "Writing beyond allocated memory boundaries."),
      term("Misconfiguration", "An unsafe or unintended system setting."),
      term("Dependency", "External software a system relies upon."),
      term("SBOM", "An inventory of software components in a product."),
      term("Attack chain", "Connected steps used to reach an objective."),
      term(
        "Compensating control",
        "An alternate safeguard used when the preferred control is unavailable.",
      ),
      term("Exposure", "The degree to which a weakness is reachable."),
      term(
        "Patch management",
        "The controlled process for evaluating and applying updates.",
      ),
      term(
        "Configuration drift",
        "A system moving away from its approved baseline.",
      ),
      term(
        "Supply-chain attack",
        "Compromise through a trusted supplier or dependency.",
      ),
    ],
    scenario: tier2Scenarios.vulnerabilities,
  },
  {
    tier: 2,
    id: "malware",
    number: 3,
    title: "Malware behavior and defense",
    domain: 2,
    objective: "2.4–2.5",
    summary:
      "Connect malware behavior and indicators to prevention and containment.",
    objectives: [
      "Identify behavior across the attack lifecycle",
      "Interpret host and network indicators",
      "Choose containment that preserves evidence",
    ],
    questions: [
      { prompt: "An email attachment launches a small program whose only action is downloading and executing a larger payload. How should the first program be classified?", options: ["Dropper", "Rootkit", "Logic bomb", "Keylogger"], correctIndex: 0, explanation: "A dropper or downloader exists primarily to place or retrieve another malicious payload rather than perform the final attack objective itself." },
      { prompt: "EDR shows a new scheduled task launching an encoded script after every user login. Which attacker objective does this most directly support?", options: ["Persistence", "Initial reconnaissance", "Data classification", "Backup validation"], correctIndex: 0, explanation: "A recurring scheduled task causes attacker-controlled code to run again after login or restart, providing persistence." },
      { prompt: "Several endpoints contact the same rare domain every five minutes with nearly identical small HTTPS requests. What does this pattern most strongly suggest?", options: ["Command-and-control beaconing", "Normal software inventory", "Local privilege removal", "Disk defragmentation"], correctIndex: 0, explanation: "Regular low-volume connections to rare infrastructure are characteristic of automated command-and-control check-ins or beaconing." },
      { prompt: "A suspicious process uses a legitimate system administration utility to dump credentials. Which description best fits this behavior?", options: ["Living off the land", "Supply-chain signing", "Password aging", "Physical tailgating"], correctIndex: 0, explanation: "Living-off-the-land behavior abuses trusted tools already present on a system, which can evade controls focused only on unknown executables." },
      { prompt: "Ransomware begins encrypting a shared drive from one workstation. What is the best first containment action that preserves response visibility?", options: ["Use EDR to network-isolate the workstation", "Immediately reimage every server", "Delete all security logs", "Restore files over the active infection"], correctIndex: 0, explanation: "EDR isolation interrupts network spread while maintaining a management channel for evidence collection and investigation." },
      { prompt: "Malicious code hides processes and files by modifying privileged operating-system components. Which malware type is most consistent with this behavior?", options: ["Rootkit", "Adware", "Worm", "Macro"], correctIndex: 0, explanation: "Rootkits manipulate privileged system behavior to conceal malicious processes, files, or access from ordinary inspection." },
      { prompt: "A file’s hash is unknown, but it spawns a script interpreter, disables endpoint protection, and modifies startup entries. Why should behavioral detection alert?", options: ["The action sequence is malicious even without a known signature", "Unknown hashes are always ransomware", "Startup entries cannot be changed legitimately", "Encryption makes process behavior invisible"], correctIndex: 0, explanation: "Behavioral detection evaluates suspicious actions and relationships, allowing it to identify novel or modified malware without a known file signature." },
      { prompt: "An analyst needs to observe a suspicious document’s network and process behavior without risking production systems. Where should it be opened?", options: ["An isolated malware sandbox", "A domain controller", "The analyst’s daily workstation", "A production file server"], correctIndex: 0, explanation: "A sandbox provides controlled isolation and instrumentation for observing untrusted code without exposing normal systems." },
      { prompt: "After isolating an infected endpoint, which action best determines whether the attacker can return after reboot?", options: ["Inspect services, scheduled tasks, startup entries, and new accounts", "Review monitor brightness", "Increase DNS cache time", "Rename the computer only"], correctIndex: 0, explanation: "Services, tasks, startup mechanisms, and accounts are common persistence locations that must be identified before declaring eradication." },
      { prompt: "A workstation is cleanly reimaged, but the compromised user’s cloud refresh token remains valid. What is the likely result?", options: ["The attacker may retain cloud access", "Reimaging automatically revokes all tokens", "The token becomes a disk backup", "Network segmentation resets the password"], correctIndex: 0, explanation: "Endpoint rebuilding does not invalidate authentication material held by cloud services; sessions and refresh tokens must be explicitly revoked." },
      { prompt: "Which outbound control most directly limits malware from reaching arbitrary command-and-control infrastructure?", options: ["Egress filtering through approved destinations or proxies", "A longer local password history", "Screen privacy filters", "Printer access badges"], correctIndex: 0, explanation: "Egress controls constrain outbound destinations and protocols, reducing a compromised host’s ability to communicate with attacker infrastructure." },
      { prompt: "A recovery team has backups, but the ransomware operator used domain-admin access to delete them. Which design would have most reduced this risk?", options: ["Immutable backups under separate administrative control", "More frequent password hints", "A public backup share", "Longer endpoint hostnames"], correctIndex: 0, explanation: "Immutability and separate credentials prevent production administrators—or attackers using those privileges—from altering protected recovery copies." },
      { prompt: "An indicator list contains one IP address shared by thousands of legitimate cloud tenants. How should an analyst use it?", options: ["Correlate it with behavior, timing, and additional evidence", "Block the entire cloud provider permanently", "Treat the IP as proof of compromise", "Discard all network telemetry"], correctIndex: 0, explanation: "Shared infrastructure makes a single IP low-confidence; analysts should correlate multiple indicators and behaviors before taking disruptive action." },
      { prompt: "Why is quarantine alone insufficient after malware steals browser session cookies?", options: ["The stolen sessions can be replayed from another system", "Quarantine always deletes backups", "Cookies exist only in DNS", "Malware cannot access browser data"], correctIndex: 0, explanation: "Restricting the file or endpoint does not invalidate session material already copied by the attacker, so affected sessions must also be revoked." },
      { prompt: "Before restoring a ransomware victim from backup, what provides the strongest assurance that recovery will not immediately fail again?", options: ["Eradicate persistence, close the entry path, and validate the backup", "Rename encrypted files", "Disable incident logging", "Reconnect every isolated endpoint"], correctIndex: 0, explanation: "Recovery is trustworthy only after persistence and the initial access path are addressed and the restoration source is verified clean and usable." },
    ],
    headings: [
      "Behavior over labels",
      "Delivery and execution",
      "Persistence and privilege",
      "Command and control",
      "Impact and evasion",
      "Break the chain",
    ],
    reading: [
      "Modern intrusions combine tools and behaviors, so defenders should describe what code does rather than depend on one malware label. Delivery, execution, persistence, control, discovery, movement, collection, and impact provide a reusable map.",
      "Malicious attachments, scripts, drive-by downloads, poisoned updates, and exploited services can start execution. Filtering helps, but application control, patching, restricted scripting, and user-resistant workflows provide additional barriers.",
      "Attackers create services, scheduled tasks, startup entries, accounts, or stolen tokens to survive. Least privilege and endpoint monitoring make those changes harder and more visible.",
      "Command-and-control traffic may use common web protocols, encrypted channels, DNS, or cloud services. Egress controls and behavior analytics can reveal unusual destinations, timing, and data movement.",
      "Ransomware encrypts or destroys data, spyware collects it, and rootkits hide activity. Obfuscation, living-off-the-land tools, and disabled security agents complicate detection.",
      "Containment isolates affected systems, revokes compromised identity material, blocks malicious infrastructure, preserves evidence, and protects backups. Recovery requires verified clean restoration and lessons that improve prevention.",
    ],
    terms: [
      term("Dropper", "Code designed to install another malicious payload."),
      term(
        "Persistence",
        "A method that maintains access across restarts or changes.",
      ),
      term(
        "Command and control",
        "A channel used to direct compromised systems.",
      ),
      term(
        "Ransomware",
        "Malware that denies access or threatens disclosure for payment.",
      ),
      term("Rootkit", "Tools that hide malicious privileged activity."),
      term(
        "Living off the land",
        "Abusing legitimate system tools for malicious actions.",
      ),
      term(
        "IOC",
        "An observable artifact associated with possible compromise.",
      ),
      term(
        "Behavioral detection",
        "Detection based on actions rather than a known signature.",
      ),
      term("EDR", "Endpoint monitoring and response technology."),
      term("Sandbox", "An isolated environment for safely observing code."),
      term(
        "Quarantine",
        "Restricting a suspicious file or system from normal interaction.",
      ),
      term("Egress filtering", "Controlling outbound network communication."),
      term(
        "Immutable backup",
        "A backup protected from alteration for a defined period.",
      ),
      term("Reimaging", "Rebuilding a system from a trusted source."),
    ],
    scenario: tier2Scenarios.malware,
  },
  {
    tier: 2,
    id: "social",
    number: 4,
    title: "Social engineering and physical attacks",
    domain: 2,
    objective: "2.2",
    summary:
      "Recognize manipulation, verify requests, and strengthen human-layer defenses.",
    objectives: [
      "Identify manipulation techniques",
      "Design verification-resistant workflows",
      "Combine awareness with technical controls",
    ],
    questions: [
      { prompt:"A caller claims to be the CIO and demands an immediate password reset while refusing the normal verification process. Which technique is central to the attack?",options:["Pretexting with authority and urgency","Credential stuffing","DNS poisoning","VLAN hopping"],correctIndex:0,explanation:"The caller uses a fabricated identity plus authority and urgency to pressure the technician into bypassing the approved workflow." },
      { prompt:"A finance employee receives a bank-change request from a supplier. Which verification is strongest?",options:["Call the supplier using the number already stored in the approved vendor record","Reply to the same email thread","Call the number included in the request","Ask whether the message looks professional"],correctIndex:0,explanation:"A known independent channel escapes contact details controlled by the requester and verifies the change with an established party." },
      { prompt:"A tailored message references a director’s current acquisition project and asks them to open a document. What attack is this?",options:["Spear phishing","Generic spam","Tailgating","Bluejacking"],correctIndex:0,explanation:"The message is customized for a particular target using contextual information, which makes it spear phishing." },
      { prompt:"An executive receives a highly tailored fraudulent legal notice. Which label best describes the targeting?",options:["Whaling","Smishing","Baiting","Dumpster diving"],correctIndex:0,explanation:"Whaling is phishing directed at senior executives or similarly high-value organizational targets." },
      { prompt:"A QR code on a fake parking notice sends an employee to a credential-harvesting site. Which vector is being used?",options:["Quishing","Vishing","Tailgating","Watering hole"],correctIndex:0,explanation:"Quishing uses a QR code to move the target to a malicious destination, often hiding the URL until after scanning." },
      { prompt:"An attacker sends a text saying the employee’s payroll account will close unless they sign in immediately. Which attack is this?",options:["Smishing","Whaling","Elicitation","Shoulder surfing"],correctIndex:0,explanation:"Smishing is phishing delivered through SMS or another text-messaging channel." },
      { prompt:"A fraudster phones the help desk, imitates a distressed employee, and requests MFA recovery. Which defense is most important?",options:["Identity verification using an approved recovery workflow","Trusting caller ID","Asking for the employee’s password","Approving one temporary bypass for speed"],correctIndex:0,explanation:"Voice presentation and caller ID can be forged, so recovery must require approved evidence and an auditable process." },
      { prompt:"A visitor follows an employee through a controlled door without presenting a badge. Which physical attack occurred?",options:["Tailgating","Baiting","Typosquatting","Credential replay"],correctIndex:0,explanation:"Tailgating gains unauthorized physical entry by following an authorized person through an access-controlled boundary." },
      { prompt:"A person watches an administrator type a PIN from across a lobby. Which technique is this?",options:["Shoulder surfing","Pretexting","Quishing","Watering hole"],correctIndex:0,explanation:"Shoulder surfing is direct observation of sensitive information such as passwords, PINs, or screen contents." },
      { prompt:"An attacker casually discusses a project with an employee and draws out internal server names without directly asking for secrets. What technique is used?",options:["Elicitation","Brute force","RFID cloning","Domain hijacking"],correctIndex:0,explanation:"Elicitation uses conversation and indirect questions to encourage a target to reveal useful information." },
      { prompt:"USB drives labeled 'Executive bonuses' are left in a parking lot. Which manipulation technique does this illustrate?",options:["Baiting","Vishing","Whaling","Tailgating"],correctIndex:0,explanation:"Baiting offers curiosity or perceived value to persuade a person to connect or open an unsafe item." },
      { prompt:"A criminal registers a domain differing from the company’s domain by one transposed character. What is this called?",options:["Typosquatting","Password spraying","Session fixation","ARP poisoning"],correctIndex:0,explanation:"Typosquatting registers look-alike domains based on common typing errors to impersonate a trusted organization." },
      { prompt:"Which payment process remains safest even when an attacker convincingly impersonates an executive?",options:["Independent callback plus dual authorization","Approval based on display name","One-person approval for urgent requests","Confirmation inside the original message thread"],correctIndex:0,explanation:"Independent verification and separation of duties make the workflow resistant to persuasion and compromise of one channel." },
      { prompt:"Why should an organization encourage users to report suspected phishing even after they clicked?",options:["Fast reporting provides detection evidence and enables containment","Reporting automatically erases malware","Punishing reporters improves visibility","Late reports have no security value"],correctIndex:0,explanation:"Prompt, psychologically safe reporting gives responders indicators, affected-user context, and time to contain related activity." },
      { prompt:"Which measure best shows that phishing training is improving defensive behavior?",options:["A rising proportion of suspicious messages reported correctly","The number of slides in training","How many messages the gateway receives","The length of the acceptable-use policy"],correctIndex:0,explanation:"Correct report rate measures a useful security behavior that improves detection, unlike attendance or content volume alone." },
    ],
    headings: [
      "People are part of the system",
      "Pressure and pretext",
      "Message channels",
      "Physical access",
      "Design safer workflows",
      "Learn without blame",
    ],
    reading: [
      "Social engineering exploits normal human behavior: trust, urgency, authority, curiosity, fear, and helpfulness. Effective defense changes workflows so a moment of persuasion cannot authorize high-impact action.",
      "Pretexting builds a believable story; impersonation borrows authority; elicitation draws out information indirectly. Verification should use a separate trusted channel and known contact details.",
      "Phishing can arrive through email, text, voice, QR codes, collaboration tools, or social media. Authentication-resistant workflows and reporting paths matter more than memorizing channel names.",
      "Tailgating, shoulder surfing, badge theft, dumpster diving, and unattended devices bypass digital boundaries. Layered physical controls and clear challenge procedures reduce opportunity.",
      "Payment changes, password resets, data releases, and privileged actions should require independent verification, separation of duties, and auditable approval. This turns awareness into resilient process design.",
      "Training should be timely, role-specific, measurable, and psychologically safe. Reported attempts provide detection data; punishing reporters teaches silence and makes the organization easier to deceive.",
    ],
    terms: [
      term(
        "Pretexting",
        "Using a fabricated story or identity to influence a target.",
      ),
      term(
        "Spear phishing",
        "A tailored deceptive message aimed at a specific target.",
      ),
      term("Whaling", "Phishing directed at senior or high-value personnel."),
      term("Smishing", "Phishing delivered through text messaging."),
      term("Vishing", "Voice-based social engineering."),
      term("Quishing", "Phishing that uses a QR code."),
      term("Baiting", "Offering something enticing to prompt unsafe action."),
      term(
        "Tailgating",
        "Following an authorized person into a controlled area.",
      ),
      term("Shoulder surfing", "Observing sensitive information directly."),
      term("Elicitation", "Drawing information out through conversation."),
      term(
        "Callback verification",
        "Confirming a request through a known independent channel.",
      ),
      term("Dual control", "Requiring two people for a sensitive action."),
      term(
        "Security awareness",
        "Education that helps people recognize and handle risk.",
      ),
      term(
        "Report rate",
        "The proportion of simulated or real attacks users report.",
      ),
    ],
    scenario: tier2Scenarios.social,
  },
  {
    tier: 2,
    id: "identity-attacks",
    number: 5,
    title: "Identity attacks and access defense",
    domain: 2,
    objective: "2.4–2.5",
    summary: "Defend credentials, sessions, and access paths from abuse.",
    objectives: [
      "Distinguish credential attack patterns",
      "Protect authentication and recovery",
      "Contain compromised sessions and privileges",
    ],
    questions: [
      { prompt:"Authentication logs show one account receiving thousands of different password attempts. Which attack is most likely?",options:["Brute force","Password spraying","Credential stuffing","Token replay"],correctIndex:0,explanation:"Brute force concentrates many guesses against one account, unlike spraying a few passwords across many identities." },
      { prompt:"A few common passwords are tried once against thousands of employees. Which attack pattern is this?",options:["Password spraying","Brute force against one account","Session hijacking","Certificate downgrade"],correctIndex:0,explanation:"Password spraying distributes a small set of likely passwords across many accounts to reduce lockouts." },
      { prompt:"Previously breached username and password pairs are tested against the company portal. What attack is occurring?",options:["Credential stuffing","Password spraying","MFA fatigue","Privilege escalation"],correctIndex:0,explanation:"Credential stuffing exploits password reuse by replaying credentials stolen from another service." },
      { prompt:"A user changes their password, but an attacker’s browser session remains active. Which response is still required?",options:["Revoke active sessions and refresh tokens","Change the username display name","Increase password age","Disable identity logging"],correctIndex:0,explanation:"A password reset may not invalidate previously issued session material, so sessions and refresh tokens must be revoked." },
      { prompt:"An attacker sends repeated MFA push prompts until the user approves one. Which technique is being used?",options:["MFA fatigue","Credential stuffing","Hash collision","Directory traversal"],correctIndex:0,explanation:"MFA fatigue overwhelms or confuses a user with repeated approval prompts until one is accepted." },
      { prompt:"Which authenticator best resists a fake sign-in site relaying credentials to the real service?",options:["A phishing-resistant FIDO security key","SMS one-time codes","Knowledge questions","Email approval links"],correctIndex:0,explanation:"FIDO authenticators bind the response to the legitimate site origin, resisting adversary-in-the-middle credential relay." },
      { prompt:"A help-desk caller knows an employee’s address and birth date but cannot satisfy the approved recovery process. What should the technician do?",options:["Deny the reset and escalate through the verified workflow","Treat public biographical data as proof","Send a bypass code to the caller","Disable audit logging for privacy"],correctIndex:0,explanation:"Public or breached biographical facts are weak evidence; recovery must follow the approved identity-verification process." },
      { prompt:"A service account has permanent domain administrator rights even though its job runs monthly. Which improvement most reduces exposure?",options:["Use narrowly scoped, time-limited privilege","Rotate the same broad password yearly","Share the account among administrators","Exclude it from access reviews"],correctIndex:0,explanation:"Least privilege and just-in-time activation reduce both the scope and duration of powerful nonhuman access." },
      { prompt:"Sign-ins appear in Virginia and Singapore seven minutes apart. What indicator should investigators consider?",options:["Impossible travel","Normal password rotation","Successful deprovisioning","Local file integrity"],correctIndex:0,explanation:"The distance and timing cannot reasonably represent physical travel and may indicate stolen credentials or session material." },
      { prompt:"An attacker steals a bearer access token. Why might MFA not stop its immediate reuse?",options:["The token may represent an already authenticated session","MFA encrypts every application file","Tokens cannot cross networks","Password history invalidates tokens"],correctIndex:0,explanation:"A valid bearer token can be replayed without repeating the original password and MFA ceremony until it expires or is revoked." },
      { prompt:"After compromising a mailbox, an attacker creates an external forwarding rule. What does the rule provide?",options:["Persistence and continued data collection","Password complexity","Network segmentation","Certificate revocation"],correctIndex:0,explanation:"The forwarding rule continues sending messages to the attacker even after the initial interactive session ends." },
      { prompt:"Which control most directly limits harm if a privileged identity is compromised?",options:["Just-in-time elevation with narrowly scoped permissions","Permanent global administration","Shared administrator accounts","Unrestricted service-account login"],correctIndex:0,explanation:"Narrow scope and limited duration reduce the actions and time available to an attacker using compromised privilege." },
      { prompt:"What should identity containment inspect beyond passwords and sessions?",options:["Delegated access, application consent, forwarding rules, and newly created credentials","Only the user’s desktop wallpaper","Printer toner levels","Public website analytics"],correctIndex:0,explanation:"Attackers often establish identity persistence through delegation, OAuth consent, rules, keys, or additional authenticators." },
      { prompt:"A nonhuman identity is used by an application. Which practice provides the strongest accountability?",options:["Give it a unique owner, purpose, scoped access, and monitored credential lifecycle","Use one shared service identity for all applications","Permit interactive login from anywhere","Exclude it from inventory"],correctIndex:0,explanation:"Ownership, purpose, narrow permissions, credential management, and monitoring make service-account risk governable and attributable." },
      { prompt:"Which response best handles a confirmed stolen cloud session?",options:["Revoke sessions, remove persistence, rotate affected secrets, and review access logs","Change only the local workstation name","Wait for the token to expire without investigation","Delete identity logs"],correctIndex:0,explanation:"Complete containment removes active material and persistence, protects secrets, and establishes what the attacker accessed." },
    ],
    headings: [
      "Identity is an attack surface",
      "Guessing and reuse",
      "Tokens and sessions",
      "MFA attacks",
      "Privilege pathways",
      "Contain identity compromise",
    ],
    reading: [
      "Passwords, tokens, sessions, recovery processes, service accounts, and identity providers all create authentication paths. Defenders must protect the full lifecycle rather than only the login screen.",
      "Brute force targets one account with many guesses, spraying tests common passwords across accounts, and stuffing reuses breached credentials. Rate limits, unique passwords, breached-password screening, and strong MFA address different parts of the problem.",
      "Session cookies and access tokens can be stolen and replayed without knowing a password. Short lifetimes, device binding, secure storage, reauthentication, and revocation reduce their value.",
      "Push fatigue, adversary-in-the-middle phishing, SIM swapping, and help-desk manipulation can bypass weaker MFA and recovery. Phishing-resistant authenticators and verified recovery processes improve assurance.",
      "Excessive privileges, stale accounts, standing administration, and weak service-account controls turn one identity into broad access. Reviews and just-in-time elevation reduce blast radius.",
      "Response revokes sessions and tokens, resets affected secrets, checks persistence and delegated access, reviews identity logs, and removes unauthorized changes. Password reset alone may leave the attacker active.",
    ],
    terms: [
      term(
        "Password spraying",
        "Testing a few common passwords across many accounts.",
      ),
      term(
        "Credential stuffing",
        "Reusing credentials stolen from another service.",
      ),
      term("Brute force", "Systematically trying many possible credentials."),
      term("Session hijacking", "Taking over an authenticated session."),
      term(
        "Token theft",
        "Stealing reusable authentication or authorization material.",
      ),
      term("MFA fatigue", "Flooding a user with approval prompts."),
      term(
        "Phishing-resistant MFA",
        "Authentication designed to resist credential relay and fake sites.",
      ),
      term(
        "Account recovery",
        "The process used to regain access after losing an authenticator.",
      ),
      term(
        "Service account",
        "A nonhuman identity used by software or automation.",
      ),
      term(
        "Standing privilege",
        "Elevated access that remains continuously available.",
      ),
      term(
        "JIT access",
        "Privilege granted only when needed and for limited time.",
      ),
      term(
        "Impossible travel",
        "Logins whose timing and location cannot reasonably coexist.",
      ),
      term(
        "Session revocation",
        "Invalidating active authentication sessions.",
      ),
      term(
        "Identity provider",
        "A service that authenticates identities for other systems.",
      ),
    ],
    scenario: tier2Scenarios.identity,
  },
  {
    tier: 2,
    id: "hardening",
    number: 6,
    title: "Hardening and layered mitigation",
    domain: 4,
    objective: "2.5, 4.1",
    summary: "Build, maintain, and verify secure system baselines.",
    objectives: [
      "Create defensible baselines",
      "Prioritize patching and isolation",
      "Verify controls remain effective",
    ],
    questions: [
      { prompt:"What is the primary purpose of a secure configuration baseline?",options:["Define an approved minimum state for a system role","Guarantee every system is identical","Replace vulnerability management","Eliminate all operational exceptions"],correctIndex:0,explanation:"A baseline establishes the approved security state against which deployment, drift, and exceptions can be evaluated." },
      { prompt:"A server does not require an installed file-transfer service. Which hardening action is best?",options:["Remove or disable the unnecessary service","Move it to a different port only","Keep it enabled for convenience","Exclude it from monitoring"],correctIndex:0,explanation:"Removing unnecessary software and services reduces reachable code and the system’s attack surface." },
      { prompt:"Only approved business applications should run on kiosks. Which control most directly enforces this?",options:["Application allow listing","Password history","DNS recursion","Data masking"],correctIndex:0,explanation:"Application allow listing permits known approved executables and denies unapproved software by default." },
      { prompt:"A critical patch cannot be applied until a vendor certifies compatibility. What is the best interim action?",options:["Use a documented compensating control with an owner and expiration","Close the vulnerability permanently","Ignore active exploitation","Disable all logging"],correctIndex:0,explanation:"A validated compensating control can reduce exposure temporarily while tracked remediation remains open." },
      { prompt:"Which factor should most increase patch priority?",options:["Active exploitation on a reachable critical asset","The alphabetical order of the CVE","The device’s physical color","The number of installed fonts"],correctIndex:0,explanation:"Exploit activity, reachability, privilege, asset criticality, and impact determine practical remediation urgency." },
      { prompt:"A suspicious endpoint must stop communicating with peers while responders retain management access. Which action is appropriate?",options:["Targeted network isolation","Immediate evidence destruction","Disabling the response agent","Connecting it to additional shares"],correctIndex:0,explanation:"Targeted isolation restricts normal communication while preserving a controlled response channel for investigation." },
      { prompt:"What does microsegmentation add beyond a broad user/server VLAN boundary?",options:["Fine-grained policy between individual workloads or service groups","Longer user passwords","Automatic backup encryption","Public certificate issuance"],correctIndex:0,explanation:"Microsegmentation restricts east-west communication at a finer workload level, reducing lateral movement within larger zones." },
      { prompt:"Which technology helps ensure only trusted startup components execute before the operating system loads?",options:["Secure boot","Port mirroring","Password spraying","DNS caching"],correctIndex:0,explanation:"Secure boot validates signed startup components against a trusted root before allowing them to execute." },
      { prompt:"A protected system file changes unexpectedly. Which control is designed to detect the event?",options:["File integrity monitoring","Load balancing","Data tokenization","Email federation"],correctIndex:0,explanation:"File integrity monitoring compares protected files with an approved state and alerts on unexpected modification." },
      { prompt:"What is configuration drift?",options:["Deviation from an approved baseline over time","Planned geographic failover","Cryptographic key exchange","A password reset request"],correctIndex:0,explanation:"Drift occurs when deployed settings diverge from the approved configuration through changes, inconsistency, or failed enforcement." },
      { prompt:"Why should baseline deployment use configuration management rather than undocumented manual changes?",options:["It creates repeatable enforcement, history, and measurable state","It eliminates testing","It prevents every administrator mistake","It makes ownership unnecessary"],correctIndex:0,explanation:"Configuration management supports repeatability, attribution, review, automated enforcement, and verification across systems." },
      { prompt:"A baseline exception is approved for a legacy application. What makes the exception defensible?",options:["Documented risk, owner, compensation, review date, and expiration","Permanent approval with no owner","Removal from all reports","A verbal agreement only"],correctIndex:0,explanation:"A controlled exception is accountable, time-bound, reviewed, and paired with measures that reduce the unresolved risk." },
      { prompt:"Why must a patch plan include rollback steps?",options:["A security update may cause unacceptable operational failure","Rollback proves patches are unnecessary","It replaces validation","It prevents all downtime"],correctIndex:0,explanation:"Rollback provides a tested route to restore service if compatibility or operational acceptance criteria fail." },
      { prompt:"After remediation, what evidence best proves the vulnerability is no longer present?",options:["Rescanning or direct verification of the deployed system","Closing the ticket without testing","The vendor announcement alone","A user changing their password"],correctIndex:0,explanation:"Validation examines the actual deployed state and confirms that remediation changed the vulnerable condition as intended." },
      { prompt:"Backups use the same administrator privileges as production. Which improvement best protects recovery?",options:["Separate administration and immutable retention","Expose the repository to every server","Disable backup monitoring","Store only one online copy"],correctIndex:0,explanation:"Separate credentials and immutability reduce the chance that a production compromise can alter or delete recovery data." },
    ],
    headings: [
      "Start from a known state",
      "Reduce functionality",
      "Patch with context",
      "Segment and isolate",
      "Protect configuration",
      "Measure and improve",
    ],
    reading: [
      "A secure baseline defines the approved configuration for a system role. It should be versioned, tested, automated where practical, and tied to an owner so drift becomes a visible operational event.",
      "Disable unnecessary services, remove default accounts, restrict administrative interfaces, enforce least privilege, and allow only required software and communication. Less functionality means fewer opportunities for abuse.",
      "Patch decisions account for exploitation, exposure, criticality, compatibility, and compensating controls. Emergency changes still need testing, approval, rollback, and verification.",
      "Segmentation limits ordinary reachability; isolation removes a suspicious asset from normal interaction. Both controls need management paths that do not silently recreate broad trust.",
      "Configuration management, signed packages, secrets protection, secure boot, and file integrity monitoring help preserve the intended state. Backups must be protected from the same privileges as production.",
      "Compliance scans, vulnerability validation, attack simulation, and operational metrics show whether the baseline works. Exceptions should expire and be reviewed rather than becoming permanent undocumented policy.",
    ],
    terms: [
      term(
        "Secure baseline",
        "An approved minimum configuration for a system role.",
      ),
      term(
        "Attack surface reduction",
        "Removing unnecessary exposure and functionality.",
      ),
      term(
        "Application allow list",
        "A policy permitting only approved software to execute.",
      ),
      term("Patch window", "An approved period for applying updates."),
      term(
        "Compensating control",
        "An alternate safeguard used when direct remediation is delayed.",
      ),
      term("Microsegmentation", "Fine-grained restrictions between workloads."),
      term("Isolation", "Separating an asset from normal communication."),
      term(
        "Secure boot",
        "Verifying trusted startup components before execution.",
      ),
      term(
        "File integrity monitoring",
        "Detecting unexpected changes to protected files.",
      ),
      term(
        "Configuration management",
        "Controlling and recording system settings over time.",
      ),
      term("Drift", "Deviation from an approved configuration."),
      term("Exception", "A documented, approved departure from policy."),
      term("Rollback plan", "Steps for safely reversing a failed change."),
      term(
        "Validation",
        "Evidence that a remediation or control works as intended.",
      ),
    ],
    scenario: tier2Scenarios.hardening,
  },
];

const compactSpecs = [
  [
    3,
    "platforms",
    1,
    "Architecture models",
    3,
    "3.1",
    "Compare on-premises, cloud, hybrid, virtual, IoT, ICS, and embedded environments.",
  ],
  [
    3,
    "responsibility",
    2,
    "Shared responsibility",
    3,
    "3.1",
    "Assign security duties correctly across service and deployment models.",
  ],
  [
    3,
    "network-design",
    3,
    "Secure enterprise design",
    3,
    "3.2",
    "Apply segmentation, zero trust, secure access, and infrastructure controls.",
  ],
  [
    3,
    "data",
    4,
    "Data protection lifecycle",
    3,
    "3.3",
    "Classify, handle, encrypt, tokenize, retain, and destroy data appropriately.",
  ],
  [
    3,
    "applied-crypto",
    5,
    "Applied cryptography and PKI",
    1,
    "1.4",
    "Choose keys, certificates, signatures, and secure protocols in context.",
  ],
  [
    3,
    "resilience",
    6,
    "Resilience and recovery",
    3,
    "3.4",
    "Balance redundancy, backups, continuity, recovery time, and recovery point needs.",
  ],
  [
    4,
    "assets",
    1,
    "Asset management and baselines",
    4,
    "4.1–4.2",
    "Control assets from discovery and onboarding through disposal.",
  ],
  [
    4,
    "vulnerability-management",
    2,
    "Vulnerability management",
    4,
    "4.3",
    "Scan, analyze, prioritize, remediate, and validate weaknesses.",
  ],
  [
    4,
    "iam-operations",
    3,
    "IAM operations",
    4,
    "4.6",
    "Operate identity lifecycles, federation, provisioning, and access reviews.",
  ],
  [
    4,
    "monitoring",
    4,
    "Telemetry and monitoring",
    4,
    "4.4",
    "Turn logs, alerts, and security-tool evidence into defensible signals.",
  ],
  [
    4,
    "incident-response",
    5,
    "Incident response",
    4,
    "4.8",
    "Prepare, detect, analyze, contain, eradicate, recover, and improve.",
  ],
  [
    4,
    "forensics",
    6,
    "Forensics and automation",
    4,
    "4.7–4.9",
    "Preserve evidence, reconstruct events, and automate repeatable response safely.",
  ],
  [
    5,
    "governance",
    1,
    "Governance and policy",
    5,
    "5.1",
    "Connect policies, standards, procedures, roles, and oversight.",
  ],
  [
    5,
    "risk",
    2,
    "Risk management",
    5,
    "5.2",
    "Identify, analyze, treat, track, and communicate risk.",
  ],
  [
    5,
    "third-party",
    3,
    "Third-party risk",
    5,
    "5.3",
    "Evaluate suppliers, contracts, dependencies, and ongoing assurance.",
  ],
  [
    5,
    "compliance",
    4,
    "Compliance and assurance",
    5,
    "5.4",
    "Coordinate privacy, audits, assessments, and penetration testing.",
  ],
  [
    5,
    "awareness",
    5,
    "Security awareness",
    5,
    "5.6",
    "Design role-based education, simulations, reporting, and behavior change.",
  ],
  [
    5,
    "resilience-program",
    6,
    "Business impact and metrics",
    5,
    "5.5",
    "Use impact analysis, resilience plans, and metrics to guide leaders.",
  ],
];

const topicPacks = {
  platforms: [
    [
      "On-premises",
      "Infrastructure operated in facilities controlled by the organization.",
    ],
    [
      "IaaS",
      "Cloud service where the customer manages operating systems, applications, and data.",
    ],
    [
      "PaaS",
      "Cloud service where the provider manages the runtime and the customer manages applications and data.",
    ],
    ["SaaS", "Provider-operated application consumed by customers."],
    [
      "Hybrid cloud",
      "Architecture joining private or on-premises resources with public cloud services.",
    ],
    [
      "Virtualization",
      "Multiple isolated guest systems sharing physical compute through a hypervisor.",
    ],
    [
      "Container",
      "An isolated application process sharing the host operating-system kernel.",
    ],
    [
      "IoT",
      "Purpose-built connected devices that often have constrained security and update capabilities.",
    ],
    ["ICS", "Technology that monitors or controls industrial processes."],
    ["Embedded system", "Dedicated computing built into a larger product."],
    ["Hypervisor", "Software layer that creates and manages virtual machines."],
    [
      "VM escape",
      "Breaking guest isolation to affect the host or another guest.",
    ],
    [
      "Edge computing",
      "Processing placed near devices or data sources to reduce latency.",
    ],
    [
      "Air gap",
      "Intentional physical or logical separation from other networks.",
    ],
  ],
  responsibility: [
    [
      "Shared responsibility",
      "Division of security duties between a service provider and customer.",
    ],
    [
      "Data owner",
      "Party accountable for classification and permitted use of data.",
    ],
    ["Cloud provider", "Organization operating the underlying cloud service."],
    [
      "Customer configuration",
      "Security settings and permissions controlled by the cloud customer.",
    ],
    [
      "Tenant isolation",
      "Controls preventing one cloud customer from accessing another tenant.",
    ],
    [
      "Control inheritance",
      "Using safeguards supplied by an underlying platform or provider.",
    ],
    ["CSPM", "Technology that identifies risky cloud configuration and drift."],
    ["CASB", "Policy enforcement between cloud consumers and cloud services."],
    ["SLA", "Contracted service targets and remedies."],
    [
      "Right to audit",
      "Contractual authority to assess a provider’s controls.",
    ],
    [
      "Data residency",
      "Requirement that data be stored or processed in specified locations.",
    ],
    [
      "Exit strategy",
      "Plan for securely moving services and data away from a provider.",
    ],
    ["Attestation", "Provider evidence about assessed control operation."],
    [
      "Responsibility matrix",
      "Explicit assignment of security tasks to accountable parties.",
    ],
  ],
  "network-design": [
    [
      "Zero trust architecture",
      "Access design that continuously evaluates identity, device, context, and resource policy.",
    ],
    [
      "Policy decision point",
      "Component that evaluates context and makes an access decision.",
    ],
    [
      "Policy enforcement point",
      "Component that permits, blocks, or terminates access.",
    ],
    [
      "Microsegmentation",
      "Workload-level communication restrictions that limit lateral movement.",
    ],
    ["DMZ", "Isolated network for services exposed to untrusted networks."],
    [
      "Jump server",
      "Hardened intermediary used to administer protected systems.",
    ],
    [
      "NAC",
      "Technology that evaluates devices before or during network access.",
    ],
    [
      "SASE",
      "Cloud-delivered networking and security capabilities near users and resources.",
    ],
    ["SD-WAN", "Software-defined control of wide-area network paths."],
    ["VPN", "Encrypted tunnel across an untrusted network."],
    ["East-west traffic", "Communication between internal workloads."],
    [
      "North-south traffic",
      "Communication entering or leaving an environment.",
    ],
    ["Load balancer", "Service distributing requests across multiple systems."],
    ["Firewall rulebase", "Ordered policy governing permitted network flows."],
  ],
  data: [
    [
      "Data classification",
      "Assigning sensitivity and handling requirements to information.",
    ],
    [
      "Data owner",
      "Business role accountable for classification and access decisions.",
    ],
    ["Data custodian", "Role operating safeguards on behalf of the owner."],
    [
      "Data sovereignty",
      "Legal authority applying because of where data or people are located.",
    ],
    [
      "Data residency",
      "Required geographic location for storage or processing.",
    ],
    [
      "Tokenization",
      "Replacing sensitive data with a non-sensitive reference token.",
    ],
    ["Masking", "Obscuring part or all of a data value from a viewer."],
    [
      "DLP",
      "Controls that identify and restrict inappropriate movement of sensitive data.",
    ],
    ["Retention", "Required period for keeping information."],
    ["Sanitization", "Rendering data infeasible to recover from media."],
    ["Encryption at rest", "Cryptographic protection of stored data."],
    [
      "Encryption in transit",
      "Cryptographic protection while data crosses a connection.",
    ],
    [
      "Rights management",
      "Persistent usage restrictions attached to documents or messages.",
    ],
    [
      "Data minimization",
      "Collecting and retaining only information needed for a defined purpose.",
    ],
  ],
  "applied-crypto": [
    [
      "Symmetric encryption",
      "Encryption using the same secret key for encryption and decryption.",
    ],
    [
      "Asymmetric encryption",
      "Cryptography using mathematically related public and private keys.",
    ],
    [
      "Digital signature",
      "Private-key operation providing integrity and source assurance.",
    ],
    ["Hash", "One-way digest used to detect data changes."],
    ["HMAC", "Keyed hash providing integrity and message authentication."],
    [
      "Certificate authority",
      "Trusted entity that issues and signs digital certificates.",
    ],
    [
      "CSR",
      "Certificate signing request containing identity details and a public key.",
    ],
    ["CRL", "Published list of certificates revoked before expiration."],
    ["OCSP", "Protocol for checking certificate revocation status."],
    [
      "Key escrow",
      "Controlled storage of key material for authorized recovery.",
    ],
    [
      "Key rotation",
      "Replacing cryptographic keys on a schedule or after risk events.",
    ],
    [
      "Perfect forward secrecy",
      "Session-key design that protects prior sessions if a long-term key is later exposed.",
    ],
    ["TLS", "Protocol protecting application traffic in transit."],
    [
      "Code signing",
      "Digital signing used to verify software publisher and integrity.",
    ],
  ],
  resilience: [
    [
      "High availability",
      "Design that minimizes service interruption through redundant capacity.",
    ],
    [
      "Fault tolerance",
      "Ability to continue operation despite component failure.",
    ],
    ["Load balancing", "Distributing work across multiple service instances."],
    ["Failover", "Moving service to a redundant component after failure."],
    ["RTO", "Target maximum time to restore a disrupted service."],
    ["RPO", "Target maximum interval of acceptable data loss."],
    ["Full backup", "Copy of all selected data."],
    [
      "Incremental backup",
      "Copy of changes since the previous backup of any type.",
    ],
    ["Differential backup", "Copy of changes since the previous full backup."],
    [
      "Immutable backup",
      "Backup protected from modification or deletion for a defined period.",
    ],
    ["Hot site", "Recovery facility maintained for rapid service restoration."],
    [
      "Warm site",
      "Partially prepared recovery facility requiring additional setup.",
    ],
    [
      "Cold site",
      "Facility space and utilities requiring equipment and restoration work.",
    ],
    [
      "Recovery testing",
      "Exercises proving restoration procedures and dependencies work.",
    ],
  ],
  assets: [
    [
      "Asset inventory",
      "Authoritative record of hardware, software, services, and ownership.",
    ],
    [
      "CMDB",
      "Repository describing configuration items and their relationships.",
    ],
    [
      "Asset owner",
      "Role accountable for an asset’s risk and lifecycle decisions.",
    ],
    ["Secure baseline", "Approved minimum configuration for an asset role."],
    ["Configuration drift", "Deviation from the approved configuration."],
    ["MDM", "Central administration of mobile-device settings and security."],
    ["UEM", "Unified management of endpoints across device types."],
    ["EOL", "Point when a product is no longer sold or developed."],
    ["EOS", "Point when a supplier stops providing support or fixes."],
    [
      "Data sanitization",
      "Process making information on retired media unrecoverable.",
    ],
    [
      "Chain of custody",
      "Documented control and transfer history for an asset or evidence.",
    ],
    [
      "Shadow IT",
      "Technology used without required organizational approval or oversight.",
    ],
    ["Discovery scan", "Technique for finding connected or installed assets."],
    [
      "Asset tag",
      "Unique identifier linking an asset to its inventory record.",
    ],
  ],
  "vulnerability-management": [
    [
      "Authenticated scan",
      "Assessment using credentials to inspect local configuration and software.",
    ],
    [
      "Unauthenticated scan",
      "External-view assessment without privileged system access.",
    ],
    [
      "CVSS",
      "Standardized representation of vulnerability severity characteristics.",
    ],
    ["CVE", "Public identifier assigned to a known vulnerability."],
    [
      "Exploitability",
      "Practical likelihood that a weakness can be successfully abused.",
    ],
    [
      "Exposure",
      "Degree to which a vulnerable asset is reachable by a threat.",
    ],
    [
      "EPSS",
      "Estimate of the probability a vulnerability will be exploited soon.",
    ],
    [
      "False positive",
      "Reported finding that is not actually present or exploitable.",
    ],
    ["Remediation", "Removing the vulnerability or its root cause."],
    [
      "Mitigation",
      "Reducing likelihood or impact without removing the weakness.",
    ],
    [
      "Exception",
      "Time-bound approval to defer a requirement with documented risk.",
    ],
    ["Rescan", "Follow-up assessment used to verify remediation."],
    [
      "Penetration test",
      "Authorized exploitation used to demonstrate attack paths and impact.",
    ],
    [
      "Attack surface management",
      "Continuous discovery and assessment of exposed assets.",
    ],
  ],
  "iam-operations": [
    ["Provisioning", "Creating identities and assigning approved access."],
    [
      "Deprovisioning",
      "Disabling identities and removing access when no longer authorized.",
    ],
    [
      "Federation",
      "Trust that lets one domain rely on another domain’s identity assertions.",
    ],
    [
      "SAML",
      "XML-based federation protocol commonly used for enterprise single sign-on.",
    ],
    ["OIDC", "Identity layer built on OAuth 2.0."],
    ["OAuth", "Delegated authorization framework for limited resource access."],
    ["SCIM", "Standard for automated identity provisioning between systems."],
    [
      "Access review",
      "Periodic confirmation that assigned permissions remain justified.",
    ],
    [
      "PAM",
      "Controls for protecting, brokering, and monitoring privileged access.",
    ],
    [
      "JIT access",
      "Privilege activated only when needed for a limited period.",
    ],
    ["Service account", "Nonhuman identity used by software or automation."],
    [
      "Conditional access",
      "Access decision incorporating identity, device, location, risk, or other context.",
    ],
    ["SSO", "Using one authenticated session to access multiple services."],
    [
      "Identity proofing",
      "Evidence-based process for establishing a real-world identity.",
    ],
  ],
  monitoring: [
    [
      "SIEM",
      "Platform that centralizes, correlates, and searches security events.",
    ],
    ["SOAR", "Automation and orchestration of repeatable security workflows."],
    [
      "EDR",
      "Endpoint telemetry, detection, investigation, and response capability.",
    ],
    ["NDR", "Network-focused behavior detection and response capability."],
    ["Syslog", "Standard protocol and message format for transmitting logs."],
    ["NetFlow", "Metadata summarizing network conversations."],
    ["Baseline", "Reference describing expected system or user behavior."],
    [
      "Correlation rule",
      "Logic joining multiple events into a higher-confidence signal.",
    ],
    [
      "Alert tuning",
      "Adjusting detection logic to reduce noise while preserving coverage.",
    ],
    ["False negative", "Malicious activity that a control fails to detect."],
    ["UEBA", "Analytics used to identify unusual user or entity behavior."],
    [
      "Time synchronization",
      "Consistent clocks needed to correlate events accurately.",
    ],
    ["Log retention", "Period security records remain available."],
    [
      "Detection engineering",
      "Design, testing, and maintenance of threat detections.",
    ],
  ],
  "incident-response": [
    [
      "Preparation",
      "People, tools, plans, and exercises established before incidents.",
    ],
    ["Detection", "Recognition that a potentially harmful event occurred."],
    ["Analysis", "Determining scope, cause, impact, and confidence."],
    [
      "Containment",
      "Limiting spread or damage while preserving needed evidence.",
    ],
    [
      "Eradication",
      "Removing malicious artifacts, persistence, and root causes.",
    ],
    [
      "Recovery",
      "Restoring trustworthy operations and monitoring for recurrence.",
    ],
    [
      "Lessons learned",
      "Structured review that turns evidence into improvement.",
    ],
    ["Playbook", "Documented actions for a repeatable incident type."],
    ["Tabletop exercise", "Discussion-based rehearsal of roles and decisions."],
    ["Severity", "Classification used to set urgency and escalation."],
    [
      "Communications plan",
      "Approved audiences, channels, ownership, and timing for incident updates.",
    ],
    [
      "Root cause",
      "Underlying condition that allowed or sustained the incident.",
    ],
    ["Dwell time", "Duration an attacker remains undetected."],
    [
      "Evidence preservation",
      "Protecting relevant data from alteration or loss.",
    ],
  ],
  forensics: [
    [
      "Order of volatility",
      "Priority for collecting evidence most likely to disappear first.",
    ],
    [
      "Chain of custody",
      "Record of evidence possession, transfer, and handling.",
    ],
    ["Forensic image", "Bit-for-bit acquisition of storage for examination."],
    [
      "Write blocker",
      "Tool preventing modification of source media during acquisition.",
    ],
    [
      "Hash verification",
      "Digest comparison demonstrating evidence remained unchanged.",
    ],
    ["Memory capture", "Acquisition of volatile system memory."],
    [
      "Timeline analysis",
      "Ordering events from multiple artifacts to reconstruct activity.",
    ],
    ["Metadata", "Context such as timestamps, ownership, and file attributes."],
    [
      "Legal hold",
      "Process preserving information relevant to litigation or investigation.",
    ],
    [
      "E-discovery",
      "Identification and production of electronically stored information.",
    ],
    [
      "Root-cause analysis",
      "Method for identifying underlying contributing conditions.",
    ],
    ["Runbook", "Detailed operational steps for a routine procedure."],
    ["Orchestration", "Coordinating actions across multiple security tools."],
    [
      "Human approval",
      "Required review before automation performs a high-impact action.",
    ],
  ],
  governance: [
    ["Policy", "Management statement of required direction and intent."],
    ["Standard", "Mandatory detailed requirement supporting policy."],
    ["Procedure", "Step-by-step instructions for performing a task."],
    ["Guideline", "Recommended practice that allows informed flexibility."],
    [
      "Governance",
      "Structures used to direct, oversee, and hold security accountable.",
    ],
    [
      "Data owner",
      "Role accountable for classification and permitted data use.",
    ],
    ["System owner", "Role accountable for a system’s operation and risk."],
    [
      "Acceptable use policy",
      "Rules governing appropriate use of organizational resources.",
    ],
    [
      "Change management",
      "Controlled evaluation, approval, implementation, and review of changes.",
    ],
    ["Exception process", "Time-bound approval for a documented deviation."],
    [
      "Separation of duties",
      "Dividing incompatible responsibilities among different people.",
    ],
    ["Due care", "Reasonable action taken to manage known risk."],
    ["Due diligence", "Reasonable investigation supporting a decision."],
    [
      "Board oversight",
      "Governing-body review of significant strategy and risk.",
    ],
  ],
  risk: [
    [
      "Risk appetite",
      "Amount and type of risk an organization is willing to pursue or retain.",
    ],
    [
      "Risk tolerance",
      "Acceptable variation around a specific risk objective.",
    ],
    [
      "Risk register",
      "Tracked record of risks, owners, treatment, and status.",
    ],
    ["Inherent risk", "Risk before additional controls are applied."],
    ["Residual risk", "Risk remaining after controls operate."],
    ["Risk avoidance", "Stopping the activity that creates the risk."],
    ["Risk mitigation", "Reducing likelihood or impact through safeguards."],
    [
      "Risk transfer",
      "Shifting defined financial or operational consequences to another party.",
    ],
    ["Risk acceptance", "Authorized decision to retain understood risk."],
    ["SLE", "Expected monetary loss from one occurrence."],
    ["ARO", "Estimated number of occurrences per year."],
    ["ALE", "Expected annual loss calculated from SLE multiplied by ARO."],
    [
      "Qualitative analysis",
      "Relative risk evaluation using categories or rankings.",
    ],
    ["Risk owner", "Person accountable for monitoring and treating a risk."],
  ],
  "third-party": [
    [
      "Vendor assessment",
      "Evaluation of supplier controls and risk before or during engagement.",
    ],
    [
      "Due diligence",
      "Investigation supporting supplier selection and risk decisions.",
    ],
    ["SLA", "Contracted service targets and remedies."],
    ["NDA", "Agreement restricting disclosure of protected information."],
    [
      "Data processing agreement",
      "Contract defining duties for processing personal or regulated data.",
    ],
    ["Right to audit", "Contractual authority to assess supplier controls."],
    [
      "Breach notification clause",
      "Required timing and method for reporting security incidents.",
    ],
    [
      "Supply-chain risk",
      "Exposure introduced through suppliers, dependencies, or service providers.",
    ],
    ["Fourth party", "Supplier used by a direct third party."],
    [
      "Concentration risk",
      "Dependence on one provider, region, or shared point of failure.",
    ],
    ["SBOM", "Inventory of software components included in a product."],
    ["Attestation", "External statement about assessed control operation."],
    [
      "Exit plan",
      "Steps for securely ending service and retrieving or destroying data.",
    ],
    [
      "Continuous monitoring",
      "Ongoing review of supplier posture and material changes.",
    ],
  ],
  compliance: [
    [
      "Compliance",
      "Meeting applicable legal, regulatory, contractual, and policy obligations.",
    ],
    [
      "Privacy",
      "Appropriate collection, use, disclosure, retention, and protection of personal data.",
    ],
    ["Audit", "Independent comparison of evidence against defined criteria."],
    ["Assessment", "Evaluation of controls, risk, or requirements."],
    [
      "Penetration test",
      "Authorized exploitation to demonstrate attack paths and impact.",
    ],
    [
      "Rules of engagement",
      "Scope, authorization, timing, and constraints for a security test.",
    ],
    [
      "Evidence",
      "Reliable information supporting an audit or assessment conclusion.",
    ],
    ["Finding", "Documented gap between observed and required state."],
    ["Remediation plan", "Owned actions and dates for resolving a finding."],
    [
      "Compensating control",
      "Alternate safeguard providing a comparable objective.",
    ],
    ["Data subject", "Person whose personal information is processed."],
    [
      "Data controller",
      "Party determining purposes and means of personal-data processing.",
    ],
    ["Data processor", "Party processing personal data for a controller."],
    [
      "Regulatory reporting",
      "Required notification to an authority within defined conditions and timing.",
    ],
  ],
  awareness: [
    [
      "Awareness",
      "Helping people recognize security risk and expected behavior.",
    ],
    ["Training", "Developing skills needed to perform security-related tasks."],
    [
      "Education",
      "Building deeper understanding that transfers across situations.",
    ],
    [
      "Phishing simulation",
      "Controlled exercise measuring response to deceptive messages.",
    ],
    [
      "Report rate",
      "Percentage of recipients who report a simulated or real attempt.",
    ],
    [
      "Click rate",
      "Percentage of recipients who interact with a simulation lure.",
    ],
    [
      "Role-based training",
      "Instruction tailored to responsibilities and exposure.",
    ],
    [
      "Just-in-time training",
      "Short guidance delivered near a relevant event or decision.",
    ],
    [
      "Security champion",
      "Local advocate connecting a team with the security program.",
    ],
    [
      "Behavior change",
      "Measurable improvement in security decisions over time.",
    ],
    [
      "Positive reinforcement",
      "Encouragement that strengthens desired reporting and handling behavior.",
    ],
    [
      "Remedial training",
      "Targeted follow-up after a demonstrated knowledge or behavior gap.",
    ],
    [
      "Insider-risk awareness",
      "Guidance for recognizing and reporting harmful or unsafe internal behavior.",
    ],
    [
      "Training metric",
      "Evidence connecting learning activity to improved outcomes.",
    ],
  ],
  "resilience-program": [
    [
      "BIA",
      "Analysis identifying critical processes, dependencies, and disruption impacts.",
    ],
    ["MTD", "Maximum tolerable duration a process can remain disrupted."],
    ["RTO", "Target time for restoring a service or process."],
    ["RPO", "Target maximum interval of acceptable data loss."],
    [
      "Business continuity",
      "Capability to sustain critical operations through disruption.",
    ],
    [
      "Disaster recovery",
      "Restoration of technology and data after a major disruption.",
    ],
    [
      "Crisis management",
      "Executive coordination of high-impact organizational events.",
    ],
    [
      "Succession planning",
      "Preparation for continuity of essential leadership or specialist roles.",
    ],
    ["KPI", "Metric showing progress toward a desired performance outcome."],
    ["KRI", "Metric signaling increasing exposure or likelihood of harm."],
    ["Leading indicator", "Measure suggesting future performance or risk."],
    [
      "Lagging indicator",
      "Measure describing an outcome that already occurred.",
    ],
    ["Exercise", "Structured rehearsal used to test plans and decisions."],
    [
      "Executive communication",
      "Concise reporting of impact, choices, ownership, and residual risk.",
    ],
  ],
};

for (const [
  tier,
  id,
  number,
  title,
  domain,
  objective,
  summary,
] of compactSpecs) {
  const terms = topicPacks[id].map(([name, definition]) =>
    term(name, definition),
  );
  const pair = (index) =>
    `${terms[index][0]} means ${terms[index][1].charAt(0).toLowerCase()}${terms[index][1].slice(1)} ${terms[index + 1][0]} means ${terms[index + 1][1].charAt(0).toLowerCase()}${terms[index + 1][1].slice(1)}`;
  const authoredScenario = tier === 3 ? tier3Scenarios[id] : tier === 4 ? tier4Scenarios[id] : undefined;
  const scenario = authoredScenario
    ? { ...authoredScenario, evidence:[...authoredScenario.evidence], actions:authoredScenario.actions.map((action) => ({...action})), hints:[...authoredScenario.hints] }
    : genericScenario(`A ${title.toLowerCase()} decision under pressure`, title.toLowerCase());
  if (!authoredScenario) scenario.evidence = [
    `The decision depends on ${terms[0][0]} and ${terms[1][0]}.`,
    `A gap involving ${terms[4][0]} creates a credible business impact.`,
    `The accountable team has not validated ${terms[8][0]}.`,
  ];
  if (!authoredScenario) scenario.actions = [
    {
      id: "scope",
      label: `Establish scope using ${terms[0][0]} and ${terms[1][0]}`,
      correct: true,
    },
    {
      id: "control",
      label: `Apply and validate ${terms[4][0]}`,
      correct: true,
    },
    {
      id: "owner",
      label: `Assign ownership and document ${terms[8][0]}`,
      correct: true,
    },
    {
      id: "erase",
      label: "Destroy evidence before confirming scope",
      correct: false,
    },
    {
      id: "ignore",
      label: "Accept the condition without an accountable decision",
      correct: false,
    },
  ];
  specs.push({
    tier,
    id,
    number,
    title,
    domain,
    objective,
    summary,
    objectives: [
      `Explain the purpose of ${title.toLowerCase()}`,
      `Apply ${title.toLowerCase()} in context`,
      `Recognize weak decisions and improve them`,
    ],
    headings: [
      terms[0][0],
      terms[2][0],
      terms[4][0],
      terms[6][0],
      terms[8][0],
      terms[10][0],
    ],
    reading: [
      `${summary} ${pair(0)}`,
      `${pair(2)} These concepts determine where responsibility and trust sit.`,
      `${pair(4)} Apply them according to system context rather than as isolated vocabulary.`,
      `${pair(6)} Their value depends on correct operation, ownership, and evidence.`,
      `${pair(8)} Compare the intended outcome with observed conditions and document exceptions.`,
      `${pair(10)} Use review and testing to expose assumptions before a real incident does.`,
    ],
    terms,
    scenario,
    questions: tier === 3 ? tier3QuestionBanks[id] : tier === 4 ? tier4QuestionBanks[id] : undefined,
  });
  if (tier === 4 && tier4Lessons[id]) {
    specs[specs.length - 1].headings = [...tier4Lessons[id].headings];
    specs[specs.length - 1].reading = [...tier4Lessons[id].content];
  }
}

function makeCheckpoint(tier, sections) {
  const questions = [
    ...sections.flatMap((section) =>
      section.activities[4].questions
        .slice(0, 3)
        .map((question) => ({ ...question, sectionId: section.id })),
    ),
    ...sections
      .slice(0, 2)
      .map((section) => ({
        ...section.activities[4].questions[3],
        sectionId: section.id,
      })),
  ].map((question, index) => ({
    ...question,
    id: `t${tier.number}-checkpoint-${index + 1}`,
  }));
  return {
    id: `t${tier.number}-final-section`,
    title: `Tier ${tier.number} · Final checkpoint`,
    summary: `Bring all six ${tier.title} sections together.`,
    activities: [
      {
        id: `t${tier.number}-checkpoint`,
        type: "checkpoint",
        title: `Tier ${tier.number} cumulative checkpoint`,
        duration: 25,
        required: true,
        domain: tier.number === 5 ? 5 : tier.number === 2 ? 2 : tier.number,
        difficulty: tier.difficulty,
        objective: `Tier ${tier.number} synthesis`,
        summary: "Complete 20 mixed questions covering every section.",
        questions,
      },
    ],
  };
}

const tierMeta = {
  2: {
    number: 2,
    title: "Systems & Threats",
    subtitle: "See how attacks meet real systems",
    difficulty: "developing",
    color: "#ffb86b",
    recommendedAfter: 1,
  },
  3: {
    number: 3,
    title: "Secure Architecture",
    subtitle: "Design systems that expect pressure",
    difficulty: "applied",
    color: "#8aa7ff",
    recommendedAfter: 2,
  },
  4: {
    number: 4,
    title: "Security Operations",
    subtitle: "Detect, contain, recover, improve",
    difficulty: "advanced",
    color: "#e78cff",
    recommendedAfter: 3,
  },
  5: {
    number: 5,
    title: "Governance & Exam Synthesis",
    subtitle: "Connect technical judgment to risk",
    difficulty: "synthesis",
    color: "#ff7c89",
    recommendedAfter: 4,
  },
};

export const advancedTiers = Object.values(tierMeta).map((tier) => {
  const sections = specs
    .filter((section) => section.tier === tier.number)
    .map((section) => makeSection(section, tier));
  const modules = [...sections, makeCheckpoint(tier, sections)];
  if (tier.number === 3)
    modules.push({
      id: "t3-architecture-lab-section",
      title: "Tier 3 · Resilient architecture lab",
      summary: "Balance confidentiality, availability, cost, and recovery.",
      activities: [
        {
          id: "t3-architecture-lab",
          type: "scenario",
          title: "Resilient architecture lab",
          duration: 20,
          required: true,
          domain: 3,
          objective: "3.1–3.4",
          difficulty: "applied",
          summary: "Design a resilient service from competing requirements.",
          ...tier3ArchitectureLab,
        },
      ],
    });
  if (tier.number === 4)
    modules.push({
      id: "t4-investigation-section",
      title: "Tier 4 · Investigation lab",
      summary: "Use telemetry and evidence to reconstruct an incident.",
      activities: [
        {
          id: "t4-investigation-lab",
          type: "scenario",
          title: "Staged investigation",
          duration: 22,
          required: true,
          domain: 4,
          objective: "4.4–4.9",
          difficulty: "advanced",
          summary:
            "Correlate alerts, preserve evidence, and contain the incident.",
          ...tier4InvestigationLab,
        },
      ],
    });
  return {
    id: `tier-${tier.number}`,
    ...tier,
    minutes: modules
      .flatMap((module) => module.activities)
      .reduce((sum, activity) => sum + activity.duration, 0),
    modules,
  };
});

const allAdvancedQuestions = advancedTiers.flatMap((tier) =>
  tier.modules.flatMap((module) =>
    module.activities
      .filter((activity) => activity.id.endsWith("-quiz"))
      .flatMap((activity) => activity.questions ?? []),
  ),
);
const examQuestions = [1, 2, 3, 4, 5]
  .flatMap((domain) =>
    allAdvancedQuestions
      .filter((question) => question.domain === domain)
      .slice(0, [9, 17, 14, 21, 15][domain - 1]),
  )
  .map((question, index) => ({ ...question, id: `final-exam-${index + 1}` }));

export const finalScenario = {
  id: "t5-cross-domain-pbq",
  type: "scenario",
  title: "Cross-domain performance scenario",
  duration: 30,
  required: true,
  domain: 5,
  objective: "Cross-domain synthesis",
  difficulty: "synthesis",
  summary: "Apply all five domains to a supplier-enabled cloud incident",
  instructions:
    "Review the evidence and choose the coordinated actions that address governance, architecture, operations, threats, and communication.",
  evidence: [
    "A supplier account accessed cloud storage from a new location.",
    "Sensitive exports occurred before the alert was triaged.",
    "The contract contains a four-hour incident notification clause.",
  ],
  actions: [
    {
      id: "revoke",
      label: "Revoke supplier sessions and preserve identity logs",
      correct: true,
    },
    {
      id: "scope",
      label: "Scope accessed data and affected obligations",
      correct: true,
    },
    {
      id: "notify",
      label: "Engage incident, legal, privacy, and supplier owners",
      correct: true,
    },
    {
      id: "delete",
      label: "Delete the audit logs to protect privacy",
      correct: false,
    },
    {
      id: "delay",
      label: "Wait for the supplier to decide whether an incident occurred",
      correct: false,
    },
  ],
  scoringRules: {
    pointsPerCorrect: 1,
    penaltyPerIncorrect: 1,
    passingScore: 2,
  },
  hints: ["A technical incident can create contractual and privacy duties."],
  explanation:
    "A sound response contains access, preserves evidence, establishes scope, and activates accountable business owners within contractual timelines.",
};

export const finalExam = {
  id: "t5-final-exam",
  type: "exam",
  title: "Security+ comprehensive practice exam",
  duration: 90,
  required: true,
  domain: 5,
  objective: "Cross-domain synthesis",
  difficulty: "synthesis",
  summary: "Complete a timed, domain-weighted comprehensive assessment.",
  questions: examQuestions,
  config: {
    version: 1,
    durationMinutes: 90,
    questionCount: examQuestions.length,
    domainWeights: { 1: 12, 2: 22, 3: 18, 4: 28, 5: 20 },
    passThreshold: 0.8,
    reviewPolicy: "after-submit",
  },
};

const tier5 = advancedTiers.find((tier) => tier.number === 5);
tier5.modules.push({
  id: "t5-synthesis-section",
  title: "Tier 5 · Exam synthesis",
  summary: "Apply the entire curriculum under exam-style constraints.",
  activities: [finalScenario, finalExam],
});

export const activityTypeLabels = {
  lesson: "Lesson",
  flashcards: "Flashcards",
  quiz: "Knowledge check",
  checkpoint: "Tier checkpoint",
  scenario: "Scenario lab",
  exam: "Practice exam",
};

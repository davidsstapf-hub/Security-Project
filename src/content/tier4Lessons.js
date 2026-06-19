export const tier4Lessons = {
  assets: {
    headings:["Know what exists","Ownership and relationships","Build from a baseline","Control mobile endpoints","Plan for support endings","Retire without leaking data"],
    content:[
      "Security operations begins with an authoritative inventory. Hardware, software, cloud services, virtual resources, and business applications need unique records, current locations, and discovery coverage. An unknown asset is not merely missing paperwork: it may be unpatched, unmanaged, or processing data outside approved controls.",
      "Inventory becomes useful when each asset has accountable ownership and documented relationships. The business owner accepts lifecycle and risk decisions; technical custodians operate the asset. A CMDB can show that a customer portal depends on identity, DNS, databases, certificates, and network paths, making change and incident impact easier to judge.",
      "A secure baseline defines the approved minimum state for an asset role. Configuration management applies that state repeatedly, while monitoring detects drift such as a disabled firewall, added administrator, or unapproved service. Exceptions should identify the owner, business reason, compensating control, expiration, and evidence that the alternate control works.",
      "Mobile and mixed endpoint fleets require centralized control. MDM focuses on mobile-device settings such as encryption, lock policy, application control, and remote wipe. UEM expands that operating model across laptops, phones, and tablets. Enrollment status must remain tied to inventory and identity so a retired or reassigned device does not keep stale access.",
      "End of life and end of support are different operational signals. A product may stop being sold while fixes continue, but once support ends, newly discovered weaknesses may remain open. Teams should identify those dates early, budget replacement, reduce exposure during transition, and avoid treating emergency segmentation as a permanent lifecycle strategy.",
      "Retirement closes both the asset and data lifecycles. Teams identify retained records, preserve evidence or legal holds, revoke identities and certificates, sanitize media using an approved method, verify the result, and update custody and inventory records. Deleting files or removing an asset tag does not prove that sensitive data is unrecoverable."
    ],
  },
  "vulnerability-management": {
    headings:["Find weaknesses with context","Prioritize actual risk","Validate scanner evidence","Choose remediation or mitigation","Manage exceptions","Prove the outcome"],
    content:[
      "Vulnerability management is a cycle of discovery, analysis, treatment, and verification. Authenticated scans can inspect installed software and configuration; unauthenticated scans show what a network observer can reach. Attack-surface management adds continuous discovery of exposed and previously unknown services.",
      "A severity score is not a remediation queue by itself. Prioritization combines technical severity with active exploitation, exploitability, reachability, asset criticality, data sensitivity, and compensating controls. A known-exploited flaw on a public gateway usually outranks an equal-scored finding on an isolated test server.",
      "Scanner results are evidence to validate, not unquestionable facts. Version detection may be wrong, a vulnerable component may be inactive, or a backported fix may not change the displayed version. Analysts document validation, preserve the rationale, and tune confirmed false positives without creating broad suppressions.",
      "Remediation removes the vulnerability or root cause, such as applying a patch or deleting an exposed service. Mitigation reduces likelihood or impact when remediation cannot happen immediately, such as segmentation, source restrictions, feature disablement, or additional monitoring. Mitigation should address the real attack path.",
      "A risk exception is a time-bound governance decision, not a closed ticket. It names the accountable owner, affected assets, business reason, residual risk, compensating controls, expiration, and planned resolution. Repeated extensions should trigger escalation because a temporary workaround can quietly become permanent exposure.",
      "Completion requires validation of the deployed state. Rescanning, package inspection, configuration checks, or controlled testing confirms that the vulnerable condition changed and that required service still works. Metrics should distinguish findings opened, risk reduced, overdue exceptions, and verified remediation rather than counting ticket closure alone."
    ],
  },
  "iam-operations": {
    headings:["Treat identity as a lifecycle","Federate trust carefully","Separate authentication and delegation","Automate provisioning","Control privilege","Review context and access"],
    content:[
      "Identity operations follows joiner, mover, and leaver events. Provisioning should start from an authoritative source and approved role; deprovisioning must disable the identity, revoke sessions and tokens, remove downstream access, and transfer owned resources. Movers are dangerous because old roles can accumulate beside new ones.",
      "Federation lets one domain rely on another domain’s authentication assertions. SAML commonly supports enterprise browser SSO, while OpenID Connect provides an identity layer for modern applications. Trust configuration, signing keys, audience restrictions, claim mapping, and deactivation behavior all need operational ownership.",
      "OAuth is delegated authorization: it lets an application receive scoped access without learning the user’s password. It is not automatically proof of identity, which is why OIDC adds identity claims. Consent grants, refresh tokens, redirect URIs, and application registrations should be monitored because attackers can use them for persistence.",
      "SCIM connects authoritative identity changes to applications. Automated provisioning reduces delay and manual inconsistency, but connectors must be monitored for failures. Applications outside automation need an explicit manual owner, reconciliation schedule, and evidence that termination and access changes are completed.",
      "Privileged access should be named, vaulted, limited, and observable. PAM can broker sessions, rotate credentials, require approval, and record activity. Just-in-time privilege reduces standing access by activating only the needed role for a short period. Service accounts need owners, scoped permissions, managed secrets, and lifecycle review.",
      "Conditional access evaluates identity, device, location, behavior, and risk at sign-in and during sessions. Periodic access reviews compare current permissions with current job need. Identity proofing establishes confidence in who receives an account; MFA and SSO improve authentication but do not replace authorization or lifecycle controls."
    ],
  },
  monitoring: {
    headings:["Build useful telemetry","Correlate across controls","Understand endpoint and network views","Engineer detections","Tune without blindness","Preserve investigative value"],
    content:[
      "Monitoring starts by deciding which questions evidence must answer. Identity, endpoint, network, application, cloud, and administrative logs should contain useful actors, actions, objects, outcomes, and timestamps. Collection health matters: a quiet source may mean normal behavior or a broken pipeline.",
      "A SIEM centralizes and searches events, but value comes from correlation and context. A low-severity script alert, new-domain lookup, unusual MFA event, mailbox rule, and bulk download can form one high-confidence incident. Shared users, hosts, sessions, addresses, and time windows connect the evidence.",
      "EDR provides process, file, user, and response visibility on managed endpoints. NDR analyzes network behavior and can reveal unmanaged devices or lateral movement. Syslog transports many event types, while NetFlow summarizes conversations without packet content. No single source supplies the whole story.",
      "Detection engineering defines a threat hypothesis, required telemetry, analytic logic, expected false positives, test cases, and response guidance. Detections should be exercised against representative benign and malicious behavior. A rule that has never been tested is an assumption, not dependable coverage.",
      "Alert tuning should reduce known noise narrowly. Exceptions need a documented reason and tests proving that malicious variants still alert. Excessive noise hides true incidents, but broad suppression creates false negatives. Metrics should consider fidelity, coverage, time to triage, and missed activity—not alert volume alone.",
      "Time synchronization and retention preserve investigative value. Incorrect clocks distort sequence; short retention can erase the beginning of a long-dwell intrusion. Raw evidence should remain available beyond the summarized alert so analysts can validate context, reconstruct events, and support legal or regulatory needs."
    ],
  },
  "incident-response": {
    headings:["Prepare before pressure","Detect and analyze","Contain proportionately","Eradicate root causes","Recover with confidence","Learn and communicate"],
    content:[
      "Preparation establishes roles, authority, contacts, tools, evidence procedures, communications, and playbooks before an incident. Tabletop exercises expose unclear decisions safely. Preparation also includes access to systems during outages, alternate communication channels, and agreements with suppliers and outside responders.",
      "Detection recognizes a potentially harmful event; analysis determines confidence, scope, cause, impact, and obligations. Responders build a timeline, identify affected identities and assets, distinguish observed facts from assumptions, and assign severity that drives urgency, escalation, and resources.",
      "Containment limits spread and harm while preserving needed evidence and business service. Endpoint isolation, session revocation, network restrictions, or disabling a malicious application are targeted controls. Destructive shutdowns may be appropriate in some cases, but should not be reflexive when safer containment exists.",
      "Eradication removes malicious artifacts, persistence, compromised secrets, and the condition that enabled access. Deleting one malware file is incomplete if an exposed key, vulnerable service, or OAuth grant remains. Root cause is the underlying condition that must change to prevent recurrence.",
      "Recovery restores trustworthy operation from validated systems and data. Teams monitor for recurrence, stage service restoration, confirm dependencies, and communicate risk to owners. Restoring too early can restart an attack; waiting for impossible certainty can prolong unnecessary business harm.",
      "Lessons learned turns evidence into owned improvements with deadlines and measures. Communications continue throughout the incident using approved audiences and channels. Technical response must coordinate with legal, privacy, regulatory, customer, insurer, and supplier obligations rather than treating them as afterthoughts."
    ],
  },
  forensics: {
    headings:["Work within authority","Collect by volatility","Acquire without alteration","Prove integrity and custody","Reconstruct and explain","Automate with guardrails"],
    content:[
      "Digital forensics begins with authorization and scope. Investigators need to know which systems, accounts, dates, and data they may examine, and whether legal holds or privacy limits apply. Technical capability does not itself grant authority to search every available source.",
      "Order of volatility prioritizes evidence likely to disappear first. Memory, active connections, running processes, and temporary cloud state can vanish when a system is powered down or a session expires. Collection choices must balance volatility, safety, business impact, and the risk of altering evidence.",
      "A forensic image is a bit-for-bit acquisition used for examination while protecting the original. Write blockers prevent accidental modification of source media. Memory capture, cloud exports, log preservation, and mailbox acquisition require similarly documented tools and procedures appropriate to the source.",
      "Hash verification demonstrates that acquired evidence remains unchanged. Chain of custody records who collected, possessed, transferred, stored, and examined it, with times and conditions. Integrity and custody records make findings reproducible and defensible; a hash without handling history is incomplete.",
      "Timeline analysis combines file, identity, network, endpoint, cloud, and message artifacts to reconstruct sequence. Metadata provides context such as ownership and timestamps. Root-cause analysis then connects observed actions to the conditions that enabled them, distinguishing evidence from inference.",
      "Runbooks and orchestration make repeatable collection, enrichment, and containment faster. Automation should preserve logs and case context, handle failures safely, and require human approval before destructive or ambiguous actions. Speed is valuable only when the workflow remains authorized, auditable, and evidence-aware."
    ],
  },
}

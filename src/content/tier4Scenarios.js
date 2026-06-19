const scenario = (title, summary, evidence, actions, hints, explanation) => ({
  title,
  summary,
  instructions: "Select the three actions that best address the operational evidence while preserving accountability and verification.",
  evidence,
  actions,
  hints,
  explanation,
  scoringRules: { pointsPerCorrect: 1, penaltyPerIncorrect: 1, passingScore: 2 },
})

export const tier4Scenarios = {
  assets: scenario(
    "The unmanaged laptop in the finance network",
    "Bring an unknown endpoint under lifecycle control without destroying evidence.",
    ["A discovery scan finds a laptop with no asset record communicating with the finance application.","The device runs an unsupported operating system and its local administrator cannot identify an owner.","Network telemetry shows no confirmed malicious traffic, but the endpoint differs from the approved finance baseline."],
    [{id:"isolate",label:"Restrict the device to a remediation network while preserving its current state",correct:true},{id:"owner",label:"Create an inventory record and assign an accountable business and technical owner",correct:true},{id:"replace",label:"Assess required data, then rebuild or replace the unsupported device using the approved baseline",correct:true},{id:"ignore",label:"Leave it connected because no malware alert has fired",correct:false},{id:"wipe",label:"Erase it immediately before identifying its data, owner, or business purpose",correct:false}],
    ["Unknown ownership is itself a control failure.","Contain first, then make a documented lifecycle decision."],
    "Restriction limits exposure without assuming compromise. Inventory and ownership restore accountability, while a controlled rebuild or replacement resolves unsupported software and baseline drift. Ignoring the asset preserves risk; immediate wiping can destroy business data and useful evidence."
  ),
  "vulnerability-management": scenario(
    "Three critical findings and one maintenance window",
    "Prioritize remediation using exploitability, exposure, business impact, and compensating controls.",
    ["A public VPN gateway has a known-exploited remote-code-execution flaw and a vendor patch is available.","An internal reporting server has the same CVSS score, but the vulnerable service is disabled and authenticated scans confirm it is not installed.","A clinical appliance has a lower score but is reachable from user networks, cannot be patched for 30 days, and supports patient care."],
    [{id:"vpn",label:"Emergency-patch the exposed VPN gateway and verify the deployed version",correct:true},{id:"clinical",label:"Segment the clinical appliance, restrict allowed sources, and track a time-bound patch exception",correct:true},{id:"validate",label:"Document validation of the reporting-server false positive and tune the finding",correct:true},{id:"score",label:"Patch strictly by CVSS score without considering exposure or exploitation",correct:false},{id:"close",label:"Close the appliance finding permanently because no patch is currently available",correct:false}],
    ["Severity is one input, not the queue.","Compensating controls need owners, expiration, and validation."],
    "The internet-facing known-exploited gateway is urgent. The clinical device needs immediate exposure reduction plus accountable deferred remediation. A validated false positive should be documented rather than consuming scarce maintenance time."
  ),
  "iam-operations": scenario(
    "The contractor who changed teams twice",
    "Correct identity lifecycle and privilege accumulation across connected applications.",
    ["A contractor moved from support to engineering but retained both role sets through group inheritance.","The HR end date passed yesterday, yet the federated account and three SaaS sessions remain active.","One application is not connected to automated provisioning and uses a shared emergency administrator credential."],
    [{id:"revoke",label:"Disable the authoritative identity and revoke active federated and SaaS sessions",correct:true},{id:"review",label:"Remove inherited access and review similar movers for accumulated privilege",correct:true},{id:"service",label:"Replace the shared administrator credential with named, vaulted, monitored access",correct:true},{id:"password",label:"Change only the contractor's workstation password",correct:false},{id:"wait",label:"Wait for each application owner to notice the expired contract",correct:false}],
    ["Termination must remove sessions as well as passwords.","Lifecycle failures often affect more than one identity."],
    "Authoritative deprovisioning and token revocation stop current access. Reviewing movers addresses the systemic role-accumulation problem, and named privileged access restores attribution where automation is unavailable."
  ),
  monitoring: scenario(
    "The alert that looks harmless in isolation",
    "Correlate endpoint, identity, DNS, and cloud evidence into a defensible incident signal.",
    ["EDR records a spreadsheet launching encoded PowerShell, but the process is initially marked low severity.","DNS logs show the endpoint resolving a newly registered domain; identity logs then show a successful MFA event followed by a new mailbox rule.","Cloud audit logs record a large download using the same user session from an unfamiliar autonomous system."],
    [{id:"correlate",label:"Correlate the endpoint, DNS, identity, mailbox, and cloud events on one incident timeline",correct:true},{id:"scope",label:"Identify other hosts, identities, domains, sessions, and data touched by the indicators",correct:true},{id:"contain",label:"Isolate the endpoint and revoke the affected sessions while retaining telemetry",correct:true},{id:"close",label:"Close the alert because each individual event has a plausible benign explanation",correct:false},{id:"delete",label:"Delete raw logs after copying only the alert title into a ticket",correct:false}],
    ["Sequence and shared entities can raise confidence.","Containment should preserve the response channel and evidence."],
    "The combined sequence supports phishing-driven execution, token misuse, mailbox persistence, and data access. Correlation, scoping, and targeted containment turn weak individual signals into an actionable, evidence-backed incident."
  ),
  "incident-response": scenario(
    "Ransomware reaches a shared engineering drive",
    "Contain active encryption, protect recovery assets, and coordinate business decisions.",
    ["EDR reports shadow-copy deletion and rapid file renaming from two engineering workstations.","A compromised service account has write access to the shared drive; immutable backups are healthy and separately administered.","Engineering can tolerate a four-hour outage, but restoring before persistence is removed could restart encryption."],
    [{id:"isolate",label:"Network-isolate affected endpoints and disable the compromised service account",correct:true},{id:"preserve",label:"Preserve endpoint, identity, file-server, and EDR evidence while scoping spread",correct:true},{id:"recover",label:"Protect backups, eradicate persistence, then restore and validate service",correct:true},{id:"restore",label:"Restore files immediately over the active compromise",correct:false},{id:"destroy",label:"Reimage every system before determining scope or initial access",correct:false}],
    ["Contain both device and identity paths.","Recovery follows containment and eradication."],
    "Isolation and account disablement interrupt spread. Evidence establishes scope and root cause, while protected backups support recovery only after persistence and the entry path are addressed. Premature restoration risks reinfection."
  ),
  forensics: scenario(
    "The administrator session under legal hold",
    "Preserve volatile and durable evidence while using automation safely.",
    ["A privileged cloud session creates a new access key and downloads regulated records before the account is disabled.","Legal counsel issues a hold covering identity, endpoint, cloud, and messaging evidence.","A proposed automation playbook would disable accounts, delete suspicious keys, and purge temporary files without analyst approval."],
    [{id:"preserve",label:"Preserve cloud audit logs, identity records, endpoint state, and relevant messages under the legal hold",correct:true},{id:"custody",label:"Record acquisition hashes, handlers, times, tools, and transfers for collected evidence",correct:true},{id:"guardrail",label:"Require approval and evidence-preservation steps before destructive playbook actions",correct:true},{id:"purge",label:"Run the playbook unchanged so temporary files are deleted immediately",correct:false},{id:"share",label:"Copy evidence into an unrestricted team folder for convenience",correct:false}],
    ["Automation must not outrun evidence obligations.","Integrity requires both hashes and documented handling."],
    "Legal preservation, verified acquisition, and chain of custody make the evidence defensible. Automation is useful for repeatable collection and containment, but destructive actions require guardrails when they could alter evidence or exceed authorization."
  ),
}

export const tier4InvestigationLab = scenario(
  "A suspicious administrator session",
  "Reconstruct a credential-theft incident from linked endpoint, identity, and cloud evidence.",
  ["09:12 EDR: WIN-23 opens invoice.xlsm, then launches encoded PowerShell; 09:14 DNS: WIN-23 queries login-check.example.","09:19 Identity: user jlee approves MFA; 09:27 Cloud: jlee consents to an unfamiliar OAuth application and creates an inbox forwarding rule.","09:41 Cloud storage: jlee downloads 2.4 GB of customer exports; 09:46 PAM: admin-jlee requests elevation from WIN-23 but the request is denied."],
  [{id:"timeline",label:"Build a correlated timeline linking WIN-23, jlee, the domain, OAuth consent, mailbox rule, and data access",correct:true},{id:"contain",label:"Isolate WIN-23, revoke jlee sessions and OAuth grants, and remove the forwarding rule after preserving details",correct:true},{id:"scope",label:"Determine accessed records, search for shared indicators, preserve evidence, and notify incident and privacy owners",correct:true},{id:"admin",label:"Treat the denied PAM request as proof that no compromise occurred",correct:false},{id:"wipe",label:"Wipe WIN-23 and delete the cloud audit records before acquisition",correct:false}],
  ["A denied privileged action does not erase successful earlier activity.","Distinguish initial execution, persistence, attempted elevation, and impact."],
  "The evidence supports malicious document execution followed by identity and cloud-session abuse, OAuth and mailbox persistence, attempted privilege elevation, and data access. A strong investigation correlates the timeline, contains every active path, scopes affected data and related indicators, and preserves defensible evidence."
)

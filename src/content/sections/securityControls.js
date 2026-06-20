export const securityControlsReading = [
  'A security control is a safeguard that reduces risk. Controls can protect people, facilities, devices, applications, data, and business processes. The exam often presents a safeguard and asks you to classify it in two ways: by category—how the control is implemented—and by function—what the control is intended to accomplish. Keeping those two questions separate prevents most classification mistakes.',
  'The four control categories are technical, managerial, operational, and physical. Technical controls are enforced by technology, such as firewalls, access-control lists, encryption, and endpoint protection. Managerial controls guide security through decisions and oversight; policies, risk assessments, and security planning belong here. Operational controls are performed mainly by people as part of recurring work, including awareness training, change management, and incident-response procedures. Physical controls protect facilities and tangible assets with locks, fencing, lighting, guards, and environmental systems.',
  'Control functions describe the result a safeguard is meant to produce. Preventive controls attempt to stop an event before it succeeds. Detective controls discover events during or after they occur. Corrective controls repair damage or return systems to an approved state. Deterrent controls make an attacker less willing to try. Compensating controls provide an alternative when the preferred control is impractical, while directive controls tell people what behavior is required.',
  'One safeguard can have more than one useful label because category and function answer different questions. A firewall is normally a technical control and commonly serves a preventive function. A security guard is physical when protecting an entrance, but the guard’s visible presence may deter an attacker while badge inspection prevents unauthorized entry. Video surveillance is physical and usually detective, although prominently displayed cameras may also deter behavior. On the exam, choose the description that best matches the scenario’s stated purpose.',
  'Controls are strongest when layered. Defense in depth assumes that any single safeguard can fail, so organizations combine controls with different categories and functions. A sensitive server might be protected by a locked room, network segmentation, multifactor authentication, endpoint monitoring, backups, and tested response procedures. No layer is perfect; together, they reduce the chance that one mistake becomes a major incident.',
  'Control selection should follow risk. Start with the asset and business objective, identify the threat and vulnerability, estimate likelihood and impact, and then select a control that reduces the relevant risk at a reasonable cost. Controls can introduce friction, expense, privacy concerns, or new failure modes. Security is therefore not the act of adding every possible safeguard—it is the discipline of choosing complementary safeguards that make risk acceptable without preventing the organization from functioning.',
]

export const securityControlCards = [
  ['Security control', 'A safeguard or countermeasure used to reduce risk.'],
  ['Technical control', 'A control implemented or enforced primarily through technology, such as encryption or a firewall.'],
  ['Managerial control', 'A control based on governance, oversight, planning, or risk decisions, such as a security policy.'],
  ['Operational control', 'A control carried out mainly by people through recurring processes or procedures.'],
  ['Physical control', 'A control that protects facilities, people, equipment, or other tangible assets.'],
  ['Preventive control', 'A control intended to stop an unwanted event before it succeeds.'],
  ['Detective control', 'A control intended to discover an event or identify that it has occurred.'],
  ['Corrective control', 'A control intended to repair damage or return a system to an approved state.'],
  ['Deterrent control', 'A control intended to discourage an attacker from attempting an action.'],
  ['Compensating control', 'An alternative safeguard used when the preferred control cannot be implemented.'],
  ['Directive control', 'A control that defines or communicates required behavior.'],
  ['Defense in depth', 'The use of multiple complementary security layers so one failure does not expose the asset.'],
  ['Risk-based control selection', 'Choosing safeguards according to the asset, threat, vulnerability, likelihood, impact, and business constraints.'],
  ['Control gap', 'A risk that remains insufficiently addressed because a required safeguard is missing or ineffective.'],
]

export const securityControlKnowledgeCheck = [
  {
    id: 'controls-kc-1', objective: '1.1', domain: 1,
    prompt: 'A company configures its email gateway to block known malicious attachments before delivery. Which category and function best describe this control?',
    options: ['Technical and preventive', 'Operational and detective', 'Managerial and directive', 'Physical and corrective'], correctIndex: 0,
    explanation: 'The gateway is implemented through technology, making it technical. It blocks the attachment before delivery, making its primary function preventive.',
  },
  {
    id: 'controls-kc-2', objective: '1.1', domain: 1,
    prompt: 'Which control is the clearest example of a managerial control?',
    options: ['A locked server rack', 'An annual enterprise risk assessment', 'Endpoint detection software', 'A help-desk identity verification procedure'], correctIndex: 1,
    explanation: 'Risk assessments support governance, planning, and security decisions, so they are managerial. The other choices are physical, technical, and operational.',
  },
  {
    id: 'controls-kc-3', objective: '1.1', domain: 1,
    prompt: 'A legacy application cannot support multifactor authentication. The organization requires access through a hardened jump server with MFA instead. What type of control is the jump server requirement?',
    options: ['Detective', 'Compensating', 'Deterrent', 'Corrective'], correctIndex: 1,
    explanation: 'The jump server provides an alternative safeguard because the preferred control cannot be applied directly to the legacy application. That makes it compensating.',
  },
  {
    id: 'controls-kc-4', objective: '1.1', domain: 1,
    prompt: 'Security analysts review authentication logs each morning to identify suspicious sign-in attempts. What is the primary function?',
    options: ['Preventive', 'Directive', 'Detective', 'Corrective'], correctIndex: 2,
    explanation: 'Reviewing logs discovers activity that has already occurred. The process may lead to later action, but its immediate function is detective.',
  },
  {
    id: 'controls-kc-5', objective: '1.1', domain: 1,
    prompt: 'Why does defense in depth use multiple overlapping controls?',
    options: ['To guarantee attacks become impossible', 'To eliminate the need for response planning', 'To ensure one control failure does not expose the asset', 'To replace risk assessments with technical safeguards'], correctIndex: 2,
    explanation: 'Defense in depth recognizes that controls can fail. Complementary layers reduce the chance that one failure or bypass leads directly to compromise.',
  },
]

export const securityControlSectionQuiz = [
  {
    id: 'controls-sq-1', objective: '1.1', domain: 1,
    prompt: 'New employees must complete security awareness training before receiving production access. Which category best describes the training?',
    options: ['Physical', 'Technical', 'Operational', 'Corrective'], correctIndex: 2,
    explanation: 'Awareness training is delivered through a people-driven recurring process, so it is categorized as an operational control.',
  },
  {
    id: 'controls-sq-2', objective: '1.1', domain: 1,
    prompt: 'A written policy requires employees to lock their screens whenever they leave their desks. What is the policy’s primary function?',
    options: ['Directive', 'Detective', 'Corrective', 'Compensating'], correctIndex: 0,
    explanation: 'The policy communicates required behavior, so its primary function is directive. Screen-lock technology itself would be a technical preventive control.',
  },
  {
    id: 'controls-sq-3', objective: '1.1', domain: 1,
    prompt: 'After malware modifies system files, an administrator restores the device from a known-good image. What function does the restoration perform?',
    options: ['Deterrent', 'Preventive', 'Corrective', 'Directive'], correctIndex: 2,
    explanation: 'Restoring the device returns it to an approved state after damage occurred, which is the purpose of a corrective control.',
  },
  {
    id: 'controls-sq-4', objective: '1.1', domain: 1,
    prompt: 'A brightly lit perimeter and visible warning signs are installed around a storage facility. Which function is most directly emphasized?',
    options: ['Compensating', 'Deterrent', 'Corrective', 'Detective'], correctIndex: 1,
    explanation: 'Visibility and warning signs are intended to discourage attempts. Lighting can also aid detection, but the scenario emphasizes deterrence.',
  },
  {
    id: 'controls-sq-5', objective: '1.1', domain: 1,
    prompt: 'Which pair contains one physical control and one technical control?',
    options: ['Fence and encryption', 'Policy and risk assessment', 'Training and incident procedure', 'Firewall and access-control list'], correctIndex: 0,
    explanation: 'A fence physically protects a boundary, while encryption is implemented through technology. The last pair contains two technical controls.',
  },
  {
    id: 'controls-sq-6', objective: '1.1', domain: 1,
    prompt: 'An intrusion detection system generates an alert when it observes a known attack pattern. Which classification is best?',
    options: ['Technical and detective', 'Technical and corrective', 'Operational and preventive', 'Managerial and deterrent'], correctIndex: 0,
    explanation: 'The system is technology-based and identifies suspicious activity, making it a technical detective control.',
  },
  {
    id: 'controls-sq-7', objective: '1.1', domain: 1,
    prompt: 'A company chooses not to deploy a costly safeguard because the expected loss is lower than the control’s lifetime cost. Which principle is it applying?',
    options: ['Implicit trust', 'Risk-based control selection', 'Security through obscurity', 'Non-repudiation'], correctIndex: 1,
    explanation: 'Controls should reduce relevant risk at a reasonable cost. Risk-based selection considers likelihood, impact, effectiveness, and business constraints.',
  },
  {
    id: 'controls-sq-8', objective: '1.1', domain: 1,
    prompt: 'Which statement about control categories and functions is correct?',
    options: ['A control may have a category and a function at the same time', 'Technical controls are always preventive', 'Physical controls cannot be detective', 'Corrective controls must be operational'], correctIndex: 0,
    explanation: 'Category describes implementation, while function describes purpose. A single safeguard can therefore receive both labels.',
  },
  {
    id: 'controls-sq-9', objective: '1.1', domain: 1,
    prompt: 'A data center uses guards, badge readers, network segmentation, endpoint monitoring, and tested backups. Which concept does this best demonstrate?',
    options: ['Single sign-on', 'Defense in depth', 'Job rotation', 'Open design'], correctIndex: 1,
    explanation: 'The organization combines physical, technical, preventive, detective, and corrective safeguards so that protection does not depend on one layer.',
  },
  {
    id: 'controls-sq-10', objective: '1.1', domain: 1,
    prompt: 'A quarterly access review discovers that former contractors still have active accounts. What did the review primarily provide?',
    options: ['A detective control that identified a control gap', 'A preventive control that stopped account creation', 'A corrective control that restored deleted data', 'A deterrent control that discouraged contractors'], correctIndex: 0,
    explanation: 'The review detected inappropriate access after it existed and revealed a gap in the account-deprovisioning process. Disabling the accounts would be the corrective action.',
  },
]

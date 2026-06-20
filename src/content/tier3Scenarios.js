const scenario = (title, summary, instructions, evidence, actions, hints, explanation) => ({
  title, summary, instructions, evidence, actions, hints, explanation,
  scoringRules:{pointsPerCorrect:1,penaltyPerIncorrect:1,passingScore:2},
})

export const tier3Scenarios = {
  platforms: scenario(
    'A factory control system that cannot tolerate ordinary patching',
    'Choose an architecture that protects a real-time production process with legacy dependencies.',
    'Select the three architecture decisions that best reduce cyber risk without violating the safety and timing requirements.',
    ['A packaging line uses an embedded real-time controller that must respond within milliseconds and cannot run endpoint agents.','The controller vendor permits updates only during two scheduled shutdowns each year; office users currently share routed access to the control network.','Engineers need remote diagnostics, but production must continue if the corporate cloud connection fails.'],
    [{id:'segment',label:'Place the controllers in a dedicated zone with deny-by-default conduits',correct:true},{id:'jump',label:'Require engineers to use a hardened, monitored jump path for remote diagnostics',correct:true},{id:'local',label:'Keep safety-critical control local and able to operate during cloud or WAN loss',correct:true},{id:'agent',label:'Install an unsupported endpoint agent directly on every controller',correct:false},{id:'flat',label:'Keep office and control devices on one routed trust zone for convenience',correct:false}],
    ['Respect the controller’s real-time and vendor-support constraints.','Remote access should not create ordinary reachability into the control zone.'],
    'Segmentation and a controlled jump path reduce exposure while preserving supported operation. Keeping critical control local avoids making cloud connectivity a safety dependency. Unsupported agents and flat trust can create both cyber and operational failure.'
  ),
  responsibility: scenario(
    'The exposed cloud database with three different owners',
    'Assign cloud duties clearly across provider, platform team, application team, and data owner.',
    'Select the three actions that close the responsibility gaps revealed by the incident.',
    ['A managed cloud database was reachable from the internet because a customer-managed security group allowed all sources.','The provider patched the database engine, but the application team stored a reusable credential in source code.','Backups exist, yet no customer team has tested restoration or confirmed retention against the data classification.'],
    [{id:'matrix',label:'Document a responsibility matrix naming owners for network policy, secrets, data, and recovery testing',correct:true},{id:'restrict',label:'Restrict the customer-managed security group and rotate the exposed application credential',correct:true},{id:'restore',label:'Have the accountable customer teams validate backup retention and restoration',correct:true},{id:'provider',label:'Assign every failure to the cloud provider because the database is managed',correct:false},{id:'assume',label:'Assume provider patching also secures application code and customer access policy',correct:false}],
    ['Managed service does not mean transferred accountability for customer configuration and data.','Name who operates each control and who verifies its result.'],
    'The provider owns underlying managed-service operation, while the customer still owns access configuration, application secrets, data decisions, and recovery assurance. A responsibility matrix prevents those duties from disappearing between teams.'
  ),
  'network-design': scenario(
    'A public claims portal with a sensitive processing tier',
    'Place security controls around the actual north-south and east-west traffic paths.',
    'Select the three design decisions that best constrain compromise while keeping the public service available.',
    ['Internet clients need HTTPS access to a claims portal, but only the application tier should query the regulated database.','Administrators currently connect directly from ordinary laptops; the organization also needs visibility into attacks without creating a single unplanned failure point.','The portal must remain reachable during maintenance of one application instance.'],
    [{id:'zones',label:'Use separate web, application, database, and management zones with explicit allowed flows',correct:true},{id:'controls',label:'Place a WAF before the web tier and monitored detection at the relevant trust boundaries',correct:true},{id:'admin',label:'Require administration through a hardened jump path and use redundant application instances behind a load balancer',correct:true},{id:'database',label:'Permit internet clients to reach the database directly if TLS is enabled',correct:false},{id:'fail',label:'Place one inline device with no bypass or redundancy in every critical path',correct:false}],
    ['Encryption does not replace reachability control.','Availability requirements affect control placement and failure mode.'],
    'Explicit zones limit lateral movement, application-aware filtering protects the public path, and a jump path separates administration. Redundant service instances preserve availability, while direct database exposure and an unplanned single point of failure undermine the design.'
  ),
  data: scenario(
    'Customer analytics across two legal regions',
    'Protect regulated data through collection, use, transfer, retention, and deletion.',
    'Select the three controls that satisfy the stated analytics need while respecting classification and sovereignty.',
    ['The analytics team needs regional trends but does not require customer names, account numbers, or exact addresses.','Law and contract require raw European customer records to remain in the European region; analysts work from both regions.','The current pipeline copies complete production records into a global data lake and retains them indefinitely.'],
    [{id:'minimize',label:'Create a minimized, tokenized analytics dataset containing only required attributes',correct:true},{id:'regional',label:'Keep regulated raw records and encryption keys in the required region with restricted access',correct:true},{id:'lifecycle',label:'Apply approved retention, deletion verification, and logging across the pipeline',correct:true},{id:'global',label:'Copy all raw records globally because encryption eliminates sovereignty requirements',correct:false},{id:'forever',label:'Retain every source record indefinitely in case it becomes useful later',correct:false}],
    ['Start with what the business purpose actually requires.','Encryption helps protect data but does not erase location and retention obligations.'],
    'Minimization and tokenization reduce exposure while preserving useful analytics. Regional storage and key control address sovereignty, and enforced retention completes lifecycle protection. Encryption alone does not authorize unrestricted movement or indefinite collection.'
  ),
  'applied-crypto': scenario(
    'A certificate renewal that breaks only mobile clients',
    'Diagnose a trust-chain failure without weakening transport security for every client.',
    'Select the three actions that best identify and correct the certificate deployment problem.',
    ['A public API certificate was renewed; desktop browsers connect successfully, but managed mobile clients report an untrusted chain.','The server presents the leaf certificate but omits the intermediate CA certificate. The private key remains protected in the approved key-management service.','The certificate name and validity period are correct, and revocation checks show no compromise.'],
    [{id:'chain',label:'Install and serve the required intermediate certificate chain',correct:true},{id:'test',label:'Validate the complete chain and hostname from representative mobile and desktop clients',correct:true},{id:'protect',label:'Keep the private key in the approved protected service and document the corrected deployment',correct:true},{id:'trust',label:'Disable certificate validation on mobile clients',correct:false},{id:'self',label:'Replace the public certificate with an untrusted self-signed certificate',correct:false}],
    ['A valid leaf certificate can still fail when the server does not provide a usable chain.','Correct the deployment rather than teaching clients to ignore trust failures.'],
    'Serving the intermediate lets clients build the chain to a trusted root. Representative validation confirms interoperability, while continued key protection preserves identity assurance. Disabling validation or switching to an untrusted certificate creates a larger vulnerability.'
  ),
  resilience: scenario(
    'Recovery targets for the order platform',
    'Select backup and availability controls from explicit business recovery requirements.',
    'Select the three design decisions that best meet the stated RTO, RPO, and dependency constraints.',
    ['The order platform may be unavailable for no more than 30 minutes and may lose no more than five minutes of committed orders.','A regional outage is credible; the identity provider and message queue are required dependencies, and the budget cannot support two permanently active full-size regions.','Nightly backups are encrypted and stored offsite, but the organization has never performed an end-to-end failover exercise.'],
    [{id:'warm',label:'Use a geographically separate warm recovery environment sized to meet the 30-minute RTO',correct:true},{id:'replicate',label:'Replicate order data and required dependencies frequently enough to meet the five-minute RPO',correct:true},{id:'test',label:'Run measured failover and restoration exercises that include identity and messaging dependencies',correct:true},{id:'nightly',label:'Rely only on nightly backups for the five-minute data-loss target',correct:false},{id:'active',label:'Buy two full-size active regions without evaluating whether a warm design meets the requirement',correct:false}],
    ['RTO drives restoration speed; RPO drives acceptable data loss.','A service is not recovered when a required dependency is missing.'],
    'A warm regional design can meet the stated recovery time at lower cost than full active-active capacity. Frequent replication addresses data loss, and exercises prove the complete dependency chain. Nightly copies cannot satisfy a five-minute RPO.'
  ),
}

export const tier3ArchitectureLab = scenario(
  'A regional healthcare scheduling redesign',
  'Balance confidentiality, availability, cost, and recovery for a regulated patient-facing service.',
  'Select the three coordinated architecture decisions that best satisfy the full requirement set.',
  ['Patients require continuous scheduling access; the business sets a 15-minute RTO and one-minute RPO for confirmed appointments.','Clinical notes and identity records are regulated, must remain in-country, and should not be exposed to the public web tier.','The budget supports redundant application capacity and a warm second region, but not two permanently active database regions.'],
  [{id:'tiers',label:'Separate public, application, regulated-data, and management tiers with explicit trust paths',correct:true},{id:'recovery',label:'Use redundant application instances plus in-country replication to a tested warm region that meets RTO and RPO',correct:true},{id:'data',label:'Encrypt regulated data, keep keys and raw records in-country, and expose only required application interfaces',correct:true},{id:'flat',label:'Place the web and patient database tiers on one flat network to reduce latency',correct:false},{id:'backup',label:'Use nightly backups alone despite the one-minute RPO',correct:false}],
  ['Meet the business targets without buying controls that do not change the stated risk.','Combine data boundaries with availability and recovery—not one at the expense of the others.'],
  'The selected design constrains public exposure, preserves in-country control of regulated data, and meets availability and recovery goals with redundant applications and a tested warm region. Flat trust violates confidentiality, while nightly backups cannot meet the one-minute RPO.'
)

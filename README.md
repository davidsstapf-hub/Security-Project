# Security+ Study App

A study companion for the CompTIA Security+ certification. The app will turn the current Security+ exam domains into focused lessons, flashcards, practice questions, scenario drills, and measurable study progress.

## Project goals

- Organize study material around the current CompTIA Security+ exam domains.
- Support short lessons, spaced review, quizzes, and performance-based scenarios.
- Track confidence, accuracy, weak objectives, and study streaks.
- Keep study content separate from application code so either can evolve cleanly.
- Explain why an answer is correct instead of functioning as a question dump.

## Certification scope

The initial curriculum targets **CompTIA Security+ SY0-701** and its five domains:

| Domain | Exam weight | App coverage |
| --- | ---: | --- |
| General Security Concepts | 12% | Security controls, fundamental principles, change management, and cryptography basics |
| Threats, Vulnerabilities, and Mitigations | 22% | Threat actors, attack surfaces, vulnerabilities, malicious activity, and mitigations |
| Security Architecture | 18% | Architecture models, enterprise infrastructure, data protection, resilience, and recovery |
| Security Operations | 28% | Hardening, asset and vulnerability management, monitoring, incident response, and investigations |
| Security Program Management and Oversight | 20% | Governance, risk, third parties, compliance, audits, and security awareness |

Source of truth: [CompTIA Security+ certification](https://www.comptia.org/en-us/certifications/security/). Before publishing study content, compare it with the latest official exam-objectives document because CompTIA can revise or retire exam versions.

## Planned learner experience

1. Take a short diagnostic assessment.
2. Follow a domain-weighted study plan.
3. Learn concepts through concise notes and examples.
4. Review with flashcards and spaced repetition.
5. Practice multiple-choice and performance-based scenarios.
6. Use the progress dashboard to target weak objectives.
7. Complete timed mixed-domain practice exams.

## Project structure

```text
Security+Project/
|-- docs/                         Product plans and authoring guidance
|-- public/                       Static assets
|-- src/
|   |-- app/                      App entry points, routes, and layout
|   |-- components/               Shared interface components
|   |-- content/
|   |   `-- domains/              Security+ curriculum and objective maps
|   |-- features/
|   |   |-- dashboard/            Study overview and recommendations
|   |   |-- learn/                Lessons and flashcards
|   |   |-- practice/             Quizzes, exams, and scenario drills
|   |   `-- progress/             Scores, mastery, and study history
|   `-- lib/                      Shared utilities and data access
`-- tests/
    |-- integration/              Feature and workflow tests
    `-- unit/                     Focused logic tests
```

## Current status

The guided curriculum now spans six tiers. Tiers 1–5 provide complete learning loops, applied labs, and cumulative checkpoints; Tier 6 adds an 80-question, domain-weighted practice exam grounded in primary NIST, CISA, OWASP, and IETF references. Review-aware recommendations, versioned device-local progress, domain scoring, mobile-safe layouts, and Capacitor configuration are included.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://127.0.0.1:5173`.

Run unit and curriculum-integrity checks with `npm test`, browser accessibility and responsive checks with `npm run test:e2e`, or the complete release suite with `npm run validate`.

## iOS direction

The project uses Capacitor to package the same React app for iOS. Native project generation and simulator validation require macOS with Xcode. On that machine, run `npx cap add ios`, followed by `npm run ios:sync` and `npm run ios:open`.

## Recommended next milestone

The authored coursework and automated content review are complete. Before release, perform final human bullet-by-bullet signoff against the official SY0-701 V7 PDF, complete manual keyboard and screen-reader journeys, and validate each tier with at least three real learners. Record confusing explanations, difficulty spikes, navigation friction, and accessibility findings before release.

## Content and ethics

Use original explanations and questions aligned to published objectives. Do not copy proprietary courseware, live exam questions, or exam dumps. This project is an independent study aid and is not affiliated with or endorsed by CompTIA.

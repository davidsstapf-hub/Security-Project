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

The guided learning app is implemented with React and Vite. Tier 1 now contains six complete learning sections, worked scenarios, 85+ flashcards, coached knowledge checks, section quizzes, and a 20-question cumulative checkpoint. The app also includes review-aware recommendations, versioned device-local progress, domain coverage, mobile-safe layouts, and Capacitor configuration for the future iOS app.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://127.0.0.1:5173`.

Run automated checks with `npm test` and create a production bundle with `npm run build`.

## iOS direction

The project uses Capacitor to package the same React app for iOS. Native project generation and simulator validation require macOS with Xcode. On that machine, run `npx cap add ios`, followed by `npm run ios:sync` and `npm run ios:open`.

## Recommended next milestone

Validate the complete Tier 1 learning loop with real learners, address usability findings, and then author Tier 2 using the same section structure and content-integrity tests.

## Content and ethics

Use original explanations and questions aligned to published objectives. Do not copy proprietary courseware, live exam questions, or exam dumps. This project is an independent study aid and is not affiliated with or endorsed by CompTIA.

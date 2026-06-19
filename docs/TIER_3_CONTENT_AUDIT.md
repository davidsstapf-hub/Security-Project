# Tier 3 Content Audit

Status: **In progress - release-blocking findings open**

## Scope reviewed

- Six Tier 3 lessons mapped to objectives 3.1-3.4 and 1.4
- Six section scenarios plus the resilient-architecture lab
- 84 flashcards
- 30 coached-check questions
- 60 section-quiz questions
- 20-question cumulative checkpoint

## Findings

### Critical - six section scenarios reuse one decision template

Each scenario changes topic labels but inherits the same evidence structure, three generic correct actions, two generic incorrect actions, and shared debrief. Learners do not yet practice materially different architecture decisions.

Required resolution:

- Architecture models: choose an appropriate platform under patching, availability, and operational constraints.
- Shared responsibility: assign cloud security duties without responsibility gaps.
- Enterprise design: place and configure infrastructure controls around real traffic paths.
- Data lifecycle: balance classification, sovereignty, states, retention, and protection methods.
- Applied cryptography: diagnose certificate, key-management, and protocol decisions.
- Resilience: select recovery architecture from RTO, RPO, dependency, and cost evidence.
- Preserve all existing scenario activity IDs.

### Critical - all 90 section questions are generated definition matches

The coached checks and quizzes use the repeated “which term best matches this description” factory. Distractors are neighboring flashcard terms rather than plausible architectural alternatives.

Required resolution:

- Author 15 questions per section while preserving existing IDs.
- Mix architecture tradeoffs, responsibility assignment, control placement, data decisions, cryptographic troubleshooting, and recovery calculations.
- Use plausible competing designs and common misconceptions as distractors.

### High - checkpoint inherits definition-only assessment material

The checkpoint represents all six sections but currently selects from the generated section quizzes.

Required resolution:

- Rebuild it from authored section banks while preserving its 20 stable IDs.
- Retain balanced coverage across all six sections.
- Include cross-section design choices involving confidentiality, availability, cost, and recovery.

### High - resilient-architecture lab is still generic

The required Tier 3 lab declares the correct tradeoff goals but does not provide architecture-specific evidence or decisions.

Required resolution:

- Add business requirements, failure assumptions, recovery targets, dependencies, and cost constraints.
- Score choices that demonstrate explicit tradeoff reasoning rather than generic evidence preservation.

## Acceptance gate

Tier 3 remains blocked from publication until all critical and high findings are resolved, official bullet-level traceability is complete, the validation suite passes, and learner review is documented.

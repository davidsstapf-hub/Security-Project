# Tier 2 Content Audit

Status: **In progress — release-blocking findings open**

## Scope reviewed

- Six Tier 2 lessons and their declared objective ranges
- Six scenarios
- 84 flashcards
- 30 coached-check questions
- 60 section-quiz questions
- 20-question cumulative checkpoint
- Curriculum metadata and traceability status

## Findings

### Critical — assessments are mechanically generated

`makeQuestions()` builds every coached-check and section-quiz item from the same definition-matching sentence. Distractors are simply the next three terms in the section's term list. This produces valid data, but it does not provide the recall, application, and scenario variety required for publication.

Required resolution:

- Replace all 90 generated Tier 2 questions with authored questions.
- Mix recognition, attack-path analysis, indicator interpretation, and control selection.
- Tie distractors to realistic misconceptions rather than neighboring vocabulary.
- Preserve existing question IDs to protect learner progress.

### Critical — scenarios reuse one generic template

All six scenarios inherit the same evidence pattern, action structure, hints, and debrief from `genericScenario()`. The topic labels change, but the learner decision does not materially change.

Required resolution:

- Author distinct evidence and decisions for each Tier 2 topic.
- Include topic-appropriate artifacts such as network observations, configuration context, identity events, malware indicators, and verification records.
- Preserve existing scenario activity IDs.

### High — checkpoint inherits definition-only questions

The checkpoint covers every section numerically, but it selects questions from the generated section quizzes. Coverage breadth is present; assessment depth is not.

Required resolution:

- Rebuild the checkpoint after the section-question rewrite.
- Keep representation across all six sections.
- Include several cross-section attack-path and mitigation questions.

### High — official objective verification is still pending

The repository correctly records `objectiveVersionVerified: false`. Direct retrieval of the current official CompTIA objectives was blocked during this audit, so objective ranges must not be marked verified yet.

Required resolution:

- Review a current official SY0-701 objectives PDF line by line.
- Replace broad teaching ranges with verified objective and sub-objective mappings.
- Record the document version and verification date in curriculum metadata.

### Medium — lesson quality is stronger than assessment quality

Each lesson contains six topic-specific segments and generally useful distinctions. Editorial review should still verify technical claims and difficulty progression, but the immediate rewrite priority is scenarios and assessments.

## Acceptance gate

Tier 2 remains blocked from publication until the two critical and two high findings are resolved, the full validation suite passes, and the objective mapping is verified against the official document.

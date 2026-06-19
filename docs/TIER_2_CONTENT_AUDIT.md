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

### Resolved — assessments were mechanically generated

All 90 coached-check and section-quiz questions now use authored prompts, plausible misconception-based distractors, and topic-specific explanations. Integrity tests reject the former definition-template wording and require 90 unique Tier 2 prompts.

Resolution completed:

- Replaced all 90 generated Tier 2 questions with authored questions.
- Mixed recognition, attack-path analysis, indicator interpretation, and control selection.
- Replaced neighboring-vocabulary distractors with plausible errors and competing controls.
- Preserved existing question IDs through the section question builder.

### Resolved — scenarios reuse one generic template

The original six scenarios inherited the same generic evidence and decision pattern. They now use distinct network exposure, actively exploited appliance, ransomware, payment fraud, token theft, and configuration-drift cases with topic-specific actions and debriefs. A regression test verifies that evidence and decision sets remain distinct.

Resolution completed:

- Authored distinct evidence and decisions for each Tier 2 topic.
- Added topic-appropriate network, configuration, identity, malware, and verification evidence.
- Preserved all existing scenario activity IDs.

### Resolved — checkpoint inherited definition-only questions

The checkpoint still covers all six sections with 20 stable checkpoint IDs, but its source banks are now fully authored application assessments. Regression tests verify section coverage and prevent definition-template questions.

Resolution completed:

- Rebuilt the checkpoint from the completed authored section banks.
- Preserved representation across all six sections and stable checkpoint IDs.
- Included attack-path, indicator, verification, containment, and mitigation decisions.

### High — official objective verification is still pending

The repository correctly records `objectiveVersionVerified: false`. Direct retrieval of the current official CompTIA objectives was blocked during this audit, so objective ranges must not be marked verified yet.

Required resolution:

- Review a current official SY0-701 objectives PDF line by line.
- Replace broad teaching ranges with verified objective and sub-objective mappings.
- Record the document version and verification date in curriculum metadata.

### Medium — lesson quality is stronger than assessment quality

Each lesson contains six topic-specific segments and generally useful distinctions. Editorial review should still verify technical claims and difficulty progression, but the immediate rewrite priority is scenarios and assessments.

## Acceptance gate

Tier 2 content-quality blockers are resolved. Publication still depends on detailed official-objective traceability, full validation, and learner review.

# Security+ Release Checklist

## Objective and content review

- [x] Obtain and review the official SY0-701 V7 objectives PDF (document version 7.0).
- [x] Resolve objective 1.3 and 4.5 coverage gaps found during official review.
- [ ] Complete detailed bullet-level traceability and mark curriculum metadata verified.
- [ ] Record its published version and review date in `curriculumMetadata.js`.
- [ ] Compare every traceability row with the official sub-objectives.
- [ ] Resolve missing, duplicated, incorrectly mapped, and out-of-scope coverage.
- [ ] Complete technical review against primary sources and editorial review for every tier.
- [ ] Confirm all wording is original and contains no exam-dump material.

## Product validation

- [x] Unit, curriculum-integrity, accessibility, responsive, and production-build checks pass.
- [ ] Complete keyboard-only journeys for lessons, cards, quizzes, scenarios, and the final exam.
- [ ] Verify focus order, visible focus, announcements, headings, contrast, reduced motion, and mobile layouts.
- [x] Verify export/import, malformed-import rejection, migration, exam recovery, timeout, scoring, and remediation through automated checks.
- [x] Complete dependency and local-data privacy review; deployment-host review remains open until a production target is selected.

## Learner acceptance

For each tier, recruit at least three learners and record device, completion outcome, confusing content, difficulty jumps, navigation friction, and accessibility problems in `docs/VALIDATION_LOG.md`. Critical and high findings block progression to the next tier.

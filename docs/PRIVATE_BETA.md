# Private Beta Review

The review build exposes Tiers 1–2 only. Tiers 3–6 remain in the source curriculum, and existing learner progress for hidden activities is preserved.

## Local review

Run `npm run dev:beta` and open `http://127.0.0.1:5173`.

Confirm the private-beta banner, two-tier Guided Path, hidden-curriculum search boundary, beta-readiness wording, privacy notice, and desktop/mobile activity journeys.

## Deployment hold

- GitHub Pages is manual-only.
- The `codex/private-beta-launch` Netlify context exits before building.
- Do not promote or merge this branch into a Netlify-watched production branch without explicit approval.

## Learner feedback

Collect feedback manually and record three Tier 1 and three Tier 2 learner sessions in `docs/VALIDATION_LOG.md`. Do not add analytics or an in-app feedback service during this beta.
